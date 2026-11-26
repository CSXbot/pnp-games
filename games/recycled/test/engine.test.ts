import { describe, expect, it } from 'vitest';
import { BUILD_ORDER } from '../src/data/buildings';
import {
  act,
  actionError,
  buildingAt,
  depotStock,
  hexesOf,
  launchStatus,
  migrateSave,
  newGame,
  placementError,
  total,
  tryAct,
  validTargets,
  joinCandidates,
  joinType,
  needsJoinChoice,
  type ActionKind,
  type ActionParams,
  type GameState,
} from '../src/engine/game';
import { rowColToKey } from '../src/engine/hex';
import { PLANET_1 } from '../src/data/maps';
import { LAUNCH_REQUIREMENTS } from '../src/data/rules';

const at = (row: number, col: number) => rowColToKey(PLANET_1, row, col);

/** Put the game straight into the action phase with the given action dice. */
function withDice(s: GameState, ...values: number[]): GameState {
  const t = structuredClone(s);
  t.phase = 'actions';
  t.dice = [...values, 3];
  t.accidentIdx = values.length;
  t.actionDice = values.map((v) => ({ value: v, used: false, parts: [v] }));
  return t;
}

describe('setup', () => {
  it('builds the Planet 1 map', () => {
    const s = newGame('planet1', 1);
    const hexes = hexesOf(s);
    expect(hexes.size).toBe(61);
    expect([...hexes.values()].filter((h) => h.outer).length).toBe(24);
    expect(hexes.get(at(4, 4))!.terrain).toBe('shuttle');
    expect(hexes.get(at(3, 4))!.terrain).toBe('ice');
  });

  it('starts with the printed resources', () => {
    const s = newGame('planet1', 1);
    expect(total(s, 'oxygen')).toBe(6);
    expect(total(s, 'food')).toBe(4 + 3 + 2);
    expect(total(s, 'sanity')).toBe(2 + 4);
    expect(total(s, 'radiation')).toBe(4);
    expect(depotStock(s, 'power')).toBe(2);
    expect(total(s, 'materials')).toBe(6 + 3 + 2);
    expect(buildingAt(s, at(1, 1))!.link).toBe(buildingAt(s, at(2, 2))!.id);
  });
});

