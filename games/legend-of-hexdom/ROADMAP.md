# Legend of Hexdom: roadmap

Only what is open. Finished work is described in `CLAUDE.md`. **(you)** marks what needs the Game
Director.


## Stage 3: UI, both arrangements together

- Invoke the `game-stages` skill first. Layout free to depart from the A4 sheet (Game Director);
  pen-like marks are the target language (`art/art-direction.md`).
- Standard features: undo that clears at `epoch` changes, saves under `pnp:legend-of-hexdom:state`,
  export/import, manual dice, "How to play", the shelf link, the build marker.
- Travel chosen hex by hex from `travelOptions`; a preview of every action's cost before it is
  committed (Mana Shield and Enchant are flags on the action).
- Flip `pnp.tabletReady` when the layout is meant to hold, then make `check:screens` pass at all
  three sizes.

## Stage 4: art

- Extract the A5 maps, sidesheets and cards at display size; measure table cells for marks.

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
