# Verified findings, 2026-11-27

Checked by the tech lead in the Game Director's own Chrome (Claude in Chrome), where Kickstarter
and YouTube open normally; our fetcher gets 403s. A quote counts as verified only when it was read
on the page itself. Tiers: **OFFICIAL** (the publisher's account or document), **COMMUNITY** (a
player).

Campaign: `https://www.kickstarter.com/projects/papermage/legend-of-hexdom-a-print-and-play-roguelike-adventure`
(below, "KS"). Comments are dated only "over 2 years ago" by Kickstarter, which puts them during
or soon after the 2024 campaign. Several predate rulebook 1.2, so a number in them (the stuck
penalty was then 1 damage, now 2) can be superseded while the principle stands. The publisher
signs comments "Kevin" or "Pedro" from the **Papermage Games** account, marked **Creator**.

## What Deep Research got right, verified

| # | Tier | Where | Verified quote | Bears on |
|---|---|---|---|---|
| V1 | OFFICIAL | KS Update #20, 2024-05-25, `/posts/4110413` (Deep Research gave `/posts/4113137`, a 404) | "We've addressed a few bugs from the initial release and implemented patches to fill the booklet with more information, and also corrected some typos." / "We've refined the clarity on gem usage—each gem can now be claimed only once per match—and provided detailed win conditions for competitive multiplayer matches. In scenarios where no player can vanquish two bosses, victory will be determined by the highest score." | Q5, Q7, rulebook history |
| V2 | COMMUNITY | KS comments, Capn Frank (Superbacker), replying to Dávid Bosý's "Is it mandatory to spend all dice during round? Or can player opt to pass an action (except travel of course, that is mandatory)" | "Per the Instruction Book page 13 I would assume that you have to use both the other dice." No reply from the publisher in that thread. | Q1, **against** our reading |
| V3 | COMMUNITY | KS comments, Fro, replying to Shinli Chi on the Donkey ("mule") | "There is an update to the rulebook, version 1.2. This should help clear up questions. For the mule, you can travel over mountains and you may add one to your movement distance." | Q3 |
| V4 | COMMUNITY | KS comments, Wylte, replying to Michel (who thought the game was won on points) | "Well if you don't beat the bosses you don't win, so you won't get any points that way". Michel: "I misunderstood the instructions. I thought it was won by points and fighting 2 bosses was simply the trigger for the end of the game." | Q7 |
| V5 | COMMUNITY | KS comments, Makoto Takahashi, then Capn Frank | "40 out of 100 maps (number with first digits 2, 3, 7, 8) do not have a BOOK as an adventure reward, However there are two Spears." / "Good Catch! I checked 2,12,22,32, etc and they are all like that ditto for the 3s, 7s and 8s for all 16 characters". This is the bug the 2024-05-23 reissue of the B/C/G/H sheets fixed; our A5 sidesheets have one spear and one book each. | stage 2 data |
| V6 | OFFICIAL | Publisher's YouTube playthrough, channel `papermagegames`, 2024-04-06, `https://www.youtube.com/watch?v=nkRx41axN8g`, transcript 7:01-7:32 | "he takes four damage Crossing four Hearts from his HP box ... please notice that damage isn't erased but you may gain new Hearts that's how healing works in the game" | Q4 |
| V7 | OFFICIAL | Same video, 1:01-1:18 | "food is used as a fuel in travel and exploration and it doubles as experience points ... you lose HP in combat exploring or by starving" | Q14 |

## What Deep Research missed: the publisher's own answers in the comments

Deep Research reported no official answers. The publisher posted **175 comments**; 18 of them
mention game terms, and these bear on rules in scope.

| # | Where (KS comments) | Verified quote | Bears on |
|---|---|---|---|
| N1 | Reply to Kym Gork, who wanted a harsher penalty for crossing without the symbol | "This is a rule that should be used ONLY when players are stuck -- not in every move they want." | Q2 |
| N2 | Reply to Mikaël L. (a player trapped by water) | "Even though the nature of this roguelike experience is that you end the game if you become trapped, like an "early retirement", in this case you can cross the special terrain (mountains/water) while taking 1 damage per crossed special hex when not using the adequate dice! We forgot to add this rule to the playtest sheet". The 1 damage is superseded by the rulebook's 2. | Q2 |
| N3 | Reply to Jonas Rosenqvist | "No moves through crossed hexes. The rule allows only for movement through mountains and water." | Q2: the unstuck crossing never lets you re-enter your own path |
| N4 | Replies to Fro and Ray on Mana Shield | "It is limited to crossing out 1 food to prevent 1 heart damage!" / "you can combo your skills, but use Mana Shield only once a round!" / "Yes, you can combo Enchant and Mana Shield. This way you can use your staff instead of your sword for 1 food cost once a round." | Mage, Q14 |
| N5 | Reply to Stan and cleanroach on Enchant | "When using Enchant, you should treat the attributes separately, not add them, and treat Swords/Strength as if they were Staves/Magic. For example as extra clarification, if the Frog had a requirement of 7 swords and 6 staves, and you had 6 staves, you could use Enchant and you'd take only 1 damage (from comparing his 7 swords to your 6 staves, as the staves requirements were fully met)." | Mage |
| N6 | Reply to Fro, who concluded a Mage should "always ... put all points in magic and agility to max them out first before putting points in strength" | "That's basically it, Fro. The main strategy for the mage seems maxing out magic/staff first". Two Bosses need Strength 12, so this strategy only works if Enchant applies to Bosses: indirect. | Q13 |
| N7 | Reply to Ray: "If you get to a point where you cannot defeat the number of bosses needed, ie two in solo play, do you keep playing till you have no moves left?" | "yes, in this case, you'll roam the world enjoying the last remaining hextiles before the evil bosses corrupt and destroy all of Hexia..." | Q7, and the engine: an unwinnable game goes on until death or stuck |
| N8 | Reply to James | "Regarding the differences between maps, yes, except for movement penalties. They'll be the same for every map as they're a "global rule"." | Travel box is global |
| N9 | Reply to tai yin yu on the Balloon | "with that gift the dice rolls 2 and 6 gain the ability to cross mountain and water hextiles!" | Balloon |

## Not verified

- A Spanish "Rulebook 1.3" on Scribd (Deep Research, Part B). Not opened. If an English 1.3 exists
  it would be on the publisher's MyMiniFactory page, which needs the Game Director's account.
- The letsgamemore review, the community playthrough video, the Reddit thread, and Deep
  Research's "Jester" and "Paladin" items: outside the 14 questions, not opened.
