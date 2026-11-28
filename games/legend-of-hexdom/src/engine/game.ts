// Legend of Hexdom rules engine. Pure: no React, no DOM. The UI sends commands to act(state, cmd)
// and draws the state that comes back. Rules are cited by rulebook page (pN) or by their entry in
// RULES-NOTES.md (Q2 ... Q14 for the rules group, A ... D for the Game Director's rulings).

import { CHARACTERS, SKILL_TEXT, type CharacterId, type SkillId } from '../data/characters';
import { MAPS, type MapDef } from '../data/maps';
import {
  ATTR_MAX,
  BOSSES,
  BOSSES_TO_WIN,
  BOSS_TREASURE_PENALTY,
  FOOD_BOX,
  FOOD_POINT_AT,
  FOOD_SKILL_AT,
  HEART_BOX,
  SCORE,
  START_FOOD,
  START_HEARTS,
  TRAVEL,
  UNSTUCK_PENALTY,
} from '../data/rules';
import { SIDESHEETS, type Enemy, type GiftId, type SidesheetDef } from '../data/sidesheets';
import { ATTR_NAME, ATTRS, COLUMNS, TREASURES, TREASURE_NAME, rowOfDie, type Attr, type Column, type Effect, type TreasureId } from '../data/types';
import { hexLabel, isLand, key, neighbours, parseKey, poiAt, terrainAt } from './hex';
import { randomSeed, rollD6 } from './rng';

export const SAVE_VERSION = 1;

export type Phase = 'start' | 'roll' | 'round' | 'won' | 'lost';

export type Pending =
  /** n attribute points of the player's choice; one "gain" for Magic Berry (RULES-NOTES D). */
  | { kind: 'points'; n: number; group: number }
  /** A gem: into the Relic box, or traded (p19). */
  | { kind: 'gem' }
  /** A Treasure of the player's choice (Treasure Crate, p72). */
  | { kind: 'treasure' }
  /** A Gift of the player's choice (a Boss's reward, p18). */
  | { kind: 'gift' };

export interface Leg {
  round: number;
  die: number;
  /** The hexes entered, in order (the start of the leg is the previous leg's end). */
  path: string[];
  /** Hearts paid for the unstuck crossing (p41). */
  penalty: number;
}

export interface LogLine {
  round: number;
  text: string;
}

export interface GameState {
  version: number;
  /** The seed the game started from: with the commands, it reproduces the game (playtest journals). Optional: saves made before 2026-11-28 lack it. */
  seed?: number;
  rng: number;
  /** Increases with every random event, so the UI's undo stack can be cleared there. */
  epoch: number;
  manualDice: boolean;
  mapId: number;
  character: CharacterId;
  phase: Phase;
  round: number;

  // The sheet.
  visited: string[]; // in path order; visited[0] is the start Village
  legs: Leg[];
  foodPainted: number;
  foodSpent: number;
  heartsPainted: number;
  heartsLost: number;
  attrs: Record<Attr, number>;
  treasures: TreasureId[];
  /** Adventure cells whose gem has been taken, "row.col" of the table (0-based row, column index). */
  gemsTaken: string[];
  relic: number;
  bossesDefeated: number[]; // dice faces
  giftsTaken: GiftId[]; // found or chosen, in order
  pending: Pending[];
  nextGroup: number;
  /** Point groups that have already given Magic Berry its food (one food per gain, RULES-NOTES D). */
  berryGroups: number[];

  // The round.
  dice: number[];
  used: boolean[];
  travelled: boolean;
  giftThisRound: boolean;
  adventures: number;
  overcomingUsed: boolean;
  manaShieldUsed: boolean;
  /** Magic Blood may be used right after the Travel, before anything else (RULES-NOTES C). */
  magicBloodOpen: boolean;
  /** After Cross Training the next action must be the Travel (RULES-NOTES C, "Before"). */
  mustTravelNext: boolean;

  result: { reason: string; score: number | null } | null;
  log: LogLine[];
}

export type Command =
  | { t: 'start'; die?: number }
  | { t: 'roll'; dice?: number[] }
  | { t: 'gift'; face: number }
  | { t: 'crossTraining' }
  | { t: 'travel'; die: number; path: string[]; shield?: boolean }
  | { t: 'magicBlood' }
  | { t: 'explore'; die: number; column: 'terrain' | 'poi'; shield?: boolean }
  | { t: 'adventure'; die: number; column: 'terrain' | 'poi'; pick?: number; enchant?: boolean; shield?: boolean }
  | { t: 'boss'; die: number; enchant?: boolean; shield?: boolean }
  | { t: 'point'; attr: Attr }
  | { t: 'gem'; to: 'relic' | 'trade' }
  | { t: 'treasure'; treasure: TreasureId }
  | { t: 'chooseGift'; gift: GiftId }
  | { t: 'finish' };

