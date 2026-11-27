# The life of a game

Every game goes through these stages in order. The expensive mistakes on Recycled all came from
starting a stage before the one before it was settled.

**This is a map for both of us, not a checklist I run alone.** Each stage says what I do and what I
need from you. When something of yours is missing I ask for it by name - which file, which answer,
which switch in a dashboard - rather than guessing or going quiet, and I keep working on whatever
isn't blocked while I wait.

**0. Intake.** The PDFs land in `sources/<slug>/`, gitignored, never committed. Inventory what
arrived - base game, expansions, extra maps - and write the list down before reading any of it
closely. PnP PDFs are usually image-only with no text layer, so render pages at 150-300 dpi and look
at them.
**You:** put the files there - every sheet, every rulebook page, and any expansion. If something
looks missing (a Sheet 2, a page 4, a map referred to by another file) I name the file I need.

**1. Spec and direction, no code.** Two jobs, both before the layout is fixed.

First, **ask what the player physically does**, with the real pages attached (`art.mjs review`):
what they read, handle, move, flip, draw or reveal; which visual details carry rules or state; and
what gives the game its identity. Make it cite the page. Save the answer as
`games/<slug>/art/art-direction.md`, which is the standing brief from then on: the Game Director's
taste decisions and anything that must never change are added to it as they are settled
(`.claude/rules/art.md`). This is the job both Claude sessions skipped on Recycled, and
it cost a rebuild: the sheet's language is a pen symbol from the legend drawn over the illustration,
an open ring per unit gained, that ring filled in when spent, one contour round a joined pair - and
the web game had invented tiles, ribbons, evenly spaced pips and a link bar instead.

Then write `games/<slug>/SPEC.md` covering:
1. Components and setup, including the exact starting state of the sheet.
2. Sheet anatomy: every grid, track, box, counter and bonus mark.
3. The turn loop, step by step.
4. Legality rules, and what happens when no move is legal.
5. End of game, scoring formulas, or win/lose conditions.
6. Asset triage (`.claude/rules/art.md`, **Choose the method per part of the component**).
7. **Ambiguities:** a numbered list of questions for me.

**State a rule question in the three-part form** (root `CLAUDE.md`, **Who does what**). At this
stage there is no web game yet, so the middle part is what you propose to implement.

Then stop and wait for my answers or "Approved". **Rules are the exception to "decide it yourself":**
how an ambiguous rule should read is mine to settle, because faithfulness to the original comes
first. Record each answer in `RULES-NOTES.md` and each ruling in the game's `CLAUDE.md`.
**You:** answer the numbered questions. This is the one stage that genuinely blocks - guessing a rule
here is how a game ends up quietly wrong.

**2. Engine and data.** Content as tables in `src/data/`, rules as pure functions in `src/engine/`,
tests alongside: exact-wording cases for every effect, plus simulated games asserting every log line
against the real change in state. Check every number against the sheets at full resolution. Misreads
are the most common bug, cheap to fix now and expensive later.
**You:** nothing, unless a number on a sheet is unreadable even at full resolution - then I show you
the crop and ask rather than picking the likelier digit.

**3. UI, responsive from the start.** The screen never changes state directly; it sends commands to
`act(state, cmd)`. Highlight only legal targets, from the same function the engine uses, so
highlighting can't drift from the rules, and show the exact reason anything is unavailable. Build
**both arrangements together** (`.claude/rules/game-code.md`, **Layout**) rather than fitting a laptop layout to a tablet
afterwards - Recycled needed a second pass only because it was built before the iPad was a target.
Flip `pnp.tabletReady: true` when the layout is meant to hold, then make `check:screens` pass -
the flag is what turns the fit check from a warning into a failure, so it goes on first, not last.
**You:** try it on the real device once it fits. I can measure that nothing scrolls; I can't feel
whether a tick box is big enough for a finger.

**4. Art, with OpenAI as art director.** Claude owns the integration and brings me the visual
decisions. Per asset: establish what the source actually holds, pick the method, then close the loop
before anything ships. Everything runs through `scripts/art.mjs`, a local asset tool - no API call
is ever part of the game, which stays one offline file.
**You:** I make the final call between the original and the best candidate, shown side by side in
both layouts.

**5. Shelf and ship.** Register the game on the shelf, push, confirm the deploy, and play it on the
real device.
**You:** anything that needs your account rather than an API token - billing, a plan upgrade, an
account-level switch in a dashboard. I tell you exactly what to click.

**5b. Playtest.** A full game played by someone who has the rulebook and not the code - invoke the
**`playtest`** skill. Ask me which way to run it and hand me the filled-in prompt; I either run it or
tell you to. Fix the findings, put the strategy into `test/bot.ts`, and run the simulation that
turns it into a win rate.
**You:** choose who runs it, and rule on anything the playtester says about how a rule reads or
whether the game is too easy.

**6. Retro, before the next game.** Stop and improve the process while it is fresh:

- What cost more than it should have, and which stage it leaked out of.
- What I got wrong **twice**. That is a line in this file, not something to remember harder.
- Move finished work out of the game's `ROADMAP.md` into its `CLAUDE.md`.
- Correct this file where it proved wrong - the stages, the sequencing rules, the art triage. A
  workflow that never changes is a workflow nobody is reading.

**You:** tell me what annoyed you that I didn't notice.

Don't save it all for the end. Stop and update this file whenever you correct me twice on the same
thing, a stage costs a multiple of what I predicted, or a tool keeps fighting us.

## When it isn't working

**The template is a default, not a constraint.** It was derived from one game. A game that doesn't
fit it is information, not a failure - and bending the game to fit is the one thing that is never
allowed, because faithfulness to the original comes first.

Say it out loud early, with the cost so far and the estimated cost to continue, and propose one of:
deviate for this game, change the shelf's default, switch tools, or don't convert this game at all.
The cheapest moment to notice a game doesn't fit is stage 1. The most expensive is stage 4.

Signals worth stopping on:

- A rule that can't be expressed in the data model. The model is wrong, not the rule.
- The same class of bug returning after two fixes.
- Art that won't come out of the PDF cleanly however the mask is drawn - a sign the wrong tool is
  being used, as with generative cleanup for anything that carries no geometry.
- Tests that have become the obstacle rather than the safety net.
- A third attempt at the same approach. There is rarely a good fourth.

This applies to my own work first: I'd rather report "this approach is wrong, here's what I'd do
instead" after two hours than hand over something that technically works.

## Sequencing rules learned the hard way

- **Direction before layout; asset production after.** What the player does decides the composition,
  so settle that while the layout is still open. Producing the assets waits: the layout fixes the
  size each one is displayed at, and a resolution defect only exists relative to a size.
- **Infrastructure before content.** Access, routing and the deploy chain get settled while there is
  nothing to lose.
- **Shared code moves to `packages/kit` the second time it is needed, not the first.** Save sync,
  manual dice, the top bar and the new-game dialog are shelf features wearing a game's clothes.
- **Anything an expansion will vary must be data from day one:** board aspect ratio from
  `BOARDS[mapId]`, a stock bar that wraps, tabs as an array, per-map Depot art. Cheap now,
  structural surgery later.
- **The save schema is a contract.** Every load goes through `migrateSave()`; stored ids are never
  renamed, only added.
- **`CLAUDE.md` describes how things are; `ROADMAP.md` holds only what is open.** Finished work moves
  from one to the other. A roadmap that accumulates history stops being a roadmap. Anything that
  needs me rather than you is marked **(you)** there, so the queue is readable at a glance.
