// @vitest-environment jsdom
//
// Plays whole games through the real interface and, after every click, checks that
// everything on screen matches the game state: numbers, enabled/disabled actions and
// their reasons, highlighted hexes, checklists, log, modals.

import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BUILDINGS, BUILD_ORDER } from '../src/data/buildings';
import { ACCIDENTS, RES_NAMES, TOTAL_DAYS } from '../src/data/rules';
import { DEPOT_ROWS, type Res } from '../src/data/types';
import {
  actionError,
  buildingAt,
  capacity,
  depotStock,
  hexesOf,
  isUnlocked,
  launchStatus,
  localStock,
  nextConsumption,
  storedRes,
  total,
  validTargets,
  type GameState,
} from '../src/engine/game';
import { App } from '../src/ui/App';
import { SAVE_KEY } from '../src/ui/save';
import { MENU, noDieReason } from '../src/ui/TurnPanel';

const STOCK_ORDER: Res[] = ['food', 'oxygen', 'sanity', 'radiation', 'power', 'materials', 'automatron'];

const $ = (sel: string, root: ParentNode = document) => root.querySelector(sel) as HTMLElement | null;
const $$ = (sel: string, root: ParentNode = document) => [...root.querySelectorAll(sel)] as HTMLElement[];
/** Visible text: ignores the hidden <title> tooltips inside icons. */
function text(el: Element | null): string {
  if (!el) return '';
  const c = el.cloneNode(true) as Element;
  c.querySelectorAll('title, svg.res-icon').forEach((t) => t.remove());
  return (c.textContent ?? '').replace(/\s+/g, ' ').trim();
}

function state(): GameState {
  return JSON.parse(localStorage.getItem(SAVE_KEY)!);
}

/** The die the UI applies actions to: the first unused one unless another was selected. */
function currentDie(s: GameState): number | null {
  if (s.phase !== 'actions') return null;
  const sel = $$('.dice-panel .die-selected, .dice-panel .combo.selected');
  if (sel.length) {
    const slots = $$('.dice-panel .die-slot');
    const idx = slots.findIndex((sl) => sl.contains(sel[0]));
    if (idx >= 0) return idx;
  }
  const i = s.actionDice.findIndex((d) => !d.used);
  return i >= 0 ? i : null;
}