describe('actions', () => {
  it('produces by AP: 2-3 -> 1, 4-5 -> 2, 6 -> 3', () => {
    // Food Plant + joined Cryo Tank have 5 free circles.
    const s = withDice(newGame('planet1', 1), 3, 4);
    const a = act(s, { t: 'action', die: 0, action: 'produce', params: { hex: at(2, 2) } });
    expect(total(a, 'food')).toBe(10);
    const b = act(a, { t: 'action', die: 1, action: 'produce', params: { hex: at(2, 2) } });
    expect(total(b, 'food')).toBe(12);
    const c = act(withDice(newGame('planet1', 1), 6), { t: 'action', die: 0, action: 'produce', params: { hex: at(2, 2) } });
    expect(total(c, 'food')).toBe(12);
  });

  it('caps Produce at 3 even with combined dice ([x2/x3])', () => {
    let s = withDice(newGame('planet1', 1), 6, 6);
    s = act(s, { t: 'combine' });
    s = act(s, { t: 'action', die: 0, action: 'produce', params: { hex: at(2, 2) } });
    expect(total(s, 'food')).toBe(12);
  });

  it('Research Site holds 6 Sanity', () => {
    const s = withDice(newGame('planet1', 1), 6);
    const a = act(s, { t: 'action', die: 0, action: 'produce', params: { hex: at(4, 6) } });
    // 4 of 6 drawn -> only 2 more fit (6 Sanity), then it is Full: +1 Sanity to the Depot.
    expect(total(a, 'sanity')).toBe(9);
    expect(total(a, 'radiation')).toBe(4); // unchanged: the card's icons are all Sanity
  });

  it('needs 6 Batteries to launch', () => {
    const s = newGame('planet1', 1);
    s.batteries = 6;
    expect(launchStatus(s).checks.find((c) => c.label === 'Batteries')!.have).toBe(6);
    expect(LAUNCH_REQUIREMENTS.batteries).toBe(6);
  });

  it('overflows food production into the joined Cryo Tank', () => {
    const s = withDice(newGame('planet1', 1), 6, 6);
    const a = act(s, { t: 'action', die: 0, action: 'produce', params: { hex: at(2, 2) } });
    const b = act(a, { t: 'action', die: 1, action: 'produce', params: { hex: at(2, 2) } });
    // plant had 3/6, cryo 2/4 -> 5 free circles total
    expect(total(b, 'food')).toBe(9 + 5);
  });

  it('refuses producing in a full building', () => {
    const s = withDice(newGame('planet1', 1), 6);
    expect(actionError(s, 0, 'produce', { hex: at(3, 4) })).toMatch(/Full/);
  });

  it('salvage needs 3 AP per Material, max 2 per action', () => {
    const s = withDice(newGame('planet1', 1), 6);
    const a = act(s, { t: 'action', die: 0, action: 'salvage', params: { hex: at(3, 6) } });
    expect(total(a, 'materials')).toBe(11 + 2);
    let c = withDice(newGame('planet1', 1), 6, 6);
    c = act(c, { t: 'combine' });
    c = act(c, { t: 'action', die: 0, action: 'salvage', params: { hex: at(3, 6) } });
    expect(total(c, 'materials')).toBe(11 + 2);
  });

  it('builds a Separator in 3 steps on trash, one step when dice are combined', () => {
    let s = withDice(newGame('planet1', 1), 3, 2);
    expect(placementError(s, 'separator', at(4, 1))).toBeNull();
    expect(placementError(s, 'separator', at(4, 2))).toMatch(/trash/);
    s = act(s, { t: 'action', die: 0, action: 'setupSeparator', params: { hex: at(4, 1) } });
    expect(buildingAt(s, at(4, 1))!.complete).toBe(true);

    let c = withDice(newGame('planet1', 1), 3, 2);
    c = act(c, { t: 'combine' });
    c = act(c, { t: 'action', die: 0, action: 'setupSeparator', params: { hex: at(4, 1) } });
    expect(buildingAt(c, at(4, 1))!.step).toBe(1);
  });

  it('constructs an Oxygen Plant only on unlocked ice, paying the cost', () => {
    const s = withDice(newGame('planet1', 1), 6);
    // (1,3) is inner ice, (0,1) is outer ice
    expect(placementError(s, 'oxygenPlant', at(0, 1))).toMatch(/locked/);
    const a = act(s, { t: 'action', die: 0, action: 'build', params: { building: 'oxygenPlant', hex: at(1, 3) } });
    expect(total(a, 'oxygen')).toBe(7);
    expect(total(a, 'materials')).toBe(11 - 4);
    expect(depotStock(a, 'power')).toBe(1);
  });

  it('needs enough AP for construction (no change)', () => {
    const s = withDice(newGame('planet1', 1), 4);
    expect(actionError(s, 0, 'build', { building: 'oxygenPlant', hex: at(1, 3) })).toMatch(/AP/);
  });

  it('says what is missing when you cannot afford a building', () => {
    const s = withDice(newGame('planet1', 1), 6, 3);
    s.depot.power.lost = s.depot.power.gained;
    expect(actionError(s, 0, 'build', { building: 'oxygenPlant' })).toMatch(/Power/);
    expect(actionError(s, 0, 'build', { building: 'nuclearPod' })).toBeNull();
  });

  it('keeps Transceivers at least 3 apart', () => {
    let s = withDice(newGame('planet1', 1), 1, 1);
    s = act(s, { t: 'action', die: 0, action: 'build', params: { building: 'transceiver', hex: at(2, 4) } });
    expect(placementError(s, 'transceiver', at(2, 5))).toMatch(/3 hexes between/);
    // (2,4) -> (2,6) is distance 2, (5,4) is distance 3: both too close; (6,4) is distance 4.
    expect(placementError(s, 'transceiver', at(5, 4))).toMatch(/3 hexes between/);
    expect(placementError(s, 'transceiver', at(6, 4))).toBeNull();
  });
});

