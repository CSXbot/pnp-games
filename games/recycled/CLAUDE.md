# Recycled

A digital version of the solo print-and-play survival game **Recycled** by Nukazombee Games, for the
owner's personal play only. You are a waste engineer on an orbital junkyard: survive a 75-day shift,
or build what the shuttle needs and launch it. The art is cut from the owner's PDFs, so the repo and
the built file stay private.

One workspace of the `pnp-games` shelf, at `games/recycled/`. Paths below are relative to this folder.
The shelf-wide rules (stack, deployment, layout targets, art protocol) are in the repo root
`CLAUDE.md` and apply here too.

## The documents

| File | What it holds |
|---|---|
| `README.md` | How to play, run and build it |
| `SPEC.md` | The rules as implemented: resources, setup, buildings, turn order, tables, edge cases |
| `RULES-NOTES.md` | How this version reads rules the rulebook leaves open (player-facing) |
| `ROADMAP.md` | What's next, known issues, and decisions already settled |
| `CLAUDE.md` | This file: status, agreements, save schema, architecture, what breaks easily |

## Status

- **Content:** Planet 1 only, base game only, fully playable: both win conditions and every way to lose.
- **Rules:** every rule from the rulebook and cards is in the engine, re-checked against the PDFs.
- **Art:** original art throughout (board, buildings, cards, icons, logo, Depot with its launch manual),
  with "pen" marks drawn over the Depot.
- **Tests:** 51 passing.
- **Source PDFs:** `sources/recycled/` at the repo root, gitignored. Base game plus the 3-maps addon
  and the Pioneers expansion, all A4 and image-only, so read them as images.

**Owner preferences:** plays on a Mac browser and an iPad Pro in landscape; wants the original game
art rather than redrawn art; wants rule questions raised, not silently guessed.

## Working agreements

- Raise rule ambiguities with the owner instead of guessing, and record each answer in
  `RULES-NOTES.md`.
- After any change: from the repo root run `npm test`, then `npm run build`, and for a UI change
  `npm run check:screens` as well. Commit the source only; `npm run release` is just for the owner's
  local offline copy, and `recycled.html` is gitignored.
- Keep every log line and button text exact. The tests check that every message matches what actually
  happened.

## Rulings the owner settled

These came up explicitly with the owner. Don't change them without asking.

