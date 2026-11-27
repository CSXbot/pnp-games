# Legend of Hexdom: art decisions

Dated, newest first. What was asked, what came back, what was accepted or rejected and why.

## 2026-11-27 - "What does the player physically do?" (stage 1)

**Asked** `art.mjs review` (gpt-4.1), with the A4 sheet for map 1, sidesheet A and rulebook pages
35, 38, 42 and 47: every kind of pen mark, which printed details carry rules, which are decorative,
what gives the game its identity, what is at risk on a screen. No layout or style proposals.

**Came back** a generic answer that was wrong on checkable facts:

- It called the bow a "shield". There is no shield on the sheet: the attributes are sword
  (Strength), bow (Agility) and staff (Magic).
- It guessed dashed borders mean "harder/bonus". They mean **unlinked**: choose which requirement
  to meet (rulebook p16, p52-53).
- It reported "red dots on the Food and HP tracks". There are red rings at 12 on the attribute
  tracks and red diamonds at 20 and 40 on the Food box; the HP box has none.
- It said Bosses have "HP"; they have two linked attribute requirements and a treasure requirement.
- Twice it filled gaps from "roll-and-write tropes" rather than the page.

**Accepted** only what the pages confirm: the path is drawn hex to hex with arrows; food and hearts
are crossed; the identity is illustrated hexes, icon-only tables and pen marks; the dense Adventure
table is the screen risk; replacing the drawn path or the icons with an invented UI language would
break it.

**So** `art-direction.md` was written by the tech lead from the pages directly, with page
citations, and is the brief from now on. Next time ask for citations to a page or a crop for every
claim, and reject any that come back without one.
