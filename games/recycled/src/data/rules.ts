import type { AccidentDef, ConsumptionStage, Res, TechBonusDef } from './types';

export const TOTAL_DAYS = 75;

/** Each Depot row has this many boxes. */
export const DEPOT_BOXES = 31;

/** Sanity counter positions (1-based box number) marked 'T'. Reaching one grants a tech bonus. */
export const SANITY_TECH_MARKS = [8, 16, 23, 31];

export const ACCIDENTS: AccidentDef[] = [
  { roll: 2, name: 'Power outage', effects: { radiation: -2, sanity: -2 } },
  { roll: 3, name: 'Spacesuit breach', effects: { radiation: -2 } },
  { roll: 4, name: 'Overexposure', effects: { radiation: -1 } },
  { roll: 5, name: 'Injury', effects: { sanity: -2 } },
  { roll: 6, name: 'Food poisoning', effects: { sanity: -1, food: -1 } },
  { roll: 7, name: 'Anxiety attack', effects: { sanity: -1 } },
  { roll: 8, name: 'Oxygen leak', effects: { oxygen: -1 } },
  { roll: 9, name: 'Infection', effects: { food: -1 } },
  { roll: 10, name: 'Reading at work', effects: { sanity: 1 } },
  { roll: 11, name: 'Surplus produce', effects: { food: 1 } },
  { roll: 12, name: 'Motor overdrive', effects: { materials: 1 } },
];

/** Every 5th day you lose these, depending on the stage. */
export const CONSUMPTION: ConsumptionStage[] = [
  { fromDay: 1, toDay: 10, loss: { food: 1, oxygen: 1 } },
  { fromDay: 11, toDay: 25, loss: { food: 1, oxygen: 1, sanity: 1 } },
  { fromDay: 26, toDay: 50, loss: { food: 1, oxygen: 1, sanity: 1, radiation: 1 } },
  { fromDay: 51, toDay: 65, loss: { food: 1, oxygen: 1, sanity: 2, radiation: 1 } },
  { fromDay: 66, toDay: 75, loss: { food: 1, oxygen: 1, sanity: 2, radiation: 2 } },
];

export const TECH_BONUSES: TechBonusDef[] = [
  { label: '+3 Power', gain: { power: 3 } },
  { label: '+3 Power', gain: { power: 3 } },
  { label: '+3 Radiation', gain: { radiation: 3 } },
  { label: '+3 Radiation', gain: { radiation: 3 } },
  { label: '+3 Radiation', gain: { radiation: 3 } },
];

/** Ministry of Space Expansion Manual: what you need to launch the Depot shuttle. */
export const LAUNCH_REQUIREMENTS = { transceivers: 3, batteries: 6, oxygen: 5, food: 5 };

/** Action point costs from the action menu. */
/** Most repetitions one action can give, from the [x2/x3] marks on the action menu. */
export const MAX_REPEATS = { produce: 3, recycle: 3, salvage: 2 } as const;

export const ACTION_COST = {
  setupSeparator: 1,
  recycle: 2,
  produce: 2,
  salvage: 3,
  setupRecycler: 3,
  study: 5,
  craft: 6,
  fixFuse: 7,
} as const;

export const RES_NAMES: Record<Res, string> = {
  food: 'Food',
  oxygen: 'Oxygen',
  sanity: 'Sanity',
  radiation: 'Radiation protection',
  power: 'Power',
  materials: 'Materials',
  automatron: 'Automatron',
  battery: 'Battery',
};
