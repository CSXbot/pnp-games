# Legend of Hexdom: roadmap

Only what is open. Finished work is described in `CLAUDE.md`. **(you)** marks what needs the Game
Director.

## Waiting on you - the short list

The Game Director asked (2026-11-28) for the game to be finished with the team, and for the
decisions that are theirs to be kept here, short.

1. **Play a round on the iPad and say if it's better.** New since your try: after travelling, you tap
   the lit cell itself (each says what it does); skills say how they work and sit under "Skills";
   while drawing a path the cells show where you'd land and green dots show where the die can end;
   "Tables, Bosses, Gifts" opens the whole sidesheet; Treasures are the sheet's own pictures; the Boss
   strip marks the Bosses you could beat right now; under the map, how many Castles are still unvisited.
2. **Taste: redraw the table cells cleaner?** The Art Director's suggestion: keep the publisher's
   pictures, rebuild the requirement boxes, numbers and loot icons crisp from the data (text set by
   code, never by a model). More legible, a little less "printed". Yes or no. A yes gets you one
   column rebuilt to look at before the rest is done.
3. **Taste: A or B?** Picture: `art/compare/2026-11-28-look-A-vs-B.jpg`. To try B on the iPad, tick
   Menu > "Try the sheet's look". It's per device, and your game is untouched.
   - **A**, today: yellow = selected, green = where you can go, blue ink.
   - **B**, the Art Director's idea: dark header bars like the printed panels, squarer boxes,
     charcoal ink, muted green.
   - Trade-off: B's charcoal route is harder to see over the grey Mountain and Water hexes.
   - Mixing is fine, e.g. B's headers with A's blue ink.
4. **Release: your call (stage 5c). I recommend yes.** Two playtests played four games and won all
   three that finished, one with each character. Their 13 findings are fixed. None was a rule error.
   What isn't done: the two taste questions above, and the Art Director's polish.
5. **FYI, no decision needed:**
   - Ruling A ("both dice mandatory") never got in the way in either playtest.
   - The bot found a real bug the playtests didn't hit, now fixed. With all three attributes at 12, a
     point still waiting to be placed could never be placed, and the game waited forever.
   - Difficulty, measured over 900 bot games: the bot wins 31% with the Mage, 15% with the Archer
     and 9% with the Warrior. That's the publisher's design. The bot is weaker than a careful player
     (the playtesters won all three games they finished), so these are floors.

## Stage 3: UI

- Waiting on the Game Director's second try on the iPad (list item 1).

## Stage 4: art

- With the Art Director: the pen marks (path, slashes, crosses) in the sheet's ink, the type, the
  frames; the sizes and encoding of the extracted art at the sizes the layout gives them.

## Stage 5b: playtest

- Two playtests on 2026-11-28 (`playtest/reports/2026-11-28-1.md`, `-2.md`). They played four games
  and won the three that finished: the Mage on map 2 in round 14, score 145; the Archer on map 1 and
  the Warrior on map 3, both in round 16, score 130. All 13 findings are fixed, and the three wins
  replay as regression tests.
- The bot plays the second notebook's strategy (`playtest/notebook.md`, "Measured by the engineers").
  Still open there:
  - the notebook's open questions, as simulations;
  - the Warrior's Adrenaline play;
  - the approach to the Boss Castle, which the bot does only roughly.
- Friction the playtesters raised, not yet changed:
  - six separate taps for six Cross Trainings;
  - hex names appear only in tooltips on the map.

## Later

- Expert mode (4 dice, no repeated actions, double damage, score x1.5): its own stage-1 pass.
- More characters, maps 4-100, sidesheets D-J. Lost Sands, Winter Tales, Epic maps, Bonus
  characters. Legacy mode, perhaps never; if it comes, rulebook 1.3 clarifies the Survivalist curse
  (Villages only, not their underlying terrain). Recheck then: the engine refuses a point into an
  attribute at 12 and drops points when all three are at 12 - harmless now, but Titan Strength and its
  siblings want the others kept low (consultant's review, 2026-11-28).
- Pen-like marks with the Art Director's help (Game Director, 2026-11-27, "probably for the
  future"). Started: the route has a pen-like wobble; the tracks paint, slash and cross.
- A rule question for when the Druid comes: does Enchant's heart (or any skill's own heart) spoil a
  "perfect combat" (p15, Wolf Pack p86)? Raised by the first playtest; nothing in scope depends on it.
- Check that the A4 sheets for maps 2 and 3 agree with A5 sidesheets B and C (we use the newer A5
  files; the B/C reissue fixed a doubled spear and a missing book).
