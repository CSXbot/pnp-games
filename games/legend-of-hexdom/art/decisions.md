# Legend of Hexdom: art decisions

Dated, newest first. What was asked, what came back, what was accepted or rejected and why.

## 2026-11-28 (morning) - the trial look, the live-Boss boxes and the portraits, after the fact

**Why after the fact.** Overnight the tech lead built three visual changes without showing them to
the Art Director, and sent the Game Director a comparison of the trial look before it had been
reviewed. The Game Director asked whether the visual decisions were aligned with the Art Director;
they were not, so the review below was run before anything else went to them.

**Asked** `gpt-5.6-sol`, in three calls, with crops at 1366x1024 (each column under 768 px wide):
1. **Blind**, without this notebook: versions A and B side by side, and the printed sheet. Neither
   version was named as newer or intended. Question: what differs, column by column, and is each
   difference better or worse for play?
2. **With the notebook and the intent:** a recommendation for the Game Director, then the live-Boss
   boxes on the Boss strip, then the old and new portrait crops beside the Mage's card.
3. **The recommended mix as built.**

**Came back:**
- **Blind:** B's charcoal header bars are better for scanning and closer to the sheet. B's charcoal
  route merges into dark terrain and Castle art. B's muted green makes tappable cells less
  distinct. B shows about one fewer log line.
- **Recommendation: a mix.** B's header bars and squarer corners. A's blue ink, bright green and
  yellow. It would not ship B's charcoal ink or muted green: the route and the tappable cells carry
  play information, so this is usability. The lost log line is worth the clearer headings.
- **Live-Boss boxes: keep as shown.** They read as "available now" and hide nothing. If players
  take green to mean only "tappable", let the action preview spell out "no 3-heart penalty" rather
  than adding anything inside the cell.
- **Portraits: all three new crops are correct.** Whole figure and starting icons, no text, no skill
  diamond. The purple diamond on the Mage's staff belongs to the portrait. No regression.
- **The mix as built:** yes, it is the recommendation, except that the corners were not yet square
  enough on panels, skill boxes and buttons.

**Done:** the trial look is now that mix, with the corners squared (panels 5 px, boxes 4 px,
buttons 5 px). It fits all three sizes with no overflow. `art/compare/2026-11-28-look-A-vs-B.jpg`
was redrawn. The choice between A and the mix stays with the Game Director.

## 2026-11-28 - review of the first screens at play size (stage 4)

**Asked** `gpt-5.6-sol`, with the notebook, four screenshots at 1366x865 and 1440x900 and the
original A4 sheet: legibility at play size, departures from the sheet's visual language, at most ten
ranked changes each marked USABILITY or TASTE, and what not to change.

**Accepted and built the same night (usability):** four table columns go into tabs when they would
be too small; the full-tables view shows Bosses and Gifts full width and scrolls instead of
shrinking them; the Travel box is shown as printed (the rolled dice outlined) instead of prose;
the score line is back under the map; the red unlock diamonds are back on skills 2 and 3, locked
skills have readable contrast, Treasures are larger; the committed route is thinner with a pen-like
wobble, the preview stays dashed.

**Rejected:** "enlarge the touch targets of hearts, diamonds and rings" - they are not touch
targets; the tracks only display state.

**For the Game Director (taste):** a cleaner redraw of the table cells (the publisher's pictures
kept, requirement boxes, numbers and loot icons rebuilt crisp from the data - text set by code,
never by a model); frames closer to the sheet's (dark header bars, vertical tabs, terrain badges,
squarer boxes); the state colours (yellow selection, green preview, blue ink - or charcoal ink, muted
previews, red and purple kept for the sheet's meanings).

**Kept, on its advice:** the large map, the readable action previews, the dice, the full-tables
view, the publisher's art for every picture, the layout's departure from the A4 arrangement.

## 2026-11-27 - "What does the player physically do?" again, done properly (stage 1)

**Asked** the same six questions, blind (without `art-direction.md`, so it could not simply agree),
on **`gpt-5.6-sol`**, the account's best vision model, now the default. Supplied this time: the
rulebook's rule pages as text (p11-25, 34-54, 66-73 and the three characters' pages; p10, setup,
was left out by mistake); map 1 whole and a native crop; sidesheet A in four native-resolution
crops; the Warrior, Archer and Mage cards; figure pages 16, 18, 19, 23, 35, 38, 42, 47. Every claim
had to cite a source, or say "not shown". A `gpt-5.5` run of the same prompt was kept for
comparison; it stayed general and committed to few specifics.

**Accepted**, checked against the crops: the mark vocabulary (painted diamonds and rings, slashes,
crosses, the arrowed route), linked and unlinked borders, the icon grammar of costs and gains, the
Boss and Gift cells, the screen risks. Folded into `art-direction.md`.

**Rejected:** "die faces are grouped in pairs, 1-2, 3-4, 5-6" for the Travel box. The box has six
distinct entries: die 2 moves two hexes, not one, and die 6 costs no food (sidesheet A crop).

**Its open questions, and what became of them:**

- Village numbers: answered by p10 ("Each player rolls one die. It determines the Village in which
  that player starts"), which it was not sent.
- The wave drawing in some Water hexes: already the Game Director's question 8 in `SPEC.md`.
- The exact mark for a Treasure ring, a Relic gem, an unlocked skill, a gained heart: the sources
  don't show them. `art-direction.md` now says which marks are shown and which are inferred.
- The X on the start, arrowheads, the red "-2 HP" route: shown in rulebook figures, not required
  by the text. They are the figures' convention, and the brief treats them as the pen language,
  not as rules.
- The second and third skill diamonds on the cards are different shades of red: true. No rule
  refers to it.

## 2026-11-27 - "What does the player physically do?" (stage 1), first attempt

**Asked** `art.mjs review` on `gpt-4.1`, then the default, with the A4 sheet for map 1, sidesheet A
and rulebook pages 35, 38, 42 and 47 at 150 dpi.

**Came back** wrong on checkable facts: the bow called a shield, dashed borders guessed to mean
"harder", red dots reported on the HP track, Bosses given "HP", gaps filled from "roll-and-write
tropes".

**Mostly the brief's fault, not the model's.** It was asked which details carry rules **without
being given the rules**, the whole A4 sheet arrived shrunk to about 1086x768 so table icons were
about 25 px, and the notebook it is meant to read did not exist yet. The tech lead's first entry
here blamed the model; that was wrong. The lessons are in `.claude/rules/art.md`, **What a review
needs**.
