# Legend of Hexdom: specification

**Stage 1 done, 2026-11-27.** Every question is answered: ten settled by the rules group and four
ruled by the Game Director, all in `RULES-NOTES.md`.
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
   **Unstuck crossing** (p41, `RULES-NOTES.md` Q2): only when no die in hand has an ordinary legal
   path; then any die may be used, and each Mountain or Water hex entered without permission costs 2
   hearts on top of the food. **Sail Boat / Trusty Donkey** (Q3): a path crossing Water / a Mountain
   may be one hex longer, optionally; the two stack.
4. **Main phase** with the two remaining dice: **each must be used** (Game Director, A), one action
   per die, in the order the player chooses
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

**Boxes are lifetime totals** (Q4): once the 50th food or the 32nd heart is painted, further gains
of that kind are lost.

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
- **An enemy whose gem or Treasure is taken** stays on the table and gives the rest of its loot
  (Q5).
- **Stuck** (p40): if no die has a legal path, even after an optional Gift and with the unstuck
  rule, the game ends in defeat.
- **Death** (p24): the game ends in defeat when the last heart is crossed. A combat that kills
  gives no loot and defeats no Boss.

## 5. End of game

The game is won in the round the **second Boss** is defeated; any die still unused that round may
still be used, then the game ends (p17, p25). Score as in section 2; "hexes travelled" counts every
hex the path entered, crossed Mountains and Water included, not the start (Q6).

**A defeat is not scored** (Q7). If two Bosses can no longer be beaten, the game goes on until the
player dies or is stuck.

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


## 7. Questions

None open. The answers, who gave them and what they rest on are in `RULES-NOTES.md`. In short,
beyond what sections 3-5 already say: Adrenaline reads the hearts at the moment the Travel starts;
Magic Blood and Cross Training can be used repeatedly in their windows, since a skill is limited only
where its card says so; Magic Berry gives one food per gain of Magic.
