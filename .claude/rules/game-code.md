---
paths:
  - "games/*/src/**"
  - "games/*/test/**"
  - "games/*/tests/**"
  - "packages/kit/**"
---

# Writing a game: engine, saves, layout

- **Deterministic randomness.** A seeded RNG lives in the state, and every die goes through one
  function. Tests replay games from seeds.
- **Undo never crosses a random event** (dice roll, accident, card draw), so there are no free
  re-rolls. Clear the undo stack whenever randomness resolves. Redo within that window is fine.
- **Saves:**
  - Use `localStorage` key `pnp:<slug>:state`, written after every change. If you persist history, use
    `pnp:<slug>:history`, capped.
  - Every load goes through a `migrateSave()` step, so schema changes never wipe a game in progress.
    Never rename stored ids (building types, map ids); add new ones instead.
- **Standard features in every game:**
  - Export/Import save (download/upload a JSON file, plus copy/paste text), because Mac, Safari and
    the iPad Home Screen app each keep separate saves.
  - A "Manual dice" mode where I type in real dice. Keep the seeded RNG path for normal play and tests.
  - Highlight only the legal targets, and show the exact reason anything is unavailable.
  - A "How to play" panel.
  - A small top-bar link back to the shelf (`../../index.html`), shown only when hosted.
- **Messages must be true.** Log lines and button texts state what actually happened, computed from
  real changes. Test this the way `games/recycled/test/engine.test.ts` (`checkedAct`) and
  `test/ui.test.tsx` (`checkScreen`) do.

## Layout: one build, two arrangements

- **Laptop (≥ 1440 px wide):** everything side by side.
- **Tablet landscape (1024–1439 px, iPad Pro 1366×1024):** board at full height, secondary panels in
  tabs or drawers. Everything fits in `100dvh` with **no page scroll**.
- **Touch** (`@media (pointer: coarse)`): targets ≥ 44 px, `touch-action: manipulation`, nothing that
  only works on hover, tap to inspect, and in-app dialogs instead of `confirm()`.
- **In `<head>`:**
  - `viewport` with `width=device-width, initial-scale=1, viewport-fit=cover`
  - `apple-mobile-web-app-capable` and `mobile-web-app-capable` set to `yes`
  - `apple-mobile-web-app-status-bar-style` set to `black-translucent`
  - an `apple-touch-icon`

  Pad the top bar with `env(safe-area-inset-top)`.

## The build marker

Every game shows which build it is, faintly, under its title: `scripts/build-stamp.mjs` gives a
short commit and a UTC timestamp, the game's `vite.config.ts` injects it as `__BUILD__`, and the
top bar renders it at 9px and 28% opacity.

It exists because a screenshot from the iPad is how problems get reported, and on 2026-11-27 a
report arrived 90 seconds after a push: the fix looked broken until commit timestamps were compared
against screenshot timestamps and the deploy turned out not to have landed. The marker is for
reading off a screenshot, not for looking at while playing.

`__BUILD__` is undefined under Vitest, which does not apply `vite.config.ts`'s `define`, so the UI
falls back to `'dev'` rather than throwing.
