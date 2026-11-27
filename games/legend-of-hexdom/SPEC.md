# Legend of Hexdom: specification

**Stage 1 draft, 2026-11-27, waiting on the Game Director's answers to the questions in section 7.**
Nothing here is built yet. When it is, this file describes the rules *as implemented*.

Scope: **Hex Forest maps 1-3** (sidesheets A-C), **solo, normal mode**, characters **Warrior,
Archer and Mage**. Expert mode follows and gets its own spec pass; Legacy mode is later or never.

Sources: the rulebook (`English_Legend of Hexdom - Rulebook 1.2.pdf`, cited as "p<n>"), the A5
maps, sidesheets and character cards, and the A4 sheets (cited by name). The cards and sheets win
over the rulebook's prose where they disagree, because they are what the player plays from; every
such disagreement is listed in section 7 rather than settled here.

## 1. Components and setup

- **Three six-sided dice.** In the web game they are rolled by a seeded RNG, or typed in from
  real dice ("Manual dice", a shelf standard).
- **A map** (one of 1-3), **its sidesheet** (map `n` uses sidesheet `(n-1) mod 10`: 1-A, 2-B, 3-C)
  and **a character card**.
- **Setup** (p10): pick the map and the character; roll one die; **start on the Village with that
  number**. The start hex counts as visited (p36).
- **Starting state, as printed:** 4 hearts painted, 5 food painted, the card's starting
  attributes filled. Warrior: Strength 2. Archer: Agility 2. Mage: Magic 2. Everything else empty.
  No Treasures, gems, Bosses or Gifts.

## 2. Sheet anatomy

**Map.** 60 hexes, pointy-top, 10 rows of 6; the 1st, 3rd, 5th, 7th and 9th rows are offset half a
hex to the right. Neighbours are the usual six. The edge of the map is impassable. Each hex has a
**terrain**: Grove, Forest, Plains, Swamp, Valley, Mountain or Water. Six hexes hold a **Village**
(numbered 1-6) and four a **Castle**; each of those also has an underlying terrain from the first
five. The data is measured per map in stage 2, cross-checked against the A5 art.

**Travel box** (same on A-C):

| Die | Food | Hexes | May cross |
|---|---|---|---|
| 1 | 1 | 1 | - |
| 2 | 1 | 2 | - |
| 3 | 2 | 2 | Mountains |
| 4 | 2 | 2 | Water |
| 5 | 2 | 2 | Mountains and Water |
| 6 | 0 | 3 | - |

**Explore table.** Rows: die faces 1-2, 3-4, 5-6. Columns: Grove, Forest, Plains, Swamp, Valley,
Village, Castle. Each cell is a list of effects in order: costs (slashed food, slashed heart) and
gains (food, heart, an attribute point of choice, a named attribute `+n`).

**Adventure table.** Same rows and columns. Each cell is one enemy: its picture, its requirements
(one attribute, two linked, or two unlinked, each with a level), and its loot (food, hearts,
attribute points, a gem, a Treasure). Gems and Treasures in loot are taken once.

**Boss table** (same on A-C). Die face 1-6 selects one of six Bosses: Gast, Liggy, Stuker, Brok,
Glubo, King. Each has two **linked** requirements (one at 12, one at 8) and one required Treasure.
Exact pairs are data, read in stage 2.

**Gift table.** Doubles 1-1 to 6-6 each find one Gift. The set and order vary by sidesheet. Gifts in
A-C: Trusty Donkey, Campfire, Vital Eggs, Treasure Crate, Mammoth Tent, Balloon, Sail Boat, Skill
Flame, Black Cat, Attribute Cart. Effects are in p68-73 and section 3.

**Treasure box.** Six Treasures: spear, hook, crow, hammer, skull, book (named in the rulebook's
lore where it names them: Serpent Spear, Little Scythe, Silver Hammer, Lost Skull, Book of Shadows).

**Relic box and Trade** (vary by sidesheet):

| Sidesheet | Relic box | When full | Trade one gem for |
|---|---|---|---|
| A | 4 gems | Agility +2, Magic +2, Strength +2 | 3 food |
| B | 3 gems | Agility +2, Magic +2 | 2 hearts |
| C | 3 gems | Agility +2, Strength +2 | 3 food |

**Character card.** HP box of 32 hearts; Food box of 50 diamonds with a `+` (attribute point of
choice) at food 10, 30 and 50 and a red diamond (unlock the next skill) at food 20 and 40; three
attribute tracks 1-12. Skills, as printed:

| | Starting skill | Unlocked at food 20 | Unlocked at food 40 |
|---|---|---|---|
| Warrior | **Adrenaline**: When travelling, if you have 2 hearts or less: Strength +1 | **Overcoming**: When you lose a heart, gain a food (once a round) | **Magic Blood**: After travelling, you may lose a heart to gain Magic +1 |
| Archer | **Focus**: After you Adventure twice in a round, gain Agility +1 | **Cross Training**: Before travelling, you may spend 2 food: Strength +1 | **Magic Berry**: Every time you improve your Magic, gain a food |
| Mage | **Enchant**: When in combat, you can lose a heart to use Magic instead of Strength | **Mana Shield**: You can spend a food to resist losing a heart, once a round | **Greed**: Every time you get a gem, gain an attribute point |

**Score line** (under the map, p25): 3 per attribute at 12; 3 per skill unlocked; 5 per heart
left; 5 per Treasure; 4 per gem in the Relic box; 10 per Boss; 1 per hex travelled. The Black Cat
Gift adds 30 (p69).

## 3. The round

1. **Roll** three dice (p11).
2. **Gift, optional:** if two dice match and that double's Gift is still available, the player may
   spend both on it, now or after travelling (p20, p66). Then the round is the Gift plus a Travel
   with the third die, and nothing else.
3. **Travel, mandatory** (p34), with one die: pay its food; move exactly its number of hexes, each
   to a neighbour; never enter a hex already visited or passed through, including the start; may
   enter Mountain or Water only if the die (or a Gift) allows crossing it, and may never end there
   (p12, p36). Each hex entered, including a crossed Mountain or Water, is one of the moves (p35).
   If no die has a legal move, the unstuck rule may apply (p41, question 2).
4. **Main phase** with the two remaining dice, one action per die, in the order the player chooses
   (p13): **Explore**, **Adventure**, or **fight a Boss** (only in a Castle). Any mix: two
   Explores, two Adventures, two Bosses, or one of each.
   - **Explore** (p14, p46-48): look up the die's row in the column of the current hex's terrain,
     or of its Village/Castle - the player's choice, per action. Apply the cell in order.
   - **Adventure** (p15-16, p49-54): look up the enemy the same way. Damage is, per requirement
     that applies, the enemy's level minus the player's attribute if that is positive: both for
     linked, the player's choice of one for unlinked. Take the damage; if alive, take the loot.
   - **Boss** (p17-18): the die face picks the Boss. Damage is both linked shortfalls, plus 3 if
     the player lacks its Treasure. If alive, the Boss is defeated: mark it, and take a Gift of
     choice still available, or a gem if none is left.
5. Skills fire at the points their text names. Unlocks and milestone attribute points happen the
   moment the food that reaches them is painted.

**Paying.** A food cost slashes painted food; any food that can't be paid is a lost heart each
(p14, p35). A heart cost or damage crosses hearts. **Gaining** food paints the next diamond;
gaining a heart paints the next heart; an attribute point fills the next ring (choice of attribute
for `+`), and is ignored past 12 (p22).

**Gems** (p19): when gained, immediately either put it in the Relic box (if there is room) or trade
it for the sidesheet's reward. The moment the Relic box is full, gain its reward.

## 4. Legality, and when nothing is legal

