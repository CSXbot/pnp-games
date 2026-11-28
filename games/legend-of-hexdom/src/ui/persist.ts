// Saves, cloud sync and undo for Legend of Hexdom. The shelf-wide parts live in packages/kit.

import { createCloudSave } from '@pnp/kit/cloudSave';
import { PLAYTEST } from '@pnp/kit/playtest';
import { saveKeys } from '@pnp/kit/save';
import { migrateSave, type GameState } from '../engine/game';

export const KEYS = saveKeys('legend-of-hexdom');
export const SAVE_KEY = KEYS.saveKey(PLAYTEST);

export const cloud = createCloudSave<GameState>({
  slug: 'legend-of-hexdom',
  /** A game nobody has played yet: adopting the cloud copy over it loses nothing. */
  isUntouched: (s) => s.round === 0,
});

/** The saved game, migrated; a save that can't be loaded is parked, not lost. */
export function loadGame(): GameState | null {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(SAVE_KEY);
  } catch {
    return null;
  }
  if (!raw) return null;
  try {
    const s = migrateSave(JSON.parse(raw));
    if (s) return s;
  } catch {
    /* fall through */
  }
  try {
    if (!localStorage.getItem(KEYS.BROKEN_KEY)) localStorage.setItem(KEYS.BROKEN_KEY, raw);
  } catch {
    /* storage unavailable */
  }
  return null;
}

export function storeGame(s: GameState | null) {
  try {
    if (s) localStorage.setItem(SAVE_KEY, JSON.stringify(s));
    else localStorage.removeItem(SAVE_KEY);
  } catch {
    /* storage unavailable: play on without saving */
  }
}

/** A file name for an exported save. */
export const exportName = (s: GameState) => `hexdom-map${s.mapId}-${s.character}-round${s.round}.json`;
