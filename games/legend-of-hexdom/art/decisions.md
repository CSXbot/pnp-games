# Legend of Hexdom: art decisions

Dated, newest first. What was asked, what came back, what was accepted or rejected and why.

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
