# Recycled: roadmap

What's left, in the order it should be done. Finished work is described in `CLAUDE.md` (how it
works) rather than kept here as history. Items marked **(you)** are waiting on the owner, not on
Claude.

## Next, in order

### 1. Finish the iPad fit

The layout itself is **done** (2026-11-26): both arrangements fit their window with no page scroll,
`pnp.tabletReady` is `true` so `npm run check:screens` now enforces it, and the 51 tests still pass.
How it works is described in `CLAUDE.md`. What is left:

- **(you) An `apple-touch-icon`.** New art that isn't in the PDFs, so it needs an
  `### External Image Request` to the owner. `index.html` has the PWA meta tags already; without the
  icon the Home Screen shows a screenshot thumbnail.
- **(you) Try it on the real iPad.** Nothing here has touched a physical device: check that the Depot's pen
  marks and the manual's tick boxes are big enough for a finger, that tap-to-inspect reads well, and
  that the standalone Home Screen app gets the full 1024 px of height.
- **The Depot tab is tight.** It fits, but the Depot art is the one panel that would gain most from
  more room; consider giving it the full width of the right column, or its own full-screen view.

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

### 3. Re-cut the art

Four defects, confirmed from zoomed screenshots at play size (2026-11-26). The rust ground under a
building tile is **not** one of them: that ground is part of the building art.

1. **The board's outer edge is ragged** - a dark, torn fringe where the board was cut out of the Mars
   background.
2. **Hex outlines break** where pre-drawn buildings were inpainted away, and where building tiles are
   drawn over them. **Check the cheap fix first:** if `HexMap` draws the hex border *after* the tile,
   the lines stay continuous and no re-extraction is needed for this one.
3. **The Depot is a lazy rectangular cut** through a machine that is not rectangular. It slices the
   shape and drags in neighbouring sheet content at the top left. The cut has to follow the machine's
   outline, pipes and rounded corners included.
4. **The launch manual is blurry**, small print smeared: it is a small region of `depot.webp`
   (2345x1335 for the whole strip) shown large. Extract it at a higher dpi, sized to whatever the
   finished layout actually displays.

**The board and the Depot carry geometry** (`board.json`'s grid, and the Depot's measured pen-mark
coordinates), so they are cleaned by inpainting in code; a generative redraw would move the grid.
Re-run `tools/calibrate_grid.py` if a crop moves. Tiles, cards, icons and the logo carry no geometry,
so generative cleanup is allowed there.

**Do it after the layout**, which fixes the sizes these assets are displayed at - defect 4 is a
resolution problem, and the iPad layout makes the Depot panel bigger.

**Finish with an `### Art Review Request`** **(you)**: every asset rendered at its real display size
plus 2x crops of every edge and seam, for the owner to check with ChatGPT. Don't self-certify the result;
this set was signed off once already and these four defects survived.

**Prerequisites:** `pdftoppm` is installed (poppler, 2026-11-26). Pillow, numpy and
opencv-python-headless are **not**, and `tools/extract_art.py` needs all three.

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

- **(you) Balance hasn't been checked against real play.** The test players usually lose, mostly on Sanity or
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
