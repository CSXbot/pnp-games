# Legend of Hexdom: the playtester's notebook

Started empty on 2026-11-28, deliberately: the first strategy recorded here should be a player's
own. The playtester rewrites "How to play well", "Turning points", "What killed you", "Open
questions" and "Results"; **"Measured by the engineers" is the Tech Lead's** and is left alone.

First filled in on 2026-11-28 from one finished game (map 2, the Mage, won in round 14) and seven
rounds of a second (map 3, the Warrior). Treat every rule below as a hypothesis from two games, not a
measurement.

## How to play well

*Rules of thumb in priority order, each a condition and an action specific enough to program.*

Definitions used below. **Lead attribute**: the attribute the character's two target Bosses need at
12. **Effective Strength** for the Mage = max(Strength, Magic) when she pays Enchant (1 heart, or 1
food with Mana Shield). **Reachable Boss**: each of its two requisites <= the effective attribute
now, and its Treasure held (else it costs 3 extra hearts). **Pocket**: a hex whose unvisited
neighbours are all Mountain or Water.

1. **Choose the two target Bosses at the start and never change them without a reason.** Pick the
   two Bosses whose requisites need the fewest attribute points beyond the character's start.
   Mage: Magic 12 covers both requisites of Stuker (M12 & S8) and Gast (S12 & M8) through Enchant,
   and Magic 12 + Agility 8 covers King (M12 & A8); Magic 12 + Agility 12 covers Glubo and Brok too.
   Warrior: Strength 12 + Magic 8 (Gast) or Strength 12 + Agility 8 (Liggy).
2. **If you have attribute points to place, put every one into the lead attribute until it is 12,
   then into the second Boss attribute until 8.** Never spread. (Game 1: 3 Vital Eggs points into
   Magic in round 1 made Magic 5, which made the Giant Rat (M4, +3 food) and the Mustard Ooze (M5,
   +4 food) free fights from round 2.)
3. **If a die can win a fight with no heart lost and the loot includes food, a gem or a Treasure you
   need, take that fight before any Explore.** Free fights are the main engine for food (which is
   also experience: food 20 unlocks skill 2) and for gems.
4. **Mage: if Enchant is needed and Mana Shield is unlocked, not yet used this round, and you have
   at least 1 food, tick both.** Enchant then costs a food, not a heart. Use the round's Shield on
   the first Enchant fight; a second Enchant fight that round costs a heart.
5. **Mage: never tick Enchant for an enemy with no Strength requisite.** It only costs a heart (the
   game previews it honestly as "-1 heart").
6. **If a fight costs more hearts than (current hearts - 2), do not take it**, unless it wins the
   game. Keep 2 hearts of margin; a Boss without its Treasure costs 3 on top.
7. **If hearts <= 2 and no fight gives hearts for free, Explore a cell that gives hearts** (sidesheet
   B: the Valley's 5-6 cell is +1 heart; the Castle's 5-6 cell is -1 food, +1 heart, +1 attribute
   point). Game 1, round 13: two Valley
   explores with 6s took hearts 2 -> 4 just before the Boss round.
8. **Gems: put the gem in the Relic box while it is not full.** Each Relic gem is 4 points and the
   box's completion gives attribute points (B: Agility +2, Magic +2). Trade only when the box is
   full, or when the trade saves your life this round (B: 2 hearts; A and C: 3 food).
9. **Gifts on a double: take an attribute gift (Vital Eggs, an Attribute Cart in the lead
   attribute) or the Skill Flame / Campfire at once.** Take the Trusty Donkey / Sail Boat / Balloon
   when the map has Mountain or Water walls near your route. Decline a movement gift if food <= 3
   and the two dice could instead win food this round.
10. **Skill Flame held: if both main-phase dice have a fight that costs at most 1 heart, Adventure
    twice** - the second Adventure gives an attribute point.
11. **Travel die choice: prefer the 6 (free, 3 hexes), then the 2 (1 food, 2 hexes), then the 1 (1
    food, 1 hex); use 3, 4 or 5 (2 food) only when the path needs their Mountain/Water permission,
    or with the Campfire (they then give an attribute point).** Break ties by which two dice you
    keep: keep the dice whose cells at the destination give free fights.
12. **Pathing: never end a Travel in a pocket unless you hold a gift that crosses its wall.** Before
    confirming, count the end hex's unvisited, non-Mountain, non-Water neighbours; if 0, pick
    another path. (Game 2, round 5: I ended at row 7 col 6, whose only exit was the Mountain at row 8
    col 6. The Trusty Donkey saved it.)
13. **Approaching the Boss Castle: end the round 2 hexes away with at least two different 2-hex
    paths into it**, so any die from 2 to 5 reaches it, and the 6 can too by a 3-hex detour.
14. **Boss round: fight with the die whose Boss is reachable first. After the first Boss, if the
    second target Boss's Treasure is missing, take the Treasure Crate as the reward and choose that
    Treasure;** otherwise take the Black Cat (+30). (Game 1, round 14: Glubo, then the Crate gave the
    Crow, then King with the last die, 0 hearts lost.)

## Turning points

*The two or three decisions that decided each game.*

