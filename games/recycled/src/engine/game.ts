// The rules engine. Pure functions over a plain JSON GameState, so the game can be
// saved, undone and tested easily. The UI never changes state directly: it sends
// a Command to `act`, which validates it against the rules and returns a new state.

import { BUILDINGS } from '../data/buildings';
import { MAPS } from '../data/maps';
import {
  ACCIDENTS,
  ACTION_COST,
  CONSUMPTION,
  DEPOT_BOXES,
  LAUNCH_REQUIREMENTS,
  MAX_REPEATS,
  RES_NAMES,
  SANITY_TECH_MARKS,
  TECH_BONUSES,
  TOTAL_DAYS,
} from '../data/rules';
import {
  DEPOT_ROWS,
  VITAL,
  type BuildingType,
  type DepotRes,
  type MapDef,
  type Res,
} from '../data/types';
import { buildHexes, distance, neighbors, rowColToKey, type Hex } from './hex';
import { randomSeed, rollD6 } from './rng';

// ---------------------------------------------------------------- state types

export interface BuildingState {
  id: number;
  type: BuildingType;
  hex: string;
  /** Circles drawn so far (lifetime). Can never exceed capacity. */
  drawn: number;
  /** Of the drawn circles, how many are darkened (spent). */
  used: number;
  /** Setup steps completed (Separator / Recycler). */
  step: number;
  complete: boolean;
  /** Stored resource (Cryo Tank). */
  res?: Res;
  /** Building joined with a shared contour. */
  link?: number;
  /** One-off bonus already granted (Full Research Site / Laboratory, Amplifier six pods). */
  bonusDone?: boolean;
}

export interface ActionDie {
  value: number;
  used: boolean;
  /** Original dice values when two dice are combined into one action. */
  parts: number[];
  /** Double/triple 1s: cannot be split. */
  locked?: boolean;
}

export type Phase = 'roll' | 'choose' | 'actions' | 'won' | 'lost';

export interface LogEntry {
  day: number;
  text: string;
  tone?: 'good' | 'bad' | 'info';
}

export interface AccidentResult {
  day: number;
  dice: [number, number];
  roll: number;
  name: string;
}

export interface GameState {
  version: 1;
  mapId: string;
  seed: number;
  rng: number;
  /** Days completed. The current turn is day + 1. */
  day: number;
  phase: Phase;
  dice: number[];
  accidentIdx: number | null;
  actionDice: ActionDie[];
  noAccident: boolean;
  lastAccident: AccidentResult | null;
  buildings: BuildingState[];
  nextId: number;
  depot: Record<DepotRes, { gained: number; lost: number }>;
  techTaken: boolean[];
  techPending: number;
  batteries: number;
  log: LogEntry[];
  endReason?: string;
}

export type ActionKind =
  | 'setupSeparator'
  | 'setupRecycler'
  | 'recycle'
  | 'produce'
  | 'salvage'
  | 'study'
  | 'craft'
  | 'fixFuse'
  | 'build';

export interface ActionParams {
  /** Hex key of the target building / construction site. */
  hex?: string;
  /** Building to construct (build action). */
  building?: BuildingType;
  /** What to craft. */
  craft?: 'automatron' | 'battery';
  /**
   * Hex of the building a new Cryo Tank / Recycler joins with a shared contour. Needed only when
   * more than one neighbour could be joined; with a single candidate it is chosen automatically.
   */
  joinTo?: string;
}

export type Command =
  | { t: 'roll' }
  | { t: 'chooseAccident'; idx: number }
  | { t: 'combine' }
  | { t: 'split' }
  | { t: 'action'; die: number; action: ActionKind; params?: ActionParams }
  | { t: 'endActions' }
  | { t: 'tech'; idx: number }
  | { t: 'launch' };

export class RuleError extends Error {}

// ---------------------------------------------------------------- setup

const hexCache = new Map<string, Map<string, Hex>>();
export function hexesOf(s: { mapId: string }): Map<string, Hex> {
  let h = hexCache.get(s.mapId);
  if (!h) {
    h = buildHexes(MAPS[s.mapId]);
    hexCache.set(s.mapId, h);
  }
  return h;
}

export function mapOf(s: { mapId: string }): MapDef {
  return MAPS[s.mapId];
}

/**
 * Bring a saved game up to what this code expects. Returns null if it is not a Recycled save.
 * Add a step here whenever GameState gains a field or a fixed-size array grows, so old saves
 * keep loading (see CLAUDE.md, "State schema and save compatibility").
 */
export function migrateSave(raw: unknown): GameState | null {
  if (!raw || typeof raw !== 'object') return null;
  const s = structuredClone(raw) as GameState;
  if (s.version !== 1 || !MAPS[s.mapId] || !Array.isArray(s.buildings)) return null;
  for (const r of DEPOT_ROWS) s.depot[r] ??= { gained: 0, lost: 0 };
  while (s.techTaken.length < TECH_BONUSES.length) s.techTaken.push(false);
  s.log ??= [];
  return s;
}

