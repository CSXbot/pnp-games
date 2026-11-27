# Legend of Hexdom

A digital version of **Legend of Hexdom - a hex and slash adventure** by Papermage Games, a
print-and-play roguelike, for the owner's personal play only. Roll 3d6 a round: one die travels,
two explore, adventure, fight Bosses in Castles or take a Gift on a double. Beat two Bosses to win.

One workspace of the `pnp-games` shelf, at `games/legend-of-hexdom/`. The shelf-wide rules are in
the repo root `CLAUDE.md`. Slug `legend-of-hexdom`: Hex Forest, Lost Sands and Winter Tales are
campaigns of one game, not three games, so a campaign will be data here, not a sibling folder.

## Status

**Stage 1 (spec and direction), 2026-11-27: ten of the fourteen rule questions settled by the
rules group (`RULES-NOTES.md`); four wait on the Game Director** (`SPEC.md` section 7, A-D). Stage 0 (intake) done the same day. No code and no
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
| Rulebook 1.2, 112 A5 pages | `English_Legend of Hexdom - Rulebook 1.2.pdf` (byte-identical copy in `Hex Forest/Hex Forest - Rulebook/`) | yes |
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

## The documents

| File | What it holds |
|---|---|
| `SPEC.md` | The rules as they will be implemented, and the open questions (section 7) |
| `RULES-NOTES.md` | The Game Director's answers to rule questions |
| `ROADMAP.md` | What is open |
| `art/art-direction.md` | The Art Director's standing brief: what the player does on paper, what carries rules |
| `art/decisions.md` | Every art call: asked, answered, accepted or rejected, and why |
| `CLAUDE.md` | This file: status, rulings, sources, how the sheets are built |
