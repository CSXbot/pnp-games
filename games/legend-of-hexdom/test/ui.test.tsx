// @vitest-environment jsdom
// The screen against the engine: a game played through the UI, every button text checked against
// what it does, Undo inside a round and never past a roll.
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, test } from 'vitest';
import { App } from '../src/ui/App';

beforeAll(() => {
  // jsdom has no layout: give the panels a size so the printed cells render.
  globalThis.ResizeObserver = class {
    constructor(private cb: ResizeObserverCallback) {}
    observe(el: Element) {
      this.cb([{ contentRect: { width: 400, height: 400 }, target: el } as unknown as ResizeObserverEntry], this as unknown as ResizeObserver);
    }
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
});
afterEach(() => {
  cleanup();
  localStorage.clear();
});

const log = () => [...document.querySelectorAll('.log li')].map((l) => l.textContent);

describe('a round through the screen', () => {
  test('new game, start, roll, travel, act, undo', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('checkbox', { name: /Manual dice/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Start' }));
    fireEvent.click(screen.getByRole('button', { name: 'Start at Village 2' }));
    expect(log()[0]).toBe('Rolled 2: start at Village 2, Valley (row 2, col 6).');
    // Roll 1, 3, 3 by hand.
    const rows = document.querySelectorAll('.manual .row');
    fireEvent.click(rows[0].querySelectorAll('button')[0]);
    fireEvent.click(rows[1].querySelectorAll('button')[2]);
    fireEvent.click(rows[2].querySelectorAll('button')[2]);
    fireEvent.click(screen.getByRole('button', { name: 'Use these dice' }));
    expect(log()[0]).toBe('Round 1: rolled 1, 3, 3.');
    // The 3-3 Gift is offered (sidesheet A: the Vital Eggs), with what happens next.
    expect(screen.getByRole('button', { name: /Double 3s: take the Vital Eggs \(then travel with the third die\)/ })).toBeTruthy();
    // Travel with the 1 to the Castle at 1.5: tap it on the map.
    fireEvent.click(screen.getByRole('button', { name: 'Die 1: 1' }));
    const target = document.querySelector('.hex.target[data-hex="1.5"]')!;
    expect(target).toBeTruthy();
    fireEvent.click(target);
    const go = screen.getByRole('button', { name: /^Travel to Castle, Plains \(row 1, col 5\) \(-1 food\)$/ });
    fireEvent.click(go);
    expect(log()[0]).toBe('Travelled with a 1: 1 hex to Castle, Plains (row 1, col 5). -1 food.');
    // The preview on a button is what the action does.
    fireEvent.click(screen.getByRole('button', { name: 'Die 2: 3' }));
    const explore = screen.getByRole('button', { name: /^Explore · castle/ });
    expect(within(explore).getByText('+1 heart, -1 food, +1 Magic')).toBeTruthy();
    fireEvent.click(explore);
    expect(log()[0]).toBe('Explored the castle with a 3: -1 food, +1 heart, +1 Magic.');
    // Undo goes back within the round...
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
    expect(log()[0]).toBe('Travelled with a 1: 1 hex to Castle, Plains (row 1, col 5). -1 food.');
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
    // ...but never past the roll.
    expect((screen.getByRole('button', { name: 'Undo' }) as HTMLButtonElement).disabled).toBe(true);
    expect(log()[0]).toBe('Round 1: rolled 1, 3, 3.');
  });

  test('a refused action shows its reason', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Start' }));
    fireEvent.click(screen.getByRole('button', { name: 'Roll for the start' }));
    fireEvent.click(screen.getByRole('button', { name: 'Roll the dice' }));
    // Until a die has travelled, there are no main-phase actions to press.
    expect(screen.queryByRole('button', { name: /^Explore ·/ })).toBeNull();
    expect(screen.getByText(/Choose a die to travel with/)).toBeTruthy();
  });
});
