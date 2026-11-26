// A simple heuristic player, used by tests to reach the late game (Laboratory,
// Workshop, Batteries, launch, day 75). Not meant to be clever, just purposeful.

import { BUILD_ORDER } from '../src/data/buildings';
import type { BuildingType } from '../src/data/types';
import {
  actionCost,
  actionError,
  countOf,
  depotStock,
  hasComplete,
  launchStatus,
  total,
  joinCandidates,
  joinType,
  needsJoinChoice,
  validTargets,
  type ActionKind,
  type ActionParams,
  type GameState,
} from '../src/engine/game';

export interface Choice {
  action: ActionKind;
  params: ActionParams;
  score: number;
}

const urgency = (have: number, comfy: number) => Math.max(0, comfy - have);

export function candidates(s: GameState, die: number): Choice[] {
  const out: Choice[] = [];
  const ap = s.actionDice[die].value;
  const o2 = total(s, 'oxygen');
  const food = total(s, 'food');
  const san = total(s, 'sanity');
  const rad = total(s, 'radiation');
  const pow = depotStock(s, 'power');
  const mats = total(s, 'materials');
  const transceivers = countOf(s, 'transceiver');
  const add = (action: ActionKind, params: ActionParams, score: number) => {
    const waste = ap - actionCost(action, params);
    if (needsJoinChoice(s, action, params)) {
      for (const b of joinCandidates(s, joinType(s, action, params)!, params.hex!)) {
        out.push({ action, params: { ...params, joinTo: b.hex }, score: score - waste * 0.3 });
      }
      return;
    }
    out.push({ action, params, score: score - waste * 0.3 });
  };

  for (const hex of validTargets(s, die, 'produce')) {
    const b = s.buildings.find((x) => x.hex === hex)!;
    const r = b.res ?? (b.type === 'foodPlant' ? 'food' : b.type === 'oxygenPlant' ? 'oxygen' : 'sanity');
    const need = r === 'oxygen' ? urgency(o2, 10) * 3 : r === 'food' ? urgency(food, 10) * 2 : urgency(san, 10) * 2;
    add('produce', { hex }, 8 + need);
  }
  for (const hex of validTargets(s, die, 'salvage')) add('salvage', { hex }, 6 + urgency(mats, 12));
  for (const hex of validTargets(s, die, 'recycle')) add('recycle', { hex }, 6 + urgency(mats, 12));
  for (const hex of validTargets(s, die, 'setupSeparator')) add('setupSeparator', { hex }, 14 + urgency(mats, 10));
  for (const hex of validTargets(s, die, 'setupRecycler')) add('setupRecycler', { hex }, 10);
  if (!actionError(s, die, 'study')) add('study', {}, 4 + urgency(san, 8) * 3);
  if (!actionError(s, die, 'fixFuse')) add('fixFuse', {}, 4 + urgency(rad, 8) * 3);
  if (!actionError(s, die, 'craft', { craft: 'battery' })) add('craft', { craft: 'battery' }, 45);
  if (!actionError(s, die, 'craft', { craft: 'automatron' })) add('craft', { craft: 'automatron' }, 9);

  const buildScore: Partial<Record<BuildingType, number>> = {
    oxygenPlant: 30 + urgency(o2, 12) * 2,
    cryoTank: 26 + urgency(o2, 10),
    foodPlant: 8 + urgency(food, 10) * 2,
    researchSite: 10 + urgency(san, 10),
    nuclearPod: pow < 3 ? 28 : 8,
    amplifier: countOf(s, 'nuclearPod') >= 1 && !hasComplete(s, 'amplifier') ? 14 : 2,
    rover: validTargets(s, die, 'build', { building: 'oxygenPlant' }).length ? 6 : 20,
    transceiver: transceivers < 3 ? 26 : 0,
    laboratory: transceivers >= 2 ? 32 : 14,
    workshop: 40,
  };
  for (const building of BUILD_ORDER) {
    const sc = buildScore[building];
    if (sc === undefined) continue;
    for (const hex of validTargets(s, die, 'build', { building })) add('build', { building, hex }, sc);
  }
  return out;
}

export function bestChoice(s: GameState, die: number, rnd: () => number): Choice | null {
  const c = candidates(s, die);
  if (!c.length) return null;
  // A little noise so games differ.
  c.forEach((x) => (x.score += rnd() * 4));
  c.sort((a, b) => b.score - a.score);
  return c[0];
}

/** Which die to keep for the accident: the highest, so sums stay away from 2–4. */
export function accidentPick(dice: number[]): number {
  let best = 0;
  dice.forEach((v, i) => {
    if (v > dice[best]) best = i;
  });
  return best;
}

/** Combine when one die alone can't do anything useful but together they can build/fix. */
export function shouldCombine(s: GameState): boolean {
  if (s.actionDice.length !== 2 || s.actionDice.some((d) => d.used || d.locked)) return false;
  // A die with nothing to do costs Sanity, so fold it into the other one.
  if (candidates(s, 0).length === 0 || candidates(s, 1).length === 0) return true;
  const sum = s.actionDice[0].value + s.actionDice[1].value;
  const rad = total(s, 'radiation');
  return (rad <= 4 && sum >= 7 && Math.max(...s.actionDice.map((d) => d.value)) < 7) || (sum >= 8 && !hasComplete(s, 'laboratory') && countOf(s, 'transceiver') >= 2);
}

export function techPick(s: GameState): number {
  const pow = depotStock(s, 'power');
  const order = pow < 2 ? [0, 1, 2, 3, 4] : [2, 3, 4, 0, 1];
  return order.find((i) => !s.techTaken[i])!;
}

export const canLaunch = (s: GameState) => launchStatus(s).ready;

/** A head start so test games reach the late game: extra Depot stock. */
export function generous(s: GameState): GameState {
  const t = structuredClone(s);
  t.depot.materials.gained += 20;
  t.depot.power.gained += 8;
  t.depot.food.gained += 8;
  t.depot.radiation.gained += 6;
  return t;
}