describe('turn flow', () => {
  it('penalises unused dice and advances the day', () => {
    let s = newGame('planet1', 7);
    s = act(s, { t: 'roll' });
    if (s.phase === 'choose') s = act(s, { t: 'chooseAccident', idx: 0 });
    const before = s.depot.sanity.lost;
    s = act(s, { t: 'endActions' });
    expect(s.day).toBe(1);
    expect(s.depot.sanity.lost + s.buildings.reduce((n, b) => n + b.used, 0)).toBeGreaterThan(before);
  });

  it('applies consumption every 5th day', () => {
    let s = newGame('planet1', 7);
    s.day = 4;
    s = withDice(s, 2);
    s.actionDice[0].used = true;
    s.noAccident = true;
    const o2 = total(s, 'oxygen');
    s = act(s, { t: 'endActions' });
    expect(total(s, 'oxygen')).toBe(o2 - 1);
  });

  it('grants a tech bonus when Sanity reaches T', () => {
    let s = newGame('planet1', 1);
    s.depot.sanity.gained = 7;
    s = withDice(s, 5);
    s = act(s, { t: 'action', die: 0, action: 'study' });
    expect(s.techPending).toBe(1);
    expect(tryAct(s, { t: 'endActions' }).ok).toBe(false);
    s = act(s, { t: 'tech', idx: 0 });
    expect(depotStock(s, 'power')).toBe(5);
  });
});

const TRACKED = ['food', 'oxygen', 'sanity', 'radiation', 'power', 'materials', 'automatron'] as const;
const TOKEN = /([+−])(\d+) (Radiation protection|Food|Oxygen|Sanity|Power|Materials|Automatrons?|Batter(?:y|ies))\b/g;
const NAME_TO_RES: Record<string, string> = {
  'Radiation protection': 'radiation', Food: 'food', Oxygen: 'oxygen', Sanity: 'sanity', Power: 'power',
  Materials: 'materials', Automatron: 'automatron', Automatrons: 'automatron', Battery: 'battery', Batteries: 'battery',
};

/** act() that also checks the new log lines describe exactly what changed. */
function checkedAct(s: GameState, cmd: Parameters<typeof act>[1]): GameState {
  const next = act(s, cmd);
  const lines = next.log.slice(s.log.length);
  const claimed: Record<string, number> = {};
  for (const l of lines) {
    expect(l.text).not.toMatch(/undefined|NaN|\bnull\b|\.\.|  |\( |, \)|:\./);
    for (const m of l.text.matchAll(TOKEN)) {
      const r = NAME_TO_RES[m[3]];
      claimed[r] = (claimed[r] ?? 0) + (m[1] === '+' ? 1 : -1) * Number(m[2]);
      // singular/plural agreement for countable resources
      if (m[3].startsWith('Automatron')) expect(m[3] === 'Automatron').toBe(m[2] === '1');
      if (m[3].startsWith('Batter')) expect(m[3] === 'Battery').toBe(m[2] === '1');
    }
  }
  const ctx = () => `${JSON.stringify(cmd)}\n${lines.map((l) => l.text).join('\n')}`;
  for (const r of TRACKED) {
    expect(claimed[r] ?? 0, `${r} after ${ctx()}`).toBe(total(next, r) - total(s, r));
  }
  expect(claimed.battery ?? 0, `batteries after ${ctx()}`).toBe(next.batteries - s.batteries);
  if (next.phase === 'lost') expect(next.log.at(-1)!.text).toMatch(/^You lost your last unit of/);
  return next;
}

