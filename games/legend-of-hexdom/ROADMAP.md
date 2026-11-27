# Legend of Hexdom: roadmap

Only what is open. Finished work is described in `CLAUDE.md`. **(you)** marks what needs the Game
Director.

## Stage 1: spec and direction

- **(you)** Answer questions A-D in `SPEC.md` section 7. Overrule any of the group's ten in
  `RULES-NOTES.md` you disagree with - Q4 (the boxes are lifetime totals) above all. Stage 2's engine
  waits on this; its data work doesn't.
- Record each answer in `RULES-NOTES.md` and each ruling in `CLAUDE.md`; fold them into `SPEC.md`.

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

## Later

- Expert mode (4 dice, no repeated actions, double damage, score x1.5): its own stage-1 pass.
- More characters, maps 4-100, sidesheets D-J. Lost Sands, Winter Tales, Epic maps, Bonus
  characters. Legacy mode, perhaps never.
- Pen-like marks with the Art Director's help (Game Director, 2026-11-27, "probably for the
  future").
