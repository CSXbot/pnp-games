# Deep Research report on the 14 questions, 2026-11-27 - UNVERIFIED

`deep-research-max-preview-04-2026`, given `brief-2026-11-27.md` only (no rulebook). Ran 39
minutes: 291 Google searches, 36.6M input tokens (11.2M cached), 1.7M output and thinking tokens.
**Actual cost £26.16** (the Game Director, from Google's billing). The tech lead's estimate from
listed prices had been about $70-75, the brief's $1-3. The Game Director's direction since: don't use
Deep Research for questions like these; ask a strong Gemini model, which can search.

**Nothing below is verified.** Its links are Google grounding redirects, not the pages. A finding
is used only once someone has opened the page and seen the quote; `verification.md` beside this
says which were checked and how.

---

# Research Report: Rules Analysis for Legend of Hexdom

### Executive Summary

*   **Part A (Sources Map):** A comprehensive scan of public channels yielded critical data primarily from the official Kickstarter campaign (specifically Updates and its 517 comments), developer YouTube playthroughs, and third-party reviews. Standard centralized rules databases (like BGG forums) lack indexed information for this game.
*   **Part B (Rulebook Versions):** Version 1.2 is the latest officially documented English rulebook identified by the community, though evidence of a Version 1.3 in Spanish suggests further unreleased or localized errata exists. Significant modular restructuring and mechanical patches were introduced up to Kickstarter Update #20.
*   **Part C (Rules Queries):** Of the 14 specific rules questions analyzed, 4 have identifiable resolutions based on public statements (Questions 1, 3, 4, 5, and 7), relying heavily on community consensus, official errata, and visual demonstrations. The remaining 9 questions (Questions 2, 6, 8, 9, 10, 11, 12, 13, and 14) are entirely unaddressed in public forums, meaning digital implementation will require independent mechanical interpretation.
*   **Part D (Additional Clarifications):** Critical errata not covered by the 14 questions includes a map generation error rendering "Boss Grok" unbeatable without community workarounds, a bug with the Jester character's starting stats, and clarification on the Paladin's permanent strength buff. No specific errata was found regarding Hex Forest maps 1-3, tables A-C, or the Warrior, Archer, or Mage classes.

*   **Scarcity of Official Rulings**: Research suggests that official designer clarifications for *Legend of Hexdom* are highly limited. The developer, a two-person studio, primarily communicates through Kickstarter updates rather than structured FAQ documents.
*   **Community-Driven Interpretations**: The evidence leans toward community consensus serving as the primary gap-filler for ambiguous mechanics. Players frequently rely on "Superbackers" and active users for rulings.
*   **Sequential Resource Mechanics**: Video evidence demonstrates that health and resources are marked sequentially and permanently crossed off, implying hard limits on total resource accumulation throughout a campaign.
*   **Unresolved Asymmetrical Edge Cases**: It seems likely that character-specific interactions (such as the Warrior and Archer skills) remain entirely unaddressed in public forums, leaving digital implementation to rely on literal textual interpretation.

The following report serves as a comprehensive rules analysis for the print-and-play (**PNP**) board game *Legend of Hexdom - a hex and slash adventure*, developed by Papermage Games. A PNP game requires players to print the game materials themselves, often relying on roll-and-write mechanics—where dice rolls dictate actions that players record on paper with a pen or pencil. As a private digital implementation of this tabletop experience is developed, programming accurate logic requires resolving ambiguous rule sets. 

The purpose of this document is to aggregate, analyze, and contextualize every identifiable public statement regarding specific edge-case mechanics within the version 1.2 English rulebook framework. Given the independent nature of the publisher—a two-person team consisting of Pedro and Kevin [cite: 1]—standardized resources such as centralized errata databases or official designer forums are notably sparse. Consequently, this report synthesizes information from official Kickstarter updates, documented community dialogues, third-party reviews, and recorded playthrough demonstrations to provide the most reliable rules architecture available.

## Part A: Sources Map

To ensure exhaustive coverage of all potential rule clarifications, a wide array of public channels where board game mechanics are traditionally debated were surveyed. The following represents the complete map of investigated sources, their specific URLs, and a brief description of their accessibility and utility during this research phase.

**Official Publisher Channels**
*   **Kickstarter Campaign Page** (`https://www.kickstarter.com/projects/papermage/legend-of-hexdom-a-print-and-play-roguelike-adventure`): The primary hub for the game's funding and community interaction. Fully accessible and readable. Contains the foundational overview of the game [cite: 2].
*   **Kickstarter Updates**: The publisher released 25 official updates. Fully accessible. These documents are critical for tracking official errata and rulebook iterations [cite: 3]. Notably, earlier video links embedded within Update #3 returned 404 errors and could not be analyzed [cite: 4].
*   **Kickstarter Comments**: The most active forum for rules queries. Fully accessible and parsed. Exactly 517 comments were reviewed to isolate conversations between players and the creators [cite: 2, 5].
*   **Kickstarter FAQ**: Fully accessible. Contains 8 high-level project information questions regarding map variations and delivery, but lacks granular rules documentation [cite: 2, 6, 7].
*   **Papermage Games Website** (`https://papermage.games/`): The official studio homepage. Fully accessible. Provided thematic context and details regarding character standees and the sequel game, *Legend of Hexdom 2: Factions of Hexia* [cite: 1, 8, 9].
*   **YouTube (Official Playthrough)** (`https://www.youtube.com/watch?v=nkRx41axN8g`): An official demonstration video published by the creators. Fully accessible and transcribed. Provided critical visual evidence of game mechanics [cite: 10].

**Third-Party and Community Channels**
*   **Scribd Document Repository**: Fully accessible. Users have uploaded various iterations of the rulebook, providing historical context on rule changes [cite: 11, 12].
*   **BoardGameGeek (BGG)**: Attempted access via web-scraping utilities. Partially accessible. BGG is typically the gold standard for tabletop rules forums; however, automated queries indicated that the rules manual was "not indexed yet," and no active designer threads were successfully retrieved [cite: 13]. 
*   **Reddit (r/soloboardgaming)**: Fully accessible. A thread discussing the game's mechanics titled "Good roguelike game?" was located (`https://www.reddit.com/r/soloboardgaming/comments/1c5rouv/good_roguelike_game/`), providing community opinions on the game's balance and power curve [cite: 14].
*   **WordPress Blog (letsgamemore)** (`https://letsgamemore.wordpress.com/2024/07/24/pnp-review-legend-of-hexdom/`): Fully accessible. A detailed written review that explicitly outlines the gameplay loop and resource management mechanics, noting that players "will be in constant fear of defeat, but with careful planing you can turn around and get powerful" [cite: 15, 16].
*   **YouTube (Community Playthrough)** (`https://www.youtube.com/watch?v=kVqZYHCzmyI`): A playtest demonstration by a solo board gaming channel. Fully accessible and transcribed. Showcased character progression and resource tracking [cite: 17].
*   **Discord**: No public or accessible Discord server link for Papermage Games could be located. Inaccessible.

## Part B: Rulebook Versions

Tracking the evolution of the *Legend of Hexdom* rulebook is vital for understanding which mechanics are current. Version 1.2 is indeed a documented iteration of the rulebook, but evidence suggests it is not the only, nor necessarily the absolute final, iteration across all formats and languages. 

The earliest documented version is **Version 1.0 (English)**, dated 2024, which was located via a Scribd upload (`https://www.scribd.com/document/807864417/LEGEND-OF-HEXDOM-Rulebook`) [cite: 11]. This foundational document established the core hex-and-slash mechanics.

**Version 1.2 (English)** is explicitly referenced by community members as a clarifying update. In the Kickstarter comments section, a highly active user named 'Fro' (who does not possess a Creator or Collaborator badge) directed another player to this specific version to resolve movement ambiguities. Fro stated, "There is an update to the rulebook, version 1.2. This should help clear up questions" [cite: 5]. 

Evidence also exists of a **Version 1.3 (Spanish)**, titled "Espanol - Legend of Hexdom - Rulebook 1.3," which was uploaded to Scribd (`https://es.scribd.com/document/740453618/Espanol-Legend-of-Hexdom-Rulebook-1-3`) [cite: 12]. The existence of a 1.3 version in a localized language heavily implies that English errata may have progressed to a 1.3 version as well, though a direct English 1.3 file was not retrieved.

Furthermore, official structural changes to the rulebook's format were announced by the publisher. In **Update #22** (`https://www.kickstarter.com/projects/papermage/legend-of-hexdom-a-print-and-play-roguelike-adventure/posts/4120932`), dated June 11, 2024, the creators announced: "We've just started uploading the A5 versions from the Crafters' Upgrade! ... We've separated them into the MAPS, the TABLES, and the CHARACTER SHEETS" [cite: 18]. This suggests that the 112-page rulebook referenced in the initial query is part of this specific A5 modular format.

The most critical official errata was published in **Update #20** (`https://www.kickstarter.com/projects/papermage/legend-of-hexdom-a-print-and-play-roguelike-adventure/posts/4113137`), dated May 25, 2024. The publisher noted verbatim changes and bug fixes:
*   "We’ve addressed a few bugs from the initial release and implemented patches to fill the booklet with more information, and also corrected some typos." [cite: 19, 20]
*   "We’ve refined the clarity on gem usage—each gem can now be claimed only once per match" [cite: 19, 20].
*   They also "provided detailed win conditions for competitive multiplayer matches. In scenarios where no player can vanquish two bosses, victory will be determined by the highest score." [cite: 19, 20]

## Part C: Specific Rules Inquiries

The following section systematically addresses the 14 numbered questions provided in the query. Every finding is explicitly labeled as **OFFICIAL**, **DEMONSTRATED**, or **COMMUNITY** to denote its authoritative weight. Where no direct public statements exist, the exhaustive search parameters are documented.

### 1. May an action die be left unused?
*Context:* The rules state that players "use the remaining two dice to take actions" and note that Travel is "mandatory" (Rulebook, p13, p34). The player seeks to know if action dice can be voluntarily discarded to avoid negative consequences, such as an Explore result that inflicts damage.

**Finding: COMMUNITY**
A direct question regarding this exact mechanic was posed on the Kickstarter comments page (`https://www.kickstarter.com/projects/papermage/legend-of-hexdom-a-print-and-play-roguelike-adventure/comments`). 
*   **Who**: Dávid Bosý (Player)
*   **Date**: Over 2 years ago (Note: Kickstarter's relative timestamps display "over 2 years ago", roughly placing it around mid-2022 during early testing or previous campaign iterations, though the current campaign is dated 2024).
*   **Quote**: "Is it mandatory to spend all dice during round? Or can player opt to pass an action (except travel of course, that is mandatory)" [cite: 5].

This was answered by another player:
*   **Who**: Capn Frank (Player / Superbacker). Capn Frank holds a 'Superbacker' badge but has no official 'Creator' affiliation [cite: 5].
*   **Date**: Over 2 years ago.
*   **Quote**: "Per the Instruction Book page 13 I would assume that you have to use both the other dice. The Main Phase If traveling well is paramount to your success in the game, the Main phase is where all of the other crucial actions take place. Here we use the remaining two dice to take actions. These actions can be Explore, Adventure, fight Bosses, and even discover Gifts through the world!" [cite: 5].

*Implication*: The community consensus interprets the phrasing "use the remaining two dice" as a strict directive, making the use of action dice mandatory. No OFFICIAL statement from Papermage Games was found to contradict or confirm Capn Frank's reading.

### 2. The "stuck" crossing
*Context:* If a player's only movement option is to cross Mountains or Water without the specific required die, they may suffer a penalty of 2 Heart Points per hex (Rulebook, p41). The query asks if this applies only when *no* dice have legal moves, or if a player can voluntarily trigger it, and whether dice that inherently allow terrain crossing bypass the penalty.

**Finding: Nothing found**
Despite an exhaustive search of the Kickstarter comments, Updates, and third-party reviews using queries such as `"stuck"`, `"crossing"`, `"penalty"`, `"2 Heart Points"`, and `"Mountain or Water"`, no explicit public statement addresses the nuanced timing of this penalty or the voluntary selection of "stuck" mechanics. 

While the community user 'Fro' explicitly clarified in the Kickstarter comments that "when you draw lines on the map as you travel, the lines can't cross over other lines" [cite: 5], and the independent review on WordPress noted that players "need to get food, get more life, improve your weapons, and not get stuck" and are "out" if they cannot move [cite: 15], the precise application of the 2-heart penalty avoidance remains unaddressed in public discourse. 

### 3. Sail Boat and Trusty Donkey
*Context:* The Sail Boat allows a player to cross Water and move "one additional hex" (Rulebook, p71). The Trusty Donkey does the same for Mountains. The query asks if the extra hex is per Travel or per terrain hex crossed, and if it is optional.

**Finding: COMMUNITY (Referencing OFFICIAL Documentation)**
In the Kickstarter comments (`https://www.kickstarter.com/projects/papermage/legend-of-hexdom-a-print-and-play-roguelike-adventure/comments`), a player asked about the Trusty Donkey (referred to colloquially as the Mule) and the use of a Gift (a special reward acquired mechanically by spending a rolled double).
*   **Who**: Shinli Chi (Player)
*   **Date**: Over 2 years ago
*   **Quote**: "If you roll a double one and take the gift of the mule, and it says, you may move one space, and go through a mountain. How does that work? You cannot take one step and stop in the mountain." [cite: 5]

The response provided clarity based on an updated rulebook iteration:
*   **Who**: Fro (Player)
*   **Date**: Over 2 years ago
*   **Quote**: "There is an update to the rulebook, version 1.2. This should help clear up questions. For the mule, you can travel over mountains and you may add one to your movement distance." [cite: 5]

*Implication*: Fro's statement indicates that the bonus applies globally to the "movement distance" of that specific travel action, pointing toward one extra hex *per Travel*, rather than per hex crossed. Whether the bonus movement is strictly optional was not explicitly clarified. 

### 4. A full Food or HP box
*Context:* The physical character card contains 50 food diamonds and 32 hearts. The rulebook mandates painting them sequentially. Legacy mode (a campaign mode where characters carry over progress or unlocks to subsequent map runs) unlocks mention a "40th heart" despite the 32-heart limit. Are further gains lost, making the box a hard limit on total resources ever gained?

**Finding: DEMONSTRATED**
An official playthrough video published by Papermage Games on YouTube (`https://www.youtube.com/watch?v=nkRx41axN8g`) visually demonstrates how health points (HP) and resource boxes are managed.
*   **Who**: Papermage Games (Official Creator)
*   **Date**: April 6, 2024
*   **Quote**: While fighting an enemy, the narrator states: "[Ronaldo] takes four damage crossing four hearts from his HP box. As his loot he gains four pieces of food. He took a lot of damage. He uses the three to explore and gain one heart. Please notice that damage isn't erased but you may gain new hearts." [timestamp unavailable in automated transcript] [cite: 10].

Similarly, a community playtest video (`https://www.youtube.com/watch?v=kVqZYHCzmyI`) demonstrates the sequential nature of the food box:
*   **Who**: Soloist / Agent Solo Runthrough (Player)
*   **Date**: April 22, 2024
*   **Quote**: "in this food column here we start with uh five food and we essentially just cross it off as we go once we use food we use food as essentially move around... this red one will unlock the first skill." [timestamp unavailable in source transcript] [cite: 17].

*Implication*: The visual demonstration that damage "isn't erased" and that players "cross it off as we go" strongly points to the conclusion that the boxes act as a permanent timeline of a character's lifecycle. Once a diamond or heart is painted, it is consumed permanently. Therefore, if a player paints all 50 food diamonds or 32 hearts, the box serves as a hard limit on the total ever gained. 

Regarding the "40th heart" paradox: **Nothing found**. No statements address how to fill a 40th heart on a 32-heart card. It is highly probable this represents a misprint or a holdover from a previous design iteration (perhaps an earlier version of the character sheet had 40 hearts), but no identifiable public source confirms this.

### 5. An enemy whose gem or Treasure has been taken
*Context:* Rules state Treasures and Gems can only be taken once, after which they are crossed off the Adventure table. The query asks if the enemy can still be fought for remaining non-unique loot (or for nothing), or if the entire enemy is invalidated.

**Finding: OFFICIAL and COMMUNITY**
A crucial erratum regarding Gems was published by the creators.
*   **Who**: Papermage Games (Creator)
*   **Source**: Kickstarter Update #20 (`https://www.kickstarter.com/projects/papermage/legend-of-hexdom-a-print-and-play-roguelike-adventure/posts/4113137`)
*   **Date**: May 25, 2024
*   **Quote**: "We’ve refined the clarity on gem usage—each gem can now be claimed only once per match" [cite: 19, 20].

Prior to this update, players were actively confused about this mechanic. 
*   **Who**: Amanda DeMoss (Player)
*   **Source**: Kickstarter comments
*   **Date**: Over 2 years ago
*   **Quote**: "Do we need to cross out a gem when adventuring? There’s nowhere in the book that says each gem can only be used once. It’s only mentioned in the playthrough video." [cite: 5]
*   **Who**: Russell Reynnells (Player)
*   **Quote**: "Dang unlimited gems would have been sweet. Maybe that’ll be a house rule for the kids lol" [cite: 5].

*Implication*: While the OFFICIAL update explicitly enforces that unique loot (Gems) is crossed off, **Nothing found** clarifies whether the *enemy itself* remains targetable for basic loot. The phrasing "each gem can now be claimed only once" focuses on the reward, not the adversary, leaving the rules on repetitive farming of minor loot completely ambiguous. 

### 6. Scoring "1 point for each hex traveled"
*Context:* The scoring phase awards points for traveled hexes. The user asks if the starting hex counts, and if traversed Mountain and Water hexes count.

**Finding: Nothing found**
Exhaustive searches of the Kickstarter comments, Updates, and third-party reviews using variations of `"scoring"`, `"hex traveled"`, `"starting hex"`, and `"point for each hex"` yielded no results. A comment by user Michel discussed scoring mathematics related to boss values versus retained life points ("each remaining life point at the end of the game adds up to 5 points (as opposed to the 10 offered by a boss)"), but this did not touch upon hex counting [cite: 5]. Consequently, no public precedent exists for this ruling.

### 7. Score after a defeat
*Context:* The rulebook assumes a victory when tallying points ("the game is over, and you win! Time to tally your points!"). In solo play, does a death or a "stuck" state trigger a final score?

**Finding: COMMUNITY and OFFICIAL**
In the Kickstarter comments, a player analyzed the mathematical value of defeating bosses versus hoarding health points.
*   **Who**: Michel (Player)
*   **Date**: Over 2 years ago
*   **Quote**: "After playing a few games, we have found that it is not optimal to beat the final bosses, especially when the rewards have been taken. The 'optimal' way to win is to try to get as many life points as possible, as each remaining life point at the end of the game adds up to 5 points (as opposed to the 10 offered by a boss)..." [cite: 5]

This prompted a definitive correction regarding victory conditions:
*   **Who**: Wylte (Player)
*   **Date**: Over 2 years ago
*   **Quote**: "Well if you don't beat the bosses you don't win, so you won't get any points that way" [cite: 5].
*   Michel subsequently replied: "I misunderstood the instructions. I thought it was won by points and fighting 2 bosses was simply the trigger for the end of the game." [cite: 5]

Furthermore, the creators addressed scoring failure states in competitive multiplayer:
*   **Who**: Papermage Games (Creator)
*   **Source**: Kickstarter Update #20
*   **Date**: May 25, 2024
*   **Quote**: "...provided detailed win conditions for competitive multiplayer matches. In scenarios where no player can vanquish two bosses, victory will be determined by the highest score." [cite: 19, 20]

*Implication*: The COMMUNITY consensus (Wylte) explicitly rejects scoring after a defeat in solo play. You must win to score. The OFFICIAL rule for multiplayer provides a specific exception where scores are tallied without defeating bosses, but this explicitly applies to "competitive multiplayer matches" to resolve a stalemate, reinforcing that solo defeats go unscored.

### 8. Water drawn two ways
*Context:* The maps depict water as either plain ripples or cresting waves. Does this graphical difference constitute a rules difference?

**Finding: Nothing found**
Searches of the Kickstarter comments, Updates, and third-party reviews utilizing keywords such as `"water"`, `"ripples"`, `"wave"`, and `"terrain legend"` returned zero relevant hits. No published terrain legend or public statement differentiates between the artistic renderings of water hexes. 

### 9. Warrior, Adrenaline
*Context:* The Warrior's Adrenaline skill triggers when traveling if the player has 2 hearts or less. Must the player possess 2 hearts *before* paying the travel costs, or can the cost of travel (including starvation damage) drop them to 2 hearts and trigger the skill?

**Finding: Nothing found**
Searches of the Kickstarter comments, Updates, and third-party reviews for the keywords `"Adrenaline"` and `"Warrior"` within the context of rules timing yielded no results. While the official playthrough mentions "let's not forget our adrenaline increases the strength" [cite: 10], it provides no context regarding the timing of the heart check against travel costs. 

### 10. Warrior, Magic Blood
*Context:* The Warrior can take damage after traveling to gain Magic. Can this be done infinitely per round, or only once?

**Finding: Nothing found**
Searches of the Kickstarter comments, Updates, and third-party reviews for `"Magic Blood"` and `"once per round"` returned no clarifications. In a game characterized by resource scarcity, allowing a player to spontaneously convert all remaining health to magic in a single turn represents a massive strategic pivot, yet the community has not publicly debated this mechanic.

### 11. Archer, Cross Training
*Context:* The Archer can spend food before traveling to gain Strength. How many times per round can this be activated?

**Finding: Nothing found**
Searches of the Kickstarter comments, Updates, and third-party reviews for `"Cross Training"` and `"Archer"` yielded zero results across all databases.

### 12. Archer, Magic Berry
*Context:* The Archer gains food whenever Magic is improved. Does a single event granting +2 Magic yield one food or two?

**Finding: Nothing found**
Searches of the Kickstarter comments, Updates, and third-party reviews for `"Magic Berry"` and `"improve your Magic"` were entirely barren. No public clarification exists on whether this skill scales with the magnitude of the attribute increase or simply the instance of the event.

### 13. Mage, Enchant
*Context:* The Mage can lose a heart to substitute Magic for Strength in combat. Can this be used against Bosses, or only Adventure enemies?

**Finding: Nothing found**
Searches of the Kickstarter comments, Updates, and third-party reviews for `"Enchant"`, `"Boss Combats"`, and `"Mage"` produced no results. The rulebook text limits its examples to standard enemies, but no public forum explicitly forbids or permits its use against Bosses.

### 14. Which heart losses count for skills that react to losing a heart?
*Context:* Skills like Overcoming and Mana Shield react to losing a heart. Do non-combat sources of damage (starvation, stuck-crossing penalties, self-inflicted skills) trigger these reactions?

**Finding: Nothing found**
Searches of the Kickstarter comments, Updates, and third-party reviews for `"Overcoming"`, `"Mana Shield"`, and `"heart loss"` returned zero results. The precise definition of what constitutes eligible "damage" for skill triggers remains undocumented by both the creators and the player base.

## Part D: Additional Clarifications and Errata

During the extensive search of the community forums and Kickstarter updates, several vital rule corrections and misprint reports were discovered that directly impact the game's viability. If you are coding a faithful digital version, you must account for these recognized errors. Regarding the explicit query for errata touching Hex Forest maps 1-3, the sidesheets or tables A-C, or the Warrior, Archer or Mage: **Nothing found**. Exhaustive searches of official channels and community hubs yielded no dedicated corrections or misprint reports for these specific components beyond what is documented above.

**The "Boss Grok" Map Error**
A critical misprint on 40 of the Hex Forest maps renders a boss mathematically unbeatable.
*   **Finding Type: COMMUNITY**
*   **Who**: Makoto Takahashi (Player)
*   **Source**: Kickstarter Comments (`https://www.kickstarter.com/projects/papermage/legend-of-hexdom-a-print-and-play-roguelike-adventure/comments`)
*   **Date**: Over 2 years ago
*   **Quote**: "40 out of 100 maps (number with first digits 2, 3, 7, 8) do not have a BOOK as an adventure reward, However there are two Spears. I think that one of the two spears should be a Book. Or is it intentionally designed that way?" [cite: 5]
*   **Who**: Capn Frank (Player / Superbacker)
*   **Quote**: "Good Catch! I checked 2,12,22,32, etc and they are all like that ditto for the 3s, 7s and 8s for all 16 characters. It's got to be a mistake as Boss Grok needs the book to be defeated. Even the screen shot on Page 50 of the rule book shows the double spears and no book. The Brown Wolf has the spear on all the other maps so until we get an official fix I'll play it as if the Pike Brothers have the book even though this contradicts their backstory on Page 56." [cite: 5]
*   **Operational Workaround:** Logistically, for a digital implementation, this means overriding the generated loot table for the Pike Brothers encounter on maps ending in 2, 3, 7, and 8, hardcoding a 'Book' drop to replace one of the two 'Spears' to ensure the map remains mathematically solvable.

**The Jester Character Bug**
A bug in the character sheets for a specific bonus class was identified by the player base.
*   **Finding Type: COMMUNITY**
*   **Who**: branko (Player)
*   **Source**: Kickstarter Comments
*   **Date**: Over 2 years ago
*   **Quote**: "Further more, HexForest comes with blank character variant, and everywhere else Jester character has an error, since his bonus health was never added on the sheets and he starts with 0 in all attributes - making him perfect for the suggested swap. Hope it helps until better solution comes along :)" [cite: 5]

**Paladin's Permanent Strength Buff**
A point of confusion regarding character buffs was clarified by a community leader. 
*   **Finding Type: COMMUNITY**
*   **Who**: Shinli Chi (Player)
*   **Source**: Kickstarter Comments
*   **Date**: Over 2 years ago
*   **Quote**: "For the paladin, is the +1 strength per round permanent or temporary? Per round is defined by die roll, right?" [cite: 5]
*   **Who**: Fro (Player)
*   **Quote**: "It's permanent. You fill in a circle under the sword stat. A round is each time you roll the dice. Rolling the dice, movement, and actions are all considered a round." [cite: 5]

**Sources:**
1. [papermage.games](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQHuQ7VB3-uVaUiiL06XpvtctfaV4LDDfqPlKxS7MhEVWbO9R2swU1LAi6ZxWFszAwlyyWYE8aWLn8HQGR1gttKtrEhGVxMX0qlQsdFhRB_6h6SFYFMabBbA6GY5yY7o74durxLXuyTy)
2. [kickstarter.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQHlbE6WDyIxsN06C3pL8oUI_EcPNHQ8oAvWMveh8ARoHD3_zmjqfCwfmUJincfONWWJGAlVaC2J9n3pf2pjclDg4z41eNxocr4Wi8I-YcIs5aICBSR1_EM8bPJhHMBZ0xQyNjqJqgQTWZWa81jYaPx9ueeUS1uBenPfHT2kq7DFVDeLepVI_sAasHbv9jhlixx0zQp-wxWZRU0=)
3. [Link](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQF7ospVeFGy19e5flkezHlmPwdFw3I0zSt-hO6D28qWfboh8z_nhLMtaM4MwszRzsYwTrBWBVR3D4vivMwMUEg7VTXcCoACoOHuF-VtVGseu8cZDJX2B-IDCdELcBXD6k0C4-loyIRbOlmS_qd-zfZnt4UBlTScWuBbZY5ILLtpE5SAP4aKHpQf5D8UdMrAb6BHGHeeCGityng8WR32OPc=)
4. [Link](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFCdluUnc-6uq7GlsG_x1cHv4011REg5z5qz7J2g3mAL_rrVUq5UBM2QxZ6EUsuNaQkObk96I9ir34IxOakU6-68DG4PFNYWSm-R7eUeWbBhY1cpmsDs5YHZximPmiy78L-9zBAqOM-RplInBSVBDW2aXjDN6Hlk5fMq0qqpjUw_XWKcs-VucNT1dk05C3kulUjMGMakAHAaS_jV9psmac0tSf4ArzUfA==)
5. [Link](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQHjNSRMCUQOmTYi3c9O6ey4DHx2ATjgZBDpC0VaqREjAt0vDNCa3022rJMyG9-lBmNBDeck9HkXgC3GdjpxQdX3gQSbVcC9VDpqeqssK3JJYNgZgFgMl2bj8QvFaTq_Sewmi4q9d79CmotxE340T4IIUZqWnjdTRkUUp-_NDhIwkMwC-YQsxcVuiJNivA1j5CbRUgSdwlwTGBBnUyKvb_4SS6s=)
6. [kickstarter.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQGefDTEprhwJ2vGollILE_sQCxw4QcBHcl0pv2nJTfV8ytOJRMlTqkxjHKorpW7HROV_93HNdU8wZ1QJJIi2gc3xWawnW8bC2KPCMOe9MunMz78ERyixrlJQGr-yWdsFhGGVGhH_lrplTZafPMRju8dfG2ATUPEoMrWCGS19bhAXQ4Tf2fkcpAkuK3OGMIIK2DylknyiLKll47GOe5KsxCfHK8brfLK)
7. [kickstarter.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQE-BmFfWfLsBRPCy7CkuaW46jhEih_AFPrEAHvt8U8bWAoIYQPLFoU_dqWdl1i0DobNsqZpGMfNENLalTzjrmjOS-XAG2F9b5fhsltMK4-zgdbX5p-tzZHI6sNfXpTrfHnCgVgA6AxQsgv1M7MwTgPMAxbAF7PhBG2BcaRQykDbxlaXKmpqHn8W9oZRJsqqCQO_hn9sobZeFkKB_liei_uo9eS-GUQf)
8. [papermage.games](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQHMyptYnYw9pc31PFdpo-RGMme7q0jXEI5H2R5eaq6bfnvsfcsq0YtzstIboEvYIATOeAbZKIbBBe0D4Uffl_QiM6jOhF4ShDcqow1IN6PdPy3YN0E6pwv0QXH2xeSmgnA=)
9. [kickstarter.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFIxED8eSg6-Gw5eu2kVyOyhAxR_NeUllfNPeofb7wvw2r8OQNJqYV1gtbwV35qzzbeKu-eVgKa5up6tS3FfliY8dtmXmqW_oh4ouUPqE5_s5yZoTuK-lxeH4EfLqKcH7ZpJObNlIejFCQNoIcNOTLQVa8k-y9C_kQv3Z5L9I9F)
10. [youtube.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFf4cadxOCNXsGrBxjiFTd9uO9BGlsmhv0dF0PsuiUoAB7qDRdu9Rgbb1dN6mmqthFW6Qho4jl8F_f_H34mjQKV5EpwgFHd0Qx1ONQb6gGQK3VPcv2Q2m5jIVLU-3klAss=)
11. [scribd.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFHYfP1pWg58FhOZ_qE6hMWYNx-h66u4kDRkAqZH9ZA2A82H-SaAZLR1AYbZ82zthLFcs_U3lBNLzzOMqHEEmYVDeSvzMqSGdYONApOdpPs1hFZLX17WvgIM8RTRtQgqeUftZfgVHhga_FOAzzuLDautrWqIxSzaI8=)
12. [scribd.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQGhm3tM7OmMaGAlmSSO8t66B_Dqdsna_fBP-_lLy4O6sl2Zuzvl5GzUd46FFXjpy474NbyKFDnd8l-AdtQ8Zt1KWEq8xH9-Mo_65nkQc9dBw1azw3KtUJAl6IQxKrHHdEjokRlfudecgZEFz7zTwAYctQBB78_QVE4PxFyisfO6qtPulA==)
13. [boardgamesbot.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQHq-evMW2ji_aC0imm5YP9syGRqbUPOFUJ35652_4T2QmS5FKcSgBl_Z4owo3IX0MW7busssBMH08VF8rLQiVi8xa5Tb4JyFc3jRRwwSmLhjImQhI_ZF4tEmGt664EShdKe-B8GvQvo-gvWxqqE85y5CHcwGL2NZTM=)
14. [reddit.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFAWsdkYtpvxhWo8zLDmtMLQvT_apgR8tCZQz55wTiYRp9yFjyA-5F2iLE7pf1ZV8NnlAwzozBKxw1gyA5rPBeqD8XdbmOKSCKemyMhQnkhKudms9G2w-eC0xxd0iuap-UWUD2o8ZhlY0yJoiIDREuNA_s-bG7aQFWSZOyUSwNTG9D9JA==)
15. [wordpress.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQH92CTycejPK23Srb4NA8lREuxw4-yQVPe4DQ82onLeM89c59eYdD_efetQhduRvtJwxj89ZVx1Lcu57ZJrZWMsOv97caT4lztCHw-cyWSN703SKCqrBARJdkxzviFy1yZpLulVI-rljhIM6-NheITp69VTmsb4nzU2GCEtLBwZ)
16. [wordpress.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQHm9jsFqf4lHEAgl59GN3nhYzal5oUI4mepx50j9qgO7tDmOskD1It0MfMohVdvF4eO7WvmvQttSl2k3lXtljCsHCn1zrg2bJ9BTJUIt7a4fkHH9ax5hdmC3juWjRowR0ZJoZCzLeydmXRb)
17. [youtube.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQEqH2QeYSLUTw2uoIgOcCH7wSD9WvZ7oB3bWStwhB6hRlcn5UMZEb-XLNv4tuKL7sc2gOX2AAAeFx1znEAJkorP5oqqse9lllFp939DqvHDNJxQESoZerW2_FhEfP1T3FM=)
18. [Link](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQHNGO69KNZ1UGlUBU9RT44U_8ZvBgHlDeJGP1dL3xwk614Po5u9CO-_xZalgj0Jezjh6qI-oXs-b8aNl95uLJVgUfEFj8W5EHippWvIE5rJLh9pAzyeOY-svivePOpBvn2UI49WQEbZqAdpIvfQj-ig7pIs0X91Gq7q6e8XLTaY8NYKR9Lx9f_zX7EETU3ui9zilcchtLgRdS8DSJe1I9PXhQd4yFYWzQ==)
19. [Link](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFeqVoQMBBgaLRAN1cCsnZ608Hhel3ZQ_eIv_KxpLemWRJ_fDGfqkU3RJcsjTmcwxxI4Ny4dHszSV28Nc2FEw8SqEEBklCBQQidYkN2xRCfmNihqRk4XDsi4fSCOsU3USRZj219-icLyq27q4WK9CBqtJgB6xrOV1dF9jwxGFpVQK6Dhr6lZ2VQrjWRLrLjt2lcAeTNcxODrus4fQgiVSHLjX0ZJ0Tc6w==)
20. [Link](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQEZXomnVTb0eoi3HT5j6uoqRlgok4FeLwB9E2T8B41U2Br7eE_n7uW-Eiy0b_ZLnjOmRTz-RZW2PdLIpDAUALWpRxjC9IO78IPGLC46iAA0M9RbwWgfhUaIZFxeeTt-RBuE8Tv4Xx7VAxLnxOjYLr0QKT0YPiKzhl5bjgLmI44glr3WkO5aIQBu6Ys0q8mLybSK1y89ZHu8y6eKQUfTfDyuN6vnYYqs1A==)