describe('random play', () => {
  const ACTIONS: ActionKind[] = [
    'produce', 'salvage', 'recycle', 'setupSeparator', 'setupRecycler',
    'study', 'craft', 'fixFuse', 'build',
  ];

  function randomTurn(s: GameState, rnd: () => number): GameState {
    while (s.techPending) s = checkedAct(s, { t: 'tech', idx: s.techTaken.indexOf(false) });
    s = checkedAct(s, { t: 'roll' });
    if (s.phase === 'choose') s = checkedAct(s, { t: 'chooseAccident', idx: Math.floor(rnd() * 3) });
    if (rnd() < 0.2 && s.actionDice.length === 2 && !s.actionDice[0].locked) s = checkedAct(s, { t: 'combine' });
    for (let d = 0; d < s.actionDice.length && s.phase === 'actions'; d++) {
      while (s.techPending) s = checkedAct(s, { t: 'tech', idx: s.techTaken.indexOf(false) });
      const options: { action: ActionKind; params: object }[] = [];
      for (const action of ACTIONS) {
        if (action === 'build') {
          for (const building of BUILD_ORDER) {
            for (const hex of validTargets(s, d, action, { building })) options.push({ action, params: { building, hex } });
          }
        } else if (action === 'craft') {
          for (const craft of ['automatron', 'battery'] as const) {
            if (!actionError(s, d, action, { craft })) options.push({ action, params: { craft } });
          }
        } else if (['study', 'fixFuse'].includes(action)) {
          if (!actionError(s, d, action)) options.push({ action, params: {} });
        } else {
          for (const hex of validTargets(s, d, action)) options.push({ action, params: { hex } });
        }
      }
      for (const o of options as { action: ActionKind; params: ActionParams }[]) {
        if (needsJoinChoice(s, o.action, o.params)) {
          const c = joinCandidates(s, joinType(s, o.action, o.params)!, o.params.hex!);
          o.params = { ...o.params, joinTo: c[Math.floor(rnd() * c.length)].hex };
        }
      }
      if (options.length) {
        const o = options[Math.floor(rnd() * options.length)];
        s = checkedAct(s, { t: 'action', die: d, action: o.action, params: o.params });
      }
    }
    while (s.techPending) s = checkedAct(s, { t: 'tech', idx: s.techTaken.indexOf(false) });
    if (s.phase === 'actions') s = checkedAct(s, { t: 'endActions' });
    return s;
  }

  it('plays 300 random games without breaking any invariant', () => {
    let seed = 12345;
    const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2 ** 31) / 2 ** 31);
    const outcomes = { won: 0, lost: 0 };
    for (let g = 0; g < 300; g++) {
      let s = newGame('planet1', g);
      while (s.phase !== 'won' && s.phase !== 'lost') {
        s = randomTurn(s, rnd);
        for (const b of s.buildings) {
          expect(b.used).toBeLessThanOrEqual(b.drawn);
        }
        for (const r of ['sanity', 'food', 'radiation', 'power', 'materials'] as const) {
          expect(s.depot[r].lost).toBeLessThanOrEqual(s.depot[r].gained);
          expect(s.depot[r].gained).toBeLessThanOrEqual(31);
        }
        expect(s.day).toBeLessThanOrEqual(75);
      }
      outcomes[s.phase]++;
    }
    expect(outcomes.won + outcomes.lost).toBe(300);
    console.log('random play outcomes', outcomes);
  }, 60_000);
});

describe('heuristic play', () => {
  it('reaches the late game and keeps every log line honest', async () => {
    const { bestChoice, accidentPick, shouldCombine, techPick, canLaunch, generous } = await import('./bot');
    let seed = 99;
    const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2 ** 31) / 2 ** 31);
    const stats = { launched: 0, survived: 0, lost: 0, days: 0, batteries: 0, rovers: 0, labs: 0 };
    const deaths: Record<string, number> = {};
    for (let g = 0; g < 200; g++) {
      let s = newGame('planet1', 1000 + g);
      // Half the games get a head start so the late game is exercised too.
      if (g % 2) s = generous(s);
      while (s.phase !== 'won' && s.phase !== 'lost') {
        while (s.techPending) s = checkedAct(s, { t: 'tech', idx: techPick(s) });
        if (canLaunch(s) && rnd() < 0.7) {
          s = checkedAct(s, { t: 'launch' });
          break;
        }
        s = checkedAct(s, { t: 'roll' });
        if (s.phase === 'choose') s = checkedAct(s, { t: 'chooseAccident', idx: accidentPick(s.dice) });
        if (shouldCombine(s)) s = checkedAct(s, { t: 'combine' });
        for (let d = 0; d < s.actionDice.length && s.phase === 'actions'; d++) {
          while (s.techPending) s = checkedAct(s, { t: 'tech', idx: techPick(s) });
          if (canLaunch(s)) break;
          const c = bestChoice(s, d, rnd);
          if (c) s = checkedAct(s, { t: 'action', die: d, action: c.action, params: c.params });
        }
        while (s.techPending && s.phase === 'actions') s = checkedAct(s, { t: 'tech', idx: techPick(s) });
        if (canLaunch(s) && s.phase === 'actions') {
          s = checkedAct(s, { t: 'launch' });
          break;
        }
        if (s.phase === 'actions') s = checkedAct(s, { t: 'endActions' });
      }
      if (s.phase === 'won') {
        if (/launched/.test(s.endReason!)) stats.launched++;
        else stats.survived++;
      } else {
        stats.lost++;
        deaths[s.endReason!] = (deaths[s.endReason!] ?? 0) + 1;
      }
      stats.days += s.day;
      stats.batteries += s.batteries;
      if (s.buildings.some((b) => b.type === 'rover')) stats.rovers++;
      if (s.buildings.some((b) => b.type === 'laboratory')) stats.labs++;
    }
    console.log('heuristic play', { ...stats, avgDay: stats.days / 200 }, deaths);
    expect(stats.launched).toBeGreaterThan(0);
  }, 120_000);
});

