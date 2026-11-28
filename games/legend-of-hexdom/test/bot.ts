// A strategy that plays whole games through the engine, so difficulty can be measured over thousands
// of games rather than guessed from a few (the playtest skill: "the engine counts"). The playtester's
// notebook supplies the strategy: this plays its second version (playtest/notebook.md, 2026-11-28),
// as weights and a little look-ahead, and what each part was worth is recorded there.

import type { CharacterId } from '../src/data/characters';
import { BOSSES } from '../src/data/rules';
import { ATTRS, type Attr, type TreasureId } from '../src/data/types';
import {
  act,
  actionError,
  availableGifts,
  columnFor,
  food,
  giftEndsGame,
  giftFaces,
  hasSkill,
  hearts,
  newGame,
  position,
  sheetOf,
  travelOptions,
  allPaths,
  type Command,
  type GameState,
} from '../src/engine/game';
import { mapOf } from '../src/engine/game';
import { isLand, key, neighbours, poiAt, terrainAt } from '../src/engine/hex';


/**
 * The Bosses that would fall now without a Treasure penalty: requisites met (the Mage through
 * Enchant) and Treasure held, not yet beaten. The notebook's "live faces" (rule 2).
 */
export function liveFaces(s: GameState): number[] {
  const enchant = hasSkill(s, 'enchant');
  const meets = (b: (typeof BOSSES)[number]) => b.reqs.every((r) => Math.max(s.attrs[r.a], enchant && r.a === 'str' ? s.attrs.mag : 0) >= r.v);
  return BOSSES.filter((b) => !s.bossesDefeated.includes(b.die) && meets(b) && s.treasures.includes(b.treasure)).map((b) => b.die);
}

/** Bosses whose requisites are met but whose Treasure is missing: 3 hearts each. */
function nearFaces(s: GameState): number {
  const enchant = hasSkill(s, 'enchant');
  return BOSSES.filter(
    (b) => !s.bossesDefeated.includes(b.die) && !s.treasures.includes(b.treasure) && b.reqs.every((r) => Math.max(s.attrs[r.a], enchant && r.a === 'str' ? s.attrs.mag : 0) >= r.v),
  ).length;
}

/** Castles never visited, the game's clock (rule 1). */
function freeCastles(s: GameState): string[] {
  return mapOf(s).castles.map((p) => key(p.row, p.col)).filter((k) => !s.visited.includes(k));
}

/**
 * The Bosses to aim for: the ones still unbeaten that need the fewest attribute points (the Mage's
 * Strength through Enchant), as many as are still needed to win. Recomputed every move, so the plan
 * follows the dice instead of two fixed targets (the notebook's rule 2, "live faces").
 */
function aims(s: GameState): { need: number; treasure: TreasureId }[] {
  const enchant = hasSkill(s, 'enchant');
  const eff = (a: Attr) => Math.max(s.attrs[a], enchant && a === 'str' ? s.attrs.mag : 0);
  return BOSSES.filter((b) => !s.bossesDefeated.includes(b.die))
    .map((b) => ({ need: b.reqs.reduce((n, r) => n + Math.max(0, r.v - eff(r.a)), 0) + (s.treasures.includes(b.treasure) ? 0 : 1.5), treasure: b.treasure }))
    .sort((x, y) => x.need - y.need)
    .slice(0, Math.max(0, 2 - s.bossesDefeated.length));
}

/** How good a position is, for choosing between actions by looking ahead. */
function value(s: GameState): number {
  if (s.phase === 'lost') return -1e6;
  if (s.phase === 'won') return 1e6;
  const targets = aims(s);
  const attrScore = targets.reduce((sum, t) => sum - t.need * 14, 0) + ATTRS.reduce((sum, k) => sum + Math.min(s.attrs[k], 12) * 2, 0);
  const h = hearts(s);
  const live = liveFaces(s).length;
  const liveScore = Math.min(live, 2) * 120 + Math.max(0, live - 2) * 50 + nearFaces(s) * 25;
  return (
    attrScore +
    liveScore -
    (food(s) < 2 ? 25 : 0) +
    h * 14 -
    (h <= 3 ? 40 : 0) -
    (h <= 2 ? 80 : 0) -
    (h <= 1 ? 150 : 0) +
    Math.min(food(s), 8) * 4 +
    s.foodPainted * 1.5 +
    s.treasures.length * 8 +
    s.bossesDefeated.length * 400 +
    s.relic * 6 +
    s.giftsTaken.length * 8
  );
}

function tryAct(s: GameState, c: Command): GameState | null {
  if (actionError(s, c)) return null;
  try {
    return act(s, c);
  } catch {
    return null;
  }
}

