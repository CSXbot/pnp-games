// The parts of the sheet that are the same on every Hex Forest sidesheet A-C (pixel-identical on
// A, B and C at 300 dpi), and the character card's boxes. Rulebook pages in brackets.

import type { Attr, TreasureId } from './types';

/** The Travel box (p34): food paid, exact hexes moved, terrain the die may cross. */
export const TRAVEL: Record<number, { food: number; hexes: number; mountain: boolean; water: boolean }> = {
  1: { food: 1, hexes: 1, mountain: false, water: false },
  2: { food: 1, hexes: 2, mountain: false, water: false },
  3: { food: 2, hexes: 2, mountain: true, water: false },
  4: { food: 2, hexes: 2, mountain: false, water: true },
  5: { food: 2, hexes: 2, mountain: true, water: true },
  6: { food: 0, hexes: 3, mountain: false, water: false },
};

/** The unstuck crossing (p41): hearts per Mountain or Water hex crossed without permission. */
export const UNSTUCK_PENALTY = 2;

export interface BossDef {
  name: string;
  /** The die face that selects this Boss (p17). */
  die: number;
  /** Two linked requirements: the first printed at 12, the second at 8. */
  reqs: { a: Attr; v: number }[];
  treasure: TreasureId;
}

/** The Boss table (p17-18). Without the Treasure, 3 more damage. */
export const BOSSES: BossDef[] = [
  { name: 'Gast', die: 1, reqs: [{ a: 'str', v: 12 }, { a: 'mag', v: 8 }], treasure: 'skull' },
  { name: 'Liggy', die: 2, reqs: [{ a: 'str', v: 12 }, { a: 'agi', v: 8 }], treasure: 'hook' },
  { name: 'Stuker', die: 3, reqs: [{ a: 'mag', v: 12 }, { a: 'str', v: 8 }], treasure: 'hammer' },
  { name: 'Brok', die: 4, reqs: [{ a: 'agi', v: 12 }, { a: 'mag', v: 8 }], treasure: 'book' },
  { name: 'Glubo', die: 5, reqs: [{ a: 'agi', v: 12 }, { a: 'str', v: 8 }], treasure: 'spear' },
  { name: 'King', die: 6, reqs: [{ a: 'mag', v: 12 }, { a: 'agi', v: 8 }], treasure: 'crow' },
];
export const BOSS_TREASURE_PENALTY = 3;
export const BOSSES_TO_WIN = 2;

/** The character card's boxes. Gains past the last box are lost (RULES-NOTES, Q4). */
export const FOOD_BOX = 50;
export const HEART_BOX = 32;
export const ATTR_MAX = 12;
export const START_FOOD = 5;
export const START_HEARTS = 4;
/** Food box milestones (p23): the n-th food painted gives an attribute point / unlocks a skill. */
export const FOOD_POINT_AT = [10, 30, 50];
export const FOOD_SKILL_AT = [20, 40];

/** The score line under the map (p25), plus the Black Cat (p69). */
export const SCORE = { maxAttr: 3, skill: 3, heart: 5, treasure: 5, relicGem: 4, boss: 10, hex: 1, blackCat: 30 };
