// The data against what the sheets guarantee. The transcriptions themselves were checked by an
// independent second reading by a QA agent that did not see them (2026-11-27): identical on all 180
// map hexes, 18 Villages and 12 Castles, and on every Explore, Adventure, Relic, Trade and Gift cell
// of sidesheets A-C. It classified linked/unlinked requirements by counting dark runs along each
// box's border (one 66 px run: single; one 139 px run: linked; eight short runs: dashed, unlinked).

import { describe, expect, test } from 'vitest';
import { MAPS, TERRAIN_LETTER } from '../src/data/maps';
import { SIDESHEETS } from '../src/data/sidesheets';
import { BOSSES, TRAVEL } from '../src/data/rules';
import { TREASURES, parseEffects, parseRequirement } from '../src/data/types';

describe('maps', () => {
  for (const m of Object.values(MAPS)) {
    test(`map ${m.id}, ${m.name}`, () => {
      expect(m.rows).toHaveLength(10);
      for (const r of m.rows) expect(r).toMatch(/^[GFPSVMW]{6}$/);
      const at = (p: { row: number; col: number }) => TERRAIN_LETTER[m.rows[p.row - 1][p.col - 1]];
      expect(Object.keys(m.villages).map(Number)).toEqual([1, 2, 3, 4, 5, 6]);
      expect(m.castles).toHaveLength(4);
      const pois = [...Object.values(m.villages), ...m.castles];
      // A Village or Castle stands on land, and no two share a hex.
      for (const p of pois) expect(['mountain', 'water']).not.toContain(at(p));
      expect(new Set(pois.map((p) => `${p.row}.${p.col}`)).size).toBe(10);
      expect(m.sidesheet).toBe('ABC'[m.id - 1]);
      // Counts the independent reading reported.
      const count = (ch: string) => m.rows.join('').split(ch).length - 1;
      expect(count('W')).toBe(9);
      expect(count('M')).toBe({ 1: 10, 2: 7, 3: 9 }[m.id]);
    });
  }
});

describe('sidesheets', () => {
  for (const s of Object.values(SIDESHEETS)) {
    test(`sidesheet ${s.id}`, () => {
      expect(s.explore).toHaveLength(3);
      expect(s.adventure).toHaveLength(3);
      for (const row of [...s.explore, ...s.adventure]) expect(row).toHaveLength(7);
      const loot = s.adventure.flat().flatMap((e) => e.loot);
      // Each Treasure exactly once: the B/C reissue fixed a doubled spear and a missing book.
      for (const t of TREASURES) expect(loot.filter((l) => l.k === 'treasure' && l.t === t), t).toHaveLength(1);
      expect(loot.filter((l) => l.k === 'gem')).toHaveLength(6);
      expect(new Set(s.gifts).size).toBe(6);
      expect([3, 4]).toContain(s.relic.size);
      if (s.gifts.includes('cart')) expect(s.cartAttr).toBeDefined();
      // Explore never hands out gems or Treasures; Adventure loot never costs.
      for (const cell of s.explore.flat()) expect(cell.every((e) => e.k !== 'gem' && e.k !== 'treasure')).toBe(true);
      for (const l of loot) if ('n' in l) expect(l.n).toBeGreaterThan(0);
    });
  }
});

test('Boss table and Travel box', () => {
  expect(BOSSES.map((b) => b.die)).toEqual([1, 2, 3, 4, 5, 6]);
  expect(new Set(BOSSES.map((b) => b.treasure)).size).toBe(6);
  for (const b of BOSSES) expect(b.reqs.map((r) => r.v)).toEqual([12, 8]);
  expect(Object.values(TRAVEL).map((t) => t.hexes)).toEqual([1, 2, 2, 2, 2, 3]);
  expect(Object.values(TRAVEL).map((t) => t.food)).toEqual([1, 1, 2, 2, 2, 0]);
});

test('the notation', () => {
  expect(parseEffects('H-1 F+1 MAG+1')).toEqual([{ k: 'heart', n: -1 }, { k: 'food', n: 1 }, { k: 'attr', a: 'mag', n: 1 }]);
  expect(parseEffects('A+2 T:skull GEM')).toEqual([{ k: 'point', n: 2 }, { k: 'treasure', t: 'skull' }, { k: 'gem' }]);
  expect(() => parseEffects('X+1')).toThrow();
  expect(parseRequirement('AGI9&MAG2')).toEqual({ type: 'linked', reqs: [{ a: 'agi', v: 9 }, { a: 'mag', v: 2 }] });
  expect(parseRequirement('AGI3/MAG4').type).toBe('unlinked');
  expect(parseRequirement('STR10')).toEqual({ type: 'single', reqs: [{ a: 'str', v: 10 }] });
});
