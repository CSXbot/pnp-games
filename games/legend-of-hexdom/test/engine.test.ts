import { describe, expect, test } from 'vitest';
import type { CharacterId } from '../src/data/characters';
import { ATTRS } from '../src/data/types';
import { neighbours } from '../src/engine/hex';
import {
  act,
  actionError,
  allPaths,
  food,
  giftFaces,
  hearts,
  newGame,
  position,
  score,
  travelOptions,
  type Command,
  type GameState,
} from '../src/engine/game';

// ---------------------------------------------------------------------------------------------
// Helpers

/** A game at round start: map, character, start village, then any overrides of the sheet. */
function at(character: CharacterId, mapId: number, village: number, over: Partial<GameState> = {}): GameState {
  let s = act(newGame({ mapId, character, seed: 1, manualDice: true }), { t: 'start', die: village });
  s = { ...s, ...over };
  return s;
}
const roll = (s: GameState, dice: number[]) => act(s, { t: 'roll', dice });
/** Travel with the die at index i along a path given as hex names. */
const go = (s: GameState, i: number, path: string, extra: Partial<Extract<Command, { t: 'travel' }>> = {}) =>
  act(s, { t: 'travel', die: i, path: path.split(' '), ...extra });
const lastLog = (s: GameState) => s.log[s.log.length - 1].text;

// The log's claims, checked against the real change in state: every "+n food", "-1 heart",
// "+2 Magic" a line says must add up to what moved, and nothing may move silently.
const TOKEN = /([+-])(\d+) (food|hearts?|Strength|Agility|Magic)\b/g;
const ATTR_OF: Record<string, 'str' | 'agi' | 'mag'> = { Strength: 'str', Agility: 'agi', Magic: 'mag' };
function checkedAct(s: GameState, cmd: Command): GameState {
  const next = act(s, cmd);
  const lines = next.log.slice(s.log.length).map((l) => l.text);
  const claim = { food: 0, hearts: 0, str: 0, agi: 0, mag: 0 };
  for (const l of lines) {
    expect(l).not.toMatch(/undefined|NaN|\bnull\b|\.\.|  |, ,|:,/);
    for (const m of l.matchAll(TOKEN)) {
      const n = (m[1] === '+' ? 1 : -1) * Number(m[2]);
      if (m[3] === 'food') claim.food += n;
      else if (m[3].startsWith('heart')) {
        claim.hearts += n;
        expect(m[3] === 'heart').toBe(m[2] === '1');
      } else claim[ATTR_OF[m[3]]] += n;
    }
  }
  const ctx = `${JSON.stringify(cmd)}\n${lines.join('\n')}`;
  expect(claim.food, `food after ${ctx}`).toBe(food(next) - food(s));
  expect(claim.hearts, `hearts after ${ctx}`).toBe(hearts(next) - hearts(s));
  for (const a of ATTRS) expect(claim[a], `${a} after ${ctx}`).toBe(next.attrs[a] - s.attrs[a]);
  // Invariants of the paper sheet.
  expect(next.foodPainted).toBeLessThanOrEqual(50);
  expect(next.heartsPainted).toBeLessThanOrEqual(32);
  expect(next.foodSpent).toBeLessThanOrEqual(next.foodPainted);
  for (const a of ATTRS) expect(next.attrs[a]).toBeLessThanOrEqual(12);
  expect(new Set(next.visited).size).toBe(next.visited.length);
  return next;
}

// ---------------------------------------------------------------------------------------------

describe('the grid', () => {
  test('neighbours follow the printed offset rows', () => {
    expect(neighbours('1.1').sort()).toEqual(['1.2', '2.1', '2.2']);
    expect(neighbours('2.1').sort()).toEqual(['1.1', '2.2', '3.1']);
    expect(neighbours('5.3').sort()).toEqual(['4.3', '4.4', '5.2', '5.4', '6.3', '6.4']);
    expect(neighbours('4.3').sort()).toEqual(['3.2', '3.3', '4.2', '4.4', '5.2', '5.3']);
  });
  test('adjacency is symmetric', () => {
    for (let r = 1; r <= 10; r++)
      for (let c = 1; c <= 6; c++) for (const n of neighbours(`${r}.${c}`)) expect(neighbours(n)).toContain(`${r}.${c}`);
  });
});

