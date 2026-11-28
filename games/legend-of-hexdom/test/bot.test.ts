// The bot plays whole games: proof that the engine never leaves a player without a legal move, and
// a first, rough measure of difficulty. The number is printed, not asserted: it describes the bot as
// much as the game (see playtest/notebook.md, "Measured by the engineers").
import { expect, test } from 'vitest';
import type { CharacterId } from '../src/data/characters';
import { playGame } from './bot';

test('the bot plays 30 whole games without getting stuck in the engine', () => {
  const chars: CharacterId[] = ['warrior', 'archer', 'mage'];
  const rows: string[] = [];
  for (const c of chars) {
    let wins = 0;
    let rounds = 0;
    for (let i = 0; i < 10; i++) {
      const r = playGame(1 + (i % 3), c, 1000 + i);
      if (r.won) wins++;
      rounds += r.rounds;
      expect(r.rounds).toBeGreaterThan(0);
    }
    rows.push(`${c}: ${wins}/10 won, ${(rounds / 10).toFixed(1)} rounds on average`);
  }
  console.log(rows.join('\n'));
}, 120000);
