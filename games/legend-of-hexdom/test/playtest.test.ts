import { describe, expect, test } from 'vitest';
import { act, newGame, travelOptions, type Command } from '../src/engine/game';
import { journalOf, parseJournal, replay } from '../src/ui/playtest';

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