export function newGame(mapId = 'planet1', seed = randomSeed()): GameState {
  const map = MAPS[mapId];
  if (!map) throw new Error(`Unknown map ${mapId}`);
  const s: GameState = {
    version: 1,
    mapId,
    seed,
    rng: seed,
    day: 0,
    phase: 'roll',
    dice: [],
    accidentIdx: null,
    actionDice: [],
    noAccident: false,
    lastAccident: null,
    buildings: [],
    nextId: 1,
    depot: structuredClone(map.depot),
    techTaken: TECH_BONUSES.map(() => false),
    techPending: 0,
    batteries: 0,
    log: [],
  };
  const idAt = new Map<string, number>();
  for (const p of map.prebuilt) {
    const def = BUILDINGS[p.type];
    const hex = rowColToKey(map, p.at[0], p.at[1]);
    const b: BuildingState = {
      id: s.nextId++,
      type: p.type,
      hex,
      drawn: p.drawn,
      used: p.used ?? 0,
      step: def.setupSteps ?? 0,
      complete: true,
      res: p.res ?? def.stores[0],
    };
    s.buildings.push(b);
    idAt.set(`${p.at[0]},${p.at[1]}`, b.id);
  }
  for (const p of map.prebuilt) {
    if (!p.linkTo) continue;
    const a = byId(s, idAt.get(`${p.at[0]},${p.at[1]}`)!);
    const b = byId(s, idAt.get(`${p.linkTo[0]},${p.linkTo[1]}`)!);
    a.link = b.id;
    b.link = a.id;
  }
  log(s, `Shift started on ${map.name}. Survive ${TOTAL_DAYS} days or launch the shuttle.`, 'info');
  return s;
}

// ---------------------------------------------------------------- queries

export const turnNumber = (s: GameState) => s.day + 1;

export function byId(s: GameState, id: number): BuildingState {
  const b = s.buildings.find((x) => x.id === id);
  if (!b) throw new Error(`No building ${id}`);
  return b;
}

export function buildingAt(s: GameState, hex: string): BuildingState | undefined {
  return s.buildings.find((b) => b.hex === hex);
}

export const capacity = (b: BuildingState) => BUILDINGS[b.type].capacity;
export const space = (b: BuildingState) => capacity(b) - b.drawn;
export const stock = (b: BuildingState) => b.drawn - b.used;
export const isFull = (b: BuildingState) => capacity(b) > 0 && b.drawn >= capacity(b);

/** Resource a building's circles hold. */
export function storedRes(b: BuildingState): Res | undefined {
  return b.res ?? BUILDINGS[b.type].stores[0];
}

export function depotStock(s: GameState, r: Res): number {
  if (!(DEPOT_ROWS as Res[]).includes(r)) return 0;
  const c = s.depot[r as DepotRes];
  return c.gained - c.lost;
}

export function localStock(s: GameState, r: Res): number {
  return s.buildings
    .filter((b) => b.complete && storedRes(b) === r)
    .reduce((n, b) => n + stock(b), 0);
}

export function total(s: GameState, r: Res): number {
  return depotStock(s, r) + localStock(s, r);
}

export function hasComplete(s: GameState, type: BuildingType): boolean {
  return s.buildings.some((b) => b.type === type && b.complete);
}

export function countOf(s: GameState, type: BuildingType, completeOnly = false): number {
  return s.buildings.filter((b) => b.type === type && (!completeOnly || b.complete)).length;
}

export function isUnlocked(s: GameState, hex: string): boolean {
  const h = hexesOf(s).get(hex);
  if (!h) return false;
  return !h.outer || hasComplete(s, 'rover');
}

export const isOver = (s: GameState) => s.phase === 'won' || s.phase === 'lost';

function adjacentBuildings(s: GameState, hex: string): BuildingState[] {
  const ns = new Set(neighbors(hex));
  return s.buildings.filter((b) => ns.has(b.hex));
}

/** Where a PRODUCE at this building puts its circles: itself first, then a joined Cryo Tank. */
function producePool(s: GameState, b: BuildingState): BuildingState[] {
  const pool = [b];
  if ((b.type === 'foodPlant' || b.type === 'oxygenPlant') && b.link) {
    const cryo = byId(s, b.link);
    if (cryo.type === 'cryoTank' && cryo.complete && storedRes(cryo) === storedRes(b)) pool.push(cryo);
  }
  return pool;
}

export function produceSpace(s: GameState, b: BuildingState): number {
  return producePool(s, b).reduce((n, x) => n + space(x), 0);
}

// ---------------------------------------------------------------- mutation helpers

function log(s: GameState, text: string, tone?: LogEntry['tone']) {
  s.log.push({ day: turnNumber(s), text, tone });
  if (s.log.length > 2000) s.log.splice(0, s.log.length - 2000);
}

function d6(s: GameState): number {
  const [v, next] = rollD6(s.rng);
  s.rng = next;
  return v;
}

