// Sidesheets A, B and C (maps 1, 2, 3), read from the publisher's A5 sidesheets
// (A5-HexForest-Tables/HexForest-A5-Table-<X>.pdf, 2024-06-10) at 300 dpi, and checked by an
// independent transcription (test/data.test.ts). Notation: see types.ts.
//
// Rows are die faces 1-2, 3-4, 5-6; columns are Grove, Forest, Plains, Swamp, Valley, Village,
// Castle. The sheet prints no enemy names: the names are the rulebook's catalogue (p55-65) matched
// by picture and loot, for the log only. "kind" (human, animal, monster) matters to characters not
// yet in scope.

import { parseEffects, parseRequirement, type Attr, type Effect, type Requirement } from './types';

export type EnemyKind = 'human' | 'animal' | 'monster';

export interface Enemy {
  name: string;
  kind: EnemyKind;
  req: Requirement;
  loot: Effect[];
}

export type GiftId = 'donkey' | 'campfire' | 'eggs' | 'crate' | 'tent' | 'balloon' | 'boat' | 'flame' | 'cat' | 'cart';

export interface SidesheetDef {
  id: 'A' | 'B' | 'C';
  relic: { size: number; reward: Effect[] };
  trade: Effect[];
  explore: Effect[][][]; // [row][column]
  adventure: Enemy[][]; // [row][column]
  /** gifts[d-1] is found by the double d-d. */
  gifts: GiftId[];
  /** The Attribute Cart's attribute (it gives 3 points of it), on the sheets that have one. */
  cartAttr?: Attr;
}

const KIND: Record<string, EnemyKind> = {
  'Brown Bear': 'animal', 'Striped Bear': 'animal', 'Brown Stag': 'animal', 'Wild Boar': 'animal',
  'Black Boar': 'animal', 'Green Frog': 'animal', 'Frog Gang': 'animal', 'Sapphire Frog': 'animal',
  'Giant Bat': 'animal', 'Grey Wolf': 'animal', 'Brown Wolf': 'animal', 'Brown Hare': 'animal',
  'Golden Hare': 'animal', 'Giant Rat': 'animal', 'Green Snake': 'animal',
  'Mustard Ooze': 'monster', 'Cyanide Ooze': 'monster',
  Bandit: 'human', 'Bandit Archer': 'human', 'Spear Bandit': 'human', 'Bandit Crew': 'human',
  'Pike Brothers': 'human', 'Evil Castle Guards': 'human', 'Evil Champion': 'human', Killer: 'human',
  Cultists: 'human', 'Farmers Mob': 'human', 'Crazy Barbarian': 'human', Thug: 'human',
};

/** "Name | requirement | loot" */
function enemy(cell: string): Enemy {
  const [name, req, loot] = cell.split('|').map((s) => s.trim());
  const kind = KIND[name];
  if (!kind) throw new Error(`unknown enemy ${name}`);
  return { name, kind, req: parseRequirement(req), loot: parseEffects(loot) };
}
const table = <T,>(rows: string[][], f: (s: string) => T): T[][] => rows.map((r) => r.map(f));

