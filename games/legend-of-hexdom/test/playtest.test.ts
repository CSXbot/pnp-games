import { describe, expect, test } from 'vitest';
import { act, newGame, travelOptions, type Command } from '../src/engine/game';
import { journalOf, parseJournal, replay } from '../src/ui/playtest';
import wonGame from './fixtures/2026-11-28-playtest-mage-map2-won.json';

describe('playtest journal', () => {
  test('seed plus commands replays to the same game', () => {
    let s = newGame({ mapId: 2, character: 'archer', seed: 424242 });
    const cmds: Command[] = [];
    const go = (c: Command) => {
      s = act(s, c);
      cmds.push(c);
    };
    go({ t: 'start' });
    go({ t: 'roll' });
    const o = travelOptions(s)[0];
    go({ t: 'travel', die: o.die, path: o.paths[0].path });
    const j = journalOf(s, cmds);
    const again = replay(JSON.parse(JSON.stringify(j)));
    expect(again).toEqual(s);
  });
  test('pasted text that is not a journal says why', () => {
    expect(parseJournal('nope')).toEqual({ ok: false, error: 'That is not JSON.' });
    expect(parseJournal('{"v":1}').ok).toBe(false);
  });
});

test("the first playtester's won game replays to the same victory (regression)", () => {
  // Map 2, the Mage, seed 400319392: won in round 14, Glubo then King, score 145 (playtest/reports/2026-11-28-1.md).
  const p = parseJournal(JSON.stringify(wonGame));
  if (!p.ok) throw new Error(p.error);
  const s = replay(p.journal);
  expect(s.phase).toBe('won');
  expect(s.round).toBe(14);
  expect(s.result?.score).toBe(145);
  expect(s.bossesDefeated.sort()).toEqual([5, 6]);
});
