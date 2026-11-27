# Researcher's reading of the 14 questions, 2026-11-27 - second run, full sources

`gemini-4-carbon` (Google's strongest Gemini 4 model), asked **blind** and fresh (no memory of the
first run): the questions as worded in `brief-2026-11-27.md`, and the publisher's own files - the
**whole rulebook 1.2 PDF with its figures**, map 1, sidesheets A, B and C, and the Warrior, Archer
and Mage cards. Not shown the tech lead's proposals in `SPEC.md`. Run in the background and
polled. Its answer follows unedited. The tech lead checked the quotes the decisions rely on
against the rulebook text (see `../RULES-NOTES.md`).

---

**1. May an action die be left unused?**
- **READING:** Yes. Travel is mandatory, while Main Phase actions (Explore, Adventure, Bosses, Gifts) are optional, so one or both remaining dice may be left unused (except for skills explicitly marked mandatory, such as the Brawler Traveller's).
- **WHY:**
  - *For:* Travel is singled out as mandatory: `"In this phase, everybody has to Travel, using one die."` (p12) and `"Travel is mandatory, as heroes don’t sit around!"` (p34). Main Phase actions use permissive wording: `"actions you can take after Traveling"` (p46, p49), `"the dice available for you to use (lines)"` (p50), `"players may continue with their round actions, if they still have one die to use"` (p25), and `"It is not mandatory to discover Gifts."` (p20). Crucially, the Brawler Traveller's Pathfinder and Trailblazer skills specify `"this Explore action is mandatory, you cannot avoid it!"` and `"this Adventure action is mandatory, you cannot avoid it!"` (p105), a warning that only makes sense if normal Explore/Adventure actions can be avoided. (In print-and-play roll-and-writes, main actions are also customarily optional unless stated otherwise.)
  - *Against:* `"Here we use the remaining two dice to take actions."` (p13) is phrased declaratively, and Expert Mode states `"You roll 4 dice, but can only use 3 of them, playing as in normal mode and leaving one behind."` (p27), which implies normal mode uses all 3 dice rather than leaving dice behind.
- **CONFIDENCE:** medium.
- **KIND:** gap.
- **WOULD CHANGE MY MIND:** An explicit statement from the publisher either allowing players to pass/discard Main Phase dice or requiring all 3 dice to be spent every round.

**2. The "stuck" crossing.**
- **READING:** It applies only when *none* of the rolled dice offers a legal normal Travel move. If invoked, a die that already permits one terrain type (e.g., a `4` crossing Water) only pays the 2 HP penalty for each Mountain/Water hex for which that die lacks the required symbol.
- **WHY:**
  - *For:* `"If you get to a point where your only movement option is to cross Mountains or Water, but lack the specific die for that, you may cross them with any other die, paying a penalty of 2 Heart Points for each Mountain or Water crossed in this way."` (p41). The example checks the entire roll before declaring the player stuck: `"In this position we’ve rolled a “2”, a “4”, and a “6” ... These dice do not allow us to cross Mountains, since none of them have the Mountains symbol ... We’re stuck unless we cross the Mountains"` (p41). For the penalty per terrain, p41 specifies `"crossed in this way"` (i.e., without the specific die) and p42 explains `"as we would cross two Mountains without the correct die"`.
  - *Against:* `"lack the specific die for that"` (p41) could be read per-die rather than across the 3-die pool, and `"each Mountain or Water crossed in this way"` (p41) does not explicitly address a mixed Water-and-Mountain path where the chosen die legally covers one terrain but not the other.
- **CONFIDENCE:** high (that no die may have a legal normal move) / medium (that a die's native terrain symbol avoids the penalty on a mixed path).
- **KIND:** text (when it applies) / gap (mixed-terrain penalty).
- **WOULD CHANGE MY MIND:** A designer ruling or example showing a player voluntarily taking the 2 HP penalty when another rolled die had a legal normal move, or paying 2 HP for Water while using a `4` or `5` die.

**3. Sail Boat and Trusty Donkey.**
- **READING:** The extra hex is optional, and it grants at most 1 extra hex per Travel action that crosses at least one hex of that terrain (not +1 per Water/Mountain hex crossed).
- **WHY:**
  - *For:* Optionality is explicit in both the rulebook—`"When crossing Water, you may also move one additional hex."` (p71) and `"When crossing Mountains, you may also move one additional hex."` (p72)—and on Sidesheets A, B, and C: `"Travel may: +[boot] [boat]"` and `"Travel may: +[boot] [mountain]"`. For once-per-Travel vs. per-hex, compare the Dwarf's two skills on the same card (p88): Mining triggers per hex (`"MINING: Every time you cross a [mountain], gain [Strength]+1"`), whereas Tunneling uses the Gift phrasing (`"TUNNELING: You may [boot]+1 when crossing [mountain]"`, p88: `"move an additional hex when crossing Mountains"`), and the Gift icons tie the bonus to the `"Travel"` action as a whole.
  - *Against:* `"When crossing Water"` / `"When crossing Mountains"` (p71–72) does not explicitly say "once per Travel" and could be read as triggering each time you cross such a hex.
- **CONFIDENCE:** high (optional) / medium (once per Travel rather than per hex crossed).
- **KIND:** text (optional) / gap (once per Travel vs. per hex).
- **WOULD CHANGE MY MIND:** A designer clarification or pathing example showing +2 boots when crossing two Mountain or Water hexes with Trusty Donkey, Sail Boat, or Tunneling.

**4. A full Food or HP box.**
- **READING:** Yes, both boxes track lifetime totals ever gained (50 food, 32 hearts), not current unspent holdings; once all icons in a box have been painted, further gains are lost. The `"40th heart"` on p29 is an apparent error/holdover in the rulebook text against the 32-heart sheet.
- **WHY:**
  - *For:* In roll-and-writes of this type, gaining paints an empty icon and spending/damage slashes an already-painted icon without freeing it; this is shown directly in the figures on p35 (two pre-filled diamonds slashed in the Food box while empty diamonds remain unpainted) and p42–43 (pre-filled hearts slashed in the HP box), alongside `"Food points must be painted from left to right, and from top lines to bottom lines."` (p23), `"Cross off the food you need"` (p12), and `"cross that number of Hearts in the HP box"` (p24). Legacy Mode confirms the boxes cap lifetime gains and can be simultaneously full and spent: `"Win a game with your Food box filled to the maximum and totally used. Blessing: If your Food box is filled, you no longer spend Food to Travel."` (p29) and `"Win a game with your HP box filled to the maximum (fill your 40th heart)."` (p29). Regarding `"40th heart"`, every HP box in the files—Figure 1 (p7), p24, p42, p43, and the Warrior, Archer, and Mage cards—has 8 rows of 4 hearts = 32 hearts total (even the Jester's 3 extra starting hearts on p92 simply start painted inside the HP box); there is no 40-heart box anywhere in the files (likely a miscount of 8 rows × 5 columns from the adjacent 10×5 Food box, or an earlier 10×4 prototype).
  - *Against:* The explicit overflow rule (`"After level 12, any attribute point gained is ignored."`, p22) is stated only under Attribute Points and never repeated under Food (p23) or Heart Points (p24).
- **CONFIDENCE:** high.
- **KIND:** text (lifetime track) / gap (explicit overflow sentence and the 32-vs-40 discrepancy).
- **WOULD CHANGE MY MIND:** A character sheet or expansion rulebook showing a 40-heart box, or a designer ruling allowing players to draw extra hearts/food outside the printed boxes.

**5. An enemy whose gem or Treasure has been taken.**
- **READING:** Only the Gem or Treasure icon is crossed off; the enemy itself remains on the Adventure table and can still be fought later (rewarding any remaining non-crossed-off loot icons it has, or no table loot if that Gem/Treasure was its only loot).
- **WHY:**
  - *For:* `"Treasures can be only taken once. After taking them, cross them off of the Adventure table"` (p18) and `"Each Gem can be only taken once. After taking them, cross them off of the Adventure table"` (p19)—"them" refers to the Treasures and Gems, in contrast to Bosses where `"everyone must cross that Boss off their game sheets. That Boss is gone for everyone!"` (p18). Many enemies on Sidesheets A, B, and C pair a Gem or Treasure with repeatable loot (e.g., Killer `[+][skull]`, Bandit Archer `[food][gem]`, Green Frog `[food][food][hammer]`, Evil Champion `[gem][heart]`). Furthermore, the Beast Tamer's Beast Whisperer skill states: `"Your future encounters with that specific animal in that particular position in the Adventure box should be treated as a free reward, as the animal is tamed for the whole match. These encounters still count as fights for the Animal Bond skill."` (p81)—and several animals on Sidesheets A–C only drop a Gem or Treasure (e.g., Frog Gang, Brown Hare, Brown Stag).
  - *Against:* No example explicitly walks through fighting an enemy a second time after its sole Gem or Treasure (such as Spear Bandit or Bandit Crew) has been crossed off.
- **CONFIDENCE:** high.
- **KIND:** text.
- **WOULD CHANGE MY MIND:** Designer errata stating that crossing off a Gem or Treasure removes the entire Adventure cell.

**6. Scoring "1 point for each hex traveled" (p25).**
- **READING:** Mountain and Water hexes that were crossed count (1 point each); the starting Village hex does not count.
- **WHY:**
  - *For:* `"1 point for each hex traveled!"` (p25). Movement counts every step—including crossed Mountains and Water—as a hex traveled: `"moving the number of hexes equal to the number of the boots shown"` (p12) and `"The number of Boots symbols indicates exactly the number of hexes you must travel – no more, no less –"` (p34), illustrated on p35 where a 2-boot `"3"` die starts from an `X` on Village 4, crosses 1 Mountain hex, and lands on 1 Forest hex (2 hexes traveled). Conversely, you are placed in your starting hex during Setup (p10) rather than traveling into it (`"From your starting position, mark your travel path"`, p12).
  - *Against:* `"you cannot travel to hexes you have already visited or passed by. This includes the starting hex."` (p36) groups the starting hex with visited hexes, and `"using more hexes to extend the match ... adds points to your final score!"` (p38) plus the `1 x [hex]` formula (p25, Map 1) could lead players in a print-and-play game to simply count every marked hex on the map, including the starting `X` or excluding unlandable Mountain/Water hexes.
- **CONFIDENCE:** high (crossed Mountains/Water count) / medium (starting hex does not count).
- **KIND:** gap.
- **WOULD CHANGE MY MIND:** A worked end-of-game scoring example from the publisher counting hexes on a completed map.

**7. Score after a defeat.**
- **READING:** No. In solo mode, dying or getting stuck is an immediate loss ("game over") and is not scored.
- **WHY:**
  - *For:* `"The game is won by beating these Bosses."` (p9), `"If you run out of hearts, game over!"` (p24), and `"If you get stuck in your own path, game over – or we can call it an early retirement!"` (p40). Under End of the Game: `"the game ends in the round the solo player defeats his second Boss ... After that, the game is over, and you win! Time to tally your points! In competitive mode, if all players die before defeating two bosses ... the highest score defines the winner."` (p25). Specifying dead-player scoring *only* as a tiebreaker `"In competitive mode, if all players die"` implies defeated solo runs do not tally a score.
  - *Against:* `"early retirement!"` (p40) could be read colloquially as ending the run early and tallying points, though p44–45 repeat `"the game is over"` for getting stuck without mentioning scoring.
- **CONFIDENCE:** high.
- **KIND:** text.
- **WOULD CHANGE MY MIND:** Designer confirmation that defeated solo runs still record a valid score.

**8. Water drawn two ways.**
- **READING:** There is no rules difference; plain ripples and cresting waves are purely cosmetic variations of Water hexes, and there is no separate terrain legend distinguishing them.
- **WHY:**
  - *For:* The rulebook only ever refers to `"Mountains and Water"` / `"Mountains or Water"` (p12, p34, p36, p41, p44, p69, p71; p71 flavor text mentions `"seas, rivers, and lakes"`), the Travel box and Sail Boat use a single boat icon for all Water, Sidesheets A–C list only the 7 land/POI columns (`GROVE`, `FOREST`, `PLAINS`, `SWAMP`, `VALLEY`, `VILLAGE`, `CASTLE`), and the pathing diagram on p38 crosses both cresting-wave hexes and plain-ripple hexes identically.
  - *Against:* None in the Hex Forest files (other than the visual difference itself on Map 1).
- **CONFIDENCE:** high.
- **KIND:** text.
- **WOULD CHANGE MY MIND:** Any rule in the unattached expansion rulebooks (*Lost Sands* / *Winter Tales*, p10) that retroactively distinguishes rough vs. calm water in Hex Forest.

**9. Warrior, Adrenaline.**
- **READING:** Unsettled in the text; the slightly stronger reading is that HP is checked when initiating Travel *before* paying that Travel's food/hunger/stuck costs (contrasting `"When travelling"` with `"After travelling"` on the same card, and matching `"remain"` on p106–107).
- **WHY:**
  - *For:* Card: `"ADRENALINE: When travelling, if you have 2[heart] or less: [Strength]+1"`; rulebook: `"when traveling, if you have 2 Heart Points or less, gain a Strength point."` (p106). Pages 106–107 explain how to trigger it: `"taking damage they otherwise wouldn’t to purposely remain below 2 Heart Points and gain the Adrenaline bonus every time they travel!"` (p106; note the tip loosely says `"below 2"` while the rule and card say `"2 ... or less"`) and using Magic Blood (`"After traveling"`, p107) `"to purposely remain below 2 Heart Points and gain the Adrenaline bonus every time they travel!"` (p107)—implying you enter the Travel action already at ≤2 HP.
  - *Against:* Page 12 describes paying Travel's food/HP cost *before* moving (`"Cross off the food you need for your Travel action from your Food box – or hearts from your HP box, if you don't have enough food to consume. From your starting position, mark your travel path"`), and other `"when you travel"` skills (e.g., Brawler Traveller's `"when you travel [6], Explore [6]"`, p104) resolve after moving. If you started Travel at 3 HP with 0 food and took 1 hunger damage to travel, checking *during/after* cost payment would trigger Adrenaline, and if you started at 2 HP and died from hunger/stuck penalties during Travel (p43: `"our adventurer died on his path!"`), checking before cost payment would grant Strength on a fatal move.
- **CONFIDENCE:** low.
- **KIND:** gap.
- **WOULD CHANGE MY MIND:** Any designer ruling on sub-step order within the Travel Phase.

**10. Warrior, Magic Blood.**
- **READING:** As many times as the player wishes (and has Heart Points to spend without dying) during the `"After travelling"` timing window each round.
- **WHY:**
  - *For:* Card: `"MAGIC BLOOD: After travelling , you may [lose a heart] to gain [Magic]+1"`. Immediately above it on the exact same card, Overcoming specifies `"OVERCOMING: When you [lose a heart] , gain [food] (once a round)"`, whereas Magic Blood omits `"(once a round)"`. Under the Druid, the rulebook explicitly establishes the convention that omitting `"once a round"` means repeatable: `"Note that both his second and last skills don’t have the "once a round" limitation!"` (p87).
  - *Against:* `"After traveling, you may take one damage to gain one Magic point."` (p107) is phrased in the singular tied to a specific timing trigger (`"After traveling"`), unlike the Druid's skills which have no timing trigger (`"[2 food], gain [Strength]+1 in a combat in the wilderness"` / `"[3 food], gain [Magic]+2 in the wilderness"`, p86), so it could be read as a single optional conversion upon finishing Travel.
- **CONFIDENCE:** medium.
- **KIND:** gap.
- **WOULD CHANGE MY MIND:** Designer confirmation on whether `"Before travelling, you may..."` / `"After travelling, you may..."` skills are single-trigger events or repeatable loops within that timing window.

**11. Archer, Cross Training.**
- **READING:** Only usable before travelling (not at any other time in the round), and usable as many times in that window as the player can pay 2 food each.
- **WHY:**
  - *For:* Timing: `"Active skills can be used at any time, unless otherwise stated."` (p22), and the Archer card (and p21, p76) explicitly states otherwise: `"CROSS TRAINING: Before travelling, you may [spend 2 food] [Strength]+1"`. Repeatability: Cross Training omits `"once a round"` (unlike 13 other skills across the roster that print `"once a round"`), matching the convention noted on p87 (`"don’t have the "once a round" limitation!"`).
  - *Against:* For timing, the prose summary on p76 (`"he consumes two food for a Strength point"`) omits `"Before travelling"`, though the card image right above it on p76 includes it. For repeatability, `"Before travelling, you may [spend 2 food] [Strength]+1"` could be read as a single trigger opportunity per Travel phase rather than a repeatable purchase.
- **CONFIDENCE:** high (only before travelling) / medium (repeatable multiple times per round).
- **KIND:** text (timing) / gap (repeatability).
- **WOULD CHANGE MY MIND:** Designer clarification on whether `"Before travelling, you may..."` can be activated multiple times in one round.

**12. Archer, Magic Berry.**
- **READING:** Unsettled, leaning toward 1 food per *event/effect* that raises Magic (so a single `[Magic]+2` reward grants 1 food, not 2), provided Magic is below 12 and actually increases.
- **WHY:**
  - *For:* Card: `"MAGIC BERRY: Every time you improve your [Magic], gain [food]"`; rulebook: `"earning him one food whenever he improves his Magic."` (p77). Both `"Every time"` and `"whenever"` refer to an occasion of improvement, and the card prints `[Magic]` without a `+1` (unlike the Berserker's Survivor on p82, which specifically writes `"you may gain [food] instead of [Strength]+1"`). Also, at level 12 `"any attribute point gained is ignored"` (p22), so Magic is no longer improved.
  - *Against:* `"Whenever we gain attribute points, we should paint them in our attribute box, from level 1 to 12."` (p22) treats multi-point gains (`[Magic]+2` on Explore/Relic tables, `[Magic]+3` from an Attribute Cart on p68, or multiple `[+]` icons allocated to Magic) as painting individual levels from 1 to 12, which supports reading each +1 painted as improving Magic once.
- **CONFIDENCE:** low.
- **KIND:** gap.
- **WOULD CHANGE MY MIND:** A designer ruling or example showing Magic Berry resolving on a `[Magic]+2` or `[Magic]+3` reward.

**13. Mage, Enchant.**
- **READING:** Yes, Enchant may be used against a Boss.
- **WHY:**
  - *For:* Card (and p94): `"ENCHANT: When in combat, you can [lose a heart] to use [Magic] instead of [Strength]"`. The rulebook explicitly names Boss fights `"Boss Combats"` (p17) and calls Bosses `"really strong enemies"` (p17). By contrast, when a skill is restricted to the Adventure table and excluded from Bosses, the card and rules say so explicitly—compare the Paladin's Holy Light: `"HOLY LIGHT: [spend 3 food] , defeat an enemy in adventure"` (p96) and `"This skill can be used against ANY enemy in the Adventure box."` (p97).
  - *Against:* The explanation and example on p94–95 only illustrate `"a Bandit"` (an Adventure-type enemy) and do not explicitly mention Bosses.
- **CONFIDENCE:** high.
- **KIND:** text.
- **WOULD CHANGE MY MIND:** Designer errata restricting `"When in combat"` skills to the Adventure table.

**14. Which heart losses count for skills that react to losing a heart?**
- **READING:** Both Overcoming and Mana Shield apply to combat/Boss damage, Explore `[lose a heart]` costs, hunger (unpaid food in Travel or Explore), and self-inflicted skill costs (such as Enchant or Magic Blood). They also apply to the 2 HP stuck-crossing penalty under the card iconography, though the prose leaves a slight doubt on stuck penalties.
- **WHY:**
  - *For:* Both cards trigger on the `[crossed-off heart]` icon itself—Warrior: `"OVERCOMING: When you [lose a heart] , gain [food] (once a round)"`; Mage: `"MANA SHIELD: You can [spend a food] to resist [losing a heart] once a round"`—and the rulebook treats `[crossed-off heart]`, `"lose HP / Heart Points"`, and `"take damage"` as synonymous across sources:
    - *Combat & Bosses:* `"take damage equal to the difference"` (p16), `"lose 3 HP"` (p18), `"take 2 extra damage from Bosses"` (p31).
    - *Explore heart costs:* Sidesheets A–C and p14 print the exact same `[crossed-off heart]` icon used on Overcoming and Mana Shield.
    - *Hunger:* Explicitly called damage in both Travel (`"if you can't pay the food price, you take damage instead. Cross off ... hearts from your HP box"`, p12) and Explore (`"you take one damage for each food you couldn’t pay!"`, p14; `"would have taken 2 damage"`, p47).
    - *Self-inflicted skill costs:* Explicitly confirmed for Mana Shield + Enchant (`"By using Mana Shield before Enchant, you can consume one food to resist the Enchant damage."`, p95; compare Paladin's Divine Shield + Sacrifice on p97) and for Overcoming + intentional/Magic Blood damage (`"taking damage they otherwise wouldn’t to purposely remain below 2 Heart Points"`, p106; `"After traveling, you may take one damage ... use Magic Blood in addition to Overcoming"`, p107).
    - *Stuck-crossing penalty:* Crosses off hearts in the HP box with the same slash (p42–43 figures), matching the `[crossed-off heart]` icon on the cards, and Expert Mode summarizes all heart loss with `"Everything in the game causes double damage."` (p27).
  - *Against:* For the stuck-crossing penalty specifically, p41 calls it `"paying a penalty of 2 Heart Points"` rather than `"damage"` (compare p79, where the Bard's Steadfast Ballad notes `"does not allow you to skip the payment of penalties for crossing Mountains/Water"`), and for Fool's Gambit p92 says `"paying 1 Heart Point"`. If the prose word `"damage"` (p95, p106) were read narrower than the `[crossed-off heart]` icon, a "penalty" might not be "damage"—and using Mana Shield to pay 1 food to resist 1 HP of hunger when you had 0 food to pay for Travel/Explore can only happen if you somehow gain food first (otherwise you have no food to spend on Mana Shield anyway).
- **CONFIDENCE:** high (combat, Bosses, Explore heart costs, hunger, and self-inflicted skill costs) / medium (stuck-crossing penalty).
- **KIND:** text (for the first four) / gap (whether the stuck-crossing "penalty" counts as damage/preventable heart loss).
- **WOULD CHANGE MY MIND:** Designer errata distinguishing `"damage"`, `[crossed-off heart]` costs, and `"penalties"`.