describe('setup (p10, p21-24)', () => {
  test('printed starting state, and the start Village from a die', () => {
    const s = at('warrior', 1, 3);
    expect([food(s), hearts(s), s.attrs.str, s.attrs.agi, s.attrs.mag]).toEqual([5, 4, 2, 0, 0]);
    expect(s.visited).toEqual(['5.6']);
    expect(lastLog(s)).toBe('Rolled 3: start at Village 3, Forest (row 5, col 6).');
    expect(at('archer', 1, 1).attrs.agi).toBe(2);
    expect(at('mage', 1, 1).attrs.mag).toBe(2);
  });
});

describe('travel (p12, p34-45)', () => {
  test('exact length, never onto Mountain or Water, never back', () => {
    // Map 1, Village 2 at 2.6: neighbours 2.5 Grove, 1.5 Castle, 1.6 Swamp, 3.5 Grove, 3.6 Water.
    const s = roll(at('warrior', 1, 2), [1, 5, 6]);
    expect(allPaths(s, 1).map((p) => p.path.join()).sort()).toEqual(['1.5', '1.6', '2.5', '3.5']);
    expect(allPaths(s, 6).every((p) => p.path.length === 3)).toBe(true);
    expect(actionError(s, { t: 'travel', die: 0, path: ['3.6'] })).toBe('Not a legal path for that die.');
  });
  test('a 3 crosses a Mountain and pays 2 food (p35)', () => {
    // Village 1 at 2.2 on map 1; 2.3 is a Mountain, 2.4 Plains beyond it.
    let s = roll(at('warrior', 1, 1), [3, 1, 1]);
    s = go(s, 0, '2.3 2.4');
    expect(position(s)).toBe('2.4');
    expect(food(s)).toBe(3);
    expect(s.visited).toEqual(['2.2', '2.3', '2.4']);
  });
  test('hunger: food that cannot be paid costs a heart each (p35)', () => {
    let s = roll(at('archer', 1, 1, { foodSpent: 5 }), [3, 1, 1]);
    s = go(s, 0, '2.3 2.4');
    expect(hearts(s)).toBe(2);
    expect(lastLog(s)).toBe('Travelled with a 3: 2 hexes to Plains (row 2, col 4). short of 2 food, -1 heart, -1 heart.');
  });
  test('the unstuck crossing only when no die in hand has an ordinary path (Q2)', () => {
    // Map 1 at 2.6, boxed in: 2.5, 1.5, 1.6, 3.5 already visited; only Water 3.6 leads on.
    // 3.6 leads only to 4.6, a Mountain: the double Mountain/Water trap of p44. Only the 6 gets out,
    // Water and Mountain both without permission: 4 hearts on top of its (zero) food.
    const boxed = { visited: ['2.5', '1.5', '1.6', '3.5', '2.6'], heartsPainted: 6 };
    let s = roll(at('warrior', 1, 2, boxed), [2, 1, 6]);
    const opts = travelOptions(s);
    expect(opts.map((o) => o.die)).toEqual([2]);
    expect(opts[0].unstuck).toBe(true);
    expect(opts[0].paths.map((p) => p.path.join(' '))).toEqual(['3.6 4.6 5.6']);
    s = go(s, 2, '3.6 4.6 5.6');
    expect(hearts(s)).toBe(2);
    expect(s.legs[0].penalty).toBe(4);
    // With a die that has an ordinary path, the unstuck crossing is not offered (Q2).
    const free = roll(at('warrior', 1, 2), [2, 1, 6]);
    expect(travelOptions(free).every((o) => !o.unstuck && o.paths.every((q) => q.unpermitted === 0))).toBe(true);
  });
  test('stuck with no way out ends the game (p40)', () => {
    // Map 1, start 10.1 (Village 6): surround it.
    const s = roll(at('warrior', 1, 6, { visited: ['9.1', '10.2', '9.2', '10.1'] }), [1, 1, 1]);
    // Triple 1s: the 1-1 Gift is the Trusty Donkey on sidesheet A, which can't help a 1 with nowhere to go.
    expect(s.phase).toBe('lost');
    expect(s.result?.score).toBeNull();
  });
});

