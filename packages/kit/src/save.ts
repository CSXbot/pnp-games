/**
 * Where a game's state lives in `localStorage`. Every game on the shelf shares one origin, so the
 * keys are namespaced per game: `pnp:<slug>:...`.
 */
export function saveKeys(slug: string) {
  const SAVE_KEY = `pnp:${slug}:state`;
  /**
   * Where a save that could not be loaded is parked. A migration bug or a version bump would
   * otherwise destroy a game in progress: the fresh game replacing it is written to SAVE_KEY
   * immediately. Only the first failure is kept, so a later good save can't be shadowed by it.
   */
  const BROKEN_KEY = `pnp:${slug}:state.broken`;
  /**
   * Where a playtest's game lives. A playtester plays the live site, and on the Game Director's own
   * browser that would otherwise overwrite SAVE_KEY and offer the playtest to their iPad through
   * cloud sync. `?playtest=1` moves the game here and turns sync off.
   */
  const PLAYTEST_SAVE_KEY = `pnp:${slug}:playtest:state`;
  return { SAVE_KEY, BROKEN_KEY, PLAYTEST_SAVE_KEY, saveKey: (playtest: boolean) => (playtest ? PLAYTEST_SAVE_KEY : SAVE_KEY) };
}
