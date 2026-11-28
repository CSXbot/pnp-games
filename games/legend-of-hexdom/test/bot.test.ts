// The bot plays whole games: proof that the engine never leaves a player without a legal move, and a
// measure of difficulty for the playtester's strategy (test/bot.ts). The suite plays a few games;
// BOT_GAMES=100 npx vitest run test/bot.test.ts measures (about 25 s per 100 games per character).
// The numbers are printed, not asserted: they describe the bot as much as the game.
import { expect, test } from 'vitest';
import type { CharacterId } from '../src/data/characters';
import { playGame } from './bot';

declare const process: { env: Record<string, string | undefined> };
const N = Number(process.env.BOT_GAMES ?? 3);

test(`the bot plays ${N * 3} whole games through the engine`, () => {
  const rows: string[] = [];
  for (const c of ['warrior', 'archer', 'mage'] as CharacterId[]) {
    const ends: Record<string, number> = { won: 0, hearts: 0, stuck: 0, cap: 0 };
    let rounds = 0;
    let bosses = 0;
    for (let i = 0; i < N; i++) {
      const r = playGame(1 + (i % 3), c, 1000 + i);
      ends[r.end]++;
      rounds += r.rounds;
      bosses += r.bosses;
      expect(r.rounds).toBeGreaterThan(0);
    }
    rows.push(`${c}: won ${ends.won}/${N}, out of hearts ${ends.hearts}, stuck ${ends.stuck}, cap ${ends.cap}; ${(rounds / N).toFixed(1)} rounds, ${(bosses / N).toFixed(2)} Bosses on average`);
  }
  console.log(rows.join('\n'));
}, 900000);