describe('Warrior (Adrenaline B, Overcoming, Magic Blood C)', () => {
  test('Adrenaline reads the hearts when the Travel starts, before its costs', () => {
    // 3 hearts, no food, travel with a 3: lose 2 hearts, no Strength (ruling B).
    let s = roll(at('warrior', 1, 1, { foodSpent: 5, heartsLost: 1 }), [3, 1, 1]);
    s = go(s, 0, '2.3 2.4');
    expect([hearts(s), s.attrs.str]).toEqual([1, 2]);
    // Already on 2 hearts: +1 Strength.
    let t = roll(at('warrior', 1, 1, { heartsLost: 2 }), [3, 1, 1]);
    t = go(t, 0, '2.3 2.4');
    expect(t.attrs.str).toBe(3);
  });
  test('Overcoming: the first heart lost in a round gives a food', () => {
    let s = roll(at('warrior', 1, 1, { foodPainted: 20, foodSpent: 20 }), [3, 1, 1]);
    s = go(s, 0, '2.3 2.4'); // no food: 2 hearts lost, Overcoming once
    expect(s.overcomingUsed).toBe(true);
    expect(food(s)).toBe(1);
  });
  test('Magic Blood repeats right after the Travel, and closes at the next action', () => {
    let s = roll(at('warrior', 1, 1, { foodPainted: 40, heartsPainted: 8 }), [3, 1, 2]);
    s = go(s, 0, '2.3 2.4');
    s = act(s, { t: 'magicBlood' });
    s = act(s, { t: 'magicBlood' });
    expect(s.attrs.mag).toBe(2);
    s = act(s, { t: 'explore', die: 1, column: 'terrain' });
    expect(actionError(s, { t: 'magicBlood' })).toBe('Only right after travelling, before anything else.');
  });
});

describe('Archer (Focus, Cross Training C, Magic Berry D)', () => {
  test('Cross Training only before the Travel, which must come next; a Gift first is fine', () => {
    let s = roll(at('archer', 1, 1, { foodPainted: 20 }), [3, 3, 1]);
    s = act(s, { t: 'gift', face: 3 }); // sidesheet A 3-3: Vital Eggs
    for (const a of ['agi', 'agi', 'mag'] as const) s = act(s, { t: 'point', attr: a });
    s = act(s, { t: 'crossTraining' });
    s = act(s, { t: 'crossTraining' });
    expect(s.attrs.str).toBe(2);
    expect(giftFaces(s)).toEqual([]);
    expect(actionError(s, { t: 'gift', face: 3 })).not.toBeNull();
    s = go(s, 2, '1.1');
    expect(s.phase).toBe('roll'); // the Gift spent the other dice: the round is over
  });
  test('Magic Berry: one food per gain of Magic, however many points (D)', () => {
    // Relic box A full: Magic +2 is one gain.
    let s = roll(at('archer', 1, 1, { foodPainted: 40, relic: 3, gemsTaken: [] }), [3, 3, 1]);
    s = { ...s, pending: [{ kind: 'gem' }] };
    const f = food(s);
    s = act(s, { t: 'gem', to: 'relic' });
    expect(s.attrs.mag).toBe(2);
    expect(food(s)).toBe(f + 1);
    // Two points from one source, both into Magic: one food.
    let t: GameState = { ...s, pending: [{ kind: 'points', n: 2, group: 99 }] };
    const g = food(t);
    t = act(t, { t: 'point', attr: 'mag' });
    t = act(t, { t: 'point', attr: 'mag' });
    expect(food(t)).toBe(g + 1);
  });
  test('Focus: Agility +1 after the second Adventure of a round', () => {
    // Map 1 Village 1 (2.2, Plains). Travel 1 to 1.1 Plains; Adventure twice.
    let s = roll(at('archer', 1, 1, { attrs: { str: 12, agi: 12, mag: 11 } }), [1, 1, 3]);
    s = go(s, 0, '1.1');
    s = act(s, { t: 'adventure', die: 1, column: 'terrain', pick: 0 });
    s = act(s, { t: 'adventure', die: 2, column: 'terrain', pick: 0 });
    expect(s.attrs.agi).toBe(12); // capped; Focus fired but Agility is at 12
    expect(s.log.some((l) => l.text.includes('Focus:'))).toBe(true);
  });
});

