# Recycled: roadmap

Open work only. **Finished work lives in `CLAUDE.md`**, which describes how things are; this file
describes what is not done. Items marked **(you)** wait on the Game Director.

**Released: 1.0.0 on 2026-11-27** (`recycled-v1.0.0`). Everything below is after that line, not
missing from it. See `RETRO.md` for what the first cycle cost and what changed because of it.

## Next, in order

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

Shipped in 1.0.0 and confirmed across real devices through the live site. What is left:

- **Export / Import save.** The parachute: a file or clipboard copy, the only route that works from
  a `file://` copy or with no network.
- **Move it to `packages/kit`** when a second game needs it - not before.
- The Worker's D1 row is never pruned. Harmless at one row per game, worth revisiting if the shelf
  ever holds many games.

### 4. The launch manual is the last art defect

Three of the four defects found on 2026-11-26 are fixed and described in `CLAUDE.md`: the board's
ragged edge, the broken hex outlines and the Depot's rectangular cut. One is left, and it is the
one re-extraction cannot solve.

**The launch manual is blurry**, small print smeared. **Not fixable by re-extracting:** the
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
- **Who is "you"** - the file changes speaker halfway through, so "Art is never done on your say-so"
  reads backwards in one half.
- **Kit extraction has no home in the stage map**, and game 2's stage 3 is where it will land.
- **The D1 schema is applied by hand**, outside the deploy chain, and the client fails silently - so
  sync can stop working without a sign.
- Smaller: test dir convention (`test/` vs `tests/`), "pure functions" vs `act`'s clone-then-mutate,
  `.btn-small` at 36px inside the 44px touch block, reasons that exist only as a `title` attribute.

### 8. Open findings from playtest 1

The first playtest ran by hand on 2026-11-27 (`playtest/reports/2026-11-27-1-manual.md`, with the
consultant's triage). Fixed since: the board resizing on hover, the Transceiver's self-contradicting
card text, and "Days survived: 16" after a day-17 launch. Still open:

- **A full Food Plant is highlighted for Produce** and nothing on screen says why. It is correct -
  the yield overflows into its joined Cryo Tank - but the player can't tell before clicking.
- **Recycle asked for a hex where Salvage didn't.** The one-target shortcut covers every action, so
  Produce asking is explained by the above; Recycle is not explained by the code and needs a repro.
  A playtest journal would settle it in one replay.
- **Combining a locked double-1s die is untested.** The engine allows it and `SPEC.md` says so, but
  both the tests and the bot avoid that path.

### 9. The single file is 2.7 MB

Up from ~1.6 MB, and it is all art. It loads once and then works offline, so this is a cost rather
than a bug. **The Game Director's call, 2026-11-27: not worth sweating.** It stays on the list
because it drifts: merging an otherwise correct Depot repair silently took it to 4.6 MB by saving a
2496x1500 scan losslessly, and no check would have caught that.

| | Base64 | Where it is used |
|---|---|---|
| Cards (12 x 530x710) | 654 KB | one 69x92 thumbnail in the inspector, and a picker fallback that can never fire now every building has a cut-out |
| Cut-outs (12) | 499 KB | the board. Lossless on purpose: the publisher's pixels are composited through the matte and the gate proves none changed |
| Depot | 377 KB | native resolution on purpose - the manual's small print needs every pixel |
| Board | 252 KB | |
| Tiles (12) | 132 KB | the documented fallback when a building has no cut-out. All twelve have one, so this never fires either |

The three choices, in order of what they cost to look at:

1. **Ship a small card.** A 200px card for the inspector thumbnail would save about 500 KB. The
   full card would then exist nowhere in the build - **(you)** worth saying whether you ever want
   to read a card at full size in the game.
2. **Stop shipping the tiles.** Keep them in the repo (the cut-out tool composites from them) but
   out of the bundle. Saves 132 KB and costs the fallback.
3. **Lossy cut-outs.** Would roughly halve 499 KB, and would mean the shipped asset is no longer
   byte-identical to the publisher's pixels the gate checked. I'd rather not, and would do 1 and 2
   first.

## Known issues

- **(you) Balance.** A careful player won by launch on **day 17 of 75** in the first playtest, which
  is the opposite of the earlier worry. The strategy bot's near-zero win rate says nothing: it was
  written to exercise the late game, not to play well. The real number comes from teaching the
  playtester's strategy to `test/bot.ts` and simulating - and from building task 2 first, because
  ruling 3 shortens the launch route and is not implemented. Play a game yourself before any rule
  is touched; the report's suggested changes would be house rules, which are yours.
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