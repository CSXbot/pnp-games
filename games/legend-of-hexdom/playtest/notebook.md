# Legend of Hexdom: the playtester's notebook

Started empty on 2026-11-28, deliberately: the first strategy recorded here should be a player's
own. The playtester rewrites "How to play well", "Turning points", "What killed you", "Open
questions" and "Results"; **"Measured by the engineers" is the Tech Lead's** and is left alone.

First filled in on 2026-11-28 from one finished game (map 2, the Mage, won in round 14) and seven
rounds of a second (map 3, the Warrior). **Rewritten the same day by the second playtest**, after two
more finished games: map 1 with the Archer (won in round 16) and map 3 with the Warrior (won in
round 16). That makes three wins from three finished games, all by a careful human-style player.
Treat every rule below as a hypothesis from four games, not a measurement.

## How to play well

*Rules of thumb in priority order, each a condition and an action specific enough to program.*

**Reference: the six Bosses (the same on sidesheets A-C).** Each is fought with one die face, in a
Castle, after travelling there:

| Die | Boss | Needs | Treasure |
|---|---|---|---|
| 1 | Gast | Strength 12 and Magic 8 | Lost Skull |
| 2 | Liggy | Strength 12 and Agility 8 | Little Scythe |
| 3 | Stuker | Magic 12 and Strength 8 | Silver Hammer |
| 4 | Brok | Agility 12 and Magic 8 | Book of Shadows |
| 5 | Glubo | Agility 12 and Strength 8 | Serpent Spear |
| 6 | King | Magic 12 and Agility 8 | Crow |

A missing Treasure costs 3 hearts on top.

**Definitions.**
- **Live Boss:** a Boss whose two requisites you meet now (for the Mage, with Enchant) and whose Treasure you hold. It costs 0 hearts.
- **Live faces:** the set of die faces whose Boss is live.
- **Free Castle:** an unvisited Castle that some legal path can still end on.
- **Pocket:** a hex whose unvisited neighbours are all Mountain or Water.