/** Messages raised in the middle of a command (tech, Full bonuses, game over) are logged after it. */
let deferred: LogEntry[] = [];
function defer(s: GameState, text: string, tone?: LogEntry['tone']) {
  deferred.push({ day: turnNumber(s), text, tone });
}
function flushDeferred(s: GameState) {
  for (const e of deferred) s.log.push(e);
  deferred = [];
  if (s.log.length > 2000) s.log.splice(0, s.log.length - 2000);
}

function lose(s: GameState, reason: string) {
  if (isOver(s)) return;
  s.phase = 'lost';
  s.endReason = reason;
  defer(s, reason, 'bad');
}

function checkVitals(s: GameState) {
  for (const r of VITAL) {
    if (total(s, r) <= 0) {
      lose(s, `You lost your last unit of ${RES_NAMES[r]}.`);
      return;
    }
  }
}

/** "Food", "Automatrons", "Battery"... */
export function resName(r: Res, n: number): string {
  if (n === 1) return RES_NAMES[r];
  if (r === 'automatron') return 'Automatrons';
  if (r === 'battery') return 'Batteries';
  return RES_NAMES[r];
}

/** Signed amount as shown in the log: "+2 Food", "−1 Sanity". */
export function amountText(n: number, r: Res): string {
  return `${n < 0 ? '−' : '+'}${Math.abs(n)} ${resName(r, Math.abs(n))}`;
}

/**
 * Add to the Depot counter. Sanity past the last box becomes Materials; other rows
 * that are full lose the gain. Returns a log text of what actually happened.
 */
function gain(s: GameState, r: Res, n: number): string {
  let added = 0;
  let asMaterials = 0;
  for (let i = 0; i < n; i++) {
    if (!(DEPOT_ROWS as Res[]).includes(r)) {
      // No Depot row (Oxygen): store in a building with space, if any.
      const b = s.buildings.find((x) => x.complete && storedRes(x) === r && space(x) > 0);
      if (b) {
        draw(s, b, 1);
        added++;
      }
      continue;
    }
    const c = s.depot[r as DepotRes];
    if (c.gained >= DEPOT_BOXES) {
      if (r === 'sanity' && s.depot.materials.gained < DEPOT_BOXES) {
        s.depot.materials.gained++;
        asMaterials++;
      }
      continue;
    }
    c.gained++;
    added++;
    if (r === 'sanity' && SANITY_TECH_MARKS.includes(c.gained)) {
      queueTech(s, `Sanity counter reached T (box ${c.gained}).`);
    }
  }
  const parts: string[] = [];
  if (added) parts.push(amountText(added, r));
  if (asMaterials) parts.push(`${amountText(asMaterials, 'materials')} (Sanity counter is full)`);
  const missed = n - added - asMaterials;
  if (missed) parts.push(`${missed} ${resName(r, missed)} did not fit (no room left)`);
  return parts.join(', ');
}

function queueTech(s: GameState, why: string) {
  const left = s.techTaken.filter((t) => !t).length;
  if (s.techPending < left) {
    s.techPending++;
    defer(s, `${why} Choose a tech bonus.`, 'good');
  }
}

/** Draw circles in a building's local storage and fire "once Full" effects. */
function draw(s: GameState, b: BuildingState, n: number): number {
  const k = Math.min(n, space(b));
  b.drawn += k;
  if (isFull(b) && !b.bonusDone) {
    if (b.type === 'researchSite') {
      b.bonusDone = true;
      const others = s.buildings.filter(
        (x) => x.id !== b.id && x.type === 'researchSite' && isFull(x),
      ).length;
      const parts = [gain(s, 'sanity', 1)];
      if (others) parts.push(`${gain(s, 'sanity', others)} (other Full Research Sites)`);
      defer(s, `Research Site is Full: ${parts.join(', ')}.`, 'good');
    } else if (b.type === 'laboratory') {
      b.bonusDone = true;
      queueTech(s, 'Laboratory is Full: one free tech.');
    }
  }
  return k;
}

/**
 * Take one unit of a resource from storage: local buildings first (as the rulebook
 * advises), then the Depot. Returns false if there was none.
 */
function takeOne(s: GameState, r: Res): boolean {
  const b = s.buildings.find((x) => x.complete && storedRes(x) === r && stock(x) > 0);
  if (b) {
    b.used++;
    return true;
  }
  if (depotStock(s, r) > 0) {
    s.depot[r as DepotRes].lost++;
    return true;
  }
  return false;
}

/**
 * Lose resources (accidents, consumption, penalties). An Automatron is used in place
 * of the last unit of a vital resource, so it can save your life. Returns log text.
 */
function loseRes(s: GameState, r: Res, n: number): string {
  let taken = 0;
  let autos = 0;
  for (let i = 0; i < n; i++) {
    if (VITAL.includes(r) && total(s, r) <= 1 && total(s, 'automatron') > 0) {
      takeOne(s, 'automatron');
      autos++;
      continue;
    }
    if (!takeOne(s, r)) break;
    taken++;
  }
  const parts: string[] = [];
  if (taken || !autos) parts.push(amountText(-taken, r));
  if (autos) parts.push(`${amountText(-autos, 'automatron')} (in place of your last ${RES_NAMES[r]})`);
  if (taken + autos < n) parts[0] += ' (that was all you had)';
  return parts.join(', ');
}

