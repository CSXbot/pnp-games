// Shared data types. Everything game-specific (buildings, maps, accident table)
// lives in plain data files so expansions can be added without touching the engine.

export type Res =
  | 'food'
  | 'oxygen'
  | 'sanity'
  | 'radiation'
  | 'power'
  | 'materials'
  | 'automatron'
  | 'battery';

/** Resources that have a counter row on the Depot. */
export type DepotRes = 'sanity' | 'food' | 'radiation' | 'power' | 'materials';
export const DEPOT_ROWS: DepotRes[] = ['sanity', 'food', 'radiation', 'power', 'materials'];

/** Losing the last unit of any of these ends the game. */
export const VITAL: Res[] = ['food', 'oxygen', 'sanity', 'radiation'];

export type Terrain = 'blank' | 'crater' | 'ice' | 'trash' | 'shuttle';

export type BuildingType =
  | 'foodPlant'
  | 'oxygenPlant'
  | 'cryoTank'
  | 'researchSite'
  | 'nuclearPod'
  | 'amplifier'
  | 'separator'
  | 'recycler'
  | 'rover'
  | 'transceiver'
  | 'laboratory'
  | 'workshop';

export interface BuildingDef {
  type: BuildingType;
  name: string;
  /** Resource shown in the card's corner badge. */
  icon: Res;
  /** Hand-drawn glyph from the reference panel, used on the map. */
  glyph: string;
  cost: { ap: number; materials: number; power: number };
  /** Built step by step with a "Set up" action (Separator, Recycler). AP cost is per step. */
  setupSteps?: number;
  /** Number of resource circles the hex can ever hold (used circles still count). */
  capacity: number;
  /** Resources this building can store locally. Cryo Tank picks one when built. */
  stores: Res[];
  /** Circles drawn immediately when construction completes. */
  instantLocal?: number;
  /** Required terrain; otherwise any free hex. */
  terrain?: Terrain;
  limit?: number;
  /** Allows the PRODUCE action. */
  produces?: boolean;
  text: string;
}

export interface AccidentDef {
  roll: number;
  name: string;
  effects: Partial<Record<Res, number>>;
}

export interface ConsumptionStage {
  /** Inclusive range of days this stage covers. */
  fromDay: number;
  toDay: number;
  loss: Partial<Record<Res, number>>;
}

export interface TechBonusDef {
  label: string;
  gain: Partial<Record<Res, number>>;
}

export interface PrebuiltDef {
  type: BuildingType;
  /** Row / index on the printed sheet (row 0 = top). */
  at: [number, number];
  /** Circles already drawn (resources produced). */
  drawn: number;
  /** Of those, how many are already darkened (used). */
  used?: number;
  /** Stored resource for Cryo Tanks. */
  res?: Res;
  /** Joined with a shared contour to the prebuilt at this row/index. */
  linkTo?: [number, number];
}

export interface MapDef {
  id: string;
  name: string;
  /**
   * Terrain rows, top to bottom, as on the printed sheet. Pointy-top hexes in a hexagon.
   * B = blank, C = crater, I = ice deposit, T = trash, S = base shuttle.
   */
  rows: string[];
  prebuilt: PrebuiltDef[];
  /** Starting Depot boxes: gained (circled) and lost (darkened). */
  depot: Record<DepotRes, { gained: number; lost: number }>;
}
