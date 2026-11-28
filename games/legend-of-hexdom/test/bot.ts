// A strategy that plays whole games through the engine, so difficulty can be measured over thousands
// of games rather than guessed from a few (the playtest skill: "the engine counts"). The playtester's
// notebook supplies the strategy; until it has one, this is the tech lead's first sensible guess,
// written as plain rules of thumb so it can be compared and replaced.

import type { CharacterId } from '../src/data/characters';
import { ATTRS, type Attr, type TreasureId } from '../src/data/types';
import {
  act,
  actionError,
  availableGifts,
  columnFor,
  food,
  giftEndsGame,
  giftFaces,
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
import { isLand, neighbours, poiAt, terrainAt } from '../src/engine/hex';

/**
 * The playtester's strategy (playtest/notebook.md, 2026-11-28), as weights: commit to two target
 * Bosses; every attribute point into the lead attribute until 12, then the second until 8; value the
 * Treasures those Bosses need; keep a margin of hearts. The Mage reaches both her targets (Gast and
 * Stuker) with Magic alone, through Enchant.
 */
const TARGETS: Record<CharacterId, { lead: Attr; second: Attr | null; treasures: TreasureId[] }> = {
  warrior: { lead: 'str', second: 'mag', treasures: ['skull', 'hook'] }, // Gast (S12+M8), Liggy (S12+A8)
  archer: { lead: 'agi', second: 'mag', treasures: ['book', 'spear'] }, // Brok (A12+M8), Glubo (A12+S8)
  mage: { lead: 'mag', second: 'agi', treasures: ['skull', 'hammer'] }, // Gast, Stuker via Enchant; King (M12+A8) next
};

/** How good a position is, for choosing between actions by looking one step ahead. */
function value(s: GameState): number {
  if (s.phase === 'lost') return -1e6;
  if (s.phase === 'won') return 1e6;
  const t = TARGETS[s.character];
  const a = s.attrs;
  const attrScore = ATTRS.reduce((sum, k) => {
    if (k === t.lead) return sum + Math.min(a[k], 12) * 14 + (a[k] >= 12 ? 40 : 0);
    if (k === t.second) return sum + Math.min(a[k], 8) * 9 + (a[k] >= 8 ? 20 : 0);
    return sum + Math.min(a[k], 12) * 2;
  }, 0);
  const h = hearts(s);
  return (
    attrScore +
    h * 14 -
    (h <= 2 ? 60 : 0) +
    Math.min(food(s), 8) * 4 +
    s.foodPainted * 1.5 +
    s.treasures.reduce((sum, tr) => sum + (t.treasures.includes(tr) ? 30 : 8), 0) +
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
    if (p.kind === 'points') cands = ATTRS.map((attr: Attr) => ({ t: 'point', attr }));
    else if (p.kind === 'gem') cands = [{ t: 'gem', to: 'relic' }, { t: 'gem', to: 'trade' }];
    else if (p.kind === 'treasure') cands = (['spear', 'hook', 'crow', 'hammer', 'skull', 'book'] as const).map((treasure) => ({ t: 'treasure', treasure }));
    else cands = availableGifts(s).map((gift) => ({ t: 'chooseGift', gift }));
    let best: GameState | null = null;
    for (const c of cands) {
      const n = tryAct(s, c);
      if (n && (!best || value(n) > value(best))) best = n;
    }
    if (!best) throw new Error(`bot: cannot place ${p.kind}`);
    s = best;
  }
  return s;
}

/** Score a hex as a destination: Castles when ready for a Boss, Villages and land otherwise. */
function destinationValue(s: GameState, hex: string): number {
  const poi = poiAt(mapOf(s), hex);
  const ready = ATTRS.filter((a) => s.attrs[a] >= 10).length >= 1 && hearts(s) >= 6;
  if (poi?.kind === 'castle') return ready ? 40 : 6;
  if (poi?.kind === 'village') return 8;
  return 0;
}

/**
 * Room to keep moving from a hex (the rulebook's "pathing", p36-45): the size of the unvisited
 * region reachable from it, and how many unvisited land neighbours it has. Ending in a corner of
 * one's own path is how games are lost.
 */
function room(s: GameState, from: string, extraVisited: string[]): { region: number; exits: number } {
  const map = mapOf(s);
  const blocked = new Set([...s.visited, ...extraVisited]);
  const seen = new Set<string>([from]);
  const queue = [from];
  while (queue.length) {
    const h = queue.shift()!;
    for (const n of neighbours(h)) if (!blocked.has(n) && !seen.has(n)) {
      seen.add(n);
      queue.push(n);
    }
  }
  const exits = neighbours(from).filter((n) => !blocked.has(n) && isLand(terrainAt(map, n))).length;
  return { region: seen.size - 1, exits };
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
        const v = value(after) + destinationValue(n, end) - p.unpermitted * 30 - trap + Math.min(r.region, 30) - stuckRisk(n) * 3000;
        if (!best || v > best.v) best = { st: n, v };
      }
    }
    if (!best) return s;
    s = place(best.st);
  }
  if (s.phase === 'round') s = bestMain(s, 2);
  return s;
}

/** Use the remaining dice, choosing each action greedily (both must be used, ruling A). */
function bestMain(s: GameState, depth: number): GameState {
  for (let guard = 0; guard < 4 && s.phase === 'round' && s.travelled && !s.giftThisRound && s.used.some((u) => !u); guard++) {
    if (s.bossesDefeated.length >= 2) return place(act(s, { t: 'finish' }));
    let best: GameState | null = null;
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
        if (!n) continue;
        const placed = place(n);
        if (!best || value(placed) > value(best)) best = placed;
      }
    });
    if (!best) break;
    s = best;
    if (depth <= 1) break;
  }
  return s;
}

/** The last game's log, for reading why it ended. */
export let lastLog: string[] = [];

export interface GameResult {
  /** Why it ended: won, out of hearts, stuck, or still going after the round cap. */
  end: 'won' | 'hearts' | 'stuck' | 'cap';
  won: boolean;
  rounds: number;
  score: number | null;
  bosses: number;
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
  const end = s.phase === 'won' ? 'won' : s.phase === 'lost' ? (s.result?.reason.startsWith('Stuck') ? 'stuck' : 'hearts') : 'cap';
  return { end, won: s.phase === 'won', rounds: s.round, score: s.result?.score ?? null, bosses: s.bossesDefeated.length };
}
