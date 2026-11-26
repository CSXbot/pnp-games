# HANDOVER: Recycled (digital solo version)

This file hands development over from the browser chat that built the game to Claude Code in the
terminal. Read it with `README.md` (how to run and build), `RULES-NOTES.md` (rule interpretations
shown to the player) and the shelf-wide `CLAUDE.md` at the repo root. Where this file and the code
disagree, the code and its tests are the truth; update this file.

**Where the game lives:** `pnp-games/games/recycled/`, one npm workspace on the shelf. Paths in this
file are relative to that folder, unless they start with `pnp-games/`.

Quick start, from the repo root:

```bash
npm ci
```

(One lockfile at the root installs every workspace.)

```bash
npm test
```

(Vitest in every workspace; 51 tests for this game, about 25 seconds. No Playwright.)

```bash
npm run build
```

(Builds the shelf into `dist/index.html` and this game into `dist/games/recycled/index.html`, each one
self-contained.)

```bash
npm run check:screens
```

(Playwright over `dist/` at 1440×900 and 1366×1024. It drives the installed Google Chrome, and writes
screenshots to `.screens/`.)

From `games/recycled/`:

```bash
npm run dev
```

(Live-reloading dev server.)

```bash
npm run release
```

(Type-checks, builds, and copies `dist/index.html` to `recycled.html`, a local offline copy for the
owner's Mac. That file is **not** committed.)

---

## 1. Game Identity & Status

**Game:** *Recycled*, a solo print-and-play resource-management and survival game by
**Nukazombee Games**. The owner bought it and this version is for their personal play only. The game's
art is cut from the owner's PDFs and lives in `src/assets/art/`. Don't publish the repo or the built
file. Keep the repo private.

**Theme:** you are a waste engineer on an orbital junkyard. Survive a 75-day shift, or build what the
shuttle needs and launch it.

**Source material the owner supplied** (A4 PDFs, image-only with no text layer, so read them as
images):

- `EN_A4_Rulebook_Page1..4`: the rules.
- `EN_A4_Sheet1_Planet1`: the hex map, the Recycle Depot counters and the launch manual.
- `EN_A4_Sheet2`: the action/accident/protocol board and all 12 building cards.

The PDFs are **not** in the repo. Ask the owner for them if you need to re-extract art or check a
rule. `tools/extract_art.py` takes their paths as arguments.

**Status (as of the handover commit):**

- **Content:** Planet 1 only, base game only, fully playable start to finish: both win conditions and
  every way to lose.
- **Rules:** every rule from the rulebook and cards is in the engine. The card costs, storage
  capacities, map terrain (all 61 hexes), pre-drawn buildings, Depot boxes, accident table,
  consumption stages and tech marks were re-checked against the PDFs at full resolution.
- **Art:** the original art is used for the hex board, building illustrations, construction cards,
  resource icons, logo and banner, and the Depot machine with the launch manual. The Depot is marked up
  with "pen" marks.
- **Tests:** 51 passing.
- **Commits:** history is in `git log`. The six commits before this file are: initial version → rule
  fixes after re-checking the sheets → clearer construction errors → message honesty sweep → original
  art + double-1s rule → exact grid alignment.
- **Owner preferences:**
  - Plays on a Mac in a browser by double-clicking `recycled.html`.
  - Wants the original game art rather than redrawn art.
  - Wants rule questions raised instead of silently guessed.

### Rulings agreed in the chat (or later corrections of my mistakes)

These came up explicitly with the owner. Don't change them without asking.

| # | Ruling | How it came up |
|---|---|---|
| 1 | **Double 1s:** the two 1s merge into **one 2 AP die (can't be split)**, and **the third die is the second action die**. **No accident** that turn. | The first version dropped the third die. The owner: "It never says to discard the dice. So just merge 1+1, and keep the third one for the second action." |
| 2 | **The shuttle needs 6 Batteries**, not 7. | The owner pointed at the launch manual, which shows 6 boxes. |
| 3 | **Automatrons do not stand in for Batteries** at launch. | This was only needed under the wrong 7-battery reading. Removed with fix 2. |
| 4 | **Research Site holds 6 Sanity**, not 9. | I miscounted the reference panel: each "8" glyph is two circles. |
| 5 | **Produce/Recycle give at most 3 and Salvage at most 2 per action**, combined dice included (the `[x2/x3]` marks on the action board). | The first version let combined dice keep adding. |
| 6 | **The owner asked for "check all rules"** and every message on screen to be correct. | This led to the full re-check against the sheets and to the message-honesty tests (see §4, Tests). |
| 7 | **Transceivers need 3 hexes *between* them** (hex distance ≥ 4, `TRANSCEIVER_MIN_DISTANCE`). | The owner chose this reading of "at least 3 hexes away" over distance ≥ 3. |
| 8 | **A new Cryo Tank or Recycler next to two possible partners asks which one to join.** | Before, it silently joined the first one found. |

Interpretations I chose and listed in `RULES-NOTES.md`, which the owner hasn't disputed. They're
still open to change if the owner reads a rule differently:

- **Combined dice and setup steps:** combined dice buy only **one** setup step.
- **Unused dice:** each unused die costs 1 Sanity. An unused combined pair costs 2, and an unused
  locked 1s-die costs 1.
- **Automatrons:** they cover a Materials shortfall when you construct, and they're spent in place of
  your last unit of Food, Oxygen, Sanity or Radiation, which saves your life. They never replace Power.
- **Full Laboratory:** one free tech, from the same 5 bonus boxes.

---

## 2. Verified Rules & Scoring Specification

**There is no score.** The game ends in a **win** (launch, or survive 75 days) or a **loss**. The
game-over screen shows "Days survived", the building count and the Batteries crafted, but these are
just information. If the owner wants a score, it's a new feature and needs a formula from them.

Where each kind of rule lives in code:

- **Data:** `src/data/rules.ts` (tables) and `src/data/buildings.ts` (cards).
- **Logic:** `src/engine/game.ts`.

### Resources

| Resource | Lives in | Notes |
|---|---|---|
| Food, Sanity, Radiation protection ("Rad. prot."), Power, Materials | Depot row (31 boxes each) **and** building storage | Power only exists in the Depot, since no building stores it. |
| Oxygen | **Buildings only** (Oxygen Plant, Cryo Tank) | No Depot row. A gain with no free building space is lost. |
| Automatron | Laboratory storage | Can be spent in place of Materials and vital resources (see above). |
| Battery | Workshop storage; `state.batteries` counts how many were crafted | Crafting one also gives +1 Radiation protection to the Depot. |

- **Vital resources** (`VITAL`): Food, Oxygen, Sanity, Radiation. If the **total** (Depot plus
  buildings) of any of them reaches 0, you lose.
- **Spending order** (`takeOne`): the first complete building that has stock, in building creation
  order, then the Depot. Automatrons come last, and only for Materials or a vital resource's last unit.
- **Depot row** (`depot[r] = { gained, lost }`):
  - Stock is `gained − lost`.
  - Boxes never come back: a box that has been gained and then lost stays spent.
  - `gained` is capped at 31.
  - Sanity past box 31 becomes **+1 Materials**, if Materials has room. Any other row that's full loses
    the gain, and the log says "did not fit".
- **Building storage** (`drawn`, `used`): `drawn` counts every circle ever drawn and is capped at
  capacity. Circles never free up again, so every building has a **lifetime** output limit.
  "**Full**" means `drawn == capacity`.

### Setup (Planet 1, `src/data/maps.ts`)

Map rows (B blank, C crater, I ice, T trash, S shuttle):

```
BITBT / BBBIBB / BBBBBBB / CCBBIBTT / TTBBSBCBB / TBBBBBCT / TTBBBBB / CCBBBB / TBBIB
```

- **Hexes:** 61 in total. The 24 hexes in the outer ring are **locked until a Rover is complete**.
  Nothing can be built on the shuttle hex.
- **Pre-built** (sheet row, col from the top; circles drawn):

  | Building | Hex | Circles drawn |
  |---|---|---|
  | Oxygen Plant | (3,4) | 6/6 |
  | Food Plant | (2,2) | 3/6 |
  | Cryo Tank (Food), joined to the Food Plant | (1,1) | 2/4 |
  | Research Site | (4,6) | 4/6 |
  | Separator, installed | (3,6) | 3/6 |
  | Recycler, joined to the Separator | (4,7) | 2/4 |

- **Depot at start:** Sanity 2, Food 4, Radiation 4, Materials 6, Power 2 (3 boxes gained, 1 spent).
- **Starting totals:** Food 9, Oxygen 6, Sanity 6, Radiation 4, Power 2, Materials 11.

### Buildings (`src/data/buildings.ts`)

| Building | AP | Mat | Pwr | Storage | Placement / limit | Effect |
|---|---|---|---|---|---|---|
| Food Plant | 5 | 4 | 1 | 6 Food | any free hex | +1 local Food. On completion: **+2 Food to Depot for each other complete Food Plant adjacent**. Produces. |
| Oxygen Plant | 5 | 4 | 1 | 6 Oxygen | **ice** | +1 local Oxygen. Produces. |
| Cryo Tank | 4 | 1 | 1 | 4 (Food **or** Oxygen) | adjacent to a complete Food/Oxygen Plant **not already joined** | Joined to that plant and stores the plant's resource. +2 local. Produces. |
| Research Site | 6 | 2 | 0 | 6 Sanity | **crater** | +1 local Sanity. **Once Full: +1 Radiation to Depot, +1 Sanity per other Full Research Site** (once). Produces. |
| Nuclear Pod | 5 | 3 | 0 | none | any | **+1 Power, or +2 if adjacent to an Amplifier** |
| Amplifier | 6 | 4 | 0 | none | any | **+1 Power per adjacent Nuclear Pod** on completion. **+3 Power once** if it's ever adjacent to six Pods. |
| Separator | 1 per step, 3 steps | 0 | 0 | 6 Materials | **trash** | Built with the "Set up Separator" action. Enables Salvage. |
| Recycler | 3 per step, 2 steps | 0 | 0 | 4 Materials | adjacent to an **installed**, un-joined Separator | Built with "Set up Recycler". Joined to the Separator. Enables Recycle. |
| Rover | 7 | 5 | 1 | 6 Sanity | any unlocked hex (so an inner one) | +1 local Sanity. **Unlocks the outer ring.** Produces. |
| Transceiver | 1 | 1 | 1 | 3 Sanity | **3 hexes between** it and other Transceivers (distance ≥ 4); limit 3 | +3 local Sanity |
| Laboratory | 8 | 5 | 2 | 6 Automatrons | limit 1 | +3 local Automatrons. Enables Craft Automatron. **Once Full: one free tech.** |
| Workshop | 7 | 6 | 2 | 6 Batteries | limit 1; needs a complete Laboratory | Enables Craft Battery. |

**Construction:**
- **Paying:** one die (or a combined pair) with value ≥ the AP cost. No change is given back.
- **Materials:** paid from buildings, then the Depot, then Automatrons for any shortfall.
- **Power:** paid from the Depot only.
- **Completion:** everything except the setup buildings completes instantly.
- **Error priority:** when a building can't be built, the reason shown follows this order:
  1. AP too low.
  2. Can't afford it (shown first so the player sees "Needs 2 Power (you have 0)", not "no valid hex").
  3. Placement.

### Turn sequence (`apply()` in `game.ts`)

`state.day` = days **completed**. The current day is `day + 1`.

1. **Roll** (`roll`): 3 d6 from the seeded RNG.
   - **Three 1s:** one locked 6 AP die and no accident. Go straight to the action phase.
   - **Two 1s:** a locked 2 AP die plus the third die, and no accident. Go straight to the action phase.
   - **Otherwise:** the `choose` phase.
2. **Choose the accident die** (`chooseAccident`). The other two dice become the action dice.
3. **Actions** (`actions` phase):
   - Each action die is used once. The UI can apply actions to either die.
   - `combine` merges two unused dice into one die worth their sum. That includes a locked 2.
   - `split` undoes a combine, as long as the combined die is unused.
   - Action costs:

     | Action | AP | Result |
     |---|---|---|
     | Set up Separator | 1 | 1 step per AP |
     | Recycle | 2 | 1 Material per 2 AP, max 3 |
     | Produce | 2 | 1 per 2 AP, max 3 |
     | Salvage | 3 | 1 Material per 3 AP, max 2 |
     | Set up Recycler | 3 | 1 step per 3 AP |
     | Study | 5 | +1 Sanity |
     | Craft (Automatron or Battery) | 6 | +1 |
     | Fix Rad Fuse | 7 | +1 Radiation |
     | Construction | card's AP | |

   - **Repeatable actions** (Produce, Recycle, Salvage, setup steps) repeat as many times as fit into
     the die, up to their caps. Each repeat targets the **one** chosen building and stops when that
     building is Full.
   - **Produce at a plant:** overflows into the plant's joined Cryo Tank.
   - **Combined dice:** buy only one setup step.
4. **End turn** (`endActions`), in this exact order:
   1. Sanity penalty for unused dice.
   2. Accident: the kept die plus a fresh d6 (2–12) looks up the accident table. Positive effects go to
      the Depot.
   3. On days divisible by 5, consumption for the current stage:

      | Days | Consumption every 5th day |
      |---|---|
      | 1–10 | −1 Food, −1 Oxygen |
      | 11–25 | adds −1 Sanity |
      | 26–50 | adds −1 Radiation |
      | 51–65 | −2 Sanity, −1 Radiation |
      | 66–75 | −2 Sanity, −2 Radiation |

   4. `day++`.
   5. If `day == 75`, **win**.

   The vital check runs after each of these steps. The first resource to hit 0 ends the game, and the
   rest of the turn doesn't happen.

### Accident table (2–12)

| Roll | Accident | Effect |
|---|---|---|
| 2 | Power outage | −2 Radiation, −2 Sanity |
| 3 | Spacesuit breach | −2 Radiation |
| 4 | Overexposure | −1 Radiation |
| 5 | Injury | −2 Sanity |
| 6 | Food poisoning | −1 Sanity, −1 Food |
| 7 | Anxiety attack | −1 Sanity |
| 8 | Oxygen leak | −1 Oxygen |
| 9 | Infection | −1 Food |
| 10 | Reading at work | +1 Sanity |
| 11 | Surplus produce | +1 Food |
| 12 | Motor overdrive | +1 Materials |

### Tech bonuses

- **Triggers:**
  - Any Sanity gain whose box reaches **8, 16, 23 or 31**.
  - A Laboratory becoming Full.
- **Choices:** five boxes, each usable once: `[+3 Power, +3 Power, +3 Radiation, +3 Radiation,
  +3 Radiation]` (the `techTaken` index order).
- **Pending:**
  - `techPending` counts choices owed, capped at the boxes still free.
  - While it's above 0, **every command except `tech` is refused**, and the UI shows a pop-up.
  - Once all five boxes are taken, further triggers do nothing.

### End conditions

- **Win by launch** (`launch`):
  - **When:** whenever `phase` is `roll`/`choose`/`actions`, no tech choice is pending, and you have
    **3 complete Transceivers, 6 crafted Batteries, total Oxygen ≥ 5 and total Food ≥ 5**.
  - **Resources:** none are consumed.
  - **Result:** an immediate win.
- **Win by survival:** finishing day 75's End turn without losing.
- **Lose:** the total of a vital resource reaches 0. The message is "You lost your last unit of X."
  It's always the last log line.

### Edge cases that aren't obvious from the code

- **Automatron life-saving:** it only triggers when the total of that resource is ≤ 1. It spends an
  Automatron *instead of* the unit, which keeps you at 1.
- **Choosing the join partner:**
  - **With one candidate** (an adjacent, complete, un-joined plant or Separator), it's joined
    automatically.
  - **With more than one,** the command needs `params.joinTo` (that building's hex). Without it the
    engine refuses with "Choose which plant the Cryo Tank joins." / "Choose which Separator the Recycler
    joins.". The UI then asks with a second click on the map.
  - **For a Recycler,** this only matters on its first setup step; later steps continue the same site.
- **Amplifier bonus scope:** "Adjacent to six Pods" counts only **complete** Pods. The check runs after
  every completed building.
- **Research Site bonus timing:** the Full bonus counts *other* Full Research Sites at the moment this
  one fills. It isn't paid again later.
- **Combining a locked die:** combining the locked 2 (double 1s) with the other die is allowed. The
  merged die is then an ordinary combined die and can be split back.
- **Undo** (UI only): Undo works within a turn and can't go back past `roll` or `endActions`, so you
  can't reroll or redo an accident.

---

## 3. State Schema & Save Compatibility (`localStorage`)

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
   refactor to do first (see §4).

---

## 4. Code Architecture Map

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

---

## 5. Known Issues & Technical Debt

### Fixed in the last browser session

- **The player can now choose the join partner** (see §2, "Edge cases").
- **Transceiver distance** is settled as the owner's ruling (§1).
- **Dead "Undo last action" button** on the game-over screen: removed.
- **Save migration:** `migrateSave` added (§3).
- **Fonts:** bundled, so the game works offline.
- **Header map name:** now comes from `MAPS[mapId].name`.
- **Leftover CSS:** the pre-art Depot styles are removed. The non-art fallbacks (the `Terrain` SVG and
  `GLYPHS` in `Icons.tsx`) stay on purpose.
- **`tools/__pycache__`:** untracked and added to `.gitignore`.

### Behaviour and rules

1. **Balance hasn't been checked against real play.**
   - **What we saw:** the test players usually lose, mostly from Sanity or Oxygen. Without a head
     start, the strategy bot lost every one of 200 games.
   - **Open question:** it's unknown whether the game is that hard or the bot is weak. The owner was
     asked to report if it feels too punishing.
   - **If it does:** re-check the consumption table, the unused-dice penalty and the double-1s
     handling against the rulebook first.

### UI and layout

2. **The layout doesn't fit an iPad Pro in landscape yet.** It's laid out for a laptop, and nothing has
   been tested on a real iPad.
   - **Layout:** iPad Pro 12.9" landscape is 1366×1024 CSS px (13" M4: 1376×1032). That's under the
     `max-width: 1420px` breakpoint, so it gets the 2-column layout with the Depot moved below, and the
     page scrolls.
   - **Measured** by `npm run check:screens` on the built file: **+448 px of vertical scroll at
     1366×1024** (the Depot and the log sit below the fold) and **+109 px at 1440×900**, where the
     three columns are right but the window is shorter than the content. Nothing in the layout was
     changed during the move into `pnp-games`; the game is marked `pnp.tabletReady: false` in its
     `package.json`, so the screen check reports both as warnings instead of failing.
   - **Inspector:** it's hover-driven. Tapping pins a hex, which works, but hover feedback doesn't
     exist on touch.
   - **Keyboard shortcuts** (R, 1/2, U, Esc) don't exist on iPad.
   - **New game:** uses the browser's `confirm()`.
   - **Small tap targets:** the Depot's pen marks and the manual's tick boxes are small at that size.
   - **The plan** is in §7, "Laptop and iPad".
3. **The Depot art is small in the right-hand column on laptop screens.** Giving it more width, closer
   to the paper sheet's layout, was offered and not yet done.
4. **Small marker-ink remnants** may survive at a few spots on the board art, under building tiles.
   They're invisible in play.
5. **There's no map or variant picker.** `newGame()` defaults to `'planet1'`.

### Repo hygiene

6. ~~**`recycled.html` (about 1.6 MB) is committed**~~ **Fixed by the move.** The built file is no
   longer in git: `games/recycled/.gitignore` excludes it, the shelf build produces the published copy,
   and `npm run release` still writes it locally for offline play (§7).

---

## 6. Expansions & Roadmap Discussed

**Expansions:** the owner said "Expansions I will provide later". **No expansion contents, names or
rules were discussed**, so there are no rule details to carry over. When the expansion PDFs arrive:

1. Read them as images; they're likely image-only like the base game.
2. List every new or changed rule. Ask the owner about anything ambiguous before coding, as we did
   with the double-1s and Battery questions.
3. Data first:
   - **Planets:** a new `MapDef` in `maps.ts`.
   - **Buildings:** new `BuildingDef`s.
   - **Rule tables:** new entries in `rules.ts`.
4. Plan the ruleset-per-state refactor (§4) and save migration (§3) before adding expansion-only
   mechanics.
5. Art for a new planet: render the sheet at 300 dpi, then:
   1. Run `calibrate_grid.py` to fit the grid.
   2. Add a board function or parameters to `extract_art.py`, including clean patches over any
      pre-drawn buildings.
   3. Register the board in `BOARDS` (`src/ui/art.ts`).
   4. If the planet's Depot differs, make the `DepotArt` coordinates per map.
6. Extend the tests:
   - exact-wording cases for each new effect
   - `checkedAct` coverage, by adding new resources to `TRACKED` and the `TOKEN` regex
   - the UI checks in `checkScreen`.

**Other features mentioned in the chat, none started:**

| Idea | Status / notes |
|---|---|
| **"Advisor" warnings** | Offered: warn when a resource will run out before the next way to get more. Not requested yet. |
| **Bigger or re-laid-out Depot** | Offered because the Depot is small in the side column. Not done. |
| **Balance review** | The owner was asked to report after playing whether it's too punishing. The first things to re-check are listed in §5.2. |
| **Mac app wrapper** | Mentioned at the very start as an option (Tauri or Electron around the same web build). The owner chose the browser file; not pursued. |
| **Difficulty modes / variants** | **Not discussed.** If added, store the choice in state (§3) and add a picker to the New game flow. |
| **Score** | Not discussed; the game is win/lose only (§2). |
| **Planet 2+** | Only implied by the PDF name "Sheet1_Planet1". Nothing was provided. Wait for the owner's files. |

**Working agreements to keep:**
- Raise rule ambiguities with the owner instead of guessing silently, and record each decision in
  `RULES-NOTES.md` and in this file.
- After any change: from the repo root run `npm test`, then `npm run build`, and for a UI change
  `npm run check:screens` as well. Commit the source only; `npm run release` is just for the owner's
  local offline copy.
- Keep every log or button message exact. The tests check that every message matches what actually
  happened.

---

## 7. The move into `pnp-games` (done) and the decisions behind it

The game now lives on the shelf: `pnp-games`, an npm-workspaces monorepo with a shelf-wide `CLAUDE.md`,
to be deployed to Cloudflare Workers and played on a Mac laptop and an **iPad Pro 12.9"/13" in landscape**
from the Home Screen. That template was written for small, hand-written single-file games. Recycled
differs in ways that matter. These are the decisions for this game; they take priority over the generic
template.

**What the move changed.** Nothing in the engine or the UI behaviour:

- The game sits in `games/recycled/` with `src/`, `test/`, `tools/`, `HANDOVER.md`, `RULES-NOTES.md`
  and `README.md`. The old `recycled-game` repo keeps the history and can be archived.
- One `package-lock.json`, at the root. `games/recycled/package.json` still carries this game's own
  dependencies and its `dev` / `build` / `test` / `release` scripts.
- The save key became `pnp:recycled:state`, and the pre-move key is read once (§3).
- `recycled.html` is gitignored instead of committed (§5.6).
- `docs/pnp-games/CLAUDE.md` became the repo root `CLAUDE.md`; the copy inside the game is gone.

### Stack and repo layout (decided, owner asked for a firm call)

**One stack for every game on the shelf: TypeScript + React + Vite, built to one self-contained HTML
file with `vite-plugin-singlefile`; Vitest for rules tests, Playwright for screen checks.**
Not hand-written vanilla JS, even for tiny roll-and-writes. Reasons:

- **The output is still one file.** It has no dependencies, works offline, and can be opened by
  double-click. That's the part of "single file" that matters to the player.
- **Rules are where these games break, and the stack keeps them testable.** A separate engine with pure
  functions and data tables lets every rule and every message be tested. One big hand-edited HTML file
  can't be tested like that, and it gets harder for Claude Code to edit safely as it grows.
- **One template for every game** means every new game starts with the same structure and test setup.
- **Art and fonts are inlined at build time,** so no game needs an asset folder at runtime.
- **The cost is a build step.** That's trivial for Claude Code and for the Cloudflare deploy.

**Repo layout: one `pnp-games` repo with npm workspaces; Cloudflare builds it.**

```
pnp-games/
  CLAUDE.md                 shelf-wide rules (stack, workflow, iPad, art protocol)
  package.json              workspaces: ["shelf", "games/*", "packages/*"]; engines: node >= 20
  package-lock.json         the only lockfile in the repo
  .nvmrc                    22
  shelf/                    the launcher page (Vite + singlefile) -> dist/index.html
  games/recycled/           this game, moved as-is
  games/<next-game>/        new games copy the same structure
  packages/                 shared code, once a second game needs it (the folder isn't there yet)
  scripts/build-all.mjs     `npm run build`: every workspace -> dist/index.html + dist/games/<slug>/index.html
  scripts/check-screens.mjs `npm run check:screens`: Playwright over dist/ at both sizes
  sources/                  gitignored except .gitkeep: the owner's PnP PDFs
  dist/, .screens/          gitignored build output and screenshots
```

- **Cloudflare settings:** **Workers with static assets**, not Pages. `wrangler.jsonc` at the repo root
  serves `./dist` with no Worker script, and the deploy is `npm ci && npm test && npm run build` then
  `npx wrangler deploy` (`--dry-run` checks the config without publishing). Only the built files are
  published; source, tests and art sources stay private. A failing test stops the chain, so it stops
  the deploy.
- **URLs:** `html_handling: "auto-trailing-slash"` makes `/games/recycled/` the real address, and
  `/games/recycled/index.html` a redirect to it. The shelf still links to `index.html`, so the same
  `dist/` also works when the files are opened directly.
- **`npm test` runs Vitest only**, in every workspace (`npm run test --workspaces --if-present`), so the
  build machine never needs a browser. The screen checks are a local step and use `playwright-core`
  with the installed Google Chrome, which keeps browser downloads out of `npm ci`.
- **How the move was done:** the files were copied into `games/recycled/`, so the history stays in the
  `recycled-game` repo, which can now be archived. (`git subtree add` was the alternative, kept for
  reference if the history is ever wanted here.) `HANDOVER.md` and `RULES-NOTES.md` sit next to the
  source.
- **`recycled.html`:** no longer committed. `npm run release` writes it locally for offline play on the
  Mac, and `games/recycled/.gitignore` keeps it out of git.

### Laptop and iPad (decided: keep the iPad, one build, two layouts)

Don't make two versions. Make **one responsive layout with two arrangements**, chosen by CSS:

- **Wide (≥ 1440 px, laptop):** today's three columns (map | dice + actions + accidents | Depot + log).
- **Tablet landscape (about 1024–1439 px wide, iPad Pro 1366×1024):** map on the left at full height.
  On the right, the dice and actions on top, and a tab strip below them with *Depot*, *Accidents* and
  *Log*. Everything fits in `100dvh` with no page scroll.
- **Touch** (`@media (pointer: coarse)`): bigger targets (≥ 44 px), tap to inspect a hex, no reliance
  on hover, `touch-action: manipulation`. Replace `confirm()` with an in-app dialog.
- **Same state, same saves, same file.** Only CSS and a small tab component change.
- **Test both** with Playwright at 1512×945 and 1366×1024 (`checkScreen` already covers the content),
  plus a "no vertical scroll" check, and try it once on the real iPad.

### Hosting and copyright (set up on 2026-11-26)

- **What gets published:** the built file contains the publisher's art as base64, so the site must
  never be readable by anyone else. The owner bought the game and plays it personally.
- **Where it lives:** `https://games.csx.tools`, a custom domain on the `pnp-games` Worker in the
  `Tuzikov@gmail.com's Account` Cloudflare account. **That is the only address.** `workers_dev` and
  `preview_urls` are `false` in `wrangler.jsonc`, and the `*.workers.dev` route is switched off, so
  there is no second, unguarded way in. Leave it that way.
- **Cloudflare Access** (Zero Trust, free plan) guards it. The important detail: the Access
  application's destination is the **Worker** (`{"type":"worker"}`), not a hostname, so every URL the
  Worker answers on is protected, including any future custom domain.
  - Application: `pnp-games - Cloudflare Workers`, session **730h** (1 month).
  - Policy: `Only tuzikov@gmail.com` - allow, `include: [{"email": {"email": "tuzikov@gmail.com"}}]`.
    It is a **reusable** (account-level) policy, so edit it at
    `/accounts/<id>/access/policies/<id>`, not through the application endpoint.
  - Login methods: **One-time PIN** (a code to that inbox) and Cloudflare account login, which is the
    same address. Team domain: `tuzikov.cloudflareaccess.com`.
  - The dashboard's "Protect with Cloudflare Access" switch created this app with a
    `cloudflare_account_member` policy and a 24h session; both were tightened to the above.
- **Source PDFs:** keep them out of git (the gitignored `sources/` folder is right).

### Saves move with the origin

- **Where saves live:** `localStorage` belongs to one origin. Saves made by double-clicking
  `recycled.html` on the Mac (`file://`) **won't show up** on `games.csx.tools`, and a Home Screen web app on
  iPad has its own storage, separate from Safari.
- **Key name:** all games on the shelf share one origin, so keys must stay unique per game. The key is
  now `pnp:recycled:state` (§3), the shelf-wide `pnp:<slug>:state` convention. A save made before the
  move, under `recycled.save.v1`, is picked up once — but only in the same browser, since the origin
  still has to match.
- **Worth adding:** an **Export / Import save** button (copy the save JSON to and from a file or the
  clipboard). That's the only way to move a game in progress between devices.

### Template requirements: what applies to Recycled

| Template rule | Recycled today | Decision / to-do |
|---|---|---|
| Rules spec before code ("Phase 1") | Done in the chat; the result is this file + `RULES-NOTES.md` | Use the same approach for expansions. |
| Full Undo/**Redo**, history saved to `localStorage` | Undo within a turn only, kept in memory | **Undo must never cross a random event** (dice roll, accident roll); otherwise the player can re-roll for free. Redo within a turn is fine to add. Saving history is optional; if it's saved, cap it and store it under a separate key so an old save still loads. |
| Manual (physical) dice mode | Not implemented | **Good feature.** The engine rolls through `d6(s)` with a seeded RNG. Add a `manualDice` flag to state and commands that supply dice values (`roll` with `dice`, `endActions` with the second accident die). Keep the RNG path for normal play and the tests. |
| Highlight only legal targets | Done (`validTargets`, shared with the engine) | Keep. |
| iPad Pro landscape 1366×1024, no vertical scroll | Not met: below 1420 px wide the layout becomes 2 columns with the Depot moved below, so the page scrolls (+448 px measured; +109 px even at 1440×900) | **Main UI task:** see "Laptop and iPad" above. Flip `pnp.tabletReady` to `true` in `package.json` when it fits, so `check:screens` enforces it. |
| 44×44 px touch targets, `touch-action: manipulation`, no hover-only UI | Mostly OK. The inspector updates on hover, and tapping pins a hex. | Make tap the main way to inspect, and check the size of every button. |
| PWA meta tags (`apple-mobile-web-app-capable`, etc.) | Missing in `index.html` | Add them, plus an `apple-touch-icon`, generated from the logo. |
| "Back to shelf" link | Missing | Add a small top-bar link (`../../index.html`, which is where the shelf sits in `dist/`), shown only when the game is hosted in the shelf. |
| Paper palette `#f8f6f0` | Uses the original rusty art instead | **The original art wins.** This was the owner's explicit choice. |
| Raster cleanup → hand off to ChatGPT | Done in code: `extract_art.py` uses OpenCV inpainting | **Keep cleanup in code** when the image's geometry matters. A generative redraw would shift the hex grid that `board.json` was measured from. Use ChatGPT only for *new* art (for example, a Home Screen icon) or cleanup where the layout doesn't matter. |
| Live score breakdown | Not applicable: win/lose only | Skip unless the owner defines a score. |
| Offline | Done: fonts and art are inlined into the file | Keep it that way for every game. |

### Suggested first tasks in Claude Code (in order)

1. ~~Set up the `pnp-games` workspace layout and move this game into `games/recycled/`.~~ **Done:**
   `npm ci`, `npm test` (51 tests), `npm run build` and `npm run check:screens` are green locally, and
   the Workers build deploys on every push to `main`.
2. ~~Put Cloudflare Access in front of the site.~~ **Done:** see "Hosting and copyright" above.
3. Laptop and iPad layouts, PWA meta tags, tap-first input, plus Playwright checks at both sizes.
4. Export/Import save.
5. Manual dice mode.
6. Expansions when the PDFs arrive (§6).