// ---------------------------------------------------------------------------------------------
// Setup

export function newGame(opts: { mapId: number; character: CharacterId; seed?: number; manualDice?: boolean }): GameState {
  const ch = CHARACTERS[opts.character];
  const seed = opts.seed ?? randomSeed();
  return {
    version: SAVE_VERSION,
    seed,
    rng: seed,
    epoch: 0,
    manualDice: !!opts.manualDice,
    mapId: opts.mapId,
    character: opts.character,
    phase: 'start',
    round: 0,
    visited: [],
    legs: [],
    foodPainted: START_FOOD,
    foodSpent: 0,
    heartsPainted: START_HEARTS,
    heartsLost: 0,
    attrs: { ...ch.start },
    treasures: [],
    gemsTaken: [],
    relic: 0,
    bossesDefeated: [],
    giftsTaken: [],
    pending: [],
    nextGroup: 1,
    berryGroups: [],
    dice: [],
    used: [],
    travelled: false,
    giftThisRound: false,
    adventures: 0,
    overcomingUsed: false,
    manaShieldUsed: false,
    magicBloodOpen: false,
    mustTravelNext: false,
    result: null,
    log: [{ round: 0, text: `${ch.name} on ${MAPS[opts.mapId].name}. Roll a die for your starting Village.` }],
  };
}

/** Every load goes through here, so a schema change never wipes a game in progress. */
export function migrateSave(raw: unknown): GameState | null {
  if (!raw || typeof raw !== 'object') return null;
  const s = raw as Partial<GameState>;
  if (typeof s.version !== 'number' || s.version > SAVE_VERSION) return null;
  if (!s.mapId || !MAPS[s.mapId] || !s.character || !CHARACTERS[s.character]) return null;
  // version 1 is the first schema; later versions add steps here.
  return s as GameState;
}

// ---------------------------------------------------------------------------------------------
// Derived values

export const mapOf = (s: GameState): MapDef => MAPS[s.mapId];
export const sheetOf = (s: GameState): SidesheetDef => SIDESHEETS[mapOf(s).sidesheet];
export const food = (s: GameState) => s.foodPainted - s.foodSpent;
export const hearts = (s: GameState) => s.heartsPainted - s.heartsLost;
export const position = (s: GameState) => s.visited[s.visited.length - 1];
export const skillsUnlocked = (s: GameState) => 1 + FOOD_SKILL_AT.filter((n) => s.foodPainted >= n).length;
export const hasGift = (s: GameState, g: GiftId) => s.giftsTaken.includes(g);

export function hasSkill(s: GameState, skill: SkillId): boolean {
  const i = CHARACTERS[s.character].skills.indexOf(skill);
  return i >= 0 && i < skillsUnlocked(s);
}

/** The table column for the current hex: its terrain, or its Village / Castle (p14, p48). */
export function columnFor(s: GameState, which: 'terrain' | 'poi'): Column | null {
  const map = mapOf(s);
  const here = position(s);
  if (which === 'poi') {
    const poi = poiAt(map, here);
    return poi ? (poi.kind === 'village' ? 'village' : 'castle') : null;
  }
  const t = terrainAt(map, here);
  return isLand(t) ? (t as Column) : null;
}

export function enemyAt(s: GameState, die: number, column: Column): Enemy {
  return sheetOf(s).adventure[rowOfDie(die)][COLUMNS.indexOf(column)];
}

/** The loot an enemy still gives: a gem or Treasure already taken is crossed off (Q5). */
export function lootLeft(s: GameState, die: number, column: Column): Effect[] {
  const cell = `${rowOfDie(die)}.${COLUMNS.indexOf(column)}`;
  return enemyAt(s, die, column).loot.filter(
    (l) => !(l.k === 'gem' && s.gemsTaken.includes(cell)) && !(l.k === 'treasure' && s.treasures.includes(l.t)),
  );
}

export function score(s: GameState): number {
  return (
    SCORE.maxAttr * ATTRS.filter((a) => s.attrs[a] >= ATTR_MAX).length +
    SCORE.skill * (skillsUnlocked(s) - 1) +
    SCORE.heart * hearts(s) +
    SCORE.treasure * s.treasures.length +
    SCORE.relicGem * s.relic +
    SCORE.boss * s.bossesDefeated.length +
    SCORE.hex * (s.visited.length - 1) +
    (hasGift(s, 'cat') ? SCORE.blackCat : 0)
  );
}

// ---------------------------------------------------------------------------------------------
// Travel (p12, p34-45, RULES-NOTES Q2, Q3, B)

export interface TravelPath {
  path: string[];
  /** Mountain/Water hexes crossed without permission: 2 hearts each, unstuck crossing only. */
  unpermitted: number;
}