1. **Castles are the game's real clock. Never end a Travel on a Castle before the Boss round unless at least 3 free Castles would remain, or the Castle's cell wins something you cannot get elsewhere** (a Relic-completing gem, a target Boss's Treasure). Maps 1 and 3 have 4 Castles each, and a visited Castle can never host a Boss. In both of the second playtest's games I spent 2 Castles on early fights, and the winning Boss round had to happen in the *last* free Castle. Game 2 would have been lost if round 16 had not rolled a 1 or 2.
2. **Maximise the number of live faces, not two fixed targets.** Before every attribute point and Treasure choice, count the live faces after it and take the option that adds the most. The Boss round wins when the two main-phase dice show two live faces, so 3 live faces win far more rounds than 2. Game 2 had Liggy (2), Glubo (5) and Gast (1) live or one reward away, and round 16's 2-2-1 roll was enough.
3. **If a die can win a fight with no heart lost and the loot includes food, a gem, a point or a Treasure you need, take that fight before any Explore.** Free fights are the engine for food, gems and points.
4. **Archer: if a free enemy is in reach of both main-phase dice, fight it twice** (the same enemy, even after its gem or Treasure is taken; ruling Q5). The second Adventure triggers Focus: Agility +1 every round for free. Game 1 took Agility from 2 to 12 by round 11 this way, with no Explore spent on Agility.
5. **Archer: place every free attribute point in Magic (to 8, then 12), never in Agility.** Focus raises Agility by itself, so points there are wasted. Magic 8 makes Brok live, and Magic 12 adds Stuker and King. Get Strength from **Cross Training in one burst**: when food is 12 or more at the start of a round and Strength is below 8, pay 2 food per point until Strength is 8 or food is 1. Game 1, round 10: six uses took food 13 to 1 and Strength 2 to 8. Two Magic-5 Ooze fights (+4 food each) refilled the food the same round.
6. **Warrior: Strength 12 first, then Agility 8. The Forest Explore 3-4 cell (+2 Strength for 2 food) is the fastest route.** Use it while food is 3 or more; at 2 or less it costs hearts. Then Agility 8 makes Liggy live (with the Scythe) and Glubo live (with the Spear). The Campfire's point after every 3/4/5 Travel gave 7 points in game 2. Points go to Strength until 12, then to Agility until 8, then to Magic for Gast.
7. **Food floor: if food at the end of your main phase would be below 2, prefer an action that gives food over one that gives an attribute.** At food 0, every Travel with a 3, 4 or 5 costs 2 hearts, and Explore costs are paid in hearts. Game 2 hit food 0 three times, and once a 5-Travel took the Warrior from 3 hearts to 1.
8. **Gems: put the gem in the Relic box while it is not full.** Sidesheet A's box (4 gems: +2 to all three attributes) was the biggest swing of game 1. Its free gems for an Agility-2 Archer: Castle 1-2 Bandit (Agi 2), Village 3-4 Spear Bandit (Agi 2), Forest 1-2 Stag (Agi 3), Village 1-2 Farmers Mob (Agi 5). **Exception: if food is 0 or 1 and the next Travel will probably need a 3/4/5, Trade the gem** (A and C: 3 food; B: 2 hearts).
9. **If a fight costs more hearts than (current hearts - 2), do not take it**, unless it wins the game or completes the live set. Game 1 broke this once on purpose, and it paid: Crazy Barbarian at Strength 8 against 11, 3 hearts for 2 points plus Focus. That made Brok live the next round.
10. **Gifts on a double: take the Balloon at once on maps 1 and 3** (both are cut by Mountain and Water bands). A Balloon Travel can end beyond a wall *and* uses up Mountain and Water hexes instead of playable land, which stretches the clock. Also take attribute gifts that add a live face, the Campfire for the Warrior, and the Skill Flame. Decline the Attribute Cart when its attribute adds no live face (game 2, round 11: Magic +3 was useless then). It is still worth taking as a Boss reward later (rule 13).
11. **Travel die choice: prefer the 6 (free, 3 hexes, and with the Balloon it crosses walls), then the 2 (1 food), then the 1. Use a 3, 4 or 5 (2 food) only when the path needs it, or with the Campfire (it then pays a point).** Break ties by which two dice you keep: keep the dice whose cells at the destination are free fights.
12. **Pathing: never end a Travel in a pocket unless you hold a gift that crosses its wall.** Before confirming, count the end hex's unvisited non-Mountain, non-Water neighbours. If there are none, pick another path.
13. **Boss round:**
    - **Approach:** end the round before it 1-2 hexes from a free Castle, with at least two different unvisited hexes adjacent to that Castle. A 1 or 2 then reaches it by either hex, and a 6 by a 3-hex detour.
    - **The fight:** in the Castle, fight the first live Boss with its die. Both Bosses may fall in the same Castle and the same round.
14. **Reward after the first Boss (the Treasure Crate trick, generalised): choose the reward that makes the *other remaining die's* Boss live.**
    - **The options:** the Attribute Cart gives an attribute (+3; sidesheet C: Magic), the Treasure Crate a missing Treasure, and the Mammoth Tent +4 hearts to pay a Treasure penalty. If none of them does, take the one that keeps you alive for a later round.
    - **Examples:**
      - Game 4: Liggy, then the Cart for Magic 5 -> 8, then Gast with the 1.
      - Game 3: Brok, then the Tent; Stuker without the Hammer cost 3 of 9 hearts four rounds later.
      - Game 1: Glubo, then the Crate for the Crow, then King.
    - **After the second Boss:** take the Treasure Crate if you lack 2 Treasures (+10 score); otherwise take the Black Cat.

## Turning points

*The two or three decisions that decided each game.*

**Game 1 - map 2, the Mage, seed 400319392, won in round 14** (first playtest).
1. Round 1, double 6: Vital Eggs, all three points into Magic (2 -> 5). From round 2 the Magic-4 and Magic-5 enemies were free food. Food 20 (Mana Shield) arrived in round 4.
2. Round 7: fought the Evil Champion with Magic 7 against 10 (3 hearts lost) to complete the Relic box: Agility +2, Magic +2.
3. Round 14: Glubo first, then the Treasure Crate for the Crow, then King with the last die for no damage.

**Game 2 - map 3, the Warrior, seed 1649081186, stopped in round 7** (first playtest).
1. Round 1, double 4: took the Trusty Donkey. In round 6 it was the only way out of my own pocket.
2. Round 2: two Forest explores at 4 took Strength 2 -> 6 but food to 0.

**Game 3 - map 1, the Archer, seed 67739131, won in round 16, score 130.**
1. Rounds 1-6: free Agility fights at Castles and Villages (the Bandit twice in round 1 for the gem and Focus). They filled the 4-gem Relic box by round 6: Strength 0 -> 2, Agility 6 -> 8, Magic 0 -> 2. After that most Agility enemies were free, and Focus added a point almost every round.
2. Round 10: Cross Training x6 (food 13 -> 1, Strength 2 -> 8). In round 11 that won the Serpent Spear (Brown Wolf, Strength 7) and let the Crazy Barbarian (3 hearts) push Agility to 12 and Magic to 8. Brok was then live.
3. Round 12: Brok in Castle 4.1, then the **Mammoth Tent** (hearts 3 -> 7) rather than the Crate. With 7-9 hearts, Stuker without the Hammer (3 hearts) was affordable. In round 16 Stuker fell in the last free Castle (1.5), and the Crate then gave the Crow and the Hammer for score.

**Game 4 - map 3, the Warrior, seed 1834211458, won in round 16, score 130.**
1. Rounds 1-2: triple 1s gave the Balloon, and double 2s the Campfire. The Balloon let three free 6-Travels hop the Mountain and Water bands, and the Campfire paid 7 points over the game.
2. Rounds 5-8: three Forest Explore 3-4s took Strength 4 -> 12 by round 8, but food fell to 0 twice. In round 11 the only survivable Travel was a 5 into Castle 9.4 for 2 hearts (3 -> 1), burning the third of four Castles.
3. Round 16, in the last free Castle (2.6): Liggy with the 2, then the **Attribute Cart** (Magic 5 -> 8) made Gast live for the remaining 1. A roll with no 1, 2 or 5 would have left me with no Castle for later rounds.

## What killed you

*And what you would do differently.*

Nothing killed me in the four games. What nearly did:

- **Game 4, round 11: 3 hearts and food 0 at Village 4 (row 7, col 3).** My own path had sealed 7.3's other exits. The only legal ends were a pocket (Forest 6.4), Swamp 8.5 and Castle 9.4, and every Travel cost 2 hearts. I went to 9.4 at 1 heart and climbed back with two free +1-heart fights (Evil Castle Guards, Evil Champion).
  - Next time, in round 10, trade the Sapphire Frog's gem for 3 food instead of putting it in the Relic box (rule 8's exception).
  - Do not take the Swamp Explore (-2 food) at food 1 (rule 7).
