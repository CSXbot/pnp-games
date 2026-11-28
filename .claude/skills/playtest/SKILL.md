---
name: playtest
description: Run a playtest of a shelf game - what the playtester role is, how difficulty gets measured, filling in the prompt from the game's brief, asking the Game Director who runs it, and filing what comes back. Use when a game reaches stage 5b, when the Game Director asks for a playtest, or when a playtest report needs filing.
---

# Playtesting

A playtest is a full game played by a Claude chat with a browser, the publisher's rulebook and **no
sight of the code**. It has two outputs: findings for the Tech Lead, and an explanation of how the
game is won.

**It is not QA.** QA reads the repo and checks the data against the sheets. The playtester never
opens the repo: its value is that it sees only what a player sees, so anything it needs has to be
handed to it. It has no memory between runs either - hence the notebook.

## Difficulty, in two halves

A 75-day game is several hundred clicks, so a few browser games cannot give a win rate.

1. **The playtester explains.** Where a careful player dies and why, and the best way to play that
   it found, written as conditions and actions specific enough to program. It also lists the
   choices it could not settle.
2. **The engine counts.** Teach that strategy to `games/<slug>/test/bot.ts` and run thousands of
   games. The win rate of a competent strategy from a normal start is the number the Game Director
   gets - the playtester's few games are not. Each open question becomes a simulation, and the
   answers go back into the notebook under "Measured by the engineers".

Two things Legend of Hexdom taught (2026-11-28):

- **Teach the bot one rule at a time and measure after each.** Then the notebook can say what each
  rule was worth. A rule that sounds right can cost wins: two fixed target Bosses held the Warrior
  to 3%, and part of the reason was a playtester's slip (Glubo needs Agility 12, not 8).
- **The bot is also a fuzzer.** Hundreds of whole games reach positions that a few careful ones
  never do. On Hexdom it found a point that could never be placed, which leaves the game stuck.
  When the bot throws, suspect the engine before the bot.

## Where a game's playtest files live

`games/<slug>/playtest/`:

- **`brief.md`** - what fills the braces in `prompt.md`: the address, the rules files, the rulings
  file, the controls, the budget.
- **`notebook.md`** - how to play well, turning points, open questions, what the engineers
  measured, and one line per game played. The playtester rewrites its own sections; the measured
  section is the Tech Lead's.
- **`reports/`** - one file per run, dated.

## Setting a run up

1. **Read the game's `brief.md`.** It holds every value the prompt needs.
2. **Check the address works and carries `?playtest=1`.** Open it and confirm the top bar shows the
   `PLAYTEST` tag. Without it the playtester would be playing on the Game Director's own save: on
   the live site in their browser it would overwrite `pnp:<slug>:state` and sync would offer that
   game to their iPad.
3. **Fill the braces in `prompt.md`.** Leave nothing in `{...}`.
4. **Ask the Game Director which way to run it**, every time - they may answer differently:
   - *they run it:* hand them the filled-in prompt as one copyable block, and list what to attach
     (rulebook pages, the sheets, the rulings file, the notebook). They paste it into a Claude chat
     and bring the blocks back.
   - *you run it:* use a fresh agent with browser tools only. It must not read this repo. Attach
     the same files.
5. **Say what it will cost** in rough terms before they choose. A full game is several hundred
   clicks.

## A finding needs a position, not a description

Every move goes through one `Command` and every die comes from the seeded RNG in the state, so the
seed plus the list of commands reproduces any position exactly. In playtest mode the game shows a
step number and copies its journal, and replays a pasted one (`games/recycled/src/ui/playtest.ts`
is the reference implementation). **A journal that ends in a bug is a regression test already
written.**

## Filing what comes back

- **Block A, the report** → `games/<slug>/playtest/reports/<YYYY-MM-DD>-<n>.md`, unchanged. It is
  evidence; don't edit it.
- **Block B, the notebook** → replace the playtester's sections of `notebook.md`. **Leave "Measured
  by the engineers" alone.** Add the game to the Results table.
- **Block C** is free-form. Read it and route it: findings to you, anything about how a rule reads
  or how the game looks to the Game Director.

Then:

- **Triage every finding against the code before acting.** The first run had three of eight
  findings turn on rules that were already settled, and one that the code contradicted.
- **Keep the journals that reproduce bugs**, reduced, as tests.
- **Turn the strategy into a measurement**, as above.