function crossPermission(s: GameState, die: number) {
  const t = TRAVEL[die];
  const balloon = hasGift(s, 'balloon') && (die === 2 || die === 6);
  return {
    mountain: t.mountain || balloon || hasGift(s, 'donkey'),
    water: t.water || balloon || hasGift(s, 'boat'),
  };
}

/** Every path a die could take from here, ordinary or not; `unpermitted` > 0 marks a crossing that needs the unstuck rule. */
export function allPaths(s: GameState, die: number): TravelPath[] {
  const map = mapOf(s);
  const base = TRAVEL[die].hexes;
  const perm = crossPermission(s, die);
  const visited = new Set(s.visited);
  const out: TravelPath[] = [];
  const maxExtra = (hasGift(s, 'boat') ? 1 : 0) + (hasGift(s, 'donkey') ? 1 : 0);
  const walk = (path: string[]) => {
    const here = path.length ? path[path.length - 1] : position(s);
    if (path.length >= base) {
      const t = terrainAt(map, here);
      if (isLand(t)) {
        const crossed = path.slice(0, -1).map((k) => terrainAt(map, k));
        const crossesW = crossed.includes('water');
        const crossesM = crossed.includes('mountain');
        // Sail Boat / Trusty Donkey: one optional extra hex each when the path crosses their terrain (Q3).
        const extra = (hasGift(s, 'boat') && crossesW ? 1 : 0) + (hasGift(s, 'donkey') && crossesM ? 1 : 0);
        if (path.length - base <= extra) {
          const unpermitted = crossed.filter((t2) => (t2 === 'water' && !perm.water) || (t2 === 'mountain' && !perm.mountain)).length;
          out.push({ path: [...path], unpermitted });
        }
      }
      if (path.length >= base + maxExtra) return;
    }
    for (const n of neighbours(here)) {
      if (visited.has(n) || path.includes(n)) continue;
      walk([...path, n]);
    }
  };
  walk([]);
  return out;
}

const ordinary = (paths: TravelPath[]) => paths.filter((p) => p.unpermitted === 0);

/** Dice still in hand that can travel: by an ordinary path, or - when none can - by the unstuck crossing (Q2). */
export function travelOptions(s: GameState): { die: number; paths: TravelPath[]; unstuck: boolean }[] {
  const hand = s.dice.map((d, i) => ({ d, i })).filter(({ i }) => !s.used[i]);
  const byDie = hand.map(({ d, i }) => ({ i, all: allPaths(s, d) }));
  const anyOrdinary = byDie.some((b) => ordinary(b.all).length > 0);
  return byDie
    .map((b) => ({ die: b.i, paths: anyOrdinary ? ordinary(b.all) : b.all, unstuck: !anyOrdinary }))
    .filter((o) => o.paths.length > 0);
}

/** Whether this round can still end in a Travel - directly, or after a Gift on a double (p66). */
export function canStillTravel(s: GameState): boolean {
  if (travelOptions(s).length > 0) return true;
  if (s.giftThisRound || s.mustTravelNext) return false;
  for (const face of giftFaces(s)) {
    const after = takeGiftForCheck(s, face);
    if (travelOptions(after).length > 0) return true;
  }
  return false;
}

// ---------------------------------------------------------------------------------------------
// Gifts (p66-73)

/** Why the double of this face can't find its Gift now, or null if it can (p20, p66). */
export function giftError(s: GameState, face: number): string | null {
  if (s.phase !== 'round') return 'Roll first.';
  if (s.giftThisRound) return 'One Gift a round: the double is already spent.';
  if (s.mustTravelNext) return 'After Cross Training the Travel comes next.';
  // The double's two dice must both be unspent, and nothing but the Travel done (p66).
  if (s.travelled && s.used.filter(Boolean).length !== 1) return 'Both dice of the double must be unspent.';
  if (s.dice.filter((d, i) => d === face && !s.used[i]).length < 2) return 'No double of that face among the dice in hand.';
  const name = GIFT_NAME[sheetOf(s).gifts[face - 1]];
  if (s.giftsTaken.includes(sheetOf(s).gifts[face - 1])) return `${name[0].toUpperCase()}${name.slice(1)} is already taken.`;
  return null;
}

/** Faces whose double can find its Gift now. */
export function giftFaces(s: GameState): number[] {
  return [1, 2, 3, 4, 5, 6].filter((f) => !giftError(s, f));
}

/** Taking this Gift before travelling would leave a die that cannot travel: the game ends (p66, p40). */
export function giftEndsGame(s: GameState, face: number): boolean {
  return !s.travelled && !giftError(s, face) && travelOptions(takeGiftForCheck(s, face)).length === 0;
}

function takeGiftForCheck(s: GameState, face: number): GameState {
  const gift = sheetOf(s).gifts[face - 1];
  const used = [...s.used];
  let n = 0;
  s.dice.forEach((d, i) => {
    if (n < 2 && d === face && !used[i]) {
      used[i] = true;
      n++;
    }
  });
  return { ...s, used, giftThisRound: true, giftsTaken: [...s.giftsTaken, gift] };
}

