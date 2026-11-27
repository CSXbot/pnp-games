# Recycled: roadmap

What's left, in the order it should be done. Finished work is described in `CLAUDE.md` (how it
works) rather than kept here as history. Items marked **(you)** are waiting on the owner, not on
Claude.

## Next, in order

### 1. Finish the iPad fit

The layout itself is **done** (2026-11-26): both arrangements fit their window with no page scroll,
`pnp.tabletReady` is `true` so `npm run check:screens` now enforces it, and the 51 tests still pass.
How it works is described in `CLAUDE.md`. What is left:

- ~~An `apple-touch-icon`.~~ **Done 2026-11-26:** generated, checked at 60 px, shipped at
  `/apple-touch-icon.png` with a matching `/favicon.png`. Master and prompt in `shelf/icons/`.
  **(you)** say if you'd rather have one of the two rejected designs in `.screens/icons/`.
- **(you) Try it on the real iPad.** Nothing here has touched a physical device: check that the Depot's pen
  marks and the manual's tick boxes are big enough for a finger, that tap-to-inspect reads well, and
  that the standalone Home Screen app gets the full 1024 px of height.
- **The Depot tab is tight.** It fits, but the Depot art is the one panel that would gain most from
  more room; consider giving it the full width of the right column, or its own full-screen view.

### 1b. Draw the game the way the sheet does

Owner direction, 2026-11-27, from ChatGPT's art kit and the review session's proposal
(`claude_exchange/2026-11-27 pnp-games tooling proposal.md`). **This supersedes "the illustrations
are done":** the problem was never image sharpness, it was that we invented a visual language.

**Verified against a 300 dpi crop of the printed starting cells** (`.screens/art/sheet1-starting-cells.png`):
on paper a building is its **pen symbol from the legend, drawn over the printed illustration**; a
unit gained is an **open ring** at a fixed position; a unit spent is **that ring filled in**; a
joined pair gets **one heavy contour around both hexes**. The web game draws an opaque tile, a name
ribbon, evenly spaced pips and a short link bar - none of which are on the sheet.

**Two independent display settings** (owner's decision), so all four pairs must work. No animation.

| Setting | "Pen marks" | "Modern" | Default |
|---|---|---|---|
| Buildings | legend pen symbol over the cut-out illustration; setup stages as the kit's stage symbols; joined pair gets one contour | cut-out illustration with its name label; setup as text; joined pair keeps the short bar | Modern |
| Stock | open ring appears when gained, filled in when spent, unused positions blank | today's ring of dots: spent / available / empty | Pen marks |

Keep the settings **out of `GameState`** - a per-device display preference, so saves stay version 1
and sync is untouched.

**Vendored already:** `src/ui/ink/` (traced marks, projection, shared contour) and the kit's one
supplied cut-out at `src/assets/cutouts/oxygenPlant.png`.

**The work, in order:**

1. Wire `BuildingInk` + `sharedContour` into `HexMap.tsx` behind the settings, mounted in the
   measured cell (`sqrt(3)*SIZE/150` by `2*SIZE/160`, anchored at 75,80). Render the six printed
   starting cells and **look at them at real play size** - a hex is about 60-110 px, and how the
   symbols read at that size is the one thing nobody has checked.
2. **Eleven more cut-outs.** Only the Oxygen Plant is supplied. Keep the publisher's pixels: the
   model supplies the silhouette only, colour comes from the existing `tile-*.webp` crops, and it is
   provable the same way as a masked edit - compare pixels inside the silhouette.
3. `checkScreen`: keep `.slot-used` / `.slot-full` / `.slot-empty` for "Modern", add the kit's
   `data-ink-stock` counts for "Pen marks".
4. Run the kit's two replays (six saves) and its review jobs on the integrated build.

**Cost to be honest about:** four combinations doubles the visual QA surface. Test the default pair
properly, smoke the other three. **Don't delete `tile-*.webp` until the cut-outs ship** - they are
the colour source for making them.

### 2. Automatrons: offer them, don't spend them silently

Owner rulings 10 and 3, made 2026-11-26, not yet implemented. The Laboratory card says an Automatron
"can be used every time instead of any other resources, except Power" - a choice the game currently
makes for the player, in two places only.

1. **Ask on every loss.** When a loss would take Food, Oxygen, Sanity or Radiation and the player
   holds at least one Automatron, ask which units to cover. That covers accidents, the 5th-day
   consumption and the unused-dice penalty. Today's automatic behaviour (spend one only to save a
   life) is the default answer, so a player who just clicks through gets what they get now.
2. **Count them at launch**, for Food, Oxygen and Batteries - one Automatron per missing unit, with
   the total shortfall capped by the Automatrons held. Nothing is spent, the game ends. Transceivers
   are "modules" on the manual, not resources, so they aren't covered. **A launch therefore no
   longer strictly needs a Workshop:** a full Laboratory's 6 Automatrons could cover all 6
   Batteries. The manual's Battery boxes are ticked by crafting today; how a box covered by an
   Automatron is drawn is a UI decision to make.
3. **Show the payment before building.** If a build will take Automatrons for missing Materials, say
   so on the build card before the player commits: "3 Materials + 2 Automatrons".
4. **Make Automatrons prominent.** They're the last item of the stock bar, labelled "Automat.".

