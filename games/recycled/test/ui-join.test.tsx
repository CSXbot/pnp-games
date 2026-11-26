// @vitest-environment jsdom
// Choosing which neighbour a new Cryo Tank joins, through the interface.

import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { BUILD_ORDER } from '../src/data/buildings';
import { PLANET_1 } from '../src/data/maps';
import { buildingAt, newGame, type GameState } from '../src/engine/game';
import { rowColToKey } from '../src/engine/hex';
import { App } from '../src/ui/App';
import { SAVE_KEY } from '../src/ui/save';

const at = (r: number, c: number) => rowColToKey(PLANET_1, r, c);
const $ = (sel: string) => document.querySelector(sel) as HTMLElement | null;
const $$ = (sel: string) => [...document.querySelectorAll(sel)] as HTMLElement[];
const saved = (): GameState => JSON.parse(localStorage.getItem(SAVE_KEY)!);

afterEach(() => {
  cleanup();
  localStorage.clear();
});

it('asks which plant a new Cryo Tank joins when two are adjacent', () => {
  const s = newGame('planet1', 3);
  // A second un-joined plant next to the free hex (2,3); the Oxygen Plant at (3,4) is the other.
  s.buildings.push({ id: s.nextId++, type: 'foodPlant', hex: at(3, 3), drawn: 1, used: 0, step: 0, complete: true, res: 'food' });
  s.depot.power.gained += 3;
  s.phase = 'actions';
  s.dice = [4, 3, 6];
  s.accidentIdx = 2;
  s.actionDice = [
    { value: 4, used: false, parts: [4] },
    { value: 3, used: false, parts: [3] },
  ];
  localStorage.setItem(SAVE_KEY, JSON.stringify(s));
  render(<App />);

  fireEvent.click($('.action.construction')!);
  fireEvent.click($$('.build-picker .card')[BUILD_ORDER.indexOf('cryoTank')]);
  fireEvent.click($(`.hex[data-hex="${at(2, 3)}"]`)!);
  expect($('.map-prompt')!.textContent).toContain('Which plant does the Cryo Tank join?');
  expect($$('.target-ring').map((r) => r.dataset.hex).sort()).toEqual([at(3, 3), at(3, 4)].sort());
  // Nothing was built yet
  expect(buildingAt(saved(), at(2, 3))).toBeUndefined();

  fireEvent.click($(`.hit[data-hex="${at(3, 4)}"]`)!);
  const after = saved();
  const tank = buildingAt(after, at(2, 3))!;
  expect(tank.res).toBe('oxygen');
  expect(buildingAt(after, at(3, 4))!.link).toBe(tank.id);
  expect(buildingAt(after, at(3, 3))!.link).toBeUndefined();
  expect($('.map-prompt')).toBeNull();
});