function applyEffects(s: GameState, effects: Partial<Record<Res, number>>, check = true): string {
  const parts: string[] = [];
  for (const [r, n] of Object.entries(effects) as [Res, number][]) {
    if (n > 0) parts.push(gain(s, r, n));
    else if (n < 0) parts.push(loseRes(s, r, -n));
  }
  if (check) checkVitals(s);
  return parts.filter(Boolean).join(', ');
}

// ---------------------------------------------------------------- construction rules

/** Why a building can't be placed on this hex, or null if it can. */
export function placementError(s: GameState, type: BuildingType, hex: string): string | null {
  const def = BUILDINGS[type];
  const h = hexesOf(s).get(hex);
  if (!h) return 'Not a hex on this map.';
  if (h.terrain === 'shuttle') return 'Nothing can be built on the base shuttle hex.';
  if (buildingAt(s, hex)) return 'This hex is already occupied.';
  if (!isUnlocked(s, hex)) return 'Outer hexes are locked. Build a Rover to unlock them.';
  if (def.terrain && h.terrain !== def.terrain) {
    const names = { crater: 'craters', ice: 'ice deposits', trash: 'trash', blank: 'blank hexes', shuttle: '' };
    return `${def.name} can only be built on ${names[def.terrain]}.`;
  }
  if (def.limit !== undefined && countOf(s, type) >= def.limit) {
    return `Limit: ${def.limit} ${def.name}${def.limit > 1 ? 's' : ''}.`;
  }
  if (type === 'workshop' && !hasComplete(s, 'laboratory')) return 'Workshop requires a Laboratory.';
  if (type === 'cryoTank' && !joinCandidates(s, type, hex).length) {
    return 'Must be adjacent to an available (not yet joined) Food or Oxygen Plant.';
  }
  if (type === 'recycler' && !joinCandidates(s, type, hex).length) {
    return 'Must be adjacent to an installed, available (not yet joined) Separator.';
  }
  if (type === 'transceiver') {
    // Owner's ruling: "at least 3 hexes away" = three empty hexes between them (distance 4+).
    const near = s.buildings.find(
      (b) => b.type === 'transceiver' && distance(b.hex, hex) < TRANSCEIVER_MIN_DISTANCE,
    );
    if (near) return 'Must have at least 3 hexes between it and other Transceivers.';
  }
  return null;
}

/** Hex distance between Transceivers must be at least this (3 hexes in between). */
export const TRANSCEIVER_MIN_DISTANCE = 4;

/** Buildings a new Cryo Tank / Recycler on this hex could be joined to. */
export function joinCandidates(s: GameState, type: BuildingType, hex: string): BuildingState[] {
  const adj = adjacentBuildings(s, hex).filter((b) => b.complete && !b.link);
  if (type === 'cryoTank') return adj.filter((b) => b.type === 'foodPlant' || b.type === 'oxygenPlant');
  if (type === 'recycler') return adj.filter((b) => b.type === 'separator');
  return [];
}

/** The building type that a new building placed by this action joins, if any. */
export function joinType(s: GameState, action: ActionKind, p: ActionParams): BuildingType | null {
  if (action === 'build' && p.building === 'cryoTank') return 'cryoTank';
  if (action === 'setupRecycler' && p.hex && !buildingAt(s, p.hex)) return 'recycler';
  return null;
}

/** True when the player has to say which neighbour the new building joins. */
export function needsJoinChoice(s: GameState, action: ActionKind, p: ActionParams): boolean {
  const type = joinType(s, action, p);
  return !!type && !!p.hex && !p.joinTo && joinCandidates(s, type, p.hex).length > 1;
}

function joinPartner(s: GameState, type: BuildingType, p: ActionParams): BuildingState | undefined {
  const c = joinCandidates(s, type, p.hex!);
  return p.joinTo ? c.find((b) => b.hex === p.joinTo) : c.length === 1 ? c[0] : undefined;
}

function joinError(s: GameState, type: BuildingType, p: ActionParams): string | null {
  if (!p.joinTo) return null;
  return joinCandidates(s, type, p.hex!).some((b) => b.hex === p.joinTo)
    ? null
    : 'That building cannot be joined to this hex.';
}

/** Materials can be covered by Automatrons; Power cannot. */
export function affordError(s: GameState, type: BuildingType): string | null {
  const { materials, power } = BUILDINGS[type].cost;
  if (depotStock(s, 'power') < power) return `Needs ${power} Power (you have ${depotStock(s, 'power')}).`;
  const mats = total(s, 'materials');
  const autos = total(s, 'automatron');
  if (mats + autos < materials) {
    return `Needs ${materials} Materials (you have ${mats}${autos ? ` + ${autos} ${resName('automatron', autos)}` : ''}).`;
  }
  return null;
}

