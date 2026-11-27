# Legend of Hexdom: roadmap

Only what is open. Finished work is described in `CLAUDE.md`. **(you)** marks what needs the Game
Director.


## Stage 2: engine and data

- Measure the three maps: hex centres, terrain per hex including under Villages and Castles,
  Village numbers, Castles. Show the Game Director any hex whose terrain is unclear at 300 dpi.
- A data test: each sidesheet's Adventure table holds each of the six Treasures exactly once (the
  B/C reissue fixed a doubled spear and a missing book), and the A4 copies of maps 2 and 3 agree
  with A5 sidesheets B and C.
- Type sidesheets A-C and the three cards into `src/data/`, from 300 dpi crops; Boss pairs and
  Treasures from the Boss table.
- Engine with the standard features (seeded dice, manual dice, undo that never crosses a roll,
  saves under `pnp:legend-of-hexdom:state` with `migrateSave()`).
- Data model ready for the other 13 characters, sidesheets D-J and maps 4-100: content is tables,
  skills hook into named moments (travel, damage, combat, gain) rather than special cases.

## Stage 5b: playtest

- Ask the Playtester whether they ever wanted to leave a main-phase die unused. The Game Director
  ruled both dice mandatory and wants to know how it felt; if nobody ever wants to, the question is
  moot (`RULES-NOTES.md`, A).

## Later

- Expert mode (4 dice, no repeated actions, double damage, score x1.5): its own stage-1 pass.
- More characters, maps 4-100, sidesheets D-J. Lost Sands, Winter Tales, Epic maps, Bonus
  characters. Legacy mode, perhaps never; if it comes, rulebook 1.3 clarifies the Survivalist curse
  (Villages only, not their underlying terrain).
- Pen-like marks with the Art Director's help (Game Director, 2026-11-27, "probably for the
  future").
