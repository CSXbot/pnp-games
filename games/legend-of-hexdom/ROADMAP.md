# Legend of Hexdom: roadmap

Only what is open. Finished work is described in `CLAUDE.md`. **(you)** marks what needs the Game
Director.


## Stage 3: UI

- **(you)** Play a few rounds on the iPad, from the shelf: whether a tap on a hex or a die is easy,
  and whether the printed cells are readable at the size they get.
- The printed cells shrink to about half size when the hex is a Village or Castle (four columns):
  readable on a laptop, to be judged on the iPad. If too small: tap a cell to enlarge, or show one
  table at a time.
- `check:screens` loads only the opening dialog. The scripted game that checks mid-game screens
  lives in the scratchpad; make it a tool (`tools/drive.mjs`) so a later change is checked the same
  way.

## Stage 4: art

- With the Art Director: the pen marks (path, slashes, crosses) in the sheet's ink, the type, the
  frames; the sizes and encoding of the extracted art at the sizes the layout gives them.
- The Mage portrait's crop catches a sliver of the card's red diamond.

## Stage 5b: playtest

- Ask the Playtester whether they ever wanted to leave a main-phase die unused. The Game Director
  ruled both dice mandatory and wants to know how it felt; if nobody ever wants to, the question is
  moot (`RULES-NOTES.md`, A).

## Later

- Expert mode (4 dice, no repeated actions, double damage, score x1.5): its own stage-1 pass.
- More characters, maps 4-100, sidesheets D-J. Lost Sands, Winter Tales, Epic maps, Bonus
  characters. Legacy mode, perhaps never; if it comes, rulebook 1.3 clarifies the Survivalist curse
  (Villages only, not their underlying terrain). Recheck then: the engine refuses a point into an
  attribute at 12 and drops points when all three are at 12 - harmless now, but Titan Strength and its
  siblings want the others kept low (consultant's review, 2026-11-28).
- Pen-like marks with the Art Director's help (Game Director, 2026-11-27, "probably for the
  future").