function pay(s: GameState, type: BuildingType): string {
  const { materials, power } = BUILDINGS[type].cost;
  let mats = 0;
  let autos = 0;
  for (let i = 0; i < materials; i++) {
    if (takeOne(s, 'materials')) mats++;
    else if (takeOne(s, 'automatron')) autos++;
  }
  for (let i = 0; i < power; i++) takeOne(s, 'power');
  const parts = [];
  if (mats) parts.push(amountText(-mats, 'materials'));
  if (autos) parts.push(`${amountText(-autos, 'automatron')} (as Materials)`);
  if (power) parts.push(amountText(-power, 'power'));
  return parts.join(', ');
}

function completeBuilding(s: GameState, b: BuildingState) {
  const def = BUILDINGS[b.type];
  b.complete = true;
  const notes: string[] = [];
  if (def.instantLocal) {
    const k = draw(s, b, def.instantLocal);
    if (k) notes.push(`${amountText(k, storedRes(b)!)} (local)`);
  }
  const adj = adjacentBuildings(s, b.hex).filter((x) => x.complete);
  if (b.type === 'foodPlant') {
    const plants = adj.filter((x) => x.type === 'foodPlant').length;
    if (plants) notes.push(`${gain(s, 'food', 2 * plants)} (adjacent Food Plants)`);
  }
  if (b.type === 'nuclearPod') {
    const amp = adj.some((x) => x.type === 'amplifier');
    notes.push(`${gain(s, 'power', amp ? 2 : 1)}${amp ? ' (next to an Amplifier)' : ''}`);
  }
  if (b.type === 'amplifier') {
    const pods = adj.filter((x) => x.type === 'nuclearPod').length;
    if (pods) notes.push(`${gain(s, 'power', pods)} (adjacent Nuclear Pods)`);
  }
  if (b.type === 'rover') notes.push('outer hexes unlocked');
  log(s, `${def.name} completed${notes.length ? `: ${notes.join(', ')}` : ''}.`, 'good');

  // Amplifier "anytime" bonus: +3 Power once it touches six Nuclear Pods.
  for (const a of s.buildings) {
    if (a.type !== 'amplifier' || !a.complete || a.bonusDone) continue;
    const pods = adjacentBuildings(s, a.hex).filter((x) => x.type === 'nuclearPod' && x.complete);
    if (pods.length >= 6) {
      a.bonusDone = true;
      log(s, `Amplifier is surrounded by six Nuclear Pods: ${gain(s, 'power', 3)}.`, 'good');
    }
  }
}

// ---------------------------------------------------------------- actions

interface Ctx {
  ap: number;
  combined: boolean;
  p: ActionParams;
}

interface ActionImpl {
  cost: (p: ActionParams) => number;
  /** Shown when there is no valid hex for this action at all. */
  noTarget?: string;
  /** Checks that don't depend on the hex (e.g. can you afford it). Reported before hex problems. */
  precheck?: (s: GameState, c: Ctx) => string | null;
  /** Returns an error message, or null if allowed. Must not mutate. */
  check: (s: GameState, c: Ctx) => string | null;
  run: (s: GameState, c: Ctx) => void;
}

function targetBuilding(s: GameState, p: ActionParams): BuildingState | undefined {
  return p.hex ? buildingAt(s, p.hex) : undefined;
}

/** How many times a repeatable action fits into the die. */
const reps = (ap: number, cost: number) => Math.floor(ap / cost);

function setupImpl(type: 'separator' | 'recycler'): ActionImpl {
  const def = BUILDINGS[type];
  const steps = def.setupSteps!;
  const cost = def.cost.ap;
  return {
    cost: () => cost,
    noTarget:
      type === 'separator'
        ? 'No free, unlocked trash hex to build on.'
        : 'Needs an installed Separator that is not already joined to a Recycler.',
    check: (s, { p }) => {
      if (!p.hex) return 'Choose a hex.';
      const b = buildingAt(s, p.hex);
      if (b) {
        if (b.type !== type) return 'This hex is already occupied.';
        if (b.complete) return `This ${def.name} is already complete.`;
        return null;
      }
      return placementError(s, type, p.hex) ?? (type === 'recycler' ? joinError(s, type, p) : null);
    },
    run: (s, { ap, combined, p }) => {
      let b = buildingAt(s, p.hex!);
      if (!b) {
        b = { id: s.nextId++, type, hex: p.hex!, drawn: 0, used: 0, step: 0, complete: false };
        if (type === 'recycler') {
          const sep = joinPartner(s, 'recycler', p)!;
          b.link = sep.id;
          sep.link = b.id;
        }
        s.buildings.push(b);
      }
      // Combining two dice is one action, so it only buys one setup step.
      const n = Math.min(combined ? 1 : reps(ap, cost), steps - b.step);
      b.step += n;
      log(s, `${def.name}: ${n} setup step${n > 1 ? 's' : ''} (${b.step}/${steps}).`);
      if (b.step >= steps) completeBuilding(s, b);
    },
  };
}

