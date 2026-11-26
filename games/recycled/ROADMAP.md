# Recycled: roadmap

What's left, in the order it should be done. Finished work is described in `CLAUDE.md` (how it
works) rather than kept here as history.

## Next, in order

### 1. Laptop and iPad layouts

The main UI task, and the reason the game can't be played on the iPad yet.

**Measured** by `npm run check:screens` on the built file: **+448 px of vertical scroll at
1366×1024** (below the `max-width: 1420px` breakpoint the layout drops to two columns and the Depot
and log fall below the fold) and **+109 px at 1440×900**, where the three columns are right but the
content is taller than the window. The game is marked `pnp.tabletReady: false` in `package.json`, so
the screen check reports both as warnings instead of failing.

One responsive layout with two arrangements, chosen by CSS. Don't make two versions:

- **Wide (≥ 1440 px, laptop):** today's three columns (map | dice + actions + accidents | Depot + log),
  but the page must fit `100dvh` — panels scroll inside themselves, the page doesn't.
- **Tablet landscape (about 1024–1439 px, iPad Pro 1366×1024):** map on the left at full height. On the
  right, dice and actions on top, and a tab strip below them with *Depot*, *Accidents* and *Log*.
  Everything inside `100dvh`, no page scroll. The tab strip also gives the Depot a full-width panel,
  closer to the proportions it has on the printed sheet.
- **Touch** (`@media (pointer: coarse)`): targets ≥ 44 px, `touch-action: manipulation`, nothing that
  only works on hover. Today the inspector is hover-driven and tapping pins a hex; make tap the main
  way to inspect. The Depot's pen marks and the manual's tick boxes are small at that size.
- **In-app dialog** instead of `confirm()` for New game.
- **PWA meta tags** in `index.html` (`apple-mobile-web-app-capable`, `mobile-web-app-capable`,
  `apple-mobile-web-app-status-bar-style`, viewport with `viewport-fit=cover`) plus an
  `apple-touch-icon`. In Safari the browser chrome eats roughly 100 px of the iPad's 1024; added to the
  Home Screen it runs standalone and gets the full height. Use `dvh`, not `vh`.
- **"Back to shelf" link** in the top bar (`../../index.html`, where the shelf sits in `dist/`), shown
  only when the game is hosted rather than opened as a file.
- **Keyboard shortcuts** (R, 1/2, U, Esc) don't exist on iPad, so nothing may depend on them.

The icon is **new art that isn't in the PDFs**, so it's an `### External Image Request` for the owner
to run through ChatGPT; build against a placeholder so nothing waits on it.

**Done when:** `check:screens` passes with `pnp.tabletReady: true` at both sizes, the 51 Vitest tests
still pass (`checkScreen` asserts a lot of DOM, so this is CSS and structure work, not a rewrite), and
the owner has tried it on the real iPad.

### 2. Saves that follow you between devices

Decided 2026-11-26, not started. `localStorage` stays the primary store, so the offline
`recycled.html` and a dropped connection keep working; on top of it, sync to **D1** through a small
Worker script (the site is assets-only today). No new login is needed: Access already puts the
player's identity in the `Cf-Access-Jwt-Assertion` header, so the Worker keys saves by email.

Two things to get right:

- **Debounce the writes.** `App.tsx` saves on every state change, which is 1,500–3,000 writes a game.
  Sync at end of turn, or after a couple of idle seconds.
- **Resolve conflicts** by `savedAt`, asking before replacing a newer game on the other device.

A save is small — measured 4.4 KB at day 10, 9.5 KB at day 30, 13 KB at day 44 — so size is not a
constraint. Build it in `packages/kit`: every game on the shelf wants it. Keep a manual
Export/Import (file or clipboard) as a parachute, since it's the only route that works offline.

### 3. Re-cut the board art

The hex interiors are faithful, but the extraction leaves visible damage at the **edges**: a dark grey
fringe down the left side and along the bottom-left, a ragged outline where the board was cut from the
Mars background, an orange smudge bottom-right, and a couple of patch seams mid-right where pre-drawn
buildings were inpainted away. Small marker-ink remnants also survive in a few spots, hidden under
building tiles.