function checkScreen(s: GameState, where: string) {
  const msg = (m: string) => `${where}: ${m}`;
  const over = s.phase === 'won' || s.phase === 'lost';

  // Resource bar
  const stocks = $$('.stock');
  STOCK_ORDER.forEach((r, i) => {
    expect(text($('.stock-n', stocks[i])), msg(`stock ${r}`)).toBe(String(total(s, r)));
    expect(stocks[i].title, msg(`stock tooltip ${r}`)).toBe(
      `${depotStock(s, r)} in Depot + ${localStock(s, r)} in buildings`,
    );
  });

  // Depot counters (pen marks on the printed Depot)
  const rows = $$('.crow');
  DEPOT_ROWS.forEach((r, i) => {
    const c = s.depot[r];
    expect(rows[i].dataset.res).toBe(r);
    expect($$('.box-lost', rows[i]).length, msg(`${r} lost boxes`)).toBe(c.lost);
    expect($$('.box-have', rows[i]).length, msg(`${r} stock boxes`)).toBe(Math.min(c.gained, 31) - c.lost);
    expect(rows[i].querySelector('title')!.textContent, msg(`${r} count`)).toBe(`${c.gained - c.lost} ${r} in Depot`);
  });
  expect($$('.techbox.taken').length, msg('tech boxes')).toBe(s.techTaken.filter(Boolean).length);
  // Tally: one mark per completed day (a stroke across every 5th)
  expect($$('.tally line').length, msg('tally marks')).toBe(s.day);

  // Top bar
  expect(text($('.day-info b')), msg('day')).toBe(`Day ${Math.min(s.day + 1, TOTAL_DAYS)}`);
  const next = nextConsumption(s);
  const nl = $('.next-loss');
  if (next && !over) {
    expect(text(nl), msg('next loss')).toBe(
      `· Day ${next.day}:` + Object.values(next.loss).map((n) => `−${n}`).join(''),
    );
  } else expect(nl, msg('next loss hidden')).toBeNull();

  // Dice panel
  expect(text($('.dice-panel h2')), msg('dice heading')).toMatch(new RegExp(`^Day ${s.day + 1}(?!\\d)`));
  if (s.phase === 'roll' && !over) {
    expect($('.dice-panel .btn-primary'), msg('roll button')).not.toBeNull();
    if (s.lastAccident) {
      expect(text($('.last-accident')), msg('last accident')).toBe(
        `Last accident: ${s.lastAccident.dice.join(' + ')} = ${s.lastAccident.roll}, ${s.lastAccident.name}`,
      );
    }
  }
  if (s.phase === 'choose') {
    expect($$('.die-pickable').map((d) => d.title), msg('pickable dice')).toEqual(
      s.dice.map((v) => `Use ${v} for the accident check`),
    );
  }
  if (s.phase === 'actions') {
    const captions = $$('.die-caption').map(text);
    const want = s.actionDice.map((d) => (d.used ? 'used' : `${d.value} AP`));
    if (s.accidentIdx !== null && !s.noAccident) want.push('accident');
    expect(captions, msg('die captions')).toEqual(want);
    const penalty = s.actionDice.filter((d) => !d.used).reduce((n, d) => n + (d.locked ? 1 : d.parts.length), 0);
    const endBtn = $$('.dice-panel button').find((b) => /End turn/.test(b.textContent ?? ''))!;
    expect(text(endBtn), msg('end turn button')).toBe(
      (s.noAccident ? 'End turn' : 'End turn & roll accident') + (penalty ? ` (−${penalty} Sanity, unused dice)` : ''),
    );
  }

  // Action menu
  const die = currentDie(s);
  const buttons = $$('.action-menu .action:not(.construction)');
  expect(buttons.length).toBe(MENU.length);
  MENU.forEach((m, i) => {
    const err = die !== null ? actionError(s, die, m.action, m.params ?? {}) : noDieReason(s);
    const b = buttons[i] as HTMLButtonElement;
    expect(b.disabled, msg(`${m.label} disabled (${err})`)).toBe(!!err);
    expect(b.title, msg(`${m.label} reason`)).toBe(err ?? '');
    const why = $('.why', b.parentElement!);
    if (die !== null && err && !err.startsWith('Needs ')) expect(text(why), msg(`${m.label} why`)).toBe(err);
    else expect(why, msg(`${m.label} no why`)).toBeNull();
  });
  const cons = $('.action.construction') as HTMLButtonElement;
  const buildable = die !== null && BUILD_ORDER.some((t) => !actionError(s, die, 'build', { building: t }));
  expect(cons.disabled, msg('construction disabled')).toBe(!buildable);
  expect(cons.title, msg('construction reason')).toBe(
    buildable ? '' : die !== null ? 'Nothing you can build with this die and your resources.' : noDieReason(s),
  );
  if (die !== null) {
    expect(text($('.action-menu h2 .phase')), msg('menu AP')).toBe(`with ${s.actionDice[die].value} AP`);
  }

  // Accident table
  const kept = s.phase === 'actions' && s.accidentIdx !== null && !s.noAccident ? s.dice[s.accidentIdx] : null;
  const acPhase = $('.accidents h2 .phase');
  if (kept !== null) {
    expect(text(acPhase), msg('accident range')).toBe(`possible: ${kept + 1}–${kept + 6}`);
    expect($$('.accidents tr.in-range').map((r) => Number(text($('.roll', r)))), msg('rows')).toEqual(
      ACCIDENTS.filter((a) => a.roll > kept && a.roll <= kept + 6).map((a) => a.roll),
    );
  } else expect(acPhase).toBeNull();

  // Launch manual
  const ls = launchStatus(s);
  ls.checks.forEach((c) => {
    const row = $(`.launch-row[data-label="${c.label}"]`)!;
    expect(row.classList.contains('ok'), msg(`${c.label} ok`)).toBe(c.have >= c.need);
    if (c.label === 'Transceivers' || c.label === 'Batteries') {
      expect($$('.pip-box', row).length).toBe(c.need);
      expect($$('.pip-box.on', row).length, msg(`${c.label} ticks`)).toBe(Math.min(c.have, c.need));
    } else {
      expect(text($('.status', row)), msg(`${c.label} status`)).toBe(`${c.have}/${c.need}${c.have >= c.need ? ' ✓' : ''}`);
    }
  });
  expect(($('.btn-launch') as HTMLButtonElement).disabled, msg('launch button')).toBe(!ls.ready || over);

  // Log: newest first
  const logItems = $$('.log li').map(text);
  const want = s.log.slice(-40).reverse().map((e) => `${e.day} ${e.text}`.replace(/\s+/g, ' '));
  expect(logItems, msg('log')).toEqual(want);

  // Map: buildings, storage circles, locks
  const bEls = $$('[data-building]');
  expect(bEls.length, msg('building count')).toBe(s.buildings.length);
  for (const b of s.buildings) {
    const el = $(`[data-building="${b.id}"]`)!;
    if (b.complete) {
      expect($$('.slot-used', el).length, msg(`${b.type} used`)).toBe(b.used);
      expect($$('.slot-full', el).length, msg(`${b.type} stock`)).toBe(b.drawn - b.used);
      expect($$('.slot-empty', el).length, msg(`${b.type} empty`)).toBe(capacity(b) - b.drawn);
    } else {
      expect(text($('.b-steps', el)), msg('setup steps')).toBe(`SETUP ${b.step}/${BUILDINGS[b.type].setupSteps}`);
    }
  }
  const hexes = [...hexesOf(s).values()];
  expect($$('.hex.locked').length, msg('locked hexes')).toBe(hexes.filter((h) => !isUnlocked(s, h.key)).length);

  // Modals
  const tech = $('.modal.tech');
  if (s.techPending > 0 && !over) {
    expect(tech, msg('tech modal')).not.toBeNull();
    const enabled = $$('button', tech!).map((b) => !(b as HTMLButtonElement).disabled);
    expect(enabled, msg('tech choices')).toEqual(s.techTaken.map((t) => !t));
  } else expect(tech, msg('no tech modal')).toBeNull();
  const go = $('.modal.gameover');
  if (over) {
    expect(go, msg('game over modal')).not.toBeNull();
    expect(text(go), msg('game over text')).toContain(s.endReason!);
    expect(text(go), msg('days survived')).toContain(`Days survived: ${s.day}`);
  } else expect(go).toBeNull();
}