function yieldImpl(
  kind: 'produce' | 'recycle' | 'salvage',
  cost: number,
  ok: (b: BuildingState) => boolean,
  what: string,
): ActionImpl {
  return {
    cost: () => cost,
    noTarget: `No ${what} with free storage space.`,
    check: (s, { p }) => {
      const b = targetBuilding(s, p);
      if (!b || !ok(b)) return `Choose a ${what}.`;
      if (!b.complete) return 'This building is not finished yet.';
      const room = kind === 'produce' ? produceSpace(s, b) : space(b);
      if (room <= 0) return 'No free space left in local storage (building is Full).';
      return null;
    },
    run: (s, { ap, p }) => {
      const b = targetBuilding(s, p)!;
      const pool = kind === 'produce' ? producePool(s, b) : [b];
      // [x2/x3]: at most 3 (Produce, Recycle) or 2 (Salvage) per action, even with combined dice.
      let want = Math.min(reps(ap, cost), MAX_REPEATS[kind]);
      const verb = { produce: 'Produced', recycle: 'Recycled', salvage: 'Salvaged' }[kind];
      // Work out the split first so the log line comes before any "Full" bonus.
      const plan = pool.map((x) => {
        const k = Math.min(want, space(x));
        want -= k;
        return k;
      });
      const got = plan.reduce((a, k) => a + k, 0);
      const extra = pool.length > 1 && plan[1] ? ` (${plan[1]} into the joined Cryo Tank)` : '';
      log(s, `${verb} at ${BUILDINGS[b.type].name}: ${amountText(got, storedRes(b)!)}${extra}.`);
      pool.forEach((x, i) => draw(s, x, plan[i]));
    },
  };
}

const ACTIONS: Record<ActionKind, ActionImpl> = {
  setupSeparator: setupImpl('separator'),
  setupRecycler: setupImpl('recycler'),
  recycle: yieldImpl('recycle', ACTION_COST.recycle, (b) => b.type === 'recycler', 'Recycler'),
  produce: yieldImpl(
    'produce',
    ACTION_COST.produce,
    (b) => !!BUILDINGS[b.type].produces,
    'building that produces',
  ),
  salvage: yieldImpl('salvage', ACTION_COST.salvage, (b) => b.type === 'separator', 'Separator'),
  study: {
    cost: () => ACTION_COST.study,
    check: () => null,
    run: (s) => {
      log(s, `Studied: ${gain(s, 'sanity', 1)}.`);
    },
  },
  fixFuse: {
    cost: () => ACTION_COST.fixFuse,
    check: () => null,
    run: (s) => {
      log(s, `Fixed a rad fuse: ${gain(s, 'radiation', 1)}.`);
    },
  },
  craft: {
    cost: () => ACTION_COST.craft,
    check: (s, { p }) => {
      const type = p.craft === 'battery' ? 'workshop' : 'laboratory';
      const b = s.buildings.find((x) => x.type === type && x.complete);
      if (!b) return `Crafting ${p.craft === 'battery' ? 'Batteries needs a Workshop' : 'Automatrons needs a Laboratory'}.`;
      if (space(b) <= 0) return `The ${BUILDINGS[type].name} is Full.`;
      return null;
    },
    run: (s, { p }) => {
      if (p.craft === 'battery') {
        const b = s.buildings.find((x) => x.type === 'workshop' && x.complete)!;
        draw(s, b, 1);
        s.batteries++;
        log(
          s,
          `Crafted a Battery: ${amountText(1, 'battery')} (${s.batteries}/${LAUNCH_REQUIREMENTS.batteries} for the shuttle), ${gain(s, 'radiation', 1)}.`,
          'good',
        );
      } else {
        const b = s.buildings.find((x) => x.type === 'laboratory' && x.complete)!;
        log(s, `Crafted: ${amountText(1, 'automatron')}.`);
        draw(s, b, 1);
      }
    },
  },
  build: {
    cost: (p) => (p.building ? BUILDINGS[p.building].cost.ap : 0),
    noTarget: 'No valid hex for this building.',
    precheck: (s, { p }) => (p.building ? affordError(s, p.building) : null),
    check: (s, { p }) => {
      if (!p.building) return 'Choose a building.';
      const def = BUILDINGS[p.building];
      if (def.setupSteps) return `${def.name} is built with its Set up action.`;
      if (!p.hex) return affordError(s, p.building);
      return (
        placementError(s, p.building, p.hex) ??
        (p.building === 'cryoTank' ? joinError(s, 'cryoTank', p) : null) ??
        affordError(s, p.building)
      );
    },
    run: (s, { p }) => {
      const type = p.building!;
      const paid = pay(s, type);
      const b: BuildingState = {
        id: s.nextId++,
        type,
        hex: p.hex!,
        drawn: 0,
        used: 0,
        step: 0,
        complete: false,
      };
      const partner = type === 'cryoTank' ? joinPartner(s, type, p) : undefined;
      if (type === 'cryoTank' && partner) {
        b.link = partner.id;
        partner.link = b.id;
        b.res = storedRes(partner);
      }
      s.buildings.push(b);
      if (paid) log(s, `Built ${BUILDINGS[type].name}: ${paid}.`);
      completeBuilding(s, b);
    },
  },
};