**What this costs, from the code:** all three losses resolve inside one `endActions` command
(`game.ts`), after the accident die is rolled, so that command has to pause part-way - the same
shape as `techPending`. Undo must still not reach back past the accident roll. Any new state field
needs a default in `migrateSave`. `test/bot.ts`, `checkedAct` and `checkScreen` all have to answer
the prompt.

### 3. Finish cross-device saves

**Built on 2026-11-26** and working end to end against a local Worker: a shift played in one browser
reaches another, and a browser with its own game in progress is asked rather than overwritten. How
it works is in `CLAUDE.md`. What is left:

- **(you) Confirm it on the real site.** Everything so far used `wrangler dev` with a `DEV_EMAIL`
  stand-in, so the **real Access assertion path has never run**. Open the game on the Mac, play a
  turn, then open it on the iPad and check the shift is there.
- **Export / Import save.** The parachute: a file or clipboard copy, the only route that works from
  a `file://` copy or with no network.
- **Move it to `packages/kit`** when a second game needs it - not before.
- The Worker's D1 row is never pruned. Harmless at one row per game, worth revisiting if the shelf
  ever holds many games.

### 4. Re-cut the art

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
4. **The launch manual is blurry**, small print smeared. **Not fixable by re-extracting:** the
   source PDF holds a single 300 ppi JPEG for the whole A4 page (2480x3508, compression ratio ~4%),
   so the manual region is only a few hundred pixels and 600 dpi would just upscale it. The options
   are, in order: **(you)** an uncompressed copy of the sheet if the publisher ships one (these files
   are all named `-compressed`); show the manual smaller; or redraw just the manual's tick boxes and
   headings in SVG over a blurred background, which is what the pen marks already do. A generative
   sharpen is **not** an option here - the manual is text, and a model would invent wording.

**The board and the Depot carry geometry** (`board.json`'s grid, and the Depot's measured pen-mark
coordinates). That does not put them off-limits to a model - it means **masked edits only**, with a
pixel diff proving nothing outside the mask moved, and no model-generated text. Defects 1 and 3 are
both edge work, so both are good candidates. Re-run `tools/calibrate_grid.py` if a crop moves.
Tiles, cards, icons and the logo carry no geometry and can be regenerated freely.

**Do it after the layout**, which fixes the sizes these assets are displayed at - defect 4 is a
resolution problem, and the iPad layout makes the Depot panel bigger.

**Finish with an `### Art Review Request`** **(you)**: every asset rendered at its real display size
plus 2x crops of every edge and seam, for the owner to check with ChatGPT. Don't self-certify the result;
this set was signed off once already and these four defects survived.

**Prerequisites:** all installed as of 2026-11-27 - poppler (`pdftoppm`, `pdfimages`), Pillow,
numpy and opencv, so `tools/extract_art.py` can run.

**What the Oxygen Plant pass established (2026-11-27), before doing the rest:**

- **The cards were being thrown away.** `extract_art.py` downscaled them to 400 px from a 530 px
  native crop. Fixed: all 12 cards are now native, visibly sharper text in the build picker, at a
  cost of +122 KB in the bundle (1597 -> 1761 KB).
- **The tiles are already native** - the shipped Oxygen Plant tile is a pixel-exact 1:1 crop of the
  illustration band (template match 0.999), so there is no lossless gain left there.
- **Reconstruction was tried twice and rejected both times.** A free reference-guided redraw
  returned a redesign: stairs, entrance and grate reworked, palette oversaturated. A masked version,
  confined to the dome roof and composited locally with a verified zero-pixel diff outside the mask,
  invented panel lines that are not in the source and was indistinguishable at play size. The
  originals ship. Candidates and both acceptance reviews are in `.screens/art/`.
- **So defects 1 and 3 are edge work, not re-rendering.** The ragged board outline and the Depot's
  rectangular cut are mask-and-repair jobs on geometry-bearing images; treat the illustrations as
  done unless something is visibly broken at play size.

### 5. Manual dice mode

So the owner can roll real dice and type the values in. The engine rolls through `d6(s)` with a seeded
RNG; add a `manualDice` flag to state and commands that supply dice values (`roll` with `dice`,
`endActions` with the second accident die). Keep the RNG path for normal play and the tests.

### 6. Expansions

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

### 7. Act on the rest of the cold-read review

A second Claude session reviewed the shelf's `CLAUDE.md` and this game on 2026-11-26
(`claude_exchange/2026-11-26 pnp-games handoff - rulings and process review.md`). The rule misread,
the vacuous fit check and the save-overwrite risk are fixed. Still open, roughly in value order:

- **A data review to match the art review.** One second read of Sheet 2 found a wrong resource that
  a test was pinning in place; four earlier rulings were the same kind of error. Numbers get no
  second reader today. Proposal: a crop beside each transcribed value, reviewed the way art is.
- **Trim the shelf `CLAUDE.md`** (it suggests ~75 lines, 288 to ~215) and give it a line budget, so
  adding a line means merging or deleting one.
- **Who is "you"** - the file changes speaker halfway through, so "Art is never done on your say-so"
  reads backwards in one half.
- **Kit extraction has no home in the stage map**, and game 2's stage 3 is where it will land.
- **The D1 schema is applied by hand**, outside the deploy chain, and the client fails silently - so
  sync can stop working without a sign.
- Smaller: test dir convention (`test/` vs `tests/`), "pure functions" vs `act`'s clone-then-mutate,
  `.btn-small` at 36px inside the 44px touch block, reasons that exist only as a `title` attribute.

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
