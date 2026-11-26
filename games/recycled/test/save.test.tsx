// @vitest-environment jsdom
// The save key moved to pnp:recycled:state when the game moved into pnp-games. A game saved
// under the old key must survive that move.

import { cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { newGame, type GameState } from '../src/engine/game';
import { App } from '../src/ui/App';
import { LEGACY_SAVE_KEY, SAVE_KEY } from '../src/ui/save';

const stored = (key: string): GameState | null => {
  const raw = localStorage.getItem(key);
  return raw ? (JSON.parse(raw) as GameState) : null;
};

/** A game part-way through day 8, to recognise again after loading. */
function midGame(seed: number, day: number): GameState {
  const s = newGame('planet1', seed);
  s.day = day;
  return s;
}

afterEach(() => {
  cleanup();
  localStorage.clear();
});

it('reads the old key when the new one is empty, and saves under the new one', () => {
  localStorage.setItem(LEGACY_SAVE_KEY, JSON.stringify(midGame(11, 7)));
  render(<App />);

  expect(stored(SAVE_KEY)).toMatchObject({ seed: 11, day: 7 });
  // Left in place: a recycled.html built before the move still reads the old key.
  expect(stored(LEGACY_SAVE_KEY)).toMatchObject({ seed: 11, day: 7 });
});

it('prefers the new key when both exist', () => {
  localStorage.setItem(LEGACY_SAVE_KEY, JSON.stringify(midGame(11, 7)));
  localStorage.setItem(SAVE_KEY, JSON.stringify(midGame(22, 19)));
  render(<App />);

  expect(stored(SAVE_KEY)).toMatchObject({ seed: 22, day: 19 });
});

it('starts a new game when neither key is set', () => {
  render(<App />);

  expect(stored(SAVE_KEY)).toMatchObject({ day: 0, phase: 'roll' });
});