export function actionCost(action: ActionKind, params: ActionParams = {}): number {
  return ACTIONS[action].cost(params);
}

/**
 * Why this action can't be done with this die (or null if it can). `params.hex` may be
 * omitted to ask "is this action possible at all with this die?".
 */
export function actionError(
  s: GameState,
  dieIdx: number,
  action: ActionKind,
  params: ActionParams = {},
): string | null {
  if (s.phase !== 'actions') return 'Not in the action phase.';
  if (s.techPending) return 'Choose your tech bonus first.';
  const die = s.actionDice[dieIdx];
  if (!die || die.used) return 'That die is already used.';
  const impl = ACTIONS[action];
  const cost = impl.cost(params);
  if (die.value < cost) return `Needs ${cost} AP; this die is ${die.value}.`;
  const ctx = { ap: die.value, combined: die.parts.length > 1, p: params };
  const pre = impl.precheck?.(s, ctx);
  if (pre) return pre;
  if (!params.hex && needsHex(action)) {
    // Is there any valid target?
    for (const h of hexesOf(s).keys()) {
      if (!impl.check(s, { ...ctx, p: { ...params, hex: h } })) return null;
    }
    return impl.noTarget ?? 'No valid place for this action.';
  }
  return impl.check(s, ctx);
}

export function needsHex(action: ActionKind): boolean {
  return !['study', 'fixFuse', 'craft'].includes(action);
}

/** All hexes where this action (with this die) is legal. */
export function validTargets(
  s: GameState,
  dieIdx: number,
  action: ActionKind,
  params: ActionParams = {},
): string[] {
  return [...hexesOf(s).keys()].filter((h) => !actionError(s, dieIdx, action, { ...params, hex: h }));
}

// ---------------------------------------------------------------- launch

export function launchStatus(s: GameState) {
  const transceivers = countOf(s, 'transceiver', true);
  const checks = [
    { label: 'Transceivers', have: transceivers, need: LAUNCH_REQUIREMENTS.transceivers },
    { label: 'Batteries', have: s.batteries, need: LAUNCH_REQUIREMENTS.batteries },
    { label: 'Oxygen', have: total(s, 'oxygen'), need: LAUNCH_REQUIREMENTS.oxygen },
    { label: 'Food', have: total(s, 'food'), need: LAUNCH_REQUIREMENTS.food },
  ];
  return { checks, ready: checks.every((c) => c.have >= c.need) };
}

// ---------------------------------------------------------------- turn flow