- **Game 4, rounds 13-16: Castle exhaustion.** By round 11 three of the four Castles were visited (5.4, 8.2 and 9.4, two of them for their Adventure cells). The game then hung on reaching 2.6 *and* rolling two live faces there.
  - Next time, skip Castle 8.2 in round 7. Its Crow was not needed by the Warrior's Bosses (rule 1).
- **Game 3, rounds 11-12: 3 hearts after the Crazy Barbarian.** Brok cost 0, and the Tent then restored 4. Without a live Boss to fight that round, 3 hearts with no Treasure for the second Boss would have been a trap.
- **Game 1, rounds 10-12: hearts at 2** (first playtest). Take one Barbarian, not two, and Explore the Valley heart with the other die.
- **Game 2, round 5: the pocket at row 7, col 6** (first playtest). Rule 12 before every Travel.

## Open questions

*Choices a few games could not settle, phrased so a simulation can answer them.*

1. **Castle discipline:** compare win rates for "never end a Travel on a Castle before at least 2 Bosses are live, unless 3+ free Castles remain" against using Castle cells freely. Also count how many of the bot's "stuck" losses are really "all Castles visited before two Bosses were live".
2. **Live faces:** at the start of the Boss round, how does the win rate depend on the number of live faces (2, 3, 4)? Is it worth spending a round to add a third live face rather than going to the Castle with two?
3. **Boss reward after the first Boss:** reward that makes the remaining die's Boss live (Cart / Crate / Tent) vs. the Black Cat (+30). In my games the first was always right, but only because the second Boss had to fall the same round.
4. **Archer:** Cross Training in one burst at food 12+ vs. 1-2 uses every round. Also: does Strength 8 by round 10 (Glubo or Stuker as second Boss) beat staying with Brok + King (Magic only)?
5. **Archer Focus loop:** fighting the same free enemy twice in a round for Focus vs. using the second die for an Explore. Measure Agility at round 10 and the win rate.
6. **Gem with food 0-1:** Relic vs. Trade (3 food on A and C). Condition on the Relic box's fill and on whether the next Travel needs a 3/4/5.
7. **Balloon on the first double** vs. waiting for an attribute gift, on maps 1 and 3.
8. **Warrior Adrenaline** (kept from the first playtest): does deliberately staying at 2 hearts for Adrenaline (Strength +1 per Travel) beat keeping hearts high? At what round should he climb back to 4+ before the Boss round? (Not tested in game 4: Strength reached 12 by round 8 without it.)
9. **Warrior food:** Forest Strength explores (-2 food) while food is 2 or less vs. waiting for food. In game 4 they drove food to 0 twice.
10. **First playtest's questions still open:**
    - Mage: Magic to 12 first, or Magic 8 then Agility?
    - Mana Shield: on the Enchant heart, or on combat damage?
    - Is a 3-heart fight for a Relic-completing gem worth it?

## Difficulty

