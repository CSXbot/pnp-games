# Legend of Hexdom: roadmap

Only what is open. Finished work is described in `CLAUDE.md`. **(you)** marks what needs the Game
Director.

## Stage 1: spec and direction

- **(you)** Answer the 14 questions in `SPEC.md` section 7, and overrule any of the "settled"
  readings under them. Stage 2 waits on this.
- Record each answer in `RULES-NOTES.md` and each ruling in `CLAUDE.md`; fold them into `SPEC.md`.

## Stage 2: engine and data

- Measure the three maps: hex centres, terrain per hex including under Villages and Castles,
  Village numbers, Castles. Show the Game Director any hex whose terrain is unclear at 300 dpi.
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