export const GIFT_NAME: Record<GiftId, string> = {
  donkey: 'the Trusty Donkey',
  campfire: 'the Campfire',
  eggs: 'the Vital Eggs',
  crate: 'the Treasure Crate',
  tent: 'the Mammoth Tent',
  balloon: 'the Balloon',
  boat: 'the Sail Boat',
  flame: 'the Skill Flame',
  cat: 'the Black Cat',
  cart: 'the Attribute Cart',
};

export function availableGifts(s: GameState): GiftId[] {
  return sheetOf(s).gifts.filter((g) => !s.giftsTaken.includes(g));
}

// ---------------------------------------------------------------------------------------------
// The ledger: every change to food, hearts and attributes goes through here, and the log line is
// built from what it recorded, so a message can only say what really happened.

interface Ctx {
  s: GameState;
  notes: string[];
  shield: boolean; // the player asked for Mana Shield on this action's first lost heart
  dead: boolean;
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

function gainFood(c: Ctx, n: number) {
  const room = FOOD_BOX - c.s.foodPainted;
  const got = Math.min(n, room);
  if (got > 0) {
    const before = c.s.foodPainted;
    c.s.foodPainted += got;
    c.notes.push(`+${got} food`);
    // Milestones count food painted (p23).
    for (const at of FOOD_POINT_AT) if (before < at && c.s.foodPainted >= at) queuePoints(c, 1, 'food box');
    FOOD_SKILL_AT.forEach((at, i) => {
      if (before < at && c.s.foodPainted >= at) {
        c.notes.push(`food ${at} reached, ${SKILL_TEXT[CHARACTERS[c.s.character].skills[i + 1]].name} unlocked`);
      }
    });
  }
  if (got < n) c.notes.push(`food box full, ${plural(n - got, 'food', 'food')} lost`);
}

function payFood(c: Ctx, n: number) {
  const paid = Math.min(n, food(c.s));
  if (paid > 0) {
    c.s.foodSpent += paid;
    c.notes.push(`-${paid} food`);
  }
  // Food that can't be paid costs a heart each (p14, p35).
  if (n - paid > 0) {
    c.notes.push(`short of ${plural(n - paid, 'food', 'food')}`);
    loseHearts(c, n - paid);
  }
}

function gainHearts(c: Ctx, n: number) {
  const room = HEART_BOX - c.s.heartsPainted;
  const got = Math.min(n, room);
  if (got > 0) {
    c.s.heartsPainted += got;
    c.notes.push(`+${plural(got, 'heart', 'hearts')}`);
  }
  if (got < n) c.notes.push(`HP box full, ${plural(n - got, 'heart', 'hearts')} lost`);
}

/** Loses n hearts one at a time: Mana Shield may stop one, Overcoming answers the first (Q14). */
function loseHearts(c: Ctx, n: number) {
  for (let k = 0; k < n && !c.dead; k++) {
    if (c.shield && !c.s.manaShieldUsed && hasSkill(c.s, 'manaShield') && food(c.s) > 0) {
      c.s.manaShieldUsed = true;
      c.shield = false;
      c.s.foodSpent += 1;
      c.notes.push('Mana Shield: -1 food instead of a heart');
      continue;
    }
    c.s.heartsLost += 1;
    c.notes.push('-1 heart');
    if (hearts(c.s) <= 0) {
      c.dead = true;
      return;
    }
    if (hasSkill(c.s, 'overcoming') && !c.s.overcomingUsed) {
      c.s.overcomingUsed = true;
      c.notes.push('Overcoming:');
      gainFood(c, 1);
    }
  }
}

/** Raises an attribute; one call is one "gain" for Magic Berry (RULES-NOTES D). */
function gainAttr(c: Ctx, a: Attr, n: number) {
  const got = Math.min(n, ATTR_MAX - c.s.attrs[a]);
  if (got > 0) {
    c.s.attrs[a] += got;
    c.notes.push(`+${got} ${ATTR_NAME[a]}`);
    if (a === 'mag' && hasSkill(c.s, 'magicBerry')) {
      c.notes.push('Magic Berry:');
      gainFood(c, 1);
    }
  }
  if (got < n) c.notes.push(`${ATTR_NAME[a]} is at 12, ${n - got} ignored`);
}

function queuePoints(c: Ctx, n: number, why: string) {
  // Points can only go where an attribute is below 12 (p22); if none is, they are ignored.
  if (ATTRS.every((a) => c.s.attrs[a] >= ATTR_MAX)) {
    c.notes.push(`${plural(n, 'attribute point', 'attribute points')} ignored, all attributes at 12`);
    return;
  }
  c.s.pending.push({ kind: 'points', n, group: c.s.nextGroup++ });
  c.notes.push(`${plural(n, 'attribute point', 'attribute points')} to place (${why})`);
}

function gainGem(c: Ctx) {
  c.s.pending.push({ kind: 'gem' });
  c.notes.push('a gem');
  // Greed: every gem gained, kept or traded, gives an attribute point.
  if (hasSkill(c.s, 'greed')) queuePoints(c, 1, 'Greed');
}

function gainTreasure(c: Ctx, t: TreasureId) {
  if (c.s.treasures.includes(t)) return;
  c.s.treasures.push(t);
  c.notes.push(`the ${TREASURE_NAME[t]}`);
}

function applyEffects(c: Ctx, effects: Effect[], source: string) {
  for (const e of effects) {
    if (c.dead) return;
    switch (e.k) {
      case 'food':
        if (e.n > 0) gainFood(c, e.n);
        else payFood(c, -e.n);
        break;
      case 'heart':
        if (e.n > 0) gainHearts(c, e.n);
        else loseHearts(c, -e.n);
        break;
      case 'point':
        queuePoints(c, e.n, source);
        break;
      case 'attr':
        gainAttr(c, e.a, e.n);
        break;
      case 'gem':
        gainGem(c);
        break;
      case 'treasure':
        gainTreasure(c, e.t);
        break;
    }
  }
}

function logAction(c: Ctx, head: string) {
  const body = c.notes.length ? ` ${c.notes.join(', ').replace(/:,/g, ':')}.` : '';
  c.s.log.push({ round: c.s.round, text: `${head}${body}` });
  if (c.dead) {
    c.s.phase = 'lost';
    c.s.result = { reason: 'You ran out of hearts.', score: null };
    c.s.log.push({ round: c.s.round, text: 'Out of hearts: game over. A defeat is not scored.' });
  }
}

// ---------------------------------------------------------------------------------------------
// Combat (p15-17, p51-54; Enchant N5, Q13)

export interface CombatPreview {
  damage: number;
  /** Per requirement applied: the requirement, the attribute compared and its level. */
  parts: { a: Attr; v: number; vs: Attr; have: number; short: number }[];
  treasurePenalty: number;
}

export function combatDamage(
  s: GameState,
  reqs: { a: Attr; v: number }[],
  type: 'single' | 'linked' | 'unlinked',
  opts: { pick?: number; enchant?: boolean },
): CombatPreview {
  const applied = type === 'unlinked' ? [reqs[opts.pick ?? 0]] : reqs;
  const parts = applied.map((r) => {
    // Enchant: compare Magic wherever Strength is asked; each requirement separately (N5).
    const vs: Attr = opts.enchant && r.a === 'str' ? 'mag' : r.a;
    const have = s.attrs[vs];
    return { a: r.a, v: r.v, vs, have, short: Math.max(0, r.v - have) };
  });
  return { damage: parts.reduce((t, p) => t + p.short, 0), parts, treasurePenalty: 0 };
}

// ---------------------------------------------------------------------------------------------
// What may happen now, with the reason when it may not. The UI highlights from these.

export function actionError(s: GameState, cmd: Command): string | null {
  if (s.phase === 'won' || s.phase === 'lost') return 'The game is over.';
  const pendingKinds = s.pending.map((p) => p.kind);
  const choice = ['point', 'gem', 'treasure', 'chooseGift'].includes(cmd.t);
  if (s.pending.length && !choice) return 'First place what you gained.';
  if (choice) {
    const want = { point: 'points', gem: 'gem', treasure: 'treasure', chooseGift: 'gift' }[cmd.t as 'point'];
    if (pendingKinds[0] !== want) return 'Nothing of that kind to place.';
  }
  switch (cmd.t) {
    case 'start':
      if (s.phase !== 'start') return 'The game has started.';
      if (cmd.die !== undefined && (!Number.isInteger(cmd.die) || cmd.die < 1 || cmd.die > 6)) return 'A die, 1 to 6.';
      return null;
    case 'roll':
      if (s.phase !== 'roll') return s.phase === 'start' ? 'Roll for your starting Village first.' : 'Finish this round first.';
      if (cmd.dice && (cmd.dice.length !== 3 || cmd.dice.some((d) => !Number.isInteger(d) || d < 1 || d > 6))) return 'Three dice, 1 to 6.';
      return null;
    case 'gift':
      return giftError(s, cmd.face);
    case 'crossTraining':
      if (s.phase !== 'round') return 'Roll first.';
      if (!hasSkill(s, 'crossTraining')) return 'Cross Training is not unlocked.';
      if (s.travelled) return 'Only before travelling.';
      if (food(s) < 2) return 'Cross Training needs 2 food.';
      if (travelOptions(s).length === 0) return 'No Travel is possible, so neither is a "before travelling" skill.';
      return null;
    case 'travel': {
      if (s.phase !== 'round') return 'Roll first.';
      if (s.travelled) return 'You travel once a round.';
      const opt = travelOptions(s).find((o) => o.die === cmd.die);
      if (!opt) return 'That die has no legal path from here.';
      return opt.paths.some((p) => p.path.join() === cmd.path.join()) ? null : 'Not a legal path for that die.';
    }
    case 'magicBlood':
      if (!hasSkill(s, 'magicBlood')) return 'Magic Blood is not unlocked.';
      if (!s.magicBloodOpen) return 'Only right after travelling, before anything else.';
      return null;
    case 'explore':
    case 'adventure':
    case 'boss': {
      if (s.phase !== 'round') return 'Roll first.';
      if (!s.travelled) return 'Travel first.';
      if (s.giftThisRound) return 'The Gift spent this round\'s other dice.';
      if (cmd.die < 0 || cmd.die > 2 || s.used[cmd.die]) return 'That die is used.';
      if (cmd.t === 'boss') {
        if (poiAt(mapOf(s), position(s))?.kind !== 'castle') return 'Bosses are fought only in a Castle.';
        if (s.bossesDefeated.includes(s.dice[cmd.die])) return 'That Boss is already defeated.';
        if (cmd.enchant && !hasSkill(s, 'enchant')) return 'Enchant is the Mage\'s.';
        return null;
      }
      if (!columnFor(s, cmd.column)) return cmd.column === 'poi' ? 'There is no Village or Castle here.' : 'No terrain column here.';
      if (cmd.t === 'adventure') {
        const e = enemyAt(s, s.dice[cmd.die], columnFor(s, cmd.column)!);
        if (e.req.type === 'unlinked' && cmd.pick !== 0 && cmd.pick !== 1) return 'Choose which requirement to meet.';
        if (cmd.enchant && !hasSkill(s, 'enchant')) return 'Enchant is the Mage\'s.';
      }
      return null;
    }
    case 'point':
      return s.attrs[cmd.attr] >= ATTR_MAX ? `${ATTR_NAME[cmd.attr]} is at 12.` : null;
    case 'gem':
      if (cmd.to === 'relic' && s.relic >= sheetOf(s).relic.size) return 'The Relic box is full.';
      return null;
    case 'treasure':
      return s.treasures.includes(cmd.treasure) ? 'You already have it.' : null;
    case 'chooseGift':
      return availableGifts(s).includes(cmd.gift) ? null : 'That Gift is gone.';
    case 'finish':
      return s.bossesDefeated.length >= BOSSES_TO_WIN ? null : 'You win by defeating two Bosses.';
  }
}

// ---------------------------------------------------------------------------------------------
// act

const clone = (s: GameState): GameState => JSON.parse(JSON.stringify(s));

export function act(state: GameState, cmd: Command): GameState {
  const err = actionError(state, cmd);
  if (err) throw new Error(err);
  const s = clone(state);
  const c: Ctx = { s, notes: [], shield: 'shield' in cmd && !!cmd.shield, dead: false };
  const roll = () => {
    const [d, next] = rollD6(s.rng);
    s.rng = next;
    return d;
  };

  switch (cmd.t) {
    case 'start': {
      const die = cmd.die ?? roll();
      const v = mapOf(s).villages[die];
      s.visited = [key(v.row, v.col)];
      s.phase = 'roll';
      s.epoch++;
      s.log.push({ round: 0, text: `Rolled ${die}: start at ${hexLabel(mapOf(s), s.visited[0])}.` });
      return s;
    }

    case 'roll': {
      s.round++;
      s.dice = cmd.dice ?? [roll(), roll(), roll()];
      s.used = [false, false, false];
      s.travelled = false;
      s.giftThisRound = false;
      s.adventures = 0;
      s.overcomingUsed = false;
      s.manaShieldUsed = false;
      s.magicBloodOpen = false;
      s.mustTravelNext = false;
      s.phase = 'round';
      s.epoch++;
      s.log.push({ round: s.round, text: `Round ${s.round}: rolled ${s.dice.join(', ')}.` });
      if (!canStillTravel(s)) {
        s.phase = 'lost';
        s.result = { reason: 'Stuck: no die can travel from here.', score: null };
        s.log.push({ round: s.round, text: 'No die can travel from here, even crossing: stuck, game over (p40). A defeat is not scored.' });
      }
      return s;
    }

    case 'gift': {
      const gift = sheetOf(s).gifts[cmd.face - 1];
      let n = 0;
      s.dice.forEach((d, i) => {
        if (n < 2 && d === cmd.face && !s.used[i]) {
          s.used[i] = true;
          n++;
        }
      });
      s.giftThisRound = true;
      s.magicBloodOpen = false;
      takeGift(c, gift);
      logAction(c, `Double ${cmd.face}s: found ${GIFT_NAME[gift]}.`);
      if (!s.travelled && s.phase === 'round' && !canStillTravel(s)) {
        s.phase = 'lost';
        s.result = { reason: 'Stuck: the die left cannot travel.', score: null };
        s.log.push({ round: s.round, text: 'The die left cannot travel from here: stuck, game over (p40).' });
      }
      return endRoundIfDone(s);
    }

    case 'crossTraining': {
      payFood(c, 2);
      gainAttr(c, 'str', 1);
      s.mustTravelNext = true;
      logAction(c, 'Cross Training:');
      return s;
    }

    case 'travel': {
      const die = s.dice[cmd.die];
      const opt = travelOptions(s).find((o) => o.die === cmd.die)!;
      const tp = opt.paths.find((p) => p.path.join() === cmd.path.join())!;
      s.used[cmd.die] = true;
      s.travelled = true;
      s.mustTravelNext = false;
      // Adrenaline reads the hearts at the moment the Travel starts, before its costs (RULES-NOTES B).
      if (hasSkill(s, 'adrenaline') && hearts(s) <= 2) {
        c.notes.push('Adrenaline:');
        gainAttr(c, 'str', 1);
      }
      payFood(c, TRAVEL[die].food);
      const penalty = tp.unpermitted * UNSTUCK_PENALTY;
      if (penalty > 0 && !c.dead) {
        c.notes.push(`crossing without the right die:`);
        loseHearts(c, penalty);
      }
      if (!c.dead) {
        s.visited.push(...tp.path);
        s.legs.push({ round: s.round, die, path: [...tp.path], penalty });
        if (hasGift(s, 'campfire') && die >= 3 && die <= 5) queuePoints(c, 1, 'Campfire');
        s.magicBloodOpen = hasSkill(s, 'magicBlood');
      }
      const where = hexLabel(mapOf(s), tp.path[tp.path.length - 1]);
      logAction(c, c.dead ? `Set out with a ${die} towards ${where}, and fell on the way.` : `Travelled with a ${die}: ${plural(tp.path.length, 'hex', 'hexes')} to ${where}.`);
      return endRoundIfDone(s);
    }

    case 'magicBlood': {
      loseHearts(c, 1);
      if (!c.dead) gainAttr(c, 'mag', 1);
      logAction(c, 'Magic Blood:');
      return s;
    }

    case 'explore': {
      const die = s.dice[cmd.die];
      const col = columnFor(s, cmd.column)!;
      s.used[cmd.die] = true;
      s.magicBloodOpen = false;
      applyEffects(c, sheetOf(s).explore[rowOfDie(die)][COLUMNS.indexOf(col)], 'Explore');
      logAction(c, `Explored the ${col} with a ${die}:`);
      return endRoundIfDone(s);
    }

    case 'adventure': {
      const die = s.dice[cmd.die];
      const col = columnFor(s, cmd.column)!;
      const enemy = enemyAt(s, die, col);
      s.used[cmd.die] = true;
      s.magicBloodOpen = false;
      if (cmd.enchant) {
        c.notes.push('Enchant:');
        loseHearts(c, 1);
      }
      const cv = combatDamage(s, enemy.req.reqs, enemy.req.type, { pick: cmd.pick, enchant: cmd.enchant });
      if (!c.dead && cv.damage > 0) loseHearts(c, cv.damage);
      if (!c.dead) {
        c.notes.push(cv.damage === 0 ? 'won without a scratch' : 'won');
        const cell = `${rowOfDie(die)}.${COLUMNS.indexOf(col)}`;
        const loot = lootLeft(s, die, col);
        if (loot.some((l) => l.k === 'gem')) s.gemsTaken.push(cell);
        applyEffects(c, loot, 'loot');
        s.adventures++;
        if (s.adventures === 2) {
          if (hasSkill(s, 'focus')) {
            c.notes.push('Focus:');
            gainAttr(c, 'agi', 1);
          }
          if (hasGift(s, 'flame')) queuePoints(c, 1, 'Skill Flame');
        }
      }
      logAction(c, `Adventure with a ${die}: ${enemy.name} (${describeReq(enemy, cmd.pick, cmd.enchant)}).`);
      return endRoundIfDone(s);
    }

    case 'boss': {
      const die = s.dice[cmd.die];
      const boss = BOSSES[die - 1];
      s.used[cmd.die] = true;
      s.magicBloodOpen = false;
      if (cmd.enchant) {
        c.notes.push('Enchant:');
        loseHearts(c, 1);
      }
      const cv = combatDamage(s, boss.reqs, 'linked', { enchant: cmd.enchant });
      const missing = s.treasures.includes(boss.treasure) ? 0 : BOSS_TREASURE_PENALTY;
      if (missing) c.notes.push(`without the ${TREASURE_NAME[boss.treasure]}:`);
      if (!c.dead && cv.damage + missing > 0) loseHearts(c, cv.damage + missing);
      if (!c.dead) {
        s.bossesDefeated.push(die);
        c.notes.push(`${boss.name} is defeated`);
        // The reward: a Gift of choice, or a gem when none is left (p18).
        if (availableGifts(s).length) {
          s.pending.push({ kind: 'gift' });
          c.notes.push('choose a Gift');
        } else gainGem(c);
      }
      logAction(c, `Boss fight with a ${die}: ${boss.name}.`);
      if (!c.dead && s.bossesDefeated.length >= BOSSES_TO_WIN) {
        s.log.push({ round: s.round, text: 'Second Boss defeated: you win! Use any die still in hand, or finish.' });
      }
      return endRoundIfDone(s);
    }

    case 'point': {
      const p = s.pending[0] as Extract<Pending, { kind: 'points' }>;
      // One "gain" per group for Magic Berry: only the first Magic point of a group counts (D).
      const berry = cmd.attr === 'mag' && hasSkill(s, 'magicBerry') && !s.berryGroups.includes(p.group);
      if (berry) s.berryGroups.push(p.group);
      s.attrs[cmd.attr] += 1;
      c.notes.push(`+1 ${ATTR_NAME[cmd.attr]}`);
      if (berry) {
        c.notes.push('Magic Berry:');
        gainFood(c, 1);
      }
      p.n--;
      if (p.n <= 0 || ATTRS.every((a) => s.attrs[a] >= ATTR_MAX)) s.pending.shift();
      logAction(c, 'Attribute point:');
      return endRoundIfDone(s);
    }

    case 'gem': {
      s.pending.shift();
      const sheet = sheetOf(s);
      if (cmd.to === 'relic') {
        s.relic++;
        c.notes.push(`${s.relic} of ${sheet.relic.size} in the Relic box`);
        if (s.relic === sheet.relic.size) {
          c.notes.push('the box is full:');
          applyEffects(c, sheet.relic.reward, 'Relic box');
        }
        logAction(c, 'Gem into the Relic box:');
      } else {
        applyEffects(c, sheet.trade, 'Trade');
        logAction(c, 'Gem traded:');
      }
      return endRoundIfDone(s);
    }

    case 'treasure': {
      s.pending.shift();
      gainTreasure(c, cmd.treasure);
      logAction(c, 'From the Treasure Crate:');
      return endRoundIfDone(s);
    }

    case 'chooseGift': {
      s.pending.shift();
      takeGift(c, cmd.gift);
      logAction(c, `Boss reward: ${GIFT_NAME[cmd.gift]}.`);
      return endRoundIfDone(s);
    }

    case 'finish': {
      s.dice.forEach((_, i) => (s.used[i] = true));
      return endRoundIfDone(s);
    }
  }
}

function takeGift(c: Ctx, gift: GiftId) {
  const s = c.s;
  s.giftsTaken.push(gift);
  switch (gift) {
    case 'eggs':
      queuePoints(c, 3, 'Vital Eggs');
      break;
    case 'tent':
      gainHearts(c, 4);
      break;
    case 'cart':
      gainAttr(c, sheetOf(s).cartAttr ?? 'str', 3);
      break;
    case 'crate': {
      const left = TREASURES.filter((t) => !s.treasures.includes(t)).length;
      for (let k = 0; k < Math.min(2, left); k++) s.pending.push({ kind: 'treasure' });
      c.notes.push(`choose ${plural(Math.min(2, left), 'Treasure', 'Treasures')}`);
      break;
    }
    case 'cat':
      c.notes.push(`+${SCORE.blackCat} to the final score`);
      break;
    default:
      c.notes.push('a permanent effect');
  }
}

function describeReq(e: Enemy, pick?: number, enchant?: boolean): string {
  const r = e.req.type === 'unlinked' ? [e.req.reqs[pick ?? 0]] : e.req.reqs;
  const txt = r.map((q) => `${ATTR_NAME[q.a]} ${q.v}`).join(' and ');
  return `${txt}${e.req.type === 'unlinked' ? ', chosen' : ''}${enchant ? ', Enchanted' : ''}`;
}

/** Ends the round when the Travel is done, the other dice are spent and nothing waits to be placed. */
function endRoundIfDone(s: GameState): GameState {
  if (s.phase !== 'round' || s.pending.length) return s;
  const won = s.bossesDefeated.length >= BOSSES_TO_WIN;
  const done = s.travelled && (s.giftThisRound || s.used.every(Boolean));
  if (won && (done || s.used.every(Boolean))) {
    s.phase = 'won';
    const sc = score(s);
    s.result = { reason: 'Two Bosses defeated.', score: sc };
    s.log.push({ round: s.round, text: `Victory. Final score ${sc}.` });
    return s;
  }
  if (done) s.phase = 'roll';
  return s;
}

export { parseKey };