describe('rare situations: exact wording', () => {
  const last = (s: GameState, n = 1) => s.log.slice(-n).map((l) => l.text);
  const place = (s: GameState, type: Parameters<typeof placementError>[1], row: number, col: number, drawn = 0) => {
    s.buildings.push({ id: s.nextId++, type, hex: at(row, col), drawn, used: 0, step: 3, complete: true });
    return s.buildings.at(-1)!;
  };

  it('double and triple 1s', () => {
    const find = (ones: number) => {
      for (let seed = 0; seed < 100000; seed++) {
        const s = act(newGame('planet1', seed), { t: 'roll' });
        if (s.dice.filter((d) => d === 1).length === ones) return s;
      }
      throw new Error('no seed');
    };
    const d = find(2);
    expect(d.phase).toBe('actions');
    const other = d.dice.find((x) => x !== 1)!;
    expect(d.actionDice).toEqual([
      { value: 2, used: false, parts: [2], locked: true },
      { value: other, used: false, parts: [other] },
    ]);
    expect(last(d)).toEqual([`Double 1s: the two 1s become one 2 AP die, plus your ${other}; no accident this turn.`]);
    const de = checkedAct(d, { t: 'endActions' });
    expect(de.lastAccident).toBeNull();
    expect(last(de)).toEqual(['Unused action dice: −2 Sanity.']);
    const t = find(3);
    expect(t.actionDice[0].value).toBe(6);
    expect(last(t)).toEqual(['Triple 1s: one 6 AP die (not splittable), no accident this turn.']);
    // ending the turn has no accident and only a 1 Sanity penalty for the unused locked die
    const e = checkedAct(t, { t: 'endActions' });
    expect(e.lastAccident).toBeNull();
    expect(last(e)).toEqual(['Unused action dice: −1 Sanity.']);
  });

  it('Sanity past the last box becomes Materials', () => {
    let s = newGame('planet1', 1);
    s.depot.sanity.gained = 31;
    s = checkedAct(withDice(s, 5), { t: 'action', die: 0, action: 'study' });
    expect(last(s)).toEqual(['Studied: +1 Materials (Sanity counter is full).']);
  });

  it('a full Depot row says the gain did not fit', () => {
    let s = newGame('planet1', 1);
    s.depot.radiation.gained = 31;
    s = checkedAct(withDice(s, 4, 3), { t: 'combine' });
    s = checkedAct(s, { t: 'action', die: 0, action: 'fixFuse' });
    expect(last(s)).toEqual(['Fixed a rad fuse: 1 Radiation protection did not fit (no room left).']);
  });

  it('an Automatron saves your last Sanity', () => {
    let s = newGame('planet1', 1);
    place(s, 'laboratory', 6, 3, 3);
    s.buildings.find((b) => b.type === 'researchSite')!.used = 4;
    s.depot.sanity.lost = 1; // 1 Sanity left in total
    s = withDice(s, 2);
    s.noAccident = true;
    s = checkedAct(s, { t: 'endActions' });
    expect(s.phase).toBe('roll');
    expect(last(s)).toEqual(['Unused action dice: −1 Automatron (in place of your last Sanity).']);
    expect(total(s, 'sanity')).toBe(1);
  });

  it('losing the last unit ends the game, and that is the last line', () => {
    let s = newGame('planet1', 1);
    s.buildings.find((b) => b.type === 'researchSite')!.used = 4;
    s.depot.sanity.lost = 1;
    s = withDice(s, 2);
    s.noAccident = true;
    s = checkedAct(s, { t: 'endActions' });
    expect(s.phase).toBe('lost');
    expect(last(s, 2)).toEqual(['Unused action dice: −1 Sanity.', 'You lost your last unit of Sanity.']);
  });

  it('a Full Research Site, with another one already Full', () => {
    let s = newGame('planet1', 1);
    const other = place(s, 'researchSite', 3, 1, 6);
    other.bonusDone = true;
    s = checkedAct(withDice(s, 4), { t: 'action', die: 0, action: 'produce', params: { hex: at(4, 6) } });
    expect(last(s, 2)).toEqual([
      'Produced at Research Site: +2 Sanity.',
      'Research Site is Full: +1 Sanity, +1 Sanity (other Full Research Sites).',
    ]);
  });

  it('surviving day 75 wins', () => {
    let s = newGame('planet1', 1);
    s.day = 74;
    s = withDice(s, 2);
    s.actionDice[0].used = true;
    s.noAccident = true;
    s.depot.radiation.gained = 10;
    s.depot.sanity.gained = 10;
    s.depot.food.gained = 10;
    s = checkedAct(s, { t: 'endActions' });
    expect(s.phase).toBe('won');
    expect(s.day).toBe(75);
    expect(last(s, 2)).toEqual([
      'Day 75 consumption: −1 Food, −1 Oxygen, −2 Sanity, −2 Radiation protection.',
      'You survived all 75 days of your shift.',
    ]);
  });

  it('paying with Automatrons and the Amplifier bonus', () => {
    let s = newGame('planet1', 1);
    place(s, 'laboratory', 6, 3, 3);
    s.depot.materials.lost = 6;
    s.buildings.find((b) => b.type === 'separator')!.used = 3;
    s.buildings.find((b) => b.type === 'recycler')!.used = 2;
    s.depot.materials.gained += 2; // 2 Materials left, Lab has 3 Automatrons
    s = checkedAct(withDice(s, 5), { t: 'action', die: 0, action: 'build', params: { building: 'foodPlant', hex: at(6, 2) } });
    expect(last(s, 2)).toEqual([
      'Built Food Plant: −2 Materials, −2 Automatrons (as Materials), −1 Power.',
      'Food Plant completed: +1 Food (local).',
    ]);

    let a = newGame('planet1', 1);
    a.depot.materials.gained = 31;
    a.depot.power.gained = 10;
    // Amplifier at (6,3) with five pods around it, then the sixth
    place(a, 'amplifier', 6, 3);
    const ring = [[5, 3], [5, 4], [6, 2], [6, 4], [7, 2]];
    for (const [r, c] of ring) place(a, 'nuclearPod', r, c);
    a = checkedAct(withDice(a, 5), { t: 'action', die: 0, action: 'build', params: { building: 'nuclearPod', hex: at(7, 3) } });
    expect(last(a, 2)).toEqual([
      'Nuclear Pod completed: +2 Power (next to an Amplifier).',
      'Amplifier is surrounded by six Nuclear Pods: +3 Power.',
    ]);
  });
});

