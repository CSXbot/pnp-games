# Researcher's reading of the 14 questions, 2026-11-27 - first run, PARTIAL sources

**Superseded by `2026-11-27-researcher-reading-2.md`.** This run had only part of the rulebook
(rule chapters as text, no figures, no other characters' pages), which was the tech lead's mistake;
the second run had the whole rulebook PDF. Kept because the two runs agree on most questions
without sharing context.

`gemini-4-carbon` (Google's strongest Gemini 4 model), asked **blind**: it was given the questions
as worded in `brief-2026-11-27.md`, the rulebook's rule pages as text (p10-25, 34-54, 66-73 and the
Warrior, Archer and Mage pages), the top of map 1 at native resolution, sidesheet A in four crops
and the three cards. It was **not** shown the tech lead's proposals in `SPEC.md`. It was asked for a
reading, the evidence for and against, confidence, whether the text settles it ("text") or it is a
genuine gap, and what would change its mind. Its answer follows unedited. Quotes in it are checked
by the tech lead before anything relies on them.

---

**1. May an action die be left unused?**
- **READING:** Yes. Travel is the only mandatory die action in a normal round; the player may decline to use one or both remaining dice in the Main phase.
- **WHY:** The rulebook explicitly marks mandatory actions when intended: *"everybody has to Travel"* (p12), *"Travel is mandatory, as heroes don’t sit around!"* (p34), and Brawler's skill *"this Explore action is mandatory, you cannot avoid it!"* (p105). By contrast, Main phase actions use permissive phrasing: *"you can Explore twice"* (p14), *"Since we can explore twice in a round, we choose to do so"* (p47), *"you can adventure twice"* (p49), *"It is not mandatory to discover Gifts"* (p20), and after beating the final Boss *"players may continue with their round actions, if they still have one die to use"* (p25). **Against:** p13 states declaratively, *"Here we use the remaining two dice to take actions"*, and no sentence explicitly says an action die may be discarded unused.
- **CONFIDENCE:** High.
- **KIND:** Gap (strongly implied by contrast, and consistent with standard PnP roll-and-write conventions, which I note explicitly here, though never stated as an explicit "pass" rule).
- **WOULD CHANGE MY MIND:** Full Brawler text on p105 showing "mandatory" only overrides choosing *Adventure instead of Explore*, or a designer FAQ stating all three dice must be spent every round.

**2. The "stuck" crossing.**
- **READING:** It applies only when *none* of the three rolled dice offers any normal legal Travel path. When triggered, the 2 HP penalty applies only to each Mountain or Water hex that the *chosen* die cannot normally cross (so a `4` crosses Water for 0 HP penalty and pays 2 HP only for each Mountain crossed).
- **WHY:** p41: *"If you get to a point where your only movement option is to cross Mountains or Water, but lack the specific die for that, you may cross them with any other die, paying a penalty of 2 Heart Points for each Mountain or Water crossed in this way."* Having another die with a normal legal move means either crossing Mountains/Water is not *"your only movement option"* or you do not *"lack the specific die for that"*. For mixed terrain on a `4`, p41 specifies *"crossed in this way"* (i.e., lacking the specific die) and p42 clarifies *"as we would cross two Mountains without the correct die"*—with a `4`, Water *is* crossed with the correct die (Boat icon). **Against:** *"with any other die"* on p41 could be read loosely as allowing penalty movement on a non-matching die even if another rolled die had a legal path, or charging 2 HP for *all* Water/Mountains on a trajectory that relies on the unstuck rule.
- **CONFIDENCE:** High.
- **KIND:** Text.
- **WOULD CHANGE MY MIND:** A rulebook example where a player rolled one legal normal move (e.g., into a dead end) and still legally invoked the unstuck rule with another die, or paid 2 HP for Water while using a `4` or `5`.

**3. Sail Boat and Trusty Donkey.**
- **READING:** One additional hex total per Travel action (not per Water/Mountain hex crossed), and the extra hex is optional.
- **WHY:** Optionality is explicit in both the rulebook (*"When crossing Water, you **may** also move one additional hex"*, p71; same for Mountains, p72) and Sidesheet A's Gift box for Trusty Donkey (*"Travel **may**: +[boot][mountain]"*), overriding normal Travel's *"no more, no less"* (p34). For the cap of +1 total per Travel, both the rulebook (*"When crossing..., move one additional hex"*) and the sheet icon (*"Travel may: +[1 boot]"*) frame the bonus per Travel condition, unlike p41 which explicitly writes *"for each Mountain or Water crossed"* when per-hex scaling is intended. **Against:** *"When crossing Water/Mountains"* could be read as a trigger firing each time you step across a Water/Mountain hex during the same move.
- **CONFIDENCE:** High.
- **KIND:** Text.
- **WOULD CHANGE MY MIND:** Designer clarification or an expansion example moving +2 hexes after crossing two Water or Mountain hexes with Sail Boat or Trusty Donkey.

**4. A full Food or HP box.**
- **READING:** Yes—both boxes track *lifetime total gained* (painted once when gained, crossed off once when spent/lost), so once all 50 food diamonds or all 32 hearts on the card have been painted, further gains are lost. The p29 reference to a *"40th heart"* is an editing mismatch against a 32-heart graphic (8 rows × 4, shortened by 2 rows relative to the 10-row Food box to fit the *"LEGEND OF HEXDOM"* logo underneath).
- **WHY:** Gaining paints empty icons in sequence (*"Food points must be painted from left to right, and from top lines to bottom lines"*, p23) while spending/damage crosses painted icons (*"Cross off the food... from your Food box – or hearts from your HP box"*, p12; *"Every time you lose life, you should cross that number of Hearts in the HP box"*, p24). Because Food unlocks skills/attributes at fixed positions (p23), slots cannot be erased and reused. Legacy p29 (*"your Food box filled to the maximum and totally used"*) confirms the box represents a cumulative *"maximum"*. Visually on the character cards, Food is 10×5 (50) extending to the bottom border, whereas HP is 8×4 (32) stopping two rows early above the logo—10×4 would have been 40 hearts. **Against:** Only Attributes explicitly state *"After level 12, any attribute point gained is ignored"* (p22); Food and HP omit that sentence, and p29's *"fill your 40th heart"* literally implies gaining at least 40 hearts is possible (e.g., by drawing extra hearts in Notes) unless it is a leftover typo.
- **CONFIDENCE:** Medium.
- **KIND:** Gap (cumulative tracking is settled by text, but hard-capping HP/Food vs. overflow tracking in Notes—especially given *"40th heart"*—is not explicitly stated in base rules).
- **WOULD CHANGE MY MIND:** Another character sheet or Legacy sheet printing 40 hearts, or a designer note explaining whether overflow hearts/food can be drawn outside the box.

**5. An enemy whose gem or Treasure has been taken.**
- **READING:** Only the Gem or Treasure icon is crossed off; the enemy remains on the Adventure table and may still be fought later (giving any remaining non-unique loot, or no loot if none remains, while still counting as an Adventure action).
- **WHY:** p18: *"Treasures can be only taken once. After taking them, cross **them** off of the Adventure table"* and p19: *"Each Gem can be only taken once. After taking them, cross **them** off of the Adventure table"*. Contrast Bosses (p18: *"cross **that Boss** off their game sheets. That Boss is gone for everyone!"*) and Gifts (p20: *"crossed out of everyone's playsheet"*). On Sidesheet A's Adventure table, many enemies carry standard repeatable loot alongside a Treasure or Gem (e.g., Forest 3–4 `[food][gem]`, Forest 5–6 `[+][skull]`, Swamp 1–2 `[food][food][hammer]`, Valley 1–2 `[food][book]`, Valley 3–4 `[food][spear]`). **Against:** Several enemies carry *only* a Gem or Treasure (e.g., Forest 1–2, Swamp 3–4, Village 1–2, Castle 1–4), making a repeat fight yield zero loot unless used for triggers like Archer's *Focus* or *Skill Flame*.
- **CONFIDENCE:** High.
- **KIND:** Text.
- **WOULD CHANGE MY MIND:** Designer errata stating defeated Treasure/Gem enemies cannot be encountered again.

**6. Scoring "1 point for each hex traveled" (p25).**
- **READING:** The starting hex does *not* count; Mountain and Water hexes crossed *do* count (i.e., you score 1 point per hex step moved along your Travel line).
- **WHY:** Setup places you on the starting Village by die roll before any Travel occurs (p10), p12 instructs *"From your starting position, mark your travel path... moving the number of hexes equal to the number of the boots"*, and p36 distinguishes *"already visited or passed by. This includes the starting hex"* (you started there; you did not travel it). For Mountains and Water, p34 defines *"how many hexes we travel"* directly as *"The number of Boots symbols indicates exactly the number of hexes you must travel"*, and p35/p44 confirm crossing a Mountain or Water consumes 1 Boot of movement just like any other hex. **Against:** p38 informally links scoring to visited hexes (*"Only a few hexes were left unvisited. Remember that using more hexes to extend the match... also adds points to your final score!"*), which could suggest counting landed-on hexes (or even including the starting hex).
- **CONFIDENCE:** Medium.
- **KIND:** Text (settled if p34's equivalence between *"hexes you must travel"* and Boots moved is read strictly; borders on a gap only because p25 lacks a scored-map example).
- **WOULD CHANGE MY MIND:** A scored example map from the publisher counting landed hexes only, or counting the starting Village.

**7. Score after a defeat.**
- **READING:** No. In solo mode, a lost game (running out of hearts or getting stuck) is an immediate *"game over"* without tallying a final victory score.
- **WHY:** p24: *"If you run out of hearts, game over!"*; p40: *"If you get stuck in your own path, game over"*. On p25, scoring follows winning (*"the game ends in the round the solo player defeats his second Boss... After that, the game is over, and you win! Time to tally your points!"* and *"Not only beat the game, but compete for the highest score!"*). Immediately below, p25 adds an explicit exception *only* for competitive multiplayer: *"In competitive mode, if all players die before defeating two bosses... the highest score defines the winner."* **Against:** Nothing physically stops a solo player from summing points on a dead sheet, and p25 introduces the scoring bullets generally as *"all the points we can achieve during a Legend of Hexdom match"*.
- **CONFIDENCE:** High.
- **KIND:** Text.
- **WOULD CHANGE MY MIND:** Legacy/campaign rules (e.g., around p29) instructing solo players to tally scores even on failed runs.

**8. Water drawn two ways.**
- **READING:** No rules difference in Hex Forest; the cresting wave and plain ripples are purely artistic variations of Water. There is no published terrain legend distinguishing them.
- **WHY:** Sidesheet A lists columns for all interactive terrains (Grove, Forest, Plains, Swamp, Valley, Village, Castle) and uses a single Sailboat icon in the Travel/Gift boxes. Throughout the rulebook (p12, p34, p36, p41, p69, p71), all dark-grey aquatic hexes are referred to solely as *"Water"*. **Against:** Map 1 draws a distinct large wave on the far-left coastal hex versus smaller ripples inland, and p10/p39 note expansion campaigns have special terrain mechanics—conceivably reused artwork or an unused visual distinction.
- **CONFIDENCE:** High.
- **KIND:** Text.
- **WOULD CHANGE MY MIND:** Any mention of "Sea/Ocean" vs. "Lake/River" in the unexcerpted pages of the 1.2 rulebook or Hex Forest map notes.

**9. Warrior, Adrenaline.**
- **READING:** Hearts are checked when initiating Travel, *before* paying that Travel action's food-shortage or unstuck-crossing HP losses.
- **WHY:** Both p106 and p107 describe triggering Adrenaline by losing HP in prior steps *"to purposely **remain** below 2 Heart Points and gain the Adrenaline bonus every time they travel!"*—*"remain"* implies entering the Travel action already at 2 HP or less (carrying that state over from previous combat or post-Travel *Magic Blood*). **Against:** p12 places paying the Travel food/HP cost *before* moving on the map (*"Cross off the food... or hearts... From your starting position, mark your travel path"*), so if *"When travelling"* (Warrior card) spans the movement step after paying costs, dropping to 1–2 HP from Travel starvation or an unstuck penalty while surviving would satisfy *"if you have 2 [hearts] or less"* during that Travel.
- **CONFIDENCE:** Low.
- **KIND:** Gap.
- **WOULD CHANGE MY MIND:** A designer ruling or playthrough example where a Warrior at 3–4 HP takes non-lethal starvation/unstuck damage during Travel and either gains or does not gain Adrenaline on that same move.

**10. Warrior, Magic Blood.**
- **READING:** As many times as the player wants (and can survive paying) in the window immediately after travelling.
- **WHY:** Under p22, optional resource-spending skills are Active skills (*"Active skills can be used at any time, unless otherwise stated. Using skills is not mandatory, and they usually cost valuable resources"*), making *"After travelling"* a timing restriction rather than a once-per-round cap. Whenever the designer intended a once-per-round limit, they wrote it explicitly—including on *Overcoming* (`(once a round)`) right above *Magic Blood* on the very same Warrior card, and on Mage's *Mana Shield* (`once a round`, p95: *"Once per round, she can consume one food to resist one damage"*). Repeating *Magic Blood* also explains how a Warrior at 4 HP can use *Magic Blood* *"as an alternative [to Overcoming] to purposely remain below 2 Heart Points"* (p107) in a single round. **Against:** p107 writes *"After traveling, you may take **one** damage to gain **one** Magic point"*, using the same `When/After [event], you may [do X]` template as *Sail Boat*/*Trusty Donkey* (p71–72), where the designer may have assumed a single binary choice per Travel since Travel occurs only once per round (p35).
- **CONFIDENCE:** Low.
- **KIND:** Gap.
- **WOULD CHANGE MY MIND:** Other character sheets in p74–107 showing explicit `"any number of times"` wording on repeatable skills (which would prove absence of `"any number of times"` means once per trigger), or a designer FAQ.

**11. Archer, Cross Training.**
- **READING:** Only before travelling (in the Travel phase prior to resolving Travel), and as many times in that window as the player wants to pay 2 food each.
- **WHY:**
  - *Only before travelling:* Yes—the Archer card explicitly states *"Before travelling, you may [spend 2 food] [Strength]+1"*. On p21–22, immediately after displaying the Archer's sheet as the example, p22 states: *"Active skills can be used at any time, **unless otherwise stated**."* *"Before travelling"* is that explicit timing restriction.
  - *Uses per round:* Repeatable while you have food, for the same textual reason as Q10: Active skills lack a per-round cap unless stated (contrast `once a round` on *Mana Shield* and *Overcoming*).
  - **Against:** p76 omits the timing restriction in its flavor/summary prose (*"Over a rigorous training regimen, he consumes two food for a Strength point"*), and for repeatability, `"Before travelling, you may [2 food] [Strength]+1"` / *"consumes two food for a Strength point"* can be read as a single optional exchange triggered once when about to Travel.
- **CONFIDENCE:** High for *"only before travelling"*; Low for *"multiple times per round"*.
- **KIND:** Text for *"only before travelling"*; Gap for *"how many times per round"*.
- **WOULD CHANGE MY MIND:** Same as Q10 for repeatability (other character cards using explicit `"any number of times"` phrasing, or a designer ruling).

**12. Archer, Magic Berry.**
- **READING:** One food per *event/effect* that increases Magic (so a Relic reward of `[Magic]+2` grants 1 food, while spending multiple separate `[+]` attribute-choice icons on Magic grants 1 food per `[+]` resolved; gaining Magic while already at level 12 grants 0 food).
- **WHY:** Both the card (*"**Every time** you improve your [Magic], gain [food]"*) and p77 (*"earning him one food **whenever** he improves his Magic"*) count *occurrences* (*"Every time"* / *"whenever"*), not points—unlike rules that scale per unit, which consistently say *"for each"* (p14, p25, p41). At level 12, *"any attribute point gained is ignored"* (p22), so Magic does not improve. **Against:** p22 instructs *"Whenever we gain attribute points, we should paint them in our attribute box, from level 1 to 12"*; if painting each circle on the Magic track is treated as an improvement, `[Magic]+2` would yield 2 food (and avoids treating `[Magic]+2` differently from two `[+]` icons).
- **CONFIDENCE:** Low.
- **KIND:** Gap.
- **WOULD CHANGE MY MIND:** Designer clarification on how *Magic Berry* interacts with a `[Magic]+2` Relic bonus.

**13. Mage, Enchant.**
- **READING:** Yes, *Enchant* may be used in Boss Combats (comparing Magic against the Boss's Strength requisite, though not replacing the missing-Treasure 3 HP loss).
- **WHY:** The card says *"When in combat"*, and p17 explicitly titles Boss fights **"Boss Combats"**, defines Bosses as *"really strong enemies"*, and states they use *"the normal attribute requisites comparison"*. Moreover, p94 specifically highlights using *Enchant* against *"enemies that require both Strength and Magic attributes"* so Magic is compared to both—which directly applies to Bosses like Gast (`[Strength] 12` + `[Magic] 8`) and Stuker (`[Magic] 12` + `[Strength] 8`). **Against:** p94–95 only illustrates *Enchant* against an Adventure enemy (a Bandit), and p17 treats *"Bosses"* as a separate Main phase action from *"Adventure"*.
- **CONFIDENCE:** High.
- **KIND:** Text.
- **WOULD CHANGE MY MIND:** Explicit designer errata stating Boss Combats disallow combat skills or *Enchant*.

**14. Which heart losses count for skills that react to losing a heart?**
- **READING:** *All* of them count—combat damage (Adventure and Bosses, including missing-Treasure HP loss), Explore `[crossed heart]` costs, hunger/starvation (unpaid Travel or Explore food), the unstuck-crossing HP penalty, and self-inflicted skill costs such as *Enchant* and *Magic Blood*.
- **WHY:** The cards define both *Overcoming* and *Mana Shield* purely by the `[crossed heart]` icon—the exact same icon printed on the Explore table (e.g., Swamp 1–2, Forest 3–4, Castle 1–2) and on *Enchant* and *Magic Blood*. In prose, the rulebook treats *"take damage"*, *"lose life"*, *"lose Heart Points"*, and `[crossed heart]` as synonymous:
  - *Self-inflicted skill costs:* Explicitly confirmed on p95 (*"By using Mana Shield before Enchant, you can consume one food to resist the Enchant damage. This combo effectively makes Enchant cost one food!"*), and p107 calls *Magic Blood* *"take one damage"*, matching p106 *Overcoming* (*"each round you take damage"*).
  - *Hunger:* Explicitly called *"take damage"* on p12 (Travel), p14 (Explore), and p47 (*"taken 2 damage"*).
  - *Explore costs & Unstuck penalty:* Explore prints the `[crossed heart]` icon directly; unstuck crossing costs *"2 Heart Points"* (p41), and p24 unifies all HP losses under crossing hearts (*"Every time you lose life, you should cross that number of Hearts in the HP box"*).
  - **Against:** p41 calls the unstuck cost *"paying a penalty of 2 Heart Points"* (and p18 says *"lose 3 HP"* for a missing Boss Treasure) rather than *"damage"*, while the rulebook prose for *Overcoming* (p106) and *Mana Shield* (p95) translates `[crossed heart]` as *"damage"*—so a narrow prose reading could exclude "penalties" or non-damage HP losses if distinguished from *"damage"*.
- **CONFIDENCE:** High (Medium only for the unstuck-crossing *"penalty"*).
- **KIND:** Text (explicitly settled for combat, *Enchant*/*Magic Blood*, Explore `[crossed heart]`, and hunger; minor gap only if *"penalty"* on p41 were distinguished from `[crossed heart]`).
- **WOULD CHANGE MY MIND:** Designer errata distinguishing HP *"penalties"* or hunger from `[crossed heart]` / *"damage"* triggers.