function checkInspector(s: GameState, hex: string, where: string) {
  const g = document.querySelector(`.hex[data-hex="${hex}"]`)!;
  fireEvent.mouseEnter(g);
  const t = text($('.inspector'));
  const b = buildingAt(s, hex);
  if (b) {
    expect(t, where).toContain(BUILDINGS[b.type].name);
    expect(t, where).toContain(BUILDINGS[b.type].text);
    if (capacity(b) > 0) {
      expect(t, where).toContain(`${b.drawn - b.used} ${RES_NAMES[storedRes(b)!]} · ${capacity(b) - b.drawn} space left`);
    }
  } else {
    const h = hexesOf(s).get(hex)!;
    expect(t, where).toMatch(new RegExp(`^${{ blank: 'Blank', crater: 'Crater', ice: 'Ice deposit', trash: 'Trash', shuttle: 'Base shuttle' }[h.terrain]}`));
    expect(t.includes('Locked until you build a Rover'), where).toBe(!isUnlocked(s, hex));
  }
  fireEvent.mouseLeave($('.hexmap')!);
}

function checkPicker(s: GameState, die: number, where: string) {
  const cards = $$('.build-picker .card') as HTMLButtonElement[];
  BUILD_ORDER.forEach((t, i) => {
    const def = BUILDINGS[t];
    const err = def.setupSteps ? `Use the “Set up ${def.name}” action.` : actionError(s, die, 'build', { building: t });
    expect(cards[i].disabled, `${where}: card ${t} (${err})`).toBe(!!err);
    expect(text(cards[i]), `${where}: card ${t} storage`).toContain(
      def.capacity ? `Storage: ${def.capacity} ${def.type === 'cryoTank' ? 'Food or Oxygen' : RES_NAMES[def.stores[0]].replace('Automatron', 'Automatrons').replace('Battery', 'Batteries')}` : 'No storage',
    );
    const why = $('.why', cards[i]);
    if (err) expect(text(why), `${where}: card ${t} reason`).toBe(err);
    else expect(why).toBeNull();
  });
}


/** If the map asks which neighbour a new Cryo Tank/Recycler joins, check the choices and pick one. */
function answerJoin(s: GameState, rnd: () => number) {
  const prompt = $('.map-prompt');
  if (!prompt || !/join\?/.test(text(prompt))) return;
  const rings = $$('.target-ring').map((r) => r.dataset.hex!);
  expect(rings.length).toBeGreaterThan(1);
  for (const h of rings) {
    expect(['foodPlant', 'oxygenPlant', 'separator']).toContain(buildingAt(s, h)!.type);
  }
  click(document.querySelector(`.hit[data-hex="${rings[Math.floor(rnd() * rings.length)]}"]`), 'join partner');
}