/** Resolve anything waiting to be placed, greedily. */
function place(s: GameState): GameState {
  while (s.pending.length && s.phase !== 'won' && s.phase !== 'lost') {
    const p = s.pending[0];
    let cands: Command[] = [];
    if (p.kind === 'points') {
      // Rule 5: the Archer's points go to Magic, since Focus raises Agility by itself.
      const magic: Command = { t: 'point', attr: 'mag' };
      cands = s.character === 'archer' && s.attrs.mag < 12 && !actionError(s, magic) ? [magic] : ATTRS.map((attr: Attr) => ({ t: 'point', attr }));
    }
    else if (p.kind === 'gem') cands = [{ t: 'gem', to: 'relic' }, { t: 'gem', to: 'trade' }];
    else if (p.kind === 'treasure') cands = (['spear', 'hook', 'crow', 'hammer', 'skull', 'book'] as const).map((treasure) => ({ t: 'treasure', treasure }));
    else cands = availableGifts(s).map((gift) => ({ t: 'chooseGift', gift }));
    let best: GameState | null = null;
    for (const c of cands) {
      const n = tryAct(s, c);
      if (n && (!best || value(n) > value(best))) best = n;
    }
    if (!best) throw new Error(`bot: cannot place ${p.kind}: ${cands.map((c) => actionError(s, c)).join(' | ')}`);
    s = best;
  }
  return s;
}

/**
 * Score a hex as a destination. Castles are the clock (rule 1): end on one when two Bosses could fall
 * there, otherwise only while enough others stay free; when ready, end near a free one (rule 13).
 */
function destinationValue(s: GameState, hex: string): number {
  const ready = liveFaces(s).length + s.bossesDefeated.length >= 2;
  const free = freeCastles(s);
  if (poiAt(mapOf(s), hex)?.kind === 'castle') {
    if (ready) return 150;
    return free.length < 2 ? -250 : free.length < 3 ? -60 : 0;
  }
  return poiAt(mapOf(s), hex)?.kind === 'village' ? 8 : 0;
}

/**
 * Room to keep moving from a hex (the rulebook's "pathing", p36-45): the size of the unvisited
 * region reachable from it, how many unvisited land neighbours it has, and the free Castles still in
 * that region with the nearest one's distance. Ending in a corner of one's own path is how games are
 * lost, and walling off the last Castles is how a ready character fails to win (playtest 2).
 */
function room(s: GameState, from: string, extraVisited: string[]): { region: number; exits: number; castles: number; castleDist: number } {
  const map = mapOf(s);
  const blocked = new Set([...s.visited, ...extraVisited]);
  const dist = new Map<string, number>([[from, 0]]);
  const queue = [from];
  while (queue.length) {
    const h = queue.shift()!;
    for (const n of neighbours(h)) if (!blocked.has(n) && !dist.has(n)) {
      dist.set(n, dist.get(h)! + 1);
      queue.push(n);
    }
  }
  const exits = neighbours(from).filter((n) => !blocked.has(n) && isLand(terrainAt(map, n))).length;
  const castles = map.castles.map((p) => key(p.row, p.col)).filter((k) => k !== from && dist.has(k));
  return { region: dist.size - 1, exits, castles: castles.length, castleDist: Math.min(...castles.map((k) => dist.get(k)!)) };
}

/**
 * The chance of being stuck next round after ending here: the faces with no path at all (ordinary
 * or unstuck), cubed, since all three dice must fail. How a careful player reads the map.
 */
function stuckRisk(after: GameState): number {
  let fails = 0;
  for (let face = 1; face <= 6; face++) if (allPaths(after, face).length === 0) fails++;
  return (fails / 6) ** 3;
}

/** One round, greedy one step ahead. */
function playRound(s: GameState, rnd: () => number): GameState {
  s = act(s, { t: 'roll' });
  if (s.phase !== 'round') return s;
  s = place(s);
  // A Gift when it doesn't end the game and isn't worse than travelling with all dice.
  for (const f of giftFaces(s)) {
    if (giftEndsGame(s, f)) continue;
    const n = tryAct(s, { t: 'gift', face: f });
    if (n && rnd() < 0.85) {
      s = place(n);
      break;
    }
  }
  // Archer: Cross Training in one burst at food 12+, Strength to 8, leaving a food (rule 5).
  if (s.character === 'archer' && food(s) >= 12) {
    while (s.attrs.str < 8 && food(s) >= 3) {
      const n = tryAct(s, { t: 'crossTraining' });
      if (!n) break;
      s = n;
    }
  }
  // Travel: try every legal path of every die, then the best follow-up from where it lands.
  if (!s.travelled && s.phase === 'round') {
    let best: { st: GameState; v: number } | null = null;
    for (const o of travelOptions(s)) {
      for (const p of o.paths) {
        const n = tryAct(s, { t: 'travel', die: o.die, path: p.path });
        if (!n) continue;
        const after = n.phase === 'round' ? bestMain(place(n), 1) : place(n);
        const end = p.path[p.path.length - 1];
        const r = room(s, end, p.path);
        const trap = (r.region < 6 ? 400 : r.region < 12 ? 120 : 0) + (r.exits === 0 ? 600 : r.exits === 1 ? 80 : 0);
        // A Boss is fought only in a Castle: keep at least one, better two, reachable (rule 1), and
        // once two Bosses could fall, head for the nearest (rule 13).
        const atCastle = poiAt(mapOf(n), end)?.kind === 'castle';
        const ready = liveFaces(n).length + n.bossesDefeated.length >= 2;
        const castleRoom = atCastle && ready ? 0 : r.castles === 0 ? 1500 : r.castles === 1 ? 100 : 0;
        const approach = ready && !atCastle && r.castles > 0 ? Math.max(0, 150 - 40 * r.castleDist) : 0;
        const v = value(after) + destinationValue(n, end) - p.unpermitted * 30 - trap - castleRoom + approach + Math.min(r.region, 30) - stuckRisk(n) * 3000;
        if (!best || v > best.v) best = { st: n, v };
      }
    }
    if (!best) return s;
    s = place(best.st);
  }
  if (s.phase === 'round') s = bestMain(s, 2);
  return s;
}

