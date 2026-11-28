// A trial look for the Game Director's taste call (ROADMAP "Waiting on you", item 3), from the Art
// Director's review (art/decisions.md, 2026-11-28): frames closer to the printed sheet (dark header
// bars, squarer boxes) and charcoal ink with muted previews. The current look stays the default until
// they decide; "?look=sheet" or the Menu switch shows the other. A per-device preference, kept apart
// from the game's save. Whichever wins becomes the only look, and this file goes.
import { readStored, writeStored } from '@pnp/kit/playtest';

const KEY = 'pnp:legend-of-hexdom:look';
export type Look = 'current' | 'sheet';

export function initialLook(): Look {
  try {
    const q = new URLSearchParams(location.search).get('look');
    if (q === 'sheet' || q === 'current') return q;
  } catch {
    /* no location */
  }
  return readStored(KEY) === 'sheet' ? 'sheet' : 'current';
}

export function applyLook(look: Look, remember: boolean) {
  document.documentElement.dataset.look = look;
  if (remember) writeStored(KEY, look);
}

export const currentLook = (): Look => (document.documentElement.dataset.look === 'sheet' ? 'sheet' : 'current');
