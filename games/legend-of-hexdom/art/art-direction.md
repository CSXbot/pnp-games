# Legend of Hexdom: standing art brief

For the Art Director, who has no memory between jobs. Everything a visual decision needs is here or
in `decisions.md` beside it. Attach both to every art call (`scripts/art.mjs --game
legend-of-hexdom`). Written by the tech lead from the sheets and the rulebook at 300 dpi; page
numbers are the rulebook's (`English_Legend of Hexdom - Rulebook 1.2.pdf`).

## The components

One game sheet per map, assembled from three A5 parts (see `../CLAUDE.md`, **How an A4 sheet is
built**):

- **The map**: 60 illustrated pointy-top hexes in 10 rows of 6, alternate rows offset. Terrain
  pictures, six Villages numbered 1-6, four Castles each with a skull emblem under it. No grid
  lines other than the hex outlines, no words except the title block and the score line.
- **The sidesheet**: Travel, Treasure, Relic and Trade boxes, a row of terrain badges, then the
  Explore table, the Adventure table, the Boss table and the Gift table. **Icon-only: no rules text
  anywhere in the tables.** Rows are pairs of die faces (1-2, 3-4, 5-6); columns are the terrain
  badges.
- **The character card**: portrait, name line, three skills in words and icons, the HP box (32
  hearts), the attribute tracks (three rows of 12 rings) and the Food box (50 diamonds).

## What the player physically does

A pen, three dice and the sheet (p7). Every mark below is shown in a rulebook figure:

- **Travel path, on the map:** a line from hex centre to hex centre through every hex entered,
  including the Mountains and Water crossed, ending in an **arrow** each round (p35, p38: one arrow
  per round, so a finished game is a chain of arrows). The start hex is marked with an **X** over
  the Village (p35, p42). An unstuck crossing was drawn in **red with "-2 HP" written beside it**
  (p42) - the rulebook's own way of showing a penalty move.
- **Food box:** diamonds are **painted** when food is gained, left to right, top to bottom (p23).
  A food spent is a **slash through a painted diamond** (p35: two of the five printed-filled
  diamonds slashed after a "3" travel). So a diamond has three states: empty, painted, painted and
  slashed.
- **HP box:** hearts are filled when gained and **crossed with an X** when lost (p42). Same three
  states.
- **Attribute tracks:** rings filled in from 1 upwards (p21, p51).
- **Treasure box:** the ring beside the treasure's icon is filled, and that treasure is **crossed
  off the Adventure table** where it was won (p18).
- **Gems:** crossed off the Adventure table (p19), then either drawn into the Relic box's empty gem
  outlines or traded.
- **Bosses and Gifts:** a defeated Boss is marked (p18); a taken Gift is crossed out (p20).
- **Score line:** under the map, the player writes counts against the printed multipliers.

## Details that carry rules - a web game that drops one is wrong

- **Terrain of every hex**, including the terrain *under* a Village or Castle, which is a playable
  column (p48). The A5 maps draw the Village and Castle icons smaller than the A4 sheets do and
  show more of that terrain: use the A5 art.
- **Village numbers 1-6** (the starting roll, p10) and the **skull emblem** under a Castle (where
  Bosses are fought; the same emblem marks the Boss table and the score line's Boss multiplier).
- **Mountain and Water hexes** (can be crossed, never ended on).
- **Travel box:** a slashed food icon is a food cost, each boot is one hex exactly, a mountain or a
  sail is permission to cross (p34).
- **Table cells:** a *slashed* food or heart is a cost; a plain food diamond or heart is a gain; a
  purple `+` square is an attribute point of the player's choice; an attribute icon with `+1`/`+2`
  is that attribute.
- **Enemy requirements:** a solid box is a single requirement; **two solid boxes joined by a bar are
  linked** (meet both); **two dashed boxes are unlinked** (choose one) (p16, p52-53). The number
  beside each box is the level.
- **Enemy portraits:** the sheet prints **no enemy names**. The picture is the enemy's identity, and
  its kind (human, animal, monster, p55-65) matters to characters not yet in scope.
- **Loot:** food, `+`, hearts, an **outlined gem**, or one of the six **treasure icons** (spear,
  hook, crow, hammer, skull, book). Gems and treasures are taken once and then crossed off.
- **Boss cells:** two linked requirements (12 and 8) with the treasure icon between them, and the
  die face that selects the Boss.
- **Gift cells:** the double that finds it, and its effect in icons.
- **Food box marks:** a `+` diamond at food 10, 30 and 50 (an attribute point) and a **red diamond
  at 20 and 40**, matching the red diamonds in front of skills 2 and 3 on the card (unlocks, p23).
- **Attribute tracks:** the red ring at 12 is the maximum and scores (p25).
- **Starting state is printed filled:** 4 hearts, 5 food, and the card's starting attributes.

## Decorative, as far as the sources show

- The drawing inside a terrain hex beyond telling which terrain it is.
- Water is drawn two ways, plain ripples or a cresting wave. The rulebook names only "Water". This
  is put to the Game Director as `SPEC.md` question 8 and is **not** settled.
- The portrait on the card, the box frames, the colours of the frames.

## What gives it its identity

The illustrated hex map with the player's own path drawn across it, a chain of arrows; dense
icon-only tables beside it; and pen marks - fill, slash, X - on printed boxes. The whole sheet is
a landscape A4 that is read at a glance: map left, everything else right.

## Sizes, measured

- Sources are 300 dpi rasters, lossless (Flate) in the PDFs, with no vector or text layer. The A5
  map is 1754x2480 px; a hex is about 250 px across at that resolution (about 21 mm printed).
- A table cell is about 170x250 px at 300 dpi; the icons inside it are about 60 px.
- The display size of everything is decided by the layout at stage 3. Judge candidates there.

## The Game Director's decisions

- **2026-11-27: the A4 arrangement is not binding.** "Feel free to change the layout to fit the
  screen(s) better if needed. I'm not married to this particular A4 layout." The components and
  their content are fixed; how they are arranged on a laptop and an iPad is a layout decision.
- **2026-11-27: pen-like marks are wanted.** "Simulated 'pen like' markings on the map and the
  sheets as game progress would be nice", with the Art Director's help, "probably for the
  future". So the marks listed under **What the player physically does** are the target language
  for the path, the boxes and the crossed-off cells. Any interim look must not invent a
  different language that would have to be undone.