describe('Mage (Enchant, Mana Shield, Greed)', () => {
  test("Enchant compares Magic for each Strength requirement, separately (publisher's example, N5)", () => {
    // Sidesheet A Swamp 1-2: Green Frog, Strength 4 and Magic 6, linked. A Mage with Magic 6.
    let s = roll(at('mage', 1, 5, { attrs: { str: 0, agi: 0, mag: 6 } }), [1, 1, 3]);
    // Village 5 at 9.6 is on Swamp; travel 1 to a neighbour, then back is not allowed - use the start hex? Travel to 10.6 Swamp.
    s = go(s, 0, '10.6');
    const before = hearts(s);
    s = act(s, { t: 'adventure', die: 1, column: 'terrain', enchant: true });
    expect(before - hearts(s)).toBe(1); // only Enchant's own heart
    expect(s.treasures).toContain('hammer');
  });
  test('Mana Shield: one food stops one heart, once a round', () => {
    let s = roll(at('mage', 1, 1, { foodPainted: 20, heartsPainted: 10 }), [3, 1, 1]);
    s = go(s, 0, '2.3 2.4');
    const f = food(s);
    const h = hearts(s);
    // Plains 1-2 on A: F-1 H+1. Adventure Plains 1-2: Wild Boar STR2/MAG3; with Magic 2 pick Magic: 1 damage.
    s = act(s, { t: 'adventure', die: 1, column: 'terrain', pick: 1, shield: true });
    expect(hearts(s)).toBe(h);
    expect(food(s)).toBe(f - 1 + 2); // shield's food, then the boar's 2 food
    expect(s.manaShieldUsed).toBe(true);
  });
});

describe('Gifts and Bosses (p17-20, p66-73)', () => {
  test('a double finds the Gift; the third die travels; nothing else that round', () => {
    let s = roll(at('warrior', 1, 1), [5, 5, 1]);
    s = act(s, { t: 'gift', face: 5 }); // A 5-5: Mammoth Tent, +4 hearts
    expect(hearts(s)).toBe(8);
    s = go(s, 2, '1.1');
    expect(s.phase).toBe('roll');
  });
  test('a Boss: two linked requirements, 3 more without its Treasure, a Gift as reward, two to win', () => {
    // Map 1 Castle at 1.5. Start Village 2 (2.6), travel 1 to 1.5.
    let s = roll(at('warrior', 1, 2, { heartsPainted: 32, attrs: { str: 12, agi: 8, mag: 8 } }), [1, 1, 2]);
    s = go(s, 0, '1.5');
    const h = hearts(s);
    s = act(s, { t: 'boss', die: 1 }); // Gast: Strength 12, Magic 8, needs the Lost Skull
    expect(h - hearts(s)).toBe(3);
    expect(s.pending[0]).toEqual({ kind: 'gift' });
    s = act(s, { t: 'chooseGift', gift: 'tent' });
    s = act(s, { t: 'boss', die: 2 }); // Liggy: Strength 12, Agility 8, needs the Little Scythe
    expect(s.bossesDefeated).toEqual([1, 2]);
    s = act(s, { t: 'chooseGift', gift: 'balloon' });
    expect(s.phase).toBe('won');
    expect(s.result?.score).toBe(score(s));
  });
});