**Game 1 - map 2, the Mage, seed 400319392, won in round 14.**
1. Round 1, double 6: Vital Eggs, all three points into Magic (2 -> 5). From round 2 the Magic-4
   and Magic-5 enemies were free food; food 20 (Mana Shield) arrived in round 4.
2. Round 7, Castle row 7 col 3: fought the Evil Champion with Magic 7 against 10 (3 hearts lost,
   hearts 5 -> 3) to complete the Relic box: Agility +2, Magic +2. That opened the Agility track,
   and the Crazy Barbarian (Strength 11, 2 attribute points, beaten with Enchant) then pushed
   Agility to 9 in one round. Agility 12 + Magic 12 made King and Glubo reachable.
3. Round 14: Glubo first (Enchant + Mana Shield, cost 1 food), then the Treasure Crate for the Crow,
   then King with the last die for no damage. Without the Crate, King would have cost 3 hearts of 4.

**Game 2 - map 3, the Warrior, seed 1649081186, stopped in round 7.**
1. Round 1, double 4: took the Trusty Donkey. In round 6 it was the only way out of my own pocket.
2. Round 2: two Forest explores at 4 (-2 food, +2 Strength each) took Strength 2 -> 6 but food to 0.

## What killed you

*And what you would do differently.*

Nothing killed me. What nearly did:

- **Game 1, rounds 10-12, hearts at 2.** Two Crazy Barbarian fights in one round (the second
  Enchant had no Shield left) and the Evil Champion fight earlier left me at 2 hearts for three
  rounds, in Groves whose cells give no hearts. A Boss without its Treasure (3 hearts) would have
  killed me. Next time: in round 10 take one Barbarian, not two, and Explore the Valley heart with
  the other die; keep 4 hearts before walking to the Boss Castle.
- **Game 2, round 5, the pocket at row 7 col 6.** I chose a 2-hex path for the cells at the end and
  did not check the exits. Without the Donkey, only a 3 or a 5 (Mountain dice), or the unstuck rule
  at 2 hearts, would have got me out, at 3 hearts. Next time: rule 12 above before every Travel.
- **Game 2, round 2, food to 0.** Two Strength explores at -2 food each emptied the food box in round
  2; every later Travel cost was then paid from new food or hearts. Next time: one Strength explore
  and one food action.

## Open questions

*Choices a few games could not settle, phrased so a simulation can answer them.*

1. Mage: from the start, all points into Magic until 12 (Enchant route), or Magic to 8 then
   Agility? Measure win rate and round of the win.
2. Mage: with Mana Shield unlocked, is it better to spend the round's Shield on the Enchant heart
   (always certain) or keep it for the first combat damage? (Both save one heart for one food; the
   difference is only when no Enchant fight happens later that round.)
3. Is it worth fighting an enemy for its gem at a cost of 3 hearts (e.g. the Evil Champion at Magic
   7) when the gem completes the Relic box? Compare with waiting until Magic 10.
4. Double on a low-food round: take the movement gift (Sail Boat, Donkey, Balloon) or keep the two
   dice for food fights? Condition on food <= 3.
5. Boss reward after the first Boss when the second Boss's Treasure is already held: Black Cat
   (+30) or Treasure Crate (+10 points, and Treasures for any other Boss)?
6. Travel with the 6 (free, 3 hexes) versus keeping the 6 for the 5-6 Adventure row (often a gem or
   Treasure). Which gives more wins?
7. How often does a game end stuck in a pocket, per map, with a "never end in a pocket" rule versus
   without it? Does map 3 (many Mountains in rows 2-6) produce more pockets than maps 1 and 2?
8. Warrior: does deliberately staying at 2 hearts for Adrenaline (Strength +1 per Travel) beat
   keeping hearts high? At what round should he climb back to 4+ before the Boss round?

## Difficulty

From one won game and seven rounds of another, I think a careful player can win most games with
the Mage. Game 1 was won in round 14 with 4 hearts and 29 hexes, and two lucky doubles early
(Vital Eggs in round 1, Skill Flame in round 5) did a lot of the work. Skill decides how many rounds
the win takes and whether hearts last: point allocation (never spread), using free fights for food,
the Enchant + Mana Shield pairing, and the Treasure Crate trick in the Boss round. Dice decide the
gifts and whether the Boss Castle is reachable on the round you arrive. The real danger was the
middle game: hearts sat at 2-3 for five rounds, and a single 3-heart penalty or a pocket would have
ended it. The Warrior game was harder in its first rounds: no free food fights at Strength 2-6 on
map 3, food at 0 by round 2. I can't say yet whether that is the character, the map or my play.

## Measured by the engineers

*Win rates from `test/bot.ts` over thousands of games, and the answers to the open questions above.*

Nothing measured yet.

## Results

*One line per game: date, seed, character, map, outcome, round reached.*

| Date | Seed | Character | Map | Outcome | Round | Who |
|---|---|---|---|---|---|---|
| 2026-11-28 | 400319392 | Mage | 2 | Won: Glubo then King, score 145, 4 hearts | 14 | playtester (Claude, build 6f0f563) |
| 2026-11-28 | 1649081186 | Warrior | 3 | Unfinished: stopped alive for budget (5 hearts, Strength 7) | 7 | playtester (Claude, build 6f0f563) |
