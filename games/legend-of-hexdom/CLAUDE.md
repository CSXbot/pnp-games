# Legend of Hexdom

A digital version of **Legend of Hexdom - a hex and slash adventure** by Papermage Games, a
print-and-play roguelike, for the owner's personal play only. Roll 3d6 a round: one die travels,
two explore, adventure, fight Bosses in Castles or take a Gift on a double. Beat two Bosses to win.

One workspace of the `pnp-games` shelf, at `games/legend-of-hexdom/`. The shelf-wide rules are in
the repo root `CLAUDE.md`. Slug `legend-of-hexdom`: Hex Forest, Lost Sands and Winter Tales are
campaigns of one game, not three games, so a campaign will be data here, not a sibling folder.

## Status

**Stage 3 (UI) built 2026-11-28, waiting on the Game Director's try on the iPad.** On the shelf
with an "In development" ribbon (the Game Director asked to start it from the shelf, 2026-11-28),
ahead of stage 5. `pnp.tabletReady` is on and `check:screens` passes at
1440x900, 1366x865 and 1366x1024; a scripted game (start, roll, travel, act) runs without errors and
without page scroll at all three. Stage 2 done 2026-11-28, stage 1 2026-11-27.

**The UI:** the board is the A5 map with the player's pen marks drawn over it in SVG (path, arrows,
the start X, a red leg for an unstuck crossing); the middle column is the turn (dice, the next step,
every action with its outcome previewed by running `act` on a copy) and the printed Explore and
Adventure cells of the current hex, scaled to the space left; the right column is the character sheet
with paper marks, the Boss and Gift strips, and the log, newest first. The art is a provisional cut
(`tools/extract_art.mjs`); stage 4 settles sizes and encoding with the Art Director.

**Checking screens:** `tools/drive.mjs <outDir> [state.json...]` plays the built game in Chrome at
the three sizes, mid-game and from saved positions, and fails on a console error, a page that
scrolls, or printed cells overflowing their panel (proved able to fail by breaking the layout).

**Shelf features:** saves (`@pnp/kit/save`), cloud sync (`@pnp/kit/cloudSave`), playtest mode's
save key and no sync (`?playtest=1`), undo cleared at each roll, manual dice, export and import,
How to play, the shelf link, the build marker. Not yet: the playtest journal and step counter
(stage 5b). Stage 0 (intake) done the same day. No code and no
`package.json` yet, so this folder is not an npm workspace and the build ignores it.

## Rulings and scope

From the Game Director unless marked otherwise:

- **2026-11-27, scope:** Hex Forest only, **maps 1-3 only**. Not yet: Epic-Sized Maps, Bonus
  Characters, Lost Sands, Winter Tales, maps 4-100.
- **2026-11-27, characters:** three - Warrior, Archer, and a third picked by the tech lead.
  **The tech lead picked the Mage.** Each attribute then has a lead character (Strength 2, Agility
  2, Magic 2). Her Enchant changes how a combat is resolved and her Mana Shield is a reaction to
  damage, and nothing else in scope does either. Six later characters need one of those, so they
  get built while there are three characters, not retrofitted. The Dwarf was the runner-up and
  is cheaper, but its Tunneling is the Trusty Donkey's mechanic again.
- **2026-11-27, modes:** solo normal first, Expert mode soon after, Legacy later or never.
- **2026-11-27, layout and look:** the A4 arrangement is not binding, and pen-like marks are
  wanted. Detail in `art/art-direction.md`.
- **2026-11-27, rules process:** Gemini joins as **Researcher**. The tech lead, the consultant and
  the Researcher may settle rule questions between them and report each decision; the Game
  Director resolves the rest after the research, and can overrule any. Verified public findings
  travel with a question as a part of their own. (Root `CLAUDE.md`, **Routing**.)
- **Rule answers** go to `RULES-NOTES.md` as they come, each saying who settled it.

## Sources

