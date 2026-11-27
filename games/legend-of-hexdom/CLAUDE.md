# Legend of Hexdom

A digital version of **Legend of Hexdom - a hex and slash adventure** by Papermage Games, a
print-and-play roguelike, for the owner's personal play only. Roll 3d6 a round: one die travels,
two explore, adventure, fight Bosses in Castles or take a Gift on a double. Beat two Bosses to win.

One workspace of the `pnp-games` shelf, at `games/legend-of-hexdom/`. The shelf-wide rules are in
the repo root `CLAUDE.md`. Slug `legend-of-hexdom`: Hex Forest, Lost Sands and Winter Tales are
campaigns of one game, not three games, so a campaign will be data here, not a sibling folder.

## Status

**Stage 0 (intake) done 2026-11-27. Stage 1 (spec and direction) next.** No code, no
`package.json` yet, so this folder is not an npm workspace and the build ignores it.

**Scope set by the Game Director, 2026-11-27:** Hex Forest only, **maps 1-3 only**. Not yet:
Epic-Sized Maps, Bonus Characters, Lost Sands, Winter Tales, maps 4-100.

## Sources

`sources/Legend of Hexdom/` at the repo root (gitignored; the owner's folder name, kept as is). All
sheets are image-only 300 dpi rasters with no text layer. The rulebook has a text layer.

| What | Path under `sources/Legend of Hexdom/` | In scope |
|---|---|---|
| Rulebook 1.2, 112 A5 pages | `English_Legend of Hexdom - Rulebook 1.2.pdf` (byte-identical copy in `Hex Forest/Hex Forest - Rulebook/`) | yes |
| 100 assembled A4 sheets, Warrior | `Hex Forest/HexForest-Warrior/HF_<n>_Warrior-A4.pdf` | 1-3 |
| 100 A5 maps | `Hex Forest/Hex Forest - A5 Pack/Hexforest-Maps/<n>.pdf` | 1-3 |
| 10 A5 sidesheets A-J | `.../A5-HexForest-TablesCharacters-English/A5-HexForest-Tables/HexForest-A5-Table-<X>.pdf` | A-C |
| 16 character cards + a blank | `.../A5-Classes/A5-CharacterSheet-<Name>.pdf` | to be decided |
| Same 17 cards as raw PNGs | `.../A5-Classes/A5-<name>.png~` | - |
| Bonus characters, epic maps, Lost Sands, Winter Tales | their own folders, some zipped | no |

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

## Not yet decided

The Game Director's, at stage 1: which characters the first release offers, which modes (solo is
certain; Expert and Legacy are solo-compatible), and every rule question in `SPEC.md` once it is
written.
