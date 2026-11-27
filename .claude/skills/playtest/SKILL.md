---
name: playtest
description: Set up a playtest of a shelf game - fill in the prompt from the game's brief, ask the Game Director who runs it, and file what comes back. Use when a game is ready for stage 5b, when the Game Director asks for a playtest, or when a playtest report needs filing.
---

# Running a playtest

A playtest is a full game played by a Claude chat with a browser, the publisher's rulebook and **no
sight of the code**. See **Playtesting** in the repo's `CLAUDE.md` for the role and why it is not
QA.

## Setting one up

1. **Read `games/<slug>/playtest/brief.md`.** It holds every value the prompt needs.
2. **Check the address works** and carries `?playtest=1`. Open it and confirm the top bar shows the
   `PLAYTEST` tag — without it the playtester would be playing on the Game Director's own save.
3. **Fill the braces in `prompt.md`** from the brief. Leave nothing in `{...}`.
4. **Ask the Game Director which way to run it**, every time - they may answer differently:
   - *they run it:* hand them the filled-in prompt as one copyable block, and list what to attach
     (rulebook pages, both sheets, the rulings file, the notebook). They paste it into a Claude chat
     and bring back the blocks.
   - *you run it:* use a fresh agent with browser tools only. It must not read this repo - the
     whole value of the role is that it sees what a player sees. Attach the same files.
5. **Say what it will cost** in rough terms before they choose. A full game is several hundred
   clicks.

## Filing what comes back

- **Block A, the report** → `games/<slug>/playtest/reports/<YYYY-MM-DD>-<n>.md`, unchanged. It is
  evidence; don't edit it.
- **Block B, the notebook** → replace the playtester's sections of
  `games/<slug>/playtest/notebook.md`. **Leave "Measured by the engineers" alone** - that section is
  yours. Add the game to the Results table.
- **Block C** is free-form. Read it and route it: findings to you, anything about how a rule reads
  or how the game looks to the Game Director.

Then:

- **Triage every finding** against the code before acting. The last run had three of eight findings
  turn on rules that were already settled, and one that the code contradicted.
- **A journal that ends in a bug is a regression test.** Replay it, reduce it, and keep it.
- **Turn the strategy into a measurement.** Teach the playtester's rules of thumb to
  `games/<slug>/test/bot.ts` and run thousands of games. The win rate of a competent strategy from a
  normal start is the difficulty number the Game Director gets - the playtester's few games are not.
  Each open question in the notebook becomes a simulation; the answers go into "Measured by the
  engineers".
