/**
 * Playtest mode (`?playtest=1`): its own save key and no cloud sync (both from @pnp/kit), plus a
 * journal - the starting setup and every command since - so any position a playtester reports can be
 * replayed exactly, and a journal that ends in a bug is a regression test already written.
 * Recycled's `src/ui/playtest.ts` is the reference.
 */
import { journalKey, PLAYTEST, readStored, writeStored } from '@pnp/kit/playtest';
import type { CharacterId } from '../data/characters';
import { act, newGame, type Command, type GameState } from '../engine/game';

export { PLAYTEST };
export const JOURNAL_KEY = journalKey('legend-of-hexdom');

export interface Journal {
  v: 1;
  mapId: number;
  character: CharacterId;
  seed: number;
  manualDice: boolean;
  cmds: Command[];
}

export const journalOf = (s: GameState, cmds: Command[]): Journal => ({
  v: 1,
  mapId: s.mapId,
  character: s.character,
  seed: s.seed ?? 0,
  manualDice: s.manualDice,
  cmds,
});

/** Rebuild the exact state a journal describes. Throws if any command is no longer legal. */
export function replay(j: Journal): GameState {
  let s = newGame({ mapId: j.mapId, character: j.character, seed: j.seed, manualDice: j.manualDice });
  for (const cmd of j.cmds) s = act(s, cmd);
  return s;
}

/** Parse pasted text into a journal, or say why it isn't one. */
export function parseJournal(text: string): { ok: true; journal: Journal } | { ok: false; error: string } {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, error: 'That is not JSON.' };
  }
  const j = raw as Partial<Journal>;
  if (j?.v !== 1 || typeof j.seed !== 'number' || typeof j.mapId !== 'number' || typeof j.character !== 'string' || !Array.isArray(j.cmds)) {
    return { ok: false, error: 'That JSON is not a journal (needs v, mapId, character, seed and cmds).' };
  }
  return { ok: true, journal: { v: 1, mapId: j.mapId, character: j.character as CharacterId, seed: j.seed, manualDice: !!j.manualDice, cmds: j.cmds as Command[] } };
}

export function readJournal(): Journal | null {
  const raw = readStored(JOURNAL_KEY);
  if (!raw) return null;
  const p = parseJournal(JSON.stringify(raw));
  return p.ok ? p.journal : null;
}

export const writeJournal = (j: Journal) => writeStored(JOURNAL_KEY, j);