function apply(s: GameState, cmd: Command) {
  if (isOver(s)) throw new RuleError('The game is over.');
  if (s.techPending && cmd.t !== 'tech') throw new RuleError('Choose your tech bonus first.');

  switch (cmd.t) {
    case 'roll': {
      if (s.phase !== 'roll') throw new RuleError('You already rolled this turn.');
      s.dice = [d6(s), d6(s), d6(s)];
      s.accidentIdx = null;
      s.lastAccident = null;
      const ones = s.dice.filter((d) => d === 1).length;
      log(s, `Day ${turnNumber(s)}: rolled ${s.dice.join(', ')}.`);
      if (ones === 3) {
        s.actionDice = [{ value: 6, used: false, parts: [6], locked: true }];
        s.noAccident = true;
        s.phase = 'actions';
        log(s, 'Triple 1s: one 6 AP die (not splittable), no accident this turn.', 'good');
      } else if (ones === 2) {
        // The two 1s merge into one 2 AP die; the third die is the second action die.
        const other = s.dice.find((d) => d !== 1)!;
        s.actionDice = [
          { value: 2, used: false, parts: [2], locked: true },
          { value: other, used: false, parts: [other] },
        ];
        s.noAccident = true;
        s.phase = 'actions';
        log(s, `Double 1s: the two 1s become one 2 AP die, plus your ${other}; no accident this turn.`, 'good');
      } else {
        s.actionDice = [];
        s.noAccident = false;
        s.phase = 'choose';
      }
      return;
    }
    case 'chooseAccident': {
      if (s.phase !== 'choose') throw new RuleError('Not choosing dice now.');
      if (cmd.idx < 0 || cmd.idx > 2) throw new RuleError('Pick one of the three dice.');
      s.accidentIdx = cmd.idx;
      s.actionDice = s.dice
        .filter((_, i) => i !== cmd.idx)
        .map((v) => ({ value: v, used: false, parts: [v] }));
      s.phase = 'actions';
      return;
    }
    case 'combine': {
      const [a, b] = s.actionDice;
      if (s.phase !== 'actions' || s.actionDice.length !== 2 || a.used || b.used) {
        throw new RuleError('You can only combine two unused action dice.');
      }
      s.actionDice = [{ value: a.value + b.value, used: false, parts: [a.value, b.value] }];
      return;
    }
    case 'split': {
      const [a] = s.actionDice;
      if (s.phase !== 'actions' || s.actionDice.length !== 1 || a.used || a.parts.length !== 2) {
        throw new RuleError('Nothing to split.');
      }
      s.actionDice = a.parts.map((v) => ({ value: v, used: false, parts: [v] }));
      return;
    }
    case 'action': {
      const params = cmd.params ?? {};
      const err = actionError(s, cmd.die, cmd.action, params);
      if (err) throw new RuleError(err);
      if (needsHex(cmd.action) && !params.hex) throw new RuleError('Choose a hex.');
      if (needsJoinChoice(s, cmd.action, params)) {
        throw new RuleError(
          joinType(s, cmd.action, params) === 'cryoTank'
            ? 'Choose which plant the Cryo Tank joins.'
            : 'Choose which Separator the Recycler joins.',
        );
      }
      const die = s.actionDice[cmd.die];
      die.used = true;
      ACTIONS[cmd.action].run(s, { ap: die.value, combined: die.parts.length > 1, p: params });
      checkVitals(s);
      return;
    }
    case 'endActions': {
      if (s.phase !== 'actions') throw new RuleError('Not in the action phase.');
      const unused = s.actionDice.filter((d) => !d.used);
      const penalty = unused.reduce((n, d) => n + (d.locked ? 1 : d.parts.length), 0);
      if (penalty) {
        const what = applyEffects(s, { sanity: -penalty }, false);
        log(s, `Unused action dice: ${what}.`, 'bad');
        checkVitals(s);
        if (isOver(s)) return;
      }
      // Accident phase
      if (!s.noAccident && s.accidentIdx !== null) {
        const kept = s.dice[s.accidentIdx];
        const second = d6(s);
        const roll = kept + second;
        const acc = ACCIDENTS.find((a) => a.roll === roll)!;
        s.lastAccident = { day: turnNumber(s), dice: [kept, second], roll, name: acc.name };
        const what = applyEffects(s, acc.effects, false);
        const good = Object.values(acc.effects).every((v) => (v ?? 0) > 0);
        log(s, `Accident ${kept}+${second}=${roll}: ${acc.name} (${what}).`, good ? 'good' : 'bad');
        checkVitals(s);
        if (isOver(s)) return;
      } else {
        s.lastAccident = null;
      }
      // Mark the day; every 5th day, regular consumption.
      const today = turnNumber(s);
      if (today % 5 === 0) {
        const stage = CONSUMPTION.find((c) => today >= c.fromDay && today <= c.toDay);
        if (stage) {
          const loss = Object.fromEntries(
            Object.entries(stage.loss).map(([r, n]) => [r, -(n ?? 0)]),
          ) as Partial<Record<Res, number>>;
          const what = applyEffects(s, loss, false);
          log(s, `Day ${today} consumption: ${what}.`, 'bad');
          checkVitals(s);
          if (isOver(s)) return;
        }
      }
      s.day = today;
      if (s.day >= TOTAL_DAYS) {
        s.phase = 'won';
        s.endReason = `You survived all ${TOTAL_DAYS} days of your shift.`;
        log(s, s.endReason, 'good');
        return;
      }
      s.phase = 'roll';
      s.dice = [];
      s.actionDice = [];
      return;
    }
    case 'tech': {
      if (!s.techPending) throw new RuleError('No tech bonus to choose.');
      if (s.techTaken[cmd.idx] !== false) throw new RuleError('That bonus is already taken.');
      s.techTaken[cmd.idx] = true;
      s.techPending--;
      const t = TECH_BONUSES[cmd.idx];
      const what = (Object.entries(t.gain) as [Res, number][]).map(([r, n]) => gain(s, r, n));
      log(s, `Tech bonus: ${what.join(', ')}.`, 'good');
      if (s.techTaken.every(Boolean)) s.techPending = 0;
      return;
    }
    case 'launch': {
      const st = launchStatus(s);
      if (!st.ready) throw new RuleError('The shuttle is not ready to launch yet.');
      s.phase = 'won';
      s.endReason = `You launched the Depot shuttle on day ${turnNumber(s)}!`;
      log(s, s.endReason, 'good');
      return;
    }
  }
}

/** Apply a command. Returns the new state; throws RuleError if it breaks a rule. */
export function act(state: GameState, cmd: Command): GameState {
  const s = structuredClone(state);
  deferred = [];
  try {
    apply(s, cmd);
  } finally {
    flushDeferred(s);
  }
  return s;
}

export function tryAct(state: GameState, cmd: Command): { ok: true; state: GameState } | { ok: false; error: string } {
  try {
    return { ok: true, state: act(state, cmd) };
  } catch (e) {
    if (e instanceof RuleError) return { ok: false, error: e.message };
    throw e;
  }
}

/** Consumption due at the next multiple of 5, for the UI. */
export function nextConsumption(s: GameState) {
  const day = Math.ceil((s.day + 1) / 5) * 5;
  const stage = CONSUMPTION.find((c) => day >= c.fromDay && day <= c.toDay);
  return stage ? { day, loss: stage.loss } : null;
}