/** Every single main-phase action from here, each with what it gains placed. */
function mainMoves(s: GameState): GameState[] {
  const out: GameState[] = [];
  s.dice.forEach((_, i) => {
    if (s.used[i]) return;
    const cmds: Command[] = [];
    for (const column of ['terrain', 'poi'] as const) {
      if (!columnFor(s, column)) continue;
      cmds.push({ t: 'explore', die: i, column });
      for (const pick of [0, 1]) for (const enchant of [false, true]) cmds.push({ t: 'adventure', die: i, column, pick, enchant, shield: true });
    }
    if (poiAt(mapOf(s), position(s))?.kind === 'castle') for (const enchant of [false, true]) cmds.push({ t: 'boss', die: i, enchant, shield: true });
    for (const c of cmds) {
      const n = tryAct(s, c);
      if (n) out.push(place(n));
    }
  });
  return out;
}

const open = (s: GameState) => s.phase === 'round' && s.travelled && !s.giftThisRound && s.used.some((u) => !u);

/**
 * Use the remaining dice (both must be used, ruling A). At depth 2 the first action is chosen by the
 * best second action it allows, so a pair of fights that triggers the Archer's Focus, or a Boss reward
 * that makes the other die's Boss live (rule 14), is seen; at depth 1, greedily.
 */
function bestMain(s: GameState, depth: number): GameState {
  for (let guard = 0; guard < 4 && open(s); guard++) {
    if (s.bossesDefeated.length >= 2) return place(act(s, { t: 'finish' }));
    let best: { st: GameState; v: number } | null = null;
    for (const n of mainMoves(s)) {
      let v = value(n);
      if (depth >= 2 && open(n) && n.bossesDefeated.length < 2) for (const m of mainMoves(n)) v = Math.max(v, value(m));
      if (!best || v > best.v) best = { st: n, v };
    }
    if (!best) break;
    s = best.st;
    if (depth <= 1) break;
  }
  return s;
}

/** The last game's log, for reading why it ended. */
export let lastLog: string[] = [];
/** The last game's final state, for diagnosis. */
export let lastState: GameState | null = null;

export interface GameResult {
  /** Why it ended: won, out of hearts, stuck, or still going after the round cap. */
  end: 'won' | 'hearts' | 'stuck' | 'cap';
  won: boolean;
  rounds: number;
  score: number | null;
  bosses: number;
  /** Castles never visited when the game ended: 0 means every possible Boss venue was used up. */
  castlesLeft: number;
}

export function playGame(mapId: number, character: CharacterId, seed: number): GameResult {
  let x = seed * 2654435761 >>> 0;
  const rnd = () => ((x = (x * 1103515245 + 12345) >>> 0) / 4294967296);
  let s = newGame({ mapId, character, seed });
  s = act(s, { t: 'start' });
  for (let r = 0; r < 120 && (s.phase === 'roll' || s.phase === 'round'); r++) {
    if (s.phase === 'round') {
      // Shouldn't happen: a round left open means the bot couldn't use a die.
      break;
    }
    s = playRound(s, rnd);
  }
  void sheetOf;
  lastLog = s.log.map((l) => l.text);
  lastState = s;
  const end = s.phase === 'won' ? 'won' : s.phase === 'lost' ? (s.result?.reason.startsWith('Stuck') ? 'stuck' : 'hearts') : 'cap';
  const castlesLeft = mapOf(s).castles.filter((p) => !s.visited.includes(key(p.row, p.col))).length;
  return { end, won: s.phase === 'won', rounds: s.round, score: s.result?.score ?? null, bosses: s.bossesDefeated.length, castlesLeft };
}