Fix it by **cutting better in code** — tighter outline mask, clean alpha at the border, better
inpainting — never by generative redraw: `board.json` records a grid (`spacing 195.851`,
`rowSpacing 165.877`) measured from the printed hexes, and `HexMap` stretches the image to match, so a
redraw shifts the grid. Re-run `tools/calibrate_grid.py` if the crop moves.

Do it **after the layout**, which fixes the size the board is finally drawn at and therefore which
artifacts actually matter.

**Prerequisites:** `pdftoppm` is installed (poppler, 2026-11-26). The Python side is **not**: Pillow,
numpy and opencv-python-headless all need installing before `tools/extract_art.py` can run.

### 4. Manual dice mode

So the owner can roll real dice and type the values in. The engine rolls through `d6(s)` with a seeded
RNG; add a `manualDice` flag to state and commands that supply dice values (`roll` with `dice`,
`endActions` with the second accident die). Keep the RNG path for normal play and the tests.

### 5. Expansions

The PDFs arrived on 2026-11-26 and are in `sources/recycled/` (gitignored). Nothing has been read or
implemented, and no rules from them have been discussed:

- `Recycled 3 maps addon/`: **Planet 2 (Infected)**, **Planet 3 (Hot)**, **Planet 4 (Toxic)** — one A4
  Sheet1 each, so each is a new `MapDef` plus board art and, if its Depot differs, new `DepotArt`
  coordinates.
- `Recycled Pioneers expansion addon/`: a single A4 sheet, contents unread.

How to take one on:

1. Read the sheet as images at 150–300 dpi and zoom into the small print.
2. List every new or changed rule, and ask the owner about anything ambiguous **before** coding, as was
   done with the double-1s and Battery questions. Record the answers in `RULES-NOTES.md`.
3. Data first: new `MapDef` in `maps.ts`, new `BuildingDef`s in `buildings.ts`, new entries in
   `rules.ts`.
4. Two refactors come first for anything beyond a new map: **a ruleset per state** (the rule tables are
   module imports today) and a **save migration** step. Both are described in `CLAUDE.md`.
5. Art: `calibrate_grid.py` to fit the grid, extend `extract_art.py` with clean patches over the
   pre-drawn buildings, register the board in `BOARDS` (`src/ui/art.ts`).
6. Tests: exact-wording cases for each new effect, new resources added to `TRACKED` and the `TOKEN`
   regex in `checkedAct`, and the `checkScreen` checks extended.

Also needed once there's more than one planet: **a map picker** in the New game flow. `newGame()`
defaults to `'planet1'` today.

## Known issues

- **Balance hasn't been checked against real play.** The test players usually lose, mostly on Sanity or
  Oxygen; without a head start the strategy bot lost all 200 of its games. It's unknown whether the
  game is that hard or the bot is weak. If it feels too punishing in play, re-check the consumption
  table, the unused-dice penalty and the double-1s handling against the rulebook before changing
  anything.
- **The Depot art is small** in the right-hand column on laptop screens. The tab strip in task 1 fixes
  this for tablet width; giving it more width on the laptop layout is still open.

## Ideas, none started

| Idea | Notes |
|---|---|
| "Advisor" warnings | Warn when a resource will run out before the next way to get more. Offered, not requested. |
| Redo within a turn | Undo exists within a turn. Redo is fine to add; persisting history is optional, and would need its own capped key so an old save still loads. |
| Difficulty modes / variants | Never discussed. If added, store the choice in state and add a picker to the New game flow. |
| Score | Never discussed. The game is win/lose only; a score needs a formula from the owner. |
| Mac app wrapper | Tauri or Electron around the same build. The owner chose the browser file; not pursued. |

## Settled: don't relitigate

- **The stack:** TypeScript + React + Vite built to one self-contained HTML file, Vitest for rules,
  Playwright for screens. The output is still one offline file; the engine stays testable.
- **The original art wins** over a clean paper palette. The owner's explicit choice.
- **Raster cleanup stays in code** (OpenCV inpainting) wherever geometry matters. ChatGPT is for *new*
  art only, such as the Home Screen icon.
- **Undo never crosses a random event** (dice roll, accident roll), or the player gets free re-rolls.
- **Everything is inlined** — art and fonts — so the game works offline. Keep it that way.
- **There is no score**, and no `public/` folder: files there aren't inlined and would break the
  single file.