describe('join choice and saves', () => {
  it('asks which plant a Cryo Tank joins when two are adjacent, and joins the chosen one', () => {
    let s = newGame('planet1', 1);
    // A second, un-joined Food Plant at (2,3), next to the free hex (1,2) as is the joined plant at (2,2)...
    // ...so make the existing pair un-joined: use the Oxygen Plant (3,4) and a new Food Plant (3,3) around hex (2,3).
    s.buildings.push({ id: s.nextId++, type: 'foodPlant', hex: at(3, 3), drawn: 1, used: 0, step: 0, complete: true, res: 'food' });
    s.depot.power.gained += 3;
    s = withDice(s, 4);
    const hex = at(2, 3);
    expect(joinCandidates(s, 'cryoTank', hex).map((b) => b.type).sort()).toEqual(['foodPlant', 'oxygenPlant']);
    expect(tryAct(s, { t: 'action', die: 0, action: 'build', params: { building: 'cryoTank', hex } })).toEqual({
      ok: false,
      error: 'Choose which plant the Cryo Tank joins.',
    });
    expect(tryAct(s, { t: 'action', die: 0, action: 'build', params: { building: 'cryoTank', hex, joinTo: at(0, 0) } })).toEqual({
      ok: false,
      error: 'That building cannot be joined to this hex.',
    });
    const a = checkedAct(s, { t: 'action', die: 0, action: 'build', params: { building: 'cryoTank', hex, joinTo: at(3, 4) } });
    const tank = buildingAt(a, hex)!;
    expect(tank.res).toBe('oxygen');
    expect(buildingAt(a, at(3, 4))!.link).toBe(tank.id);
    expect(buildingAt(a, at(3, 3))!.link).toBeUndefined();
  });

  it('loads old saves and fills what newer code expects', () => {
    const s = newGame('planet1', 1) as unknown as Record<string, unknown>;
    const old = structuredClone(s) as { techTaken: boolean[]; depot: Record<string, unknown> };
    old.techTaken = [true, false];
    delete old.depot.materials;
    const m = migrateSave(old)!;
    expect(m.techTaken).toEqual([true, false, false, false, false]);
    expect(m.depot.materials).toEqual({ gained: 0, lost: 0 });
    expect(migrateSave({ version: 2 })).toBeNull();
    expect(migrateSave('junk')).toBeNull();
  });
});
