# Recycled 1.0.0: retro

Written 2026-11-27, at the Game Director's request, before starting the second game. Stage 6.
Finished work is described in `CLAUDE.md`; open work is in `ROADMAP.md`. This file is only the
lessons, and each one that changed a rule says which file it changed.

## What cost more than it should have

### The crop box, three times — and the third was found by someone else

Three assets looked damaged and were not. The crop box was.

| Asset | What was lost | What it really was |
|---|---|---|
| Building tiles | the Recycler's right wall, the Laboratory's frame, the Workshop's doors | a 230×196 window taken from a 360×198 printed illustration band |
| The Depot | the console's outer metal frame, its corner bolts, its side hinges | `DEPOT_BOX` started *inside* the printed frame |
| The cards | the bottom badges, sliced through | a 530×710 crop of a card that is taller, with a chevron bottom |

**Each time, the sheet had printed the whole thing.** The expensive part is not the mistake, it is
that I fixed the first, wrote it up as a decision — "the buildings were never clipped by the
sheet, only by our crop" — and then **did not apply it to the Depot the same evening**. The Art
Director found that one. A lesson written down and not generalised is not learned.

Worse: I had `close_depot.py` ask a model to reconstruct the Depot's bottom lip, when most of what
was missing was simply uncropped print. **Reconstruction was reached for before measurement.**

→ `.claude/rules/art.md` now opens asset work with **Measure the component before you cut it**, and
says a reconstruction is the last resort, after "is it in the crop we are not taking?" and "is it
elsewhere on the sheet?".

### Checks that passed because they measured the wrong thing

Two of these, which is a pattern rather than an accident.

- **`check:screens` tested 1366×1024 for weeks.** That is the iPad's screen. A browser with its tab
  strip and address bar hands the page about **865px**. At that height the reference column was
  starved to 200px and the Launch button rendered at y=980 — off screen, with the column reporting
  no overflow, so there was nothing to scroll to reach it. The check said "fits".
- **Before that, "fits" meant nothing at all.** `.app{height:100dvh;overflow:hidden}` means the
  document can never scroll, so the scroll check could not fail. It only ever meant "no console
  errors".

→ Stage 3 now says take the viewport from a browser on the device, not the device's spec, and
**a new check has to be proven able to fail** — break it and watch it go red. The privacy test was
verified that way and holds; neither of these was.

### Verifying the right things and missing the obvious one

I reviewed the Art Director's Depot pull request carefully: nine template patches proving it
pixel-exact against the publisher's embedded JPEG, a change-mask proving no lettering was touched,
and overlay registration re-checked after the canvas origin moved. All correct, all worth doing.

**I did not look at what it weighed.** It saved a 2496×1500 scan losslessly and took the single
file from 2.5 MB to 4.6. I found it while gathering facts for this release, not from a check.

→ `.claude/rules/art.md` adds file size to the verification list, and `scripts/build-all.mjs` now
fails the build when a game's single file exceeds `pnp.maxKB`. Proven to fail before being trusted.

### A probe session committed to main on its own

`claude -p` sessions I spawned to measure start-up context picked up an uncommitted settings file,
committed it, deleted a roadmap item and pushed — which deployed. The content was harmless and
wanted, but it was neither authored nor reviewed. A print-mode session inherits this repo's "commit
and push freely" instruction and acts on whatever it finds in the tree.

→ A housekeeping item on the shelf roadmap: run probes read-only or from a scratch directory.

## What I got wrong twice

1. **A crop box is a measurement someone made once and nobody re-checked.** Three times. Now the
   first line of the art rule.
2. **A green check is not a check.** Twice. Now a line in stage 3.

## What changed because of this

| Change | Where |
|---|---|
| Measure the component before cutting; reconstruction last | `.claude/rules/art.md` |
| File size is part of verification | `.claude/rules/art.md` |
| Size budget that fails the build | `scripts/build-all.mjs`, `pnp.maxKB` |
| Viewport from a browser, not a spec sheet | `stages.md`, stage 3 |
| A new check must be proven able to fail | `stages.md`, stage 3 |
| Work re-enters at the earliest stage it touches | root `CLAUDE.md` |
| A release is a label on a moving trunk; open items are normal | root `CLAUDE.md` |
| Every game shows its build, faintly | `scripts/build-stamp.mjs` |
| Playtester role, and a playtest that cannot touch a real save | `.claude/skills/playtest/` |
| Root rules split 449 → 211 lines, the rest loading by path | `.claude/rules/`, `.claude/skills/` |

## What went right, and is worth keeping

- **Gates that refuse to write.** `make_cutouts.py` will not save an asset where a publisher pixel
  changed inside the silhouette. That caught real failures and cost nothing to carry.
- **Driving the real browser instead of reasoning about CSS.** Every layout claim in this release
  was measured in Chrome. Two of the three worst bugs were found that way and not by reading code.
- **A second Art Director that reads the repo.** `codex exec` found two defects in drawing order,
  and the OpenAI side found the Depot crop. Both saw things I had stopped seeing.
- **The consultant improving an answer rather than confirming it.** The release-loop design here is
  theirs, not mine: my "stages 0–2 happen once per game" was disproved by this very week.

## What annoyed me that you did not notice

Stage 6 asks this of you; it is only fair to answer it myself.

- **The art direction job was skipped at stage 1 by two sessions, and it cost a rebuild.** The
  sheet's visual language — a pen symbol over the illustration, a ring per unit, one contour per
  joined pair — was discovered after the UI had invented tiles, ribbons and pips. That stage exists
  now, but nothing enforces it.
- **`sources/` is gitignored, which is right, and it means a fresh session cannot see the game.**
  Every art tool takes a PDF path as an argument that only works on your machine. For game 2 I would
  like the intake step to record what was rendered and where, so a session that cannot read the PDFs
  still knows what they contain.
- **The bot is called a strategy and is not one.** It loses nearly every game, which told us nothing
  about difficulty for weeks, until a human playtest won on day 17 of 75. I should have said
  "this measures nothing" earlier instead of quoting its loss rate.