| # | Ruling | How it came up |
|---|---|---|
| 1 | **Double 1s:** the two 1s merge into **one 2 AP die (can't be split)**, and **the third die is the second action die**. **No accident** that turn. | The first version dropped the third die. The owner: "It never says to discard the dice. So just merge 1+1, and keep the third one for the second action." |
| 2 | **The shuttle needs 6 Batteries**, not 7. | The owner pointed at the launch manual, which shows 6 boxes. |
| 3 | **Automatrons do not stand in for Batteries** at launch. | This was only needed under the wrong 7-battery reading. Removed with fix 2. |
| 4 | **Research Site holds 6 Sanity**, not 9. | I miscounted the reference panel: each "8" glyph is two circles. |
| 5 | **Produce/Recycle give at most 3 and Salvage at most 2 per action**, combined dice included (the `[x2/x3]` marks on the action board). | The first version let combined dice keep adding. |
| 6 | **The owner asked for "check all rules"** and every message on screen to be correct. | This led to the full re-check against the sheets and to the message-honesty tests (see Tests, below). |
| 7 | **Transceivers need 3 hexes *between* them** (hex distance ≥ 4, `TRANSCEIVER_MIN_DISTANCE`). | The owner chose this reading of "at least 3 hexes away" over distance ≥ 3. |
| 8 | **A new Cryo Tank or Recycler next to two possible partners asks which one to join.** | Before, it silently joined the first one found. |

Readings chosen during development and listed in `RULES-NOTES.md`, which the owner hasn't disputed.
They're still open to change if the owner reads a rule differently:

- **Combined dice and setup steps:** combined dice buy only **one** setup step.
- **Unused dice:** each unused die costs 1 Sanity. An unused combined pair costs 2, and an unused
  locked 1s-die costs 1.
- **Automatrons:** they cover a Materials shortfall when you construct, and they're spent in place of
  your last unit of Food, Oxygen, Sanity or Radiation, which saves your life. They never replace Power.
- **Full Laboratory:** one free tech, from the same 5 bonus boxes.

## State schema and save compatibility (`localStorage`)

- **Key:** `pnp:recycled:state`, exported as `SAVE_KEY` from `src/ui/save.ts`. `App.tsx` and the tests
  import it from there, so the name is written down once. Every game on the shelf shares one origin,
  hence the `pnp:<slug>:state` convention.
- **Old key:** `recycled.save.v1`, exported as `LEGACY_SAVE_KEY`. `load()` falls back to it while
  `SAVE_KEY` holds nothing, which happens once: the next save writes the new key. The old key is left
  in place, because a `recycled.html` built before the move still reads it. `test/save.test.tsx` covers
  all three cases.
- **Value:** `JSON.stringify(GameState)`.
- **When it's written:** after every state change (`useEffect` in `src/ui/App.tsx`).
- **When it's read:** on load. If the key is missing, the JSON is unparsable, or `version !== 1`, the
  game **silently starts a new game**.
- **Storage errors:** they're swallowed, so the game plays on without saving.

**Undo history is not saved.** `history` is React state in `App.tsx`: an array of earlier
`GameState` snapshots. It's cleared on `roll` and `endActions`, and lost on reload. Nothing else is
saved: selected die, pending placement, hover and pins, pop-ups.

```ts
interface GameState {
  version: 1;
  mapId: string;              // key into MAPS (src/data/maps.ts); 'planet1'
  seed: number;               // initial RNG seed
  rng: number;                // current mulberry32 state; every d6 advances it (deterministic replays)
  day: number;                // days completed (0..75); current day = day + 1
  phase: 'roll' | 'choose' | 'actions' | 'won' | 'lost';
  dice: number[];             // this turn's 3 rolled dice ([] in 'roll' phase)
  accidentIdx: number | null; // index into dice kept for the accident
  actionDice: { value: number; used: boolean; parts: number[]; locked?: boolean }[];
                              // parts.length === 2 => combined pair; locked => from 1s, not splittable
  noAccident: boolean;        // true after double/triple 1s
  lastAccident: { day: number; dice: [number, number]; roll: number; name: string } | null;
  buildings: {
    id: number; type: BuildingType; hex: string;   // hex = axial "q,r", centre "0,0"
    drawn: number; used: number;                   // lifetime circles drawn / darkened
    step: number; complete: boolean;               // setup steps (Separator 3, Recycler 2)
    res?: Res;                                     // stored resource (Cryo Tank; prebuilts set it too)
    link?: number;                                 // id of joined building (both sides point at each other)
    bonusDone?: boolean;                           // one-off Full / six-pod bonus already paid
  }[];
  nextId: number;
  depot: Record<'sanity'|'food'|'radiation'|'power'|'materials', { gained: number; lost: number }>;
  techTaken: boolean[];       // length === TECH_BONUSES.length (5), index order as in rules.ts
  techPending: number;
  batteries: number;          // Batteries crafted (launch counter)
  log: { day: number; text: string; tone?: 'good'|'bad'|'info' }[];  // capped at 2000 entries
  endReason?: string;
}
```

- **Hex keys:** axial `"q,r"` for pointy-top hexes. `rowColToKey(map, row, col)` converts from the
  printed sheet's row/column numbers.
- **Derived values:** totals, capacities and "Full" are always computed from the rule data. Only
  counts are stored.

### Extending state for expansions without breaking saves

`load()` runs every save through **`migrateSave(raw)`** in `game.ts`. Today it accepts `version: 1`,
rejects anything that isn't a Recycled save (unknown map, wrong version, missing buildings), adds any
missing Depot row, pads `techTaken` to the current number of bonuses, and makes sure `log` exists.
When changing the schema:

1. **Add a step to `migrateSave`.** Keep accepting `version: 1` and fill in defaults. Bump `version`
   only alongside a migration step that converts the older versions.
2. **Make new fields optional with defaults**, such as `expansions?: string[]` or `variant?: string`,
   and read them with `?? default` in the engine.
3. **These existing structures assume fixed shapes, and old saves will break if you change them:**
   - **`techTaken`** is indexed by `TECH_BONUSES`. Adding a bonus means old saves have a shorter array,
     and `techTaken[i] !== false` then reads as "taken". Pad it in the migration.
   - **`depot`** has exactly the 5 `DEPOT_ROWS` keys. A new Depot row (for example, an expansion
     resource) makes `state.depot[newRow]` undefined, which crashes. Add it in the migration as
     `{ gained: 0, lost: 0 }`.
   - **`BuildingType` and `mapId` strings are stored in saves.** Never rename or remove one. Add new
     ones instead.
   - **`rng`/`seed`:** keep using `d6(s)` so games stay deterministic. Tests depend on seeded replays.
4. **Store expansion and variant choices in state**, set in `newGame()`. Make the engine read rules
   through a lookup that takes the state into account, not the module constants directly. Today
   `ACCIDENTS`, `CONSUMPTION`, `BUILDINGS` and so on are imported directly in `game.ts`, so that's a
   refactor to do first (see the architecture map below).

## Code architecture map

**This is not a hand-written single HTML file.**
- **Source:** a TypeScript + React 19 project built with Vite 8.
- **Build:** `vite-plugin-singlefile` inlines all JS, CSS and art (as base64 webp) into one
  self-contained HTML file of about 1.6 MB.
- **Fonts:** Russo One and Barlow Condensed come from the `@fontsource` packages (Latin subset only,
  imported in `main.tsx`) and are inlined too, so the file works fully offline.
- **Rule for editing:** edit `src/`, never `recycled.html` or `dist/`. `recycled.html` is no longer
  committed: the shelf build makes the published copy, and `npm run release` makes a local one when the
  owner wants a file to double-click.

```
package.json             workspace "recycled"; pnp.tabletReady drives the screen check
index.html               Vite entry (fonts, #root)
vite.config.ts           react + singlefile plugins, base './'
src/main.tsx             mounts <App/>
src/styles.css           all styles (tokens on :root; layout grid; map; depot art; modals)
src/data/                GAME CONTENT AS DATA
  types.ts               Res, DepotRes, DEPOT_ROWS, VITAL, BuildingDef, MapDef, ...
  buildings.ts           BUILDINGS (12 cards), BUILD_ORDER
  rules.ts               TOTAL_DAYS, DEPOT_BOXES, SANITY_TECH_MARKS, ACCIDENTS, CONSUMPTION,
                         TECH_BONUSES, LAUNCH_REQUIREMENTS, MAX_REPEATS, ACTION_COST, RES_NAMES
  maps.ts                PLANET_1 (terrain rows, prebuilt, depot start), MAPS registry
src/engine/              RULES ENGINE (no React, no DOM)
  game.ts                state types, newGame, queries, rules, actions, turn flow
  hex.ts                 axial hex math, buildHexes(map), neighbors, distance, rowColToKey, pixel helpers
  rng.ts                 mulberry32 nextRandom/rollD6, randomSeed
src/ui/                  REACT UI
  App.tsx                state + undo history + localStorage, commit(), keyboard, layout, modals,
                         Inspector, Log
  TurnPanel.tsx          DicePanel, ActionMenu (MENU table), BuildPicker (cards), AccidentTable,
                         noDieReason
  HexMap.tsx             SVG map: board art, hexes, locks, buildings, storage circles, links, targets
  Depot.tsx              StockBar (top totals) and DepotArt (printed Depot + manual with pen marks,
                         Launch button)
  Icons.tsx              ResIcon (art badge, SVG glyph fallback), Amount, Die
  art.ts                 imports the art; BOARDS (board image + grid geometry per map), DEPOT,
                         tileArt/cardArt/iconArt
  Help.tsx               How to play modal
  save.ts                SAVE_KEY ('pnp:recycled:state') and LEGACY_SAVE_KEY, shared with the tests
src/assets/art/          extracted webp art + board.json / depot.json geometry
tools/extract_art.py     cuts art from the PDFs (needs pdftoppm, Pillow, numpy, opencv-python-headless)
tools/calibrate_grid.py  fits the printed hex grid; numbers go into extract_art.py
test/engine.test.ts      rules tests, 300 random games, 200 strategy games, exact-wording cases
test/ui.test.tsx         18 full games through the UI (jsdom), checking the screen after every click
test/ui-join.test.tsx    choosing which neighbour a new Cryo Tank joins, through the UI
test/save.test.tsx       the save key, including reading the pre-move key once
test/bot.ts              heuristic player + `generous()` head start (test-only)
```

### Engine (`src/engine/game.ts`)

- **State transitions:**
  - `act(state, cmd)` clones the state, runs `apply()`, and returns the new state. It throws
    `RuleError` when a command breaks a rule.
  - `tryAct` turns a `RuleError` into `{ ok: false, error }`. The UI only ever calls `tryAct`.
  - Commands: `roll`, `chooseAccident`, `combine`, `split`, `action`, `endActions`, `tech`, `launch`.
- **Actions:**
  - The `ACTIONS` table maps each `ActionKind` to `{ cost, check, run, precheck?, noTarget? }`.
  - `setupImpl` builds the Separator/Recycler actions, and `yieldImpl` builds Produce, Recycle and
    Salvage.
  - Joining: `joinCandidates`, `joinType`, `needsJoinChoice` (all exported for the UI) and the
    internal `joinPartner`/`joinError`.
  - Construction is `ACTIONS.build`, using `placementError`, `affordError`, `pay`, `joinPartner` and
    `completeBuilding`. `completeBuilding` handles instant gains, the Food Plant, Pod and Amplifier
    bonuses, the Rover unlock and the six-pod check.
- **Legality and highlighting:**
  - `actionError(s, die, action, params)` returns the exact reason string the UI shows, or null if the
    action is allowed.
  - Without `params.hex`, it means "is this possible anywhere?". It tries every hex and returns
    `noTarget` if none work.
  - `validTargets()` lists the legal hexes, which are what the map highlights. The UI and the engine
    share this one function, so highlighting can't drift from the rules.
- **Resource changes:**
  - `gain` handles the Depot cap, Sanity overflowing into Materials, Oxygen going into buildings, and
    the T-mark tech trigger.
  - `takeOne`, `loseRes`, `applyEffects` and `draw` handle spending, losing and drawing circles. `draw`
    also fires the Full bonuses.
  - `checkVitals` sets the loss.
  - Each of these **returns its own log text** built from what really changed.
- **Dice:** `apply` → `case 'roll'` (1s rules), `chooseAccident`, `combine`, `split`, and the accident
  roll in `endActions`.
- **Win/lose checks:** `launchStatus(s)` drives both the launch command and the manual display.
  `checkVitals` handles losing, and the end of `endActions` handles the day-75 win.

### UI

- **Data flow:** `App` keeps `state` and `history`. Every interaction goes through
  `commit(cmd)` → `tryAct`. A refusal shows a toast with the reason.
- **Placement:**
  - Choosing an action that needs a hex sets `pending`.
  - `HexMap` highlights `validTargets`, and a click commits the action.
  - When there's exactly one legal hex, the action is applied immediately.
- **The current die:** the selected unused die, otherwise the first unused one.
- **Map rendering:**
  - The board image is stretched separately in x and y so its printed grid lines up with the hex
    math. The printed hexes are squashed: rows are 209.3 px apart where regular hexes would be 214.0,
    at 300 dpi.
  - **Without art for a map** (`BOARDS[mapId]` missing), it falls back to the drawn `Terrain` shapes
    and the `.hex-bg` fills.
- **Depot rendering:** `DepotArt` overlays SVG on `depot.webp`, using **hard-coded pixel coordinates
  measured on the 300 dpi Sheet 1** (`STAGE_BARS`, `TALLY_Y`, `TECH_BOXES`, `COUNTER`, `MANUAL`). It
  draws the pen marks:
  - a tally mark per completed day, with a stroke across every 5th
  - an X in taken tech boxes
  - an ellipse around each box of stock, and a filled box for each spent one
  - ticks in the manual for Transceivers and Batteries
  - an Oxygen/Food "n/5" count.

### Tests

- **`engine.test.ts`:**
  - **`checkedAct`:** a wrapper used in the random and strategy games. It parses every new log line
    for `+N Resource` / `−N Resource` and asserts that the sums **equal the real change** in totals.
    It also checks Battery and Automatron plurals, no "undefined"/"NaN" text, and that the game-over
    line comes last.
  - **Simulated games:** 300 random games and 200 strategy games. Half the strategy games start with
    `generous()` extra resources so the late game gets exercised.
- **`ui.test.tsx`:**
  - **What it does:** renders `<App/>` in jsdom with `Math.random` mocked, and plays 10 random and
    8 strategy games by clicking.
  - **What `checkScreen()` compares with the saved state after every click:**
    - the stock bar and its tooltips
    - the Depot pen marks and tally
    - the day and next consumption
    - dice captions and the End turn penalty text
    - every action button's enabled state and its title/why text
    - the Construction button, and every card's storage text and reason in the picker
    - the accident range highlight
    - the launch manual and Launch button
    - the last 40 log lines
    - building circles and setup text, and locked hexes
    - the tech and game-over pop-ups
  - It also checks highlighted hexes against `validTargets`, the inspector text, and that Undo
    restores the exact earlier state.

### Fragility: read before refactoring

- **Two copies of some strings:**
  - **What:** the tests rebuild some strings independently, on purpose. Examples: End turn button text,
    `Storage: …`, `possible: a–b`, `Last accident: …`, status `n/5 ✓`, and the inspector `"x Res · y
    space left"`.
  - **Rule:** change wording in both places.
  - **Lookups the tests rely on:**
    - **Class names:** `.crow`, `.box-lost`, `.box-have`, `.tally line`, `.techbox.taken`,
      `.pip-box.on`, `.stock-n`, `.die-caption`, `.why`, `.target-ring`, `.map-prompt`, `.card`,
      `.btn-launch`, `.modal.tech`, `.modal.gameover`.
    - **Data attributes:** `data-hex`, `data-building`, `data-res`, `data-label`.
    - **Order:** the `MENU` order in `TurnPanel.tsx`.
- **Deferred log lines:**
  - **What:** `deferred` is a **module-level** array in `game.ts`. Lines such as "tech bonus", "Full"
    and "You lost" are queued during a command and flushed after it, so they appear after the line
    describing the action.
  - **Risk:** the engine isn't safe to run re-entrantly or concurrently (fine today).
  - **Rule:** keep `act()` as the only entry point.
- **`hexCache`** is keyed by `mapId`. Map definitions must not change at runtime.
- **Rule constants are module imports.** Supporting expansions or variants means passing a ruleset into
  the engine (for example, `rulesFor(state)`). Plan that refactor before adding the first expansion
  rule.
- **`Depot.tsx` coordinates are specific to Sheet 1.**
  - **If an expansion sheet changes the Depot:** measure new coordinates and make `DEPOT` data per map,
    alongside its image.
  - **`depot.json` today:** holds only the crop origin (`x0`, `y0`) and size.
- **`board.json` and the grid numbers come from `tools/calibrate_grid.py`.**
  - **What uses them:** `extract_art.py` uses `ROW0_X`, `DX`, `ROW0_Y` and `DY` for the clean-up and
    the outline mask, and `HexMap` relies on `spacing`/`rowSpacing`/`centerX`/`centerY`.
  - **Rule:** after re-extracting, look at the board. The art cleanup uses inpainting, with hand-placed
    patch hexes for the pre-drawn buildings.
- **The Separator and Recycler have no instant gain.** Their `cost.ap` is the AP per step (1 and 3).
  `BUILD_ORDER` includes them, but `ACTIONS.build` refuses them and tells the player to use the Set up
  actions instead.
- **`techPending` blocks every command.** Any new command type has to respect that, or tech choices can
  be skipped.
- **Safety-check quirk in this environment:** long `bash` heredocs that also contain `rm` were refused
  by the tool's safety check. Use Write/Edit for files.
