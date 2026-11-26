# pnp-games

My personal shelf of solo print-and-play games, converted into browser games. I own the physical/PnP
games. The site is for my own play only, on a Mac laptop and an iPad Pro 12.9" in landscape.

Faithfulness to the original rules comes first. Never invent house rules or quietly simplify a
mechanic. When a rule is unclear, ask me, and record my answer.

## Stack (same for every game)

- **TypeScript + React + Vite.** `vite-plugin-singlefile` builds each game into **one self-contained
  HTML file**: JS, CSS, art and fonts all inlined, no network needed. "Single file" describes the
  build output, not the source.
- **Rules in a pure engine.** Put them in `src/engine/` (no React, no DOM) and the game content in data
  tables (`src/data/`). The UI never changes state directly. It sends commands to `act(state, cmd)`,
  which checks them against the rules and returns a new state.
- **Vitest** for rules tests and for UI tests in jsdom. **Playwright** for screen checks in a real
  browser.
- `games/recycled/` is the reference implementation. Copy its structure for new games. When a second
  game needs a feature the first one has (save export, manual dice, top bar), move it into a shared
  workspace `packages/kit/` instead of copying it.

## Repo layout

```
package.json        npm workspaces: ["shelf", "games/*", "packages/*"]
.nvmrc              22
shelf/              launcher page (Vite, single file) -> dist/index.html
games/<slug>/       one game per folder: src/, test/ (or tests/), tools/, vite.config.ts,
                    HANDOVER.md (state of the game, decisions), RULES-NOTES.md (rule interpretations)
packages/           shared code, once two games need it
scripts/            build-all script that assembles dist/
sources/            my PnP PDFs and scans; gitignored, never commit anything from here
dist/               build output (gitignored); wrangler publishes this folder
wrangler.jsonc      Workers config: ./dist as static assets, no Worker script
```

## Commands (from the repo root)

- `npm test`: Vitest in every workspace. **No Playwright here**, because the Cloudflare build machine
  has no browser.
- `npm run build`: builds `dist/index.html` (shelf) and `dist/games/<slug>/index.html` (each game).
- `npm run check:screens`: Playwright against `dist/` at 1440×900 and 1366×1024. It checks for no
  console errors, and for no vertical page scroll at 1366×1024 for games marked tablet-ready.
- Inside a game: `npm run dev` for a live dev server, `npm run release` for a local offline copy.

## Deployment

- **Cloudflare Workers with static assets** (not Pages). `wrangler.jsonc` at the repo root serves
  `./dist` as assets, with no Worker script. The build and deploy are
  `npm ci && npm test && npm run build`, then `npx wrangler deploy`. A failing test stops the deploy,
  because the chain stops. Add `--dry-run` to check the config without publishing.
- `html_handling: "auto-trailing-slash"` means `/games/<slug>/` is the real URL; a request for
  `/games/<slug>/index.html` is redirected to it. Keep the shelf's links pointing at `index.html`
  anyway, so the same `dist/` also works when opened as plain files.
- **Deploying publishes.** Commit when you like, but **deploy and push only when I say so.**
- The site sits behind Cloudflare Access, because the games contain the publishers' art. Never
  link to it or share it anywhere.

## Converting a new game (two phases)

**Phase 1: spec, no code.** Read the PDFs in `sources/<slug>/`. PnP PDFs are often image-only, so
render the pages to images at 150–300 dpi and look at them; zoom into small print. Then write
`games/<slug>/SPEC.md` covering:
1. Components and setup, including the exact starting state of the sheet.
2. Sheet anatomy: every grid, track, box, counter and bonus mark.
3. The turn loop, step by step.
4. Legality rules, and what happens when no move is legal.
5. End of game, scoring formulas, or win/lose conditions.
6. Asset triage (see below).
7. **Ambiguities:** a numbered list of questions for me.

Stop and wait for my answers or "Approved". Record my rulings in `RULES-NOTES.md`.

**Phase 2: build and verify.** Engine and data first, with tests. Then the UI. Then register the game
on the shelf. Check every number against the sheets at full resolution (costs, capacities, tables,
starting values). Misreads are the most common bug.

## Art

Triage every visual:
1. **Simple geometry** (dice, checkboxes, tracks, plain icons): build it in SVG/CSS.
2. **Original art from the PDFs** (boards, cards, illustrations, icons): cut it out with Python
   (`pdftoppm`, Pillow, numpy, OpenCV) in a script saved under `games/<slug>/tools/`. Remove
   pre-printed marks with **inpainting in code**, never generative editing, because exact geometry must
   not move. Measure grids by fitting them, not by eye (see `games/recycled/tools/calibrate_grid.py`).
   Save the art under `games/<slug>/src/assets/` and **import** it, so it's inlined.
   **Don't use `public/`:** files there aren't inlined, which breaks the single file.
3. **New art that doesn't exist in the PDFs** (a Home Screen icon, textures): I make it in ChatGPT.
   Give me an `### External Image Request` block with the target file path, the size or aspect ratio,
   the background (transparent or a colour), and a prompt I can paste. Meanwhile, build with a
   placeholder so nothing waits on the art.

The original art wins when it's available. Otherwise use a clean paper look (off-white `#f8f6f0`,
dark ink `#1f2421`).

## Game rules for the code

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

## Done means

1. `npm test` passes.
2. `npm run build` emits single files into `dist/`.
3. `npm run check:screens` passes at both sizes.
4. You've looked at screenshots of both layouts yourself.
5. `HANDOVER.md` and `RULES-NOTES.md` for the game are up to date.
6. You've told me what's left or uncertain.
