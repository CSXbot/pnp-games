/**
 * Playtest mode: `?playtest=1`.
 *
 * A playtester is a Claude chat with a browser and the rulebook, and it plays the live site. Two
 * things have to be true for that to be safe and useful:
 *
 * 1. **It must not touch the Game Director's game.** Playtest mode has its own save key and turns
 *    cloud sync off, so a playtest in the owner's own Chrome cannot overwrite a real shift or
 *    offer it to the iPad.
 * 2. **A finding needs a position, not a description.** Every move goes through one `Command` and
 *    every die comes from the seeded RNG in the state, so the starting seed plus the list of
 *    commands reproduces any position exactly. The game records that journal, shows the step
 *    number a report can quote, and will replay one back.
 *
 * The journal is deliberately playtest-only: normal play has nothing to do with it, and the save
 * is already the whole state.
 */
import { journalKey, PLAYTEST, readStored, writeStored } from '@pnp/kit/playtest';
import { act, newGame, type Command, type GameState } from '../engine/game';

export { PLAYTEST };
export const JOURNAL_KEY = journalKey('recycled');

export interface Journal {
  v: 1;
  mapId: string;
  seed: number;
  cmds: Command[];
}

export const journalOf = (s: GameState, cmds: Command[]): Journal => ({
  v: 1,
  mapId: s.mapId,
  seed: s.seed,
  cmds,
});

/** Rebuild the exact state a journal describes. Throws if any command is no longer legal. */
export function replay(j: Journal): GameState {
  let s = newGame(j.mapId, j.seed);
  for (const cmd of j.cmds) s = act(s, cmd);
  return s;
}

/** Parse pasted text into a journal, or return the reason it isn't one. */
export function parseJournal(text: string): { ok: true; journal: Journal } | { ok: false; error: string } {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, error: 'That is not JSON.' };
  }
  const j = raw as Partial<Journal>;
  if (j?.v !== 1 || typeof j.seed !== 'number' || typeof j.mapId !== 'string' || !Array.isArray(j.cmds)) {
    return { ok: false, error: 'That JSON is not a journal (needs v, mapId, seed and cmds).' };
  }
  return { ok: true, journal: { v: 1, mapId: j.mapId, seed: j.seed, cmds: j.cmds as Command[] } };
}

/** A journal with one more command on the end. */
export const recordStep = (j: Journal, cmd: Command): Journal => ({ ...j, cmds: [...j.cmds, cmd] });

export function readJournal(): Journal | null {
  const raw = readStored(JOURNAL_KEY);
  if (!raw) return null;
  const parsed = parseJournal(JSON.stringify(raw));
  return parsed.ok ? parsed.journal : null;
}

export function writeJournal(j: Journal): void {
  writeStored(JOURNAL_KEY, j);
}