- A travel path is legal if it has exactly the die's length, touches no visited hex, ends on a
  non-Mountain, non-Water hex, and crosses Mountain/Water only where allowed. The web game
  computes every legal destination per die, and highlights only those.
- A Boss can be fought only in a Castle, and only if the die's Boss is not yet defeated.
- **Stuck** (p40): if no die has a legal path, even after an optional Gift and with the unstuck
  rule, the game ends in defeat.
- **Death** (p24): the game ends in defeat when the last heart is crossed. A combat that kills
  gives no loot and defeats no Boss.

## 5. End of game

The game is won in the round the **second Boss** is defeated; any die still unused that round may
still be used, then the game ends (p17, p25). Score as in section 2.

## 6. Asset triage

| Component | Method |
|---|---|
| Map art | **Extract** the A5 map (300 dpi, lossless in the PDF), not the A4 copy: its Village and Castle icons are smaller and show the terrain underneath. Hex centres **measured** into data, never redrawn. |
| Sidesheet tables | **Extract** from the A5 sidesheet: the cells' art (enemies, icons) is the content, and the sheet prints no words to rebuild. Cell boxes **measured**, so marks (crossed gem, taken Treasure, defeated Boss, taken Gift) land on the printed cell. The engine's data is typed in from the same 300 dpi pages, and tests pin it. |
| Character card | **Extract** from the card PDF (the `.png~` files are the same art without the PDF's margin). The HP, Food and attribute boxes are the state display, so their rings, hearts and diamonds are **measured** too. |
| Pen marks: path, arrows, fills, slashes, X | **SVG drawn over the art**, in the sheet's ink. The Game Director wants these pen-like; see `art/art-direction.md`. |
| Dice, buttons | SVG/CSS. |
| Layout | Free to depart from the A4 arrangement (Game Director, 2026-11-27); decided at stage 3. |

**Weight:** three maps and three sidesheets at full resolution would be roughly 10 MB as PNG.
They will be re-encoded at the size they are actually displayed (2x for the iPad's screen), and
the game gets a `pnp.maxKB` budget when it gets a `package.json`.

## 7. Questions for the Game Director

Each in three parts: what the original says, what I propose the web game does, and the question.
Readings I consider already settled by the sources are listed after the questions, each with its
citation, so any of them can be overruled too.

**1. May a die be left unused in the main phase?**
- *Original:* "Here we use the remaining two dice to take actions." (p13). Only Travel is called
  mandatory: "Travel is mandatory, as heroes don't sit around!" (p34). The Brawler's skill says of
  its extra Explore "this Explore action is mandatory, you cannot avoid it!" (p105), which suggests
  actions are otherwise optional.
- *Proposal:* the two main-phase dice may each be used or left unused. Example: you roll 3, 3, 6,
  travel with the 6 and arrive in a Swamp with 1 heart. On sidesheet A, Explore Swamp 3-4 costs two
  hearts, so you end the round without using either 3.
- *Question:* may the player decline to use a main-phase die?

**2. When does the unstuck crossing apply?**
- *Original:* "If you get to a point where your only movement option is to cross Mountains or
  Water, but lack the specific die for that, you may cross them with any other die, paying a
  penalty of 2 Heart Points for each Mountain or Water crossed in this way." (p41). The example
  rolls 2, 4, 6 and offers the 2 or the 4 (one Mountain, 2 HP) or the 6 (two Mountains, 4 HP)
  (p42).
- *Proposal:* the unstuck crossing is offered only when **no die has an ordinary legal path**.
  Then any die may be used; each Mountain or Water entered without that die's permission costs 2
  hearts, on top of the die's food. A Water hex entered with a 4 (which allows Water) costs
  nothing extra. If one die has an ordinary legal path, the unstuck crossing is not offered for
  the others.
- *Question:* is that the reading? In particular, if one die can still move legally, may the
  player still choose an unstuck crossing with another?

**3. Sail Boat and Trusty Donkey: "move one additional hex".**
- *Original:* Sail Boat: "You may now use any die to cross Water. When crossing Water, you may also
  move one additional hex." (p71). Trusty Donkey, the same for Mountains (p72). The sidesheet cell
  shows "Travel may: + boot, Water".
- *Proposal:* when a travel path crosses at least one Water hex (Mountain for the Donkey), the
  player may make it exactly one hex longer than the die allows. One extra hex per travel, however
  many Water hexes it crosses. Example: with the Sail Boat, a 2 (two hexes) may go Plains, Water,
  Forest, three hexes.
- *Question:* one extra hex per travel, or one per Water/Mountain hex crossed? And is the extra hex
  optional (the path may be either length)?

**4. What happens when the Food or HP box is full?**
- *Original:* the card has exactly 50 food diamonds and 32 hearts. "Food points must be painted
  from left to right, and from top lines to bottom lines." (p23). For attributes only: "After
  level 12, any attribute point gained is ignored." (p22). Legacy unlocks speak of "your Food box
  filled to the maximum and totally used" and "fill your 40th heart" (p29). The card has 32.
- *Proposal:* as on paper. Once the 50th food has been painted, further food gains are lost, even
  if most of it has been spent. Once the 32nd heart has been painted, further heart gains are lost.
  Example: at 50 painted, 44 slashed, the Brown Bear's loot "food, food, +" gives only the
  attribute point.
- *Question:* is the box a hard limit on food and hearts *ever gained*? (This makes a long game
  end in hunger, which may be intended.)

**5. An enemy whose gem or Treasure is already taken.**
- *Original:* "Treasures can be only taken once. After taking them, cross them off of the Adventure
  table and mark them in your Treasure box" (p18); "Each Gem can be only taken once. After taking
  them, cross them off of the Adventure table" (p19).
- *Proposal:* only the gem or Treasure is crossed off; the enemy can still be fought, and gives
  whatever else its loot lists. Example, sidesheet A: the Brown Stag (Forest, 1-2) loots only a gem.
  Fought a second time, it is a combat (it counts for the Archer's Focus) that gives nothing.
- *Question:* is the enemy still there to fight after its gem or Treasure is gone?

**6. "1 point for each hex traveled" - which hexes?**
- *Original:* p25, and the score line's last term, "1 x [hex]".
- *Proposal:* every hex the path entered, including Mountains and Water crossed, and not the start
  hex. Example: start on Village 3, travel 2 then 3 hexes: 5 points.
- *Question:* does the start hex count, and do crossed Mountain/Water hexes count?

**7. Is there a score when the game is lost?**
- *Original:* the tally is described after winning: "the game is over, and you win! Time to tally
  your points!" (p25). Death and getting stuck are "game over" (p24, p40). Only competitive
  multiplayer scores players who died (p25).
- *Proposal:* a lost game shows its score, labelled as a defeat, and keeps it in the history.
- *Question:* score a defeat, or show no score?

**8. Water is drawn two ways.**
- *Original:* the maps draw Water either as plain ripples or as a cresting wave (map 1 has both).
  The rulebook knows only "Mountains and Water".
- *Proposal:* both are Water, the wave purely decorative.
- *Question:* agreed?

**9. Warrior, Adrenaline: hearts counted before or after paying for the travel?**
- *Original:* card: "When travelling, if you have 2 [heart] or less: [Strength] +1". p106: "when
  traveling, if you have 2 Heart Points or less, gain a Strength point."
- *Proposal:* counted after the travel is paid, including hunger and any unstuck penalty. Example:
  3 hearts, no food, travel with a 3 (2 food): you lose 2 hearts, have 1, gain Strength.
- *Question:* before or after paying?

**10. Warrior, Magic Blood: how often?**
- *Original:* card: "After travelling, you may [lose a heart] to gain [Magic] +1". p107: "After
  traveling, you may take one damage to gain one Magic point." No "once a round", unlike
  Overcoming on the same card.
- *Proposal:* once per round, right after travelling.
- *Question:* once per round, or as many hearts as the player wants to pay?

**11. Archer, Cross Training: when and how often?**
- *Original:* card: "Before travelling, you may [spend 2 food]: [Strength] +1". p76 gives no timing
  ("he consumes two food for a Strength point"), and p22 says "Active skills can be used at any
  time, unless otherwise stated."
- *Proposal:* the card's timing: only before the Travel. As often as the player can pay 2 food
  each time.
- *Question:* card timing, and unlimited uses in that window?

**12. Archer, Magic Berry: one food per point, or per gain?**
- *Original:* card: "Every time you improve your [Magic], gain [food]". p77: "earning him one food
  whenever he improves his Magic."
- *Proposal:* one food per point of Magic gained. Example: completing Relic box A (Magic +2) gives
  2 food. A point ignored at Magic 12 is not an improvement and gives none.
- *Question:* per point, or one food per event that raises Magic?

**13. Mage, Enchant: does it work against Bosses?**
- *Original:* card: "When in combat, you can [lose a heart] to use [Magic] instead of [Strength]".
  The rulebook calls Boss fights "Boss Combats" (p17), but explains Enchant only with Adventure
  enemies (p94-95).
- *Proposal:* yes, any combat including Bosses. Example: Gast needs Strength 12 and Magic 8 (exact
  pairs read in stage 2); a Mage with Magic 12 and Strength 2 who Enchants loses 1 heart instead of
  10.
- *Question:* may Enchant be used against a Boss?

**14. Which heart losses count for Mana Shield and Overcoming?**
- *Original:* both cards use the same mark, a slashed heart: Overcoming, "When you [lose a heart],
  gain [food]"; Mana Shield, "You can [spend a food] to resist [losing a heart] once a round".
  Explore cells use the same slashed heart as a cost (sidesheet A, Swamp, 1-2: "lose a heart,
  attribute point").
- *Proposal:* every heart lost counts, whatever the cause: combat, a Boss, hunger, an Explore cost,
  the unstuck penalty, Enchant, Magic Blood. Example: the Mage explores Swamp 1-2 on sidesheet A,
  spends a food on Mana Shield, keeps her heart and still gains the attribute point.
- *Question:* agreed, or do only combat losses count?

### Readings I consider settled (overrule any)

- **Starting food is 5**: the first row of the Food box is printed filled, and the p35 figure
  slashes two of those five after a "3" travel.
- **Food is experience**: milestones count food painted, not food held (p23). Spending doesn't
  undo a milestone.
- **Partial payment**: pay what food you have, a heart for each food short (p14, p35).
- **Path**: exact length, no hex twice, Mountain/Water crossed count as moves and are visited
  (p35-36).
- **Village/Castle column**: chosen per action, so the two dice may use different columns (p14,
  p48).
- **Linked/unlinked** as p16 and p52-53. A single requirement is compared directly.
- **Death** at the last heart; a fatal combat gives no loot (p24, p54).
- **Bosses**: a die whose Boss is already defeated cannot fight a Boss; the Treasure is a
  requirement, not spent; two Bosses in one round are allowed solo (p17).
- **Gifts**: optional; a taken Gift is gone; on a triple, two dice take the Gift and the third
  travels (p20, p66-67). A Boss's reward is a Gift of choice, or a gem if none are left (p18).
- **Treasure Crate** takes two Treasures not yet taken, which are then crossed off the Adventure
  table like any other.
- **Skills unlocked** scores the two unlockable skills (the score line's icon is the red unlock
  diamond), so 0-6 points.
- **Magic Blood's heart triggers Overcoming** (p106-107 say so).
- **Greed** counts every gem gained, whether it goes to the Relic box or is traded, and the gem a
  Boss gives when no Gift is left.