`sources/Legend of Hexdom/` at the repo root (gitignored; the owner's folder name, kept as is). All
sheets are image-only 300 dpi rasters with no text layer. The rulebook has a text layer.

| What | Path under `sources/Legend of Hexdom/` | In scope |
|---|---|---|
| Rulebook 1.2, 112 A5 pages | `English_Legend of Hexdom - Rulebook 1.2.pdf` (byte-identical copy in `Hex Forest/Hex Forest - Rulebook/`) | yes - the edition we implement |
| Rulebook 1.3, 108 pages, in German, Spanish, French, Italian, Portuguese | `<Language>_Legend of Hexdom - Rulebook 1.3.pdf` | reference only: translations, no English 1.3 exists (Game Director); compared in `research/2026-11-27-rulebook-1.3-comparison.md`, nothing in scope changed |
| 100 assembled A4 sheets, Warrior | `Hex Forest/HexForest-Warrior/HF_<n>_Warrior-A4.pdf` | 1-3 |
| 100 A5 maps | `Hex Forest/Hex Forest - A5 Pack/Hexforest-Maps/<n>.pdf` | 1-3 |
| 10 A5 sidesheets A-J | `.../A5-HexForest-TablesCharacters-English/A5-HexForest-Tables/HexForest-A5-Table-<X>.pdf` | A-C |
| 16 character cards + a blank | `.../A5-Classes/A5-CharacterSheet-<Name>.pdf` | to be decided |
| Same 17 cards as raw PNGs | `.../A5-Classes/A5-<name>.png~` | - |
| Bonus characters, epic maps, Lost Sands, Winter Tales | their own folders, some zipped | no |

**Which files are newest.** The A4 sheets carry two dates: 60 from 2024-05-17 (map 1 among them)
and 40 from 2024-05-23 - exactly the sheets on sidesheets B, C, G and H, so maps 2 and 3. A search
summary of the publisher's MyMiniFactory page (unverified, reported by the consultant) mentions
"fixed map files for bugged double spears and missing book". The A5 sidesheets and maps are newer
than both, 2024-06-10, and are the data source. Checked by eye: A5 sidesheets A, B and C each have
all six Treasures in their Adventure table exactly once. Stage 2 makes that a test, and compares
the A4 copies.

The `.png~` files are genuine PNGs (1296x887 RGBA), most likely the images the card PDFs were
exported from, under a backup-file suffix. The PDFs embed a 1555x887 image, so treat the PDFs as
canonical.

## How an A4 sheet is built

**A4 sheet `n` = A5 map `n` + sidesheet `(n-1) mod 10` (1-A, 2-B ... 10-J, 11-A) + a character
card.** Checked for maps 1-3:

- **Left half = the A5 map, pixel for pixel**, except the Village and Castle icons. The A4 draws
  them larger and the A5 smaller. Measured: the A5 is 1754x2480, exactly the A4's left half
  (3508x2480 at the same 300 dpi). At zero offset map 1's diff heatmap lights up only those 10
  icons, and every 1-2px shift is worse. Maps 2 and 3 differ in the same share of pixels (3.4%), and
  their heatmaps were not drawn. **The A5 map shows more of the terrain under a Village or Castle**,
  which matters because that terrain is a playable column.
- **Right half = the sidesheet and the card, rearranged:** attributes turned vertical, and Food,
  HP, Treasure and Relic stacked in one column. The content matches by eye; this half has not been
  pixel-checked.
- Map 1 is "The Ranger's Return", 2 "The Scout's Folly", 3 "The Camper's Pride".

### What varies, and with what

| Per map | Per sidesheet (A-J) | Per character | Same on A, B and C |
|---|---|---|---|
| Hex layout, Village numbers 1-6, Castle positions, the map's name | Explore table, Adventure table, Relic box (size 3 or 4 and its reward), Trade reward, the six Gifts and their doubles | starting attributes, three skills, art | Travel box, Boss table, the six Treasures, the score line |

Relic and Trade so far: A = 4 gems for +2 to all three attributes, trade a gem for 3 food. B = 3
gems for Agility +2 and Magic +2, trade a gem for 2 Hearts. C = 3 gems for Agility +2 and Strength
+2, trade a gem for 3 food.

### Map geometry, by eye (to be measured in stage 2)

Ten rows of six pointy-top hexes, 60 in all. The 1st, 3rd, 5th, 7th and 9th rows sit half a hex to
the right. Terrains: Grove, Forest, Plains, Swamp, Valley, Mountain and Water, and Water is drawn
two ways (plain ripples, or a cresting wave). Six numbered Villages, and four Castles on each of
maps 1-3, each marked by the skull emblem. A Village or Castle sits on a terrain that shows
around it.

### The character card

Name and three skills (the first is active from the start; the 2nd and 3rd each carry a red
diamond, which is their unlock mark). Starting attributes are printed as icons under the portrait
and pre-filled on the tracks. HP is 4x8 = 32 hearts, first row of 4 pre-filled. Food is 5x10 = 50,
first row of 5 pre-filled. A `+` (an attribute point) sits at food 10, 30 and 50, and a red diamond
(a skill unlock) at food 20 and 40. Attributes run 1-12, with a red ring at 12. The A4 Warrior uses
the same card.

## Architecture

- `src/data/` - the publisher's content as tables. `maps.ts` (terrain per hex as letters, the
  terrain under each Village and Castle, the measured grid), `sidesheets.ts` (Explore, Adventure,
  Relic, Trade, Gifts for A-C, in the notation of `types.ts`: `F-1 H+1`, `AGI9&MAG2` linked,
  `AGI3/MAG4` unlinked), `rules.ts` (Travel box, Boss table, box sizes, score line - identical on
  A-C), `characters.ts` (card text and starting attributes).
- `src/engine/` - pure rules. `act(state, cmd)` is the only way to change a game; `actionError`
  gives the exact reason a command is refused, and the UI highlights from it and from
  `travelOptions`, so highlighting can't drift from the rules. Every change to food, hearts and
  attributes goes through one ledger in `game.ts`, and each log line is built from it.
- **How the transcriptions were proved:** the maps' grid is measured by `tools/measure_maps.mjs`
  (residuals under 3 px); every hex, Village, Castle and table cell was read twice, by the tech lead
  and by a QA agent that never saw the first reading, and the two agree everywhere.
- `test/data.test.ts` pins what the sheets guarantee; `test/engine.test.ts` has a case per rule and
  ruling (the worked examples of `RULES-NOTES.md`), and 300 random games in which every log line's
  claims are checked against the real change in state.

## Save schema

`GameState` in `src/engine/game.ts`, `version: 1` (`SAVE_VERSION`). Every load goes through
`migrateSave()`; stored ids (map ids, `CharacterId`, `GiftId`, `TreasureId`, hex names `row.col`)
are never renamed, only added. `epoch` increases at every random event (the start roll, each
round's roll), which is where the UI clears its undo stack. Manual dice: `start` and `roll` take the
dice as arguments. Storage key `pnp:legend-of-hexdom:state` (stage 3).

## The documents

| File | What it holds |
|---|---|
| `SPEC.md` | The rules as they will be implemented, and the open questions (section 7) |
| `RULES-NOTES.md` | The Game Director's answers to rule questions |
| `ROADMAP.md` | What is open |
| `art/art-direction.md` | The Art Director's standing brief: what the player does on paper, what carries rules |
| `art/decisions.md` | Every art call: asked, answered, accepted or rejected, and why |
| `CLAUDE.md` | This file: status, rulings, sources, how the sheets are built |
