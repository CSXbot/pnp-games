/**
 * Playtest mode: `?playtest=1`. It gives the game its own save key and turns cloud sync off, so a
 * playtest in the owner's own browser can't overwrite a real game or offer it to another device.
 * Each game keeps its own journal format (it replays through that game's `newGame` and `act`); the
 * shelf-wide parts are the flag and where the journal is stored.
 */
export const PLAYTEST = (() => {
  try {
    return new URLSearchParams(location.search).has('playtest');
  } catch {
    return false; // no location (tests, jsdom without a URL)
  }
})();

export const journalKey = (slug: string) => `pnp:${slug}:playtest:journal`;

/** Reads a JSON value, or null if it is missing, unparseable or storage is unavailable. */
export function readStored(key: string): unknown {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** Writes a JSON value; a full or unavailable storage is ignored rather than breaking play. */
export function writeStored(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable */
  }
}
