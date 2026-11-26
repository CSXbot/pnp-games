# Recycled

A digital version of the solo print-and-play survival game **Recycled** by Nukazombee Games, for
personal use. You are a waste engineer stuck on an orbital junkyard: survive 75 days or launch the
shuttle.

## Play

Open the game from the shelf, or run `npm run release` here and open **`recycled.html`**: double-click
it, or drag it into Safari or Chrome. It's a single self-contained file, so it works offline and you
can keep it anywhere. Your game saves automatically in that browser, under the key
`pnp:recycled:state`; saves don't travel between a local file and the hosted shelf, because the
browser keeps them per origin.

The game does all the bookkeeping: dice, legal moves, building storage, accidents, consumption every
5 days, tech bonuses, and win/lose checks. You make the decisions. Undo works within a turn, but not
across a dice roll or the end of a turn.

How this version reads unclear rules is listed in [RULES-NOTES.md](RULES-NOTES.md). The rules as
implemented are in [SPEC.md](SPEC.md), what's still open is in [ROADMAP.md](ROADMAP.md), and
[CLAUDE.md](CLAUDE.md) is the working brief for Claude Code.

## Develop

This game is one workspace of the `pnp-games` shelf. Requires Node.js 20+ (the repo pins 22 in
`.nvmrc`). Install once, from the repo root:

```bash
npm ci
```

Then, in this folder:

```bash
npm run dev
```

starts a live-reloading dev server.

```bash
npm test
```

runs the tests: rules, 500 simulated games that check every log line against what really changed, 18 games played through the interface that check every number and message on screen after each click, and the save-key cases.

```bash
npm run release
```

type-checks, builds, and writes `recycled.html` for offline play. That file isn't committed; the
hosted copy comes from `npm run build` at the repo root.

## How it's organised

```
src/data/        Game content as plain data: buildings, accident table, consumption, tech bonuses, maps
src/engine/      Rules engine. Pure functions over a JSON game state: act(state, command) -> new state
src/ui/          React interface (map, dice, action menu, Depot, modals)
test/            Rules tests
```

The engine knows nothing about the screen, and the screen never changes the state directly. It sends
commands such as `{ t: 'action', die: 0, action: 'produce', params: { hex } }`, and the engine checks
them against the rules.

## Art

All art is cut straight from the print-and-play PDFs by `tools/extract_art.py`: the hex board (with
the pre-drawn starting buildings cleaned off), building illustrations, cards, resource icons, the
Depot machine with the launch manual, and the logo. The game draws pen marks on top of the Depot,
like you would on paper. To redo it (needs poppler's `pdftoppm`, Pillow, numpy and
opencv-python-headless):

```bash
python3 tools/extract_art.py EN_A4_Sheet1_Planet1.pdf EN_A4_Sheet2.pdf EN_A4_Rulebook_Page1.pdf
```

The art belongs to Nukazombee Games and is used here for personal play only.

## Adding expansions

- **New planet:** add a `MapDef` to `src/data/maps.ts`, with terrain rows, pre-built buildings and
  starting Depot boxes. Hexagon maps of any size work. For its board art, add the sheet to
  `tools/extract_art.py` and register the image in `src/ui/art.ts`. Without art, the map is drawn
  in plain shapes.
- **New building:** add it to `src/data/buildings.ts`. Simple ones (cost, storage, terrain, limit,
  produces) need no code. Special effects go in `completeBuilding` / `draw` in `src/engine/game.ts`.
- **New accidents, consumption stages or tech bonuses:** edit `src/data/rules.ts`.
