/**
 * Where this game's state lives in `localStorage`.
 *
 * Every game on the shelf shares one origin, so the key is namespaced per game:
 * `pnp:<slug>:state`. `App.tsx` and the tests both import it from here, so the name is
 * written down once.
 */
export const SAVE_KEY = 'pnp:recycled:state';

/**
 * The key the game used before it moved into `pnp-games`. It is read when `SAVE_KEY` holds
 * nothing, which happens once: the next save writes the new key. The old key is left in
 * place, because a `recycled.html` built before the move still reads it.
 */
export const LEGACY_SAVE_KEY = 'recycled.save.v1';

/**
 * Where a save that could not be loaded is parked. A migration bug or a version bump would
 * otherwise destroy a game in progress: the fresh game replacing it is written to `SAVE_KEY`
 * immediately. Only the first failure is kept, so a later good save can't be shadowed by it.
 */
export const BROKEN_KEY = 'pnp:recycled:state.broken';