function mulberry(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function click(el: Element | null, what: string) {
  expect(el, `missing ${what}`).not.toBeNull();
  fireEvent.click(el!);
}

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('interface', () => {
  for (const seed of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) {
    it(`shows correct text throughout game ${seed}`, () => {
      const rnd = mulberry(seed * 7919);
      vi.spyOn(Math, 'random').mockImplementation(rnd);
      localStorage.clear();
      render(<App />);
      click($$('.modal.help button')[0], 'help close');

      let s = state();
      let steps = 0;
      let undos = 0;
      const check = (w: string) => {
        s = state();
        checkScreen(s, `game ${seed} day ${s.day + 1} ${w}`);
        steps++;
      };
      check('start');

      while (s.phase !== 'won' && s.phase !== 'lost' && steps < 3000) {
        if (s.techPending) {
          const opts = $$('.modal.tech button:not([disabled])');
          click(opts[Math.floor(rnd() * opts.length)], 'tech choice');
          check('after tech');
          continue;
        }
        if (s.phase === 'roll') {
          click($('.dice-panel .btn-primary'), 'roll');
          check('after roll');
          continue;
        }
        if (s.phase === 'choose') {
          // Mostly keep the highest die for the accident, like a careful player.
          const order = s.dice.map((v, i) => [v, i]).sort((a, b) => b[0] - a[0]);
          const pick = rnd() < 0.7 ? order[0][1] : order[2][1];
          click($$('.die-pickable')[pick], 'accident die');
          check('after choosing accident die');
          continue;
        }
        // Action phase
        const die = currentDie(s);
        if (die !== null && rnd() < 0.08 && s.actionDice.length === 2 && !s.actionDice[0].used && !s.actionDice[1].used) {
          click($$('.dice-panel button').find((b) => /Combine/.test(b.textContent!))!, 'combine');
          check('after combine');
          continue;
        }
        if (die === null || rnd() < 0.04) {
          click($$('.dice-panel button').find((b) => /End turn/.test(b.textContent!))!, 'end turn');
          check('after end turn');
          continue;
        }
        if (rnd() < 0.15) {
          const hexes = [...hexesOf(s).keys()];
          checkInspector(s, hexes[Math.floor(rnd() * hexes.length)], `game ${seed} inspector`);
        }
        const before = s;
        const cons = $('.action.construction') as HTMLButtonElement;
        if (!cons.disabled && rnd() < 0.5) {
          click(cons, 'construction');
          checkPicker(s, die, `game ${seed} day ${s.day + 1}`);
          const cards = $$('.build-picker .card:not([disabled])');
          const i = Math.floor(rnd() * cards.length);
          const type = BUILD_ORDER[$$('.build-picker .card').indexOf(cards[i])];
          const targets = validTargets(s, die, 'build', { building: type });
          click(cards[i], 'card');
          if (targets.length > 1) {
            const rings = $$('.target-ring').map((r) => r.dataset.hex).sort();
            expect(rings, 'highlighted hexes for ' + type).toEqual([...targets].sort());
            expect(text($('.map-prompt'))).toContain(`Place your ${BUILDINGS[type].name}`);
            click(document.querySelector(`.hex[data-hex="${targets[Math.floor(rnd() * targets.length)]}"]`), 'hex');
          }
          answerJoin(state(), rnd);
          check(`after building ${type}`);
        } else {
          const enabled = $$('.action-menu .action:not(.construction):not([disabled])');
          if (!enabled.length) {
            click($$('.dice-panel button').find((b) => /End turn/.test(b.textContent!))!, 'end turn');
            check('after end turn (nothing to do)');
            continue;
          }
          const btn = enabled[Math.floor(rnd() * enabled.length)];
          const m = MENU[$$('.action-menu .action:not(.construction)').indexOf(btn)];
          const needsHex = !['study', 'fixFuse', 'craft'].includes(m.action);
          const targets = needsHex ? validTargets(s, die, m.action, m.params ?? {}) : [];
          click(btn, m.label);
          if (targets.length > 1) {
            const rings = $$('.target-ring').map((r) => r.dataset.hex).sort();
            expect(rings, 'highlighted hexes for ' + m.label).toEqual([...targets].sort());
            click(document.querySelector(`.hex[data-hex="${targets[Math.floor(rnd() * targets.length)]}"]`), 'hex');
          }
          answerJoin(state(), rnd);
          check(`after ${m.label}`);
        }
        // Sometimes undo and check we are back exactly where we were.
        if (rnd() < 0.05 && s.phase === 'actions' && !s.techPending) {
          click($$('.topbar button').find((b) => b.textContent === 'Undo')!, 'undo');
          expect(state()).toEqual(before);
          undos++;
          check('after undo');
        }
      }
      expect(['won', 'lost']).toContain(s.phase);
      console.log(`game ${seed}: ${s.phase} on day ${s.day + 1}, ${steps} screens checked, ${undos} undos`);
    }, 120_000);
  }
});

describe('interface, late game (strategy player with a head start)', () => {
  for (const seed of [21, 22, 23, 24, 25, 26, 27, 28]) {
    it(`shows correct text throughout game ${seed}`, async () => {
      const { bestChoice, accidentPick, shouldCombine, techPick, canLaunch, generous } = await import('./bot');
      const { newGame } = await import('../src/engine/game');
      const rnd = mulberry(seed * 104729);
      vi.spyOn(Math, 'random').mockImplementation(rnd);
      localStorage.clear();
      localStorage.setItem(SAVE_KEY, JSON.stringify(generous(newGame('planet1', seed))));
      render(<App />);
      expect($('.modal.help')).toBeNull();

      let s = state();
      let steps = 0;
      const seen = new Set<string>();
      const check = (w: string) => {
        s = state();
        checkScreen(s, `late game ${seed} day ${s.day + 1} ${w}`);
        steps++;
      };
      const endTurn = () => click($$('.dice-panel button').find((b) => /End turn/.test(b.textContent!))!, 'end turn');
      check('start');
      while (s.phase !== 'won' && s.phase !== 'lost' && steps < 4000) {
        if (s.techPending) {
          click($$('.modal.tech button')[techPick(s)], 'tech');
          check('after tech');
          continue;
        }
        if ((s.phase === 'roll' || s.phase === 'actions') && canLaunch(s) && rnd() < 0.5) {
          click($('.btn-launch'), 'launch');
          check('after launch');
          continue;
        }
        if (s.phase === 'roll') {
          click($('.dice-panel .btn-primary'), 'roll');
          check('after roll');
          continue;
        }
        if (s.phase === 'choose') {
          click($$('.die-pickable')[accidentPick(s.dice)], 'accident die');
          check('after accident die');
          continue;
        }
        if (shouldCombine(s)) {
          click($$('.dice-panel button').find((b) => /Combine/.test(b.textContent!))!, 'combine');
          check('after combine');
          continue;
        }
        const die = currentDie(s);
        const choice = die === null ? null : bestChoice(s, die, rnd);
        if (!choice) {
          endTurn();
          check('after end turn');
          continue;
        }
        if (rnd() < 0.1) checkInspector(s, choice.params.hex ?? [...hexesOf(s).keys()][0], `late ${seed}`);
        if (choice.action === 'build') {
          click($('.action.construction'), 'construction');
          checkPicker(s, die!, `late game ${seed}`);
          click($$('.build-picker .card')[BUILD_ORDER.indexOf(choice.params.building!)], 'card');
          seen.add(choice.params.building!);
        } else {
          const i = MENU.findIndex((m) => m.action === choice.action && m.params?.craft === choice.params.craft);
          click($$('.action-menu .action:not(.construction)')[i], MENU[i].label);
          seen.add(MENU[i].label);
        }
        if ($('.map-prompt')) {
          const { joinTo: _j, ...placeParams } = choice.params;
          const targets = validTargets(s, die!, choice.action, placeParams);
          expect($$('.target-ring').map((r) => r.dataset.hex).sort()).toEqual([...targets].sort());
          click(document.querySelector(`.hex[data-hex="${choice.params.hex}"]`), 'hex');
        }
        if (choice.params.joinTo && $('.map-prompt')) {
          click(document.querySelector(`.hit[data-hex="${choice.params.joinTo}"]`), 'join partner');
        }
        answerJoin(state(), rnd);
        check(`after ${choice.action} ${choice.params.building ?? choice.params.craft ?? ''}`);
      }
      console.log(
        `late game ${seed}: ${s.phase} on day ${s.day + 1} (${s.endReason}), ${steps} screens, used: ${[...seen].join(', ')}`,
      );
    }, 180_000);
  }
});
