import { describe, expect, it } from 'vitest';
import { act, newGame, type Command } from '../src/engine/game';
import { journalOf, parseJournal, recordStep, replay } from '../src/ui/playtest';
import { PLAYTEST_SAVE_KEY, SAVE_KEY, saveKey } from '../src/ui/save';
import { drive } from './bot';

describe('playtest journal', () => {
  it('replays to exactly the state the commands produced', () => {
    // Drive a real game and keep both the state and the journal, the way App.tsx does.
    for (const seed of [1, 777, 779905127]) {
      let state = newGame('planet1', seed);
      let journal = journalOf(state, []);
      for (const cmd of commandsOf(seed, 120)) {
        state = act(state, cmd);
        journal = recordStep(journal, cmd);
      }
      expect(journal.cmds.length).toBeGreaterThan(10);
      expect(replay(journal)).toEqual(state);
      // And through the clipboard: a report carries the journal as text.
      const parsed = parseJournal(JSON.stringify(journal));
      expect(parsed.ok).toBe(true);
      if (parsed.ok) expect(replay(parsed.journal)).toEqual(state);
    }
  });

  it('refuses text that is not a journal', () => {
    expect(parseJournal('nonsense')).toEqual({ ok: false, error: 'That is not JSON.' });
    expect(parseJournal('{"v":2}').ok).toBe(false);
    expect(parseJournal('{"v":1,"mapId":"planet1","seed":1}').ok).toBe(false);
  });

  it('keeps a playtest out of the real save', () => {
    expect(saveKey(false)).toBe(SAVE_KEY);
    expect(saveKey(true)).toBe(PLAYTEST_SAVE_KEY);
    expect(PLAYTEST_SAVE_KEY).not.toBe(SAVE_KEY);
  });
});

/** The bot's commands for one game, capped, so the journal under test is a real sequence. */
function commandsOf(seed: number, cap: number): Command[] {
  const cmds: Command[] = [];
  drive(newGame('planet1', seed), (c) => cmds.push(c), { maxCommands: cap });
  return cmds;
}
