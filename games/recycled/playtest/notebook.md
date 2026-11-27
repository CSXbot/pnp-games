# Recycled: the playtester's notebook

Started empty on 2026-11-27, deliberately: the first strategy recorded here should be a player's
own, not a transcription of `test/bot.ts`. The playtester rewrites "How to play well", "Turning
points", "What killed you", "Open questions" and "Results"; **"Measured by the engineers" is the
Tech Lead's** and is left alone.

## How to play well

*Rules of thumb in priority order, each a condition and an action specific enough to program.*

Nothing recorded yet.

## Turning points

*The two or three decisions that decided each game.*

Nothing recorded yet.

## What killed you

*And what you would do differently.*

Nothing recorded yet.

## Open questions

*Choices a few games could not settle, phrased so a simulation can answer them.*

Nothing recorded yet.

## Measured by the engineers

*Win rates from `test/bot.ts` over thousands of games, and the answers to the open questions above.*

- **2026-11-27.** Nothing measured against a playtester's strategy yet. The heuristic bot in
  `test/bot.ts` wins almost never from a normal start, and that number says nothing about
  difficulty: it is a bot written to exercise the late game, not to play well. A manual playtest on
  the same day won by launch on **day 17 of 75** (seed 779905127), so the real difficulty is not
  what the bot suggests.
- Ruling 10 (Automatrons offered rather than taken) is **not built**, and ruling 3 (Automatrons
  standing in for Batteries at launch) shortens the launch route considerably. Any difficulty
  number measured before both are in is provisional.

## Results

*One line per game: date, seed, outcome, day reached.*

| Date | Seed | Outcome | Day | Who |
|---|---|---|---|---|
| 2026-11-27 | 779905127 | Won, launched | 17 | manual run, before the role existed |
