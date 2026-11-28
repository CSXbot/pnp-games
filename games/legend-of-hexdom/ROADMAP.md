# Legend of Hexdom: roadmap

Only what is open. Finished work is described in `CLAUDE.md`. **(you)** marks what needs the Game
Director.

## Waiting on you - the short list

The Game Director asked (2026-11-28) for the game to be finished with the team, and for the
decisions that are theirs to be kept here, short.

1. **Play a round on the iPad and say if it's better.** New since your try: after travelling, you tap
   the lit cell itself (each says what it does); skills say how they work and sit under "Skills";
   while drawing a path the cells show where you'd land and green dots show where the die can end;
   "Tables, Bosses, Gifts" opens the whole sidesheet; Treasures are the sheet's own pictures.
2. **Taste: redraw the table cells cleaner?** The Art Director's suggestion: keep the publisher's
   pictures, rebuild the requirement boxes, numbers and loot icons crisp from the data (text set by
   code, never by a model). More legible, a little less "printed". Yes or no.
3. **Taste: frames and colours closer to the sheet?** Dark header bars and squarer boxes like the
   printed panels; and either keep the current colours (yellow = selected, green = where you can go,
   blue = your ink) or go charcoal ink with muted previews. Keep, or which.
4. **When it's a release** - your call (stage 5c). The first playtest's nine findings are fixed; a
   second playtest (the Archer and the Warrior) runs overnight.
5. **FYI, no decision needed:** the first playtester never wanted to leave a die unused, so your
   ruling A ("both dice mandatory") looks moot in practice. And the Mage is much the strongest of the
   three: 19% wins for the bot against 3% for the Archer and the Warrior - the publisher's design, not
   ours to change, but you may want to know before choosing who to play.

## Stage 3: UI

- The Game Director's first try (2026-11-28): hexes easy to tap; cells readable but could be better
  (to the Art Director at stage 4); skills hard to find, travel hard to plan without the whole
  tables, Treasure choice as text - all three addressed the same night.

## Stage 4: art

- With the Art Director: the pen marks (path, slashes, crosses) in the sheet's ink, the type, the
  frames; the sizes and encoding of the extracted art at the sizes the layout gives them.
- The Mage portrait's crop catches a sliver of the card's red diamond.

## Stage 5b: playtest

- First playtest done 2026-11-28 (`playtest/reports/2026-11-28-1.md`): the Mage won on map 2 in round
  14 (score 145); nine findings, all fixed the same night. On ruling A it never wanted to leave a die
  unused. A second run (the Archer on map 1, then the Warrior on map 3) is under way.
- Measured with the playtester's strategy (`playtest/notebook.md`): Mage 19%, Archer 3%, Warrior 3%
  over 300 bot games; the bot understates a careful player (it doesn't plan the Boss round). Teach it
  rules 13-14 and the Warrior's Adrenaline play, then measure again.

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