A careful player can win this with all three characters. I finished two games, the Archer on map 1
and the Warrior on map 3, and won both in round 16 with 6 hearts and a score of 130. The first
playtester won the Mage game in round 14. The three wins share a shape:
- a strong early gift (Vital Eggs; the Balloon in both of my games, plus the Campfire);
- a mid-game in which free fights snowball attributes;
- a Boss round played in the last or second-to-last free Castle.

Skill decides most of the game:
- not spreading points;
- the Archer's double-fight Focus loop and the Cross Training burst;
- keeping food above 2;
- choosing the Boss reward that makes the next Boss live.

Dice decide the end. Both of my games came down to one roll in one remaining Castle. Game 4 needed a 1, 2 or 5 among the two main-phase dice in round 16 and got 2-2-1. That suggests the real losses are Castle exhaustion, not hearts: the "stuck" the engineers measure. The bot's 3/100 for the Archer and the Warrior is far below what careful play gets here. I think most of the gap is Castle discipline (rule 1), live-face counting (rule 2) and the reward choice (rule 14).

## Measured by the engineers

*Win rates from `test/bot.ts` over thousands of games, and the answers to the open questions above.*

- **2026-11-28, second measurement: 900 games (300 per character, maps 1-3 in turn, seeds
  1000-1299), playing this notebook's second version. Mage 93/300 won (31%), Archer 46/300 (15%),
  Warrior 27/300 (9%).** Games last about 15 rounds. Losses: Mage 186 stuck, 21 out of hearts; Archer
  226 and 28; Warrior 237 and 36. `BOT_GAMES=300 npx vitest run test/bot.test.ts
  --disableConsoleIntercept` reproduces it (about 6 minutes on an idle machine).
- **What the bot learned from the second playtest, and what each step was worth** (100 games per
  character each, so a few points either way is noise). Wins went from 19/3/3 (Mage/Archer/Warrior)
  as follows:
  - **Castles as the clock (rules 1 and 13)**, with the target Bosses' value: 26/8/4. Stuck games
    with every Castle already visited fell from about 30 per 100 to about 8.
  - **A free Castle kept reachable from where a Travel ends**, and a main phase that looks two
    actions ahead (it now sees the Archer's Focus pair): 31/9/5.
  - **No fixed target Bosses**: it aims at the two that need the fewest points, recomputed every
    move (rule 2's live faces, generalised): 26/18/8.
  - **A wider heart margin**: 36/20/7.
- **Open question 1 (Castle discipline), answered: yes, it matters.** It took stuck-with-no-Castle
  losses from about a third of all losses to under a tenth, and it accounts for part of the gain.
  Most losses are still "stuck": the land runs out before two Bosses are live.
- **A correction to rule 6:** Glubo needs **Agility 12** and Strength 8, so Agility 8 does not make
  him live. A Warrior with Strength 12 and Agility 8 has Liggy only, and needs Magic 8 (Gast) or
  more Agility for a second Boss. This is why fixed targets hurt the Warrior most.
- **A bug the bot found:** with all three attributes at 12, a point still waiting to be placed (one
  gained with a gem whose Relic box then filled everything) could never be placed. Fixed in the
  engine: waiting points are ignored once all three are at 12.
- **How far to trust it:** the bot plays greedily, at most two actions ahead. It does not plan the
  Boss round's approach beyond heading for the nearest free Castle, the Warrior's Adrenaline (open
  question 8), the gem-trade exception (rule 8) or the Balloon (rule 10). So these are floors: three
  careful games by the playtesters were all won. Measure again when one of those is taught to it.
- **First measurement, 2026-11-28:** the first notebook's strategy, 300 games: Mage 19/100, Archer
  3/100, Warrior 3/100.

## Results

*One line per game: date, seed, character, map, outcome, round reached.*

| Date | Seed | Character | Map | Outcome | Round | Who |
|---|---|---|---|---|---|---|
| 2026-11-28 | 400319392 | Mage | 2 | Won: Glubo then King, score 145, 4 hearts | 14 | playtester (Claude, build 6f0f563) |
| 2026-11-28 | 1649081186 | Warrior | 3 | Unfinished: stopped alive for budget (5 hearts, Strength 7) | 7 | playtester (Claude, build 6f0f563) |
| 2026-11-28 | 67739131 | Archer | 1 | Won: Brok (round 12) then Stuker (round 16), score 130, 6 hearts, 32 hexes | 16 | playtester 2 (Claude, build e145f2a) |
| 2026-11-28 | 1834211458 | Warrior | 3 | Won: Liggy then Gast in the same round, last free Castle, score 130, 6 hearts, 32 hexes | 16 | playtester 2 (Claude, build e145f2a) |