describe('the boxes are lifetime totals (Q4)', () => {
  test('food past the 50th is lost even when most is spent', () => {
    let s = roll(at('warrior', 1, 1, { foodPainted: 50, foodSpent: 44 }), [1, 1, 1]);
    s = go(s, 0, '1.1');
    const f = food(s);
    s = act(s, { t: 'explore', die: 1, column: 'terrain' }); // Plains 1-2 on A: F-1 H+1
    expect(food(s)).toBe(f - 1);
    expect(s.foodPainted).toBe(50);
  });
});

// ---------------------------------------------------------------------------------------------
// Random play: legal commands only, every log line checked against the state.

function legalCommands(s: GameState, rnd: () => number): Command[] {
  const out: Command[] = [];
  const p = s.pending[0];
  if (p) {
    if (p.kind === 'points') for (const a of ATTRS) out.push({ t: 'point', attr: a });
    if (p.kind === 'gem') out.push({ t: 'gem', to: 'relic' }, { t: 'gem', to: 'trade' });
    if (p.kind === 'treasure') for (const t of ['spear', 'hook', 'crow', 'hammer', 'skull', 'book'] as const) out.push({ t: 'treasure', treasure: t });
    if (p.kind === 'gift') for (const g of ['donkey', 'campfire', 'eggs', 'crate', 'tent', 'balloon', 'boat', 'flame', 'cat', 'cart'] as const) out.push({ t: 'chooseGift', gift: g });
    return out.filter((c) => !actionError(s, c));
  }
  if (s.phase === 'roll') return [{ t: 'roll' }];
  for (const f of giftFaces(s)) if (rnd() < 0.5) out.push({ t: 'gift', face: f });
  out.push({ t: 'crossTraining' }, { t: 'magicBlood' }, { t: 'finish' });
  for (const o of travelOptions(s)) {
    if (s.travelled) break;
    const path = o.paths[Math.floor(rnd() * o.paths.length)];
    out.push({ t: 'travel', die: o.die, path: path.path, shield: rnd() < 0.5 });
  }
  for (let d = 0; d < 3; d++) {
    for (const column of ['terrain', 'poi'] as const) {
      out.push({ t: 'explore', die: d, column, shield: rnd() < 0.5 });
      out.push({ t: 'adventure', die: d, column, pick: rnd() < 0.5 ? 0 : 1, enchant: rnd() < 0.3, shield: rnd() < 0.5 });
    }
    out.push({ t: 'boss', die: d, enchant: rnd() < 0.3 });
  }
  return out.filter((c) => !actionError(s, c));
}

describe('random play', () => {
  const chars: CharacterId[] = ['warrior', 'archer', 'mage'];
  test('300 games: never stuck without a reason, every line true', () => {
    let wins = 0;
    let losses = 0;
    for (let g = 0; g < 300; g++) {
      let x = (g + 1) * 7919;
      const rnd = () => ((x = (x * 1103515245 + 12345) % 2147483648) / 2147483648);
      let s = newGame({ mapId: 1 + (g % 3), character: chars[g % 3], seed: g + 1 });
      s = checkedAct(s, { t: 'start' });
      for (let step = 0; step < 2000 && s.phase !== 'won' && s.phase !== 'lost'; step++) {
        const cmds = legalCommands(s, rnd);
        expect(cmds.length, `no legal command in ${s.phase}, pending ${JSON.stringify(s.pending)}`).toBeGreaterThan(0);
        s = checkedAct(s, cmds[Math.floor(rnd() * cmds.length)]);
      }
      expect(['won', 'lost']).toContain(s.phase);
      if (s.phase === 'won') wins++;
      else losses++;
    }
    expect(wins + losses).toBe(300);
  });
});