export const SIDESHEETS: Record<'A' | 'B' | 'C', SidesheetDef> = {
  A: {
    id: 'A',
    relic: { size: 4, reward: parseEffects('AGI+2 MAG+2 STR+2') },
    trade: parseEffects('F+3'),
    explore: table(
      [
        //  Grove        Forest      Plains      Swamp        Valley         Village        Castle
        ['F+3', 'AGI+1', 'F-1 H+1', 'H-1 A+1', 'F-1 AGI+1', 'F+1 STR+1', 'H-1 F+1 MAG+1'],
        ['F-2 A+1', 'H-1 F+3', 'H+1', 'F-2 AGI+2', 'H+1 MAG+1', 'AGI+1', 'F-1 H+1 MAG+1'],
        ['F+1 H+1', 'F-2 STR+2', 'F-1 H+2', 'H-2 A+2', 'H+1', 'F+2', 'F-1 H+1 A+1'],
      ],
      parseEffects,
    ),
    adventure: table(
      [
        [
          'Brown Bear | STR10 | F+2 A+1',
          'Brown Stag | AGI3/MAG4 | GEM',
          'Wild Boar | STR2/MAG3 | F+2',
          'Green Frog | STR4&MAG6 | F+2 T:hammer',
          'Giant Bat | AGI7/MAG6 | F+1 T:book',
          'Farmers Mob | AGI5/STR3 | GEM',
          'Bandit | AGI2/MAG3 | GEM',
        ],
        [
          'Grey Wolf | STR8 | F+1 A+1',
          'Bandit Archer | AGI9&MAG2 | F+1 GEM',
          'Giant Rat | AGI3/MAG4 | F+3',
          'Frog Gang | STR5/MAG4 | T:hook',
          'Brown Wolf | STR7/MAG7 | F+1 T:spear',
          'Spear Bandit | AGI2/STR4 | GEM',
          'Bandit Crew | AGI5/STR6 | T:crow',
        ],
        [
          'Brown Hare | AGI7/STR2 | GEM',
          'Killer | AGI8&STR3 | A+1 T:skull',
          'Mustard Ooze | MAG5 | F+4',
          'Green Snake | AGI8/MAG10 | H+1 A+1',
          'Crazy Barbarian | STR11 | A+2',
          'Thug | MAG4 | F+1 H+1',
          'Evil Castle Guards | AGI4/STR9 | H+1 A+1',
        ],
      ],
      enemy,
    ),
    gifts: ['donkey', 'campfire', 'eggs', 'crate', 'tent', 'balloon'],
  },
  B: {
    id: 'B',
    relic: { size: 3, reward: parseEffects('AGI+2 MAG+2') },
    trade: parseEffects('H+2'),
    explore: table(
      [
        ['F+3', 'H-1 F+3', 'F-1 H+1', 'F-2 AGI+2', 'F-1 AGI+1', 'AGI+1', 'H-1 F+1 MAG+1'],
        ['F-2 A+1', 'F-2 STR+2', 'H+1', 'H-2 A+2', 'H+1 MAG+1', 'F+2', 'F-1 H+1 MAG+1'],
        ['F+1 H+1', 'F+2', 'F-1 H+2', 'F-3 A+1', 'H+1', 'F+1 H+1', 'F-1 H+1 A+1'],
      ],
      parseEffects,
    ),
    adventure: table(
      [
        [
          'Grey Wolf | STR8 | F+1 A+1',
          'Brown Stag | AGI3/MAG4 | GEM',
          'Giant Rat | AGI3/MAG4 | F+3',
          'Green Frog | STR4&MAG6 | F+2 T:hammer',
          'Giant Bat | AGI7/MAG6 | F+1 T:book',
          'Farmers Mob | AGI5/STR3 | GEM',
          'Bandit Crew | AGI5/STR6 | T:crow',
        ],
        [
          'Brown Hare | AGI7/STR2 | GEM',
          'Bandit Archer | AGI9&MAG2 | F+1 GEM',
          'Mustard Ooze | MAG5 | F+4',
          'Frog Gang | STR5/MAG4 | T:hook',
          'Crazy Barbarian | STR11 | A+2',
          'Spear Bandit | AGI2/STR4 | GEM',
          'Evil Castle Guards | AGI4/STR9 | H+1 A+1',
        ],
        [
          'Striped Bear | STR5&MAG2 | A+1',
          'Killer | AGI8&STR3 | A+1 T:skull',
          'Golden Hare | STR9 | F+1 A+1',
          'Green Snake | AGI8/MAG10 | H+1 A+1',
          'Pike Brothers | STR5&MAG2 | H+1 T:spear',
          'Thug | MAG4 | F+1 H+1',
          'Evil Champion | AGI5/MAG10 | GEM H+1',
        ],
      ],
      enemy,
    ),
    gifts: ['boat', 'crate', 'donkey', 'flame', 'cat', 'eggs'],
  },
  C: {
    id: 'C',
    relic: { size: 3, reward: parseEffects('AGI+2 STR+2') },
    trade: parseEffects('F+3'),
    explore: table(
      [
        ['F-2 A+1', 'H-1 F+3', 'H+1', 'F-2 AGI+2', 'H+1 MAG+1', 'AGI+1', 'F-1 H+1 MAG+1'],
        ['F+1 H+1', 'F-2 STR+2', 'F-1 H+2', 'H-2 A+2', 'H+1', 'F+2', 'F-1 H+1 A+1'],
        ['F+1 MAG+1', 'F+2', 'F+2', 'F-3 A+1', 'H-1 STR+1', 'F+1 H+1', 'H-1 F+1 AGI+1'],
      ],
      parseEffects,
    ),
    adventure: table(
      [
        [
          'Grey Wolf | STR8 | F+1 A+1',
          'Bandit Archer | AGI9&MAG2 | F+1 GEM',
          'Giant Rat | AGI3/MAG4 | F+3',
          'Frog Gang | STR5/MAG4 | T:hook',
          'Black Boar | AGI3&STR4 | F+2 A+1',
          'Spear Bandit | AGI2/STR4 | GEM',
          'Bandit Crew | AGI5/STR6 | T:crow',
        ],
        [
          'Brown Hare | AGI7/STR2 | GEM',
          'Killer | AGI8&STR3 | A+1 T:skull',
          'Mustard Ooze | MAG5 | F+4',
          'Green Snake | AGI8/MAG10 | H+1 A+1',
          'Pike Brothers | STR5&MAG2 | H+1 T:spear',
          'Thug | MAG4 | F+1 H+1',
          'Evil Castle Guards | AGI4/STR9 | H+1 A+1',
        ],
        [
          'Striped Bear | STR5&MAG2 | A+1',
          'Cultists | STR5 | F+1 GEM',
          'Golden Hare | STR9 | F+1 A+1',
          'Cyanide Ooze | AGI8 | A+1 T:hammer',
          'Giant Bat | AGI7/MAG6 | F+1 T:book',
          'Sapphire Frog | AGI5 | GEM H+1',
          'Evil Champion | AGI5/MAG10 | GEM H+1',
        ],
      ],
      enemy,
    ),
    gifts: ['balloon', 'campfire', 'crate', 'donkey', 'cart', 'boat'],
    cartAttr: 'mag',
  },
};
