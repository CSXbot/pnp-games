# Rules notes

The rulebook leaves some questions open. This file lists how this digital version answers them.
If you read a rule differently, the place to change it is named after each item.

## Starting position (Planet 1)

Read from the pre-drawn sheet (`src/data/maps.ts`):

| Building | Hex (row, col from top) | Circles drawn |
|---|---|---|
| Oxygen Plant (on ice) | 3, 4 | 6 of 6 Oxygen |
| Food Plant | 2, 2 | 3 of 6 Food |
| Cryo Tank, joined to the Food Plant | 1, 1 | 2 of 4 Food |
| Research Site | 4, 6 | 4 of 6 Sanity |
| Separator, installed | 3, 6 | 3 of 6 Materials |
| Recycler, joined to the Separator | 4, 7 | 2 of 4 Materials |

The Depot starts with Sanity 2, Food 4, Radiation 4, Materials 6. Power has 3 boxes circled and one
darkened, so 2 Power.

## Resources and storage

1. **Oxygen has no Depot row.** It only exists in buildings: Oxygen Plants and Cryo Tanks.
2. **Losing or spending takes from buildings first, then the Depot.** The rulebook recommends this,
   and the game does it for you (`takeOne` in `src/engine/game.ts`).
3. **Building storage is a lifetime limit.** A spent circle stays drawn, so a building can produce at
   most its capacity over the whole game.
4. **Depot rows have 31 boxes.** Sanity beyond the last box becomes a Material, as printed. For other
   rows, gains past box 31 are lost.
5. **You lose when the total of Food, Oxygen, Sanity or Radiation protection reaches 0.** The total is
   Depot plus buildings.

## Dice and actions

6. **Produce and Recycle give 1 per 2 AP, up to 3; Salvage gives 1 per 3 AP, up to 2.** The caps come
   from the [x2/x3] marks on the action menu and also apply to combined dice, so combining gains nothing
   for these actions. Each action uses one building with free space. The rulebook's "6 and 4 AP recycle
   5 Materials" example is two separate dice: 3 + 2.
7. **Producing at a Food or Oxygen Plant overflows into its joined Cryo Tank.** The rulebook mentions
   "Food plants (or connected Cryo tanks)".
8. **Set up steps repeat within a single die, but combined dice buy only one step.** A 6 AP die does
   both Recycler steps, and a 3 AP die does all 3 Separator steps. 2+4 combined does only one Recycler
   step: the rulebook says you can't use 2 and 4 AP to build the Recycler.
9. **Double 1s merge into one 2 AP die, and the third die is your second action die.** There is no
   accident that turn. The merged die can't be split back into 1s. Triple 1s give a single 6 AP die
   and no accident.
10. **Unused dice cost 1 Sanity each.** An unused combined pair costs 2.
11. **Construction is one action.** The die (or combined dice) must be at least the card's AP cost, and
    no change is given.

## Accidents and consumption

12. **The accident roll is the die you set aside plus one new die**, giving 2–12. Positive results go
    into the Depot.
13. **Consumption happens after the accident, on days 5, 10, 15 and so on.** The amounts depend on the
    stage under the day counter.
14. **Surviving day 75 wins**, after that day's consumption.

## Buildings

15. **A Cryo Tank stores the resource of the plant it's joined to.** If a new Cryo Tank or Recycler
    touches more than one building it could join, you choose which one.
16. **A full Research Site gives +1 Radiation protection, and +1 Sanity for every other full Research
    Site.** This happens once, when it becomes full.
17. **The Amplifier's "six Nuclear Pods" bonus (+3 Power) happens once.**
18. **Transceivers need at least 3 hexes between them** (hex distance 4 or more). Owner's ruling for
    "at least 3 hexes away".
19. **The Rover must be built on an inner hex.** It then unlocks the outer ring.

## Tech bonuses

20. **The Sanity counter's T marks are boxes 8, 16, 23 and 31.** A bonus triggers when a gain reaches
    one of them.
21. **A full Laboratory also gives one tech.** There are 5 bonus boxes in total, each usable once.

## Automatrons

The card says an Automatron "can be used every time instead of any other resources, except Power".
In this version that means the following. Automatrons do not replace Batteries for the launch.

22. **Automatrons cover a Materials shortfall when you construct.** This happens automatically, and only
    for what you're missing.
23. **An Automatron is used in place of your last unit of Food, Oxygen, Sanity or Radiation.** So it
    can save your life.
## Launch

24. **You can launch whenever you have 3 Transceivers, 6 Batteries, 5 Oxygen and 5 Food.** Batteries
    count as crafted, ticked on the manual. Launching wins immediately.