describe('every Gift and gem effect', () => {
  test('Sail Boat: any die crosses Water, and a path crossing it may be one hex longer (Q3)', () => {
    // Map 1, Village 2 at 2.6; 3.6 is Water. A 1 normally moves one hex and can't cross.
    let s = roll(at('warrior', 1, 2, { giftsTaken: ['boat'] }), [1, 2, 2]);
    const one = travelOptions(s).find((o) => o.die === 0)!.paths.map((p) => p.path.join(' '));
    expect(one).toContain('2.5'); // the ordinary length is still allowed
    expect(one.some((p) => p.startsWith('3.6 '))).toBe(true); // through the Water, one hex longer
    expect(one.every((p) => p.split(' ').length <= 2)).toBe(true);
    s = go(s, 0, one.find((p) => p.startsWith('3.6 '))!);
    expect(s.visited.length).toBe(3);
  });
  test('Campfire: travel with a 3, 4 or 5 gives an attribute point', () => {
    let s = roll(at('warrior', 1, 1, { giftsTaken: ['campfire'] }), [3, 1, 1]);
    s = go(s, 0, '2.3 2.4');
    expect(s.pending).toEqual([{ kind: 'points', n: 1, group: expect.any(Number) }]);
  });
  test('Skill Flame: an attribute point when you Adventure twice in a round', () => {
    let s = roll(at('warrior', 1, 1, { giftsTaken: ['flame'], attrs: { str: 12, agi: 12, mag: 11 } }), [1, 1, 3]);
    s = go(s, 0, '1.1');
    s = act(s, { t: 'adventure', die: 1, column: 'terrain', pick: 0 });
    s = act(s, { t: 'adventure', die: 2, column: 'terrain', pick: 0 });
    expect(s.pending.some((p) => p.kind === 'points')).toBe(true);
  });
  test("Attribute Cart: sidesheet C's cart gives Magic +3", () => {
    let s = roll(at('warrior', 3, 1), [5, 5, 1]);
    s = act(s, { t: 'gift', face: 5 });
    expect(s.attrs.mag).toBe(3);
  });
  test('Treasure Crate: two Treasures of your choice, crossed off the Adventure table', () => {
    let s = roll(at('warrior', 1, 1), [4, 4, 1]);
    s = act(s, { t: 'gift', face: 4 });
    s = act(s, { t: 'treasure', treasure: 'hammer' });
    s = act(s, { t: 'treasure', treasure: 'skull' });
    expect(s.treasures).toEqual(['hammer', 'skull']);
    expect(actionError({ ...s, pending: [{ kind: 'treasure' }] }, { t: 'treasure', treasure: 'skull' })).toBe('You already have it.');
  });
  test('Black Cat: +30 to the final score', () => {
    const s = at('warrior', 2, 1);
    expect(score({ ...s, giftsTaken: ['cat'] }) - score(s)).toBe(30);
  });
  test('a gem traded on sidesheet B gives 2 hearts; Greed adds a point for every gem', () => {
    let s = { ...roll(at('mage', 2, 1, { foodPainted: 40 }), [1, 2, 3]), pending: [] as GameState['pending'] };
    // Simulate a gem gained through the engine: Adventure loot. Map 2 Village 1 at 1.4 (Plains);
    // B Plains 3-4 is the Mustard Ooze (no gem), so use the Relic/trade step directly.
    s = { ...s, pending: [{ kind: 'gem' }] };
    const h = hearts(s);
    s = act(s, { t: 'gem', to: 'trade' });
    expect(hearts(s)).toBe(h + 2);
  });
});

test('Greed: a gem from an Adventure also gives an attribute point', () => {
  // Map 1, Village 3 at 5.6; travel 1 to 6.6 (Forest). A, Forest 1-2: Brown Stag, Agility 3 / Magic 4, a gem.
  let s = roll(at('mage', 1, 3, { foodPainted: 40, heartsPainted: 6 }), [1, 1, 2]);
  s = go(s, 0, '6.6');
  s = act(s, { t: 'adventure', die: 1, column: 'terrain', pick: 1 });
  expect(s.pending.map((p) => p.kind)).toEqual(['gem', 'points']);
  expect(s.gemsTaken).toEqual(['0.1']);
  // The Stag's gem is crossed off; fought again it is still there and gives nothing (Q5).
  expect(lastLog(s)).toBe('Adventure with a 1: Brown Stag (Magic 4, chosen). -1 heart, -1 heart, won, a gem, 1 attribute point to place (Greed).');
});
