# Recycled: the rules as implemented

What the engine actually does. Every number here was checked against the printed sheets at full
resolution. Where this file and the code disagree, the code and its tests are the truth: fix this
file. Player-facing readings of ambiguous rules are in `RULES-NOTES.md`; decisions you must not
change on your own are in `CLAUDE.md`.

**There is no score.** The game ends in a **win** (launch, or survive 75 days) or a **loss**. The
game-over screen shows "Days survived", the building count and the Batteries crafted, but these are
just information. If the owner wants a score, it's a new feature and needs a formula from them.

Where each kind of rule lives in code:

- **Data:** `src/data/rules.ts` (tables) and `src/data/buildings.ts` (cards).
- **Logic:** `src/engine/game.ts`.

## Resources

| Resource | Lives in | Notes |
|---|---|---|
| Food, Sanity, Radiation protection ("Rad. prot."), Power, Materials | Depot row (31 boxes each) **and** building storage | Power only exists in the Depot, since no building stores it. |
| Oxygen | **Buildings only** (Oxygen Plant, Cryo Tank) | No Depot row. A gain with no free building space is lost. |
| Automatron | Laboratory storage | Can be spent in place of Materials and vital resources (see above). |
| Battery | Workshop storage; `state.batteries` counts how many were crafted | Crafting one also gives +1 Radiation protection to the Depot. |

- **Vital resources** (`VITAL`): Food, Oxygen, Sanity, Radiation. If the **total** (Depot plus
  buildings) of any of them reaches 0, you lose.
- **Spending order** (`takeOne`): the first complete building that has stock, in building creation
  order, then the Depot. Automatrons come last, and only for Materials or a vital resource's last unit.
- **Depot row** (`depot[r] = { gained, lost }`):
  - Stock is `gained − lost`.
  - Boxes never come back: a box that has been gained and then lost stays spent.
  - `gained` is capped at 31.
  - Sanity past box 31 becomes **+1 Materials**, if Materials has room. Any other row that's full loses
    the gain, and the log says "did not fit".
- **Building storage** (`drawn`, `used`): `drawn` counts every circle ever drawn and is capped at
  capacity. Circles never free up again, so every building has a **lifetime** output limit.
  "**Full**" means `drawn == capacity`.

## Setup (Planet 1, `src/data/maps.ts`)

Map rows (B blank, C crater, I ice, T trash, S shuttle):

```
BITBT / BBBIBB / BBBBBBB / CCBBIBTT / TTBBSBCBB / TBBBBBCT / TTBBBBB / CCBBBB / TBBIB
```

- **Hexes:** 61 in total. The 24 hexes in the outer ring are **locked until a Rover is complete**.
  Nothing can be built on the shuttle hex.
- **Pre-built** (sheet row, col from the top; circles drawn):

  | Building | Hex | Circles drawn |
  |---|---|---|
  | Oxygen Plant | (3,4) | 6/6 |
  | Food Plant | (2,2) | 3/6 |
  | Cryo Tank (Food), joined to the Food Plant | (1,1) | 2/4 |
  | Research Site | (4,6) | 4/6 |
  | Separator, installed | (3,6) | 3/6 |
  | Recycler, joined to the Separator | (4,7) | 2/4 |

- **Depot at start:** Sanity 2, Food 4, Radiation 4, Materials 6, Power 2 (3 boxes gained, 1 spent).
- **Starting totals:** Food 9, Oxygen 6, Sanity 6, Radiation 4, Power 2, Materials 11.

## Buildings (`src/data/buildings.ts`)

| Building | AP | Mat | Pwr | Storage | Placement / limit | Effect |
|---|---|---|---|---|---|---|
| Food Plant | 5 | 4 | 1 | 6 Food | any free hex | +1 local Food. On completion: **+2 Food to Depot for each other complete Food Plant adjacent**. Produces. |
| Oxygen Plant | 5 | 4 | 1 | 6 Oxygen | **ice** | +1 local Oxygen. Produces. |
| Cryo Tank | 4 | 1 | 1 | 4 (Food **or** Oxygen) | adjacent to a complete Food/Oxygen Plant **not already joined** | Joined to that plant and stores the plant's resource. +2 local. Produces. |
| Research Site | 6 | 2 | 0 | 6 Sanity | **crater** | +1 local Sanity. **Once Full: +1 Radiation to Depot, +1 Sanity per other Full Research Site** (once). Produces. |
| Nuclear Pod | 5 | 3 | 0 | none | any | **+1 Power, or +2 if adjacent to an Amplifier** |
| Amplifier | 6 | 4 | 0 | none | any | **+1 Power per adjacent Nuclear Pod** on completion. **+3 Power once** if it's ever adjacent to six Pods. |
| Separator | 1 per step, 3 steps | 0 | 0 | 6 Materials | **trash** | Built with the "Set up Separator" action. Enables Salvage. |
| Recycler | 3 per step, 2 steps | 0 | 0 | 4 Materials | adjacent to an **installed**, un-joined Separator | Built with "Set up Recycler". Joined to the Separator. Enables Recycle. |
| Rover | 7 | 5 | 1 | 6 Sanity | any unlocked hex (so an inner one) | +1 local Sanity. **Unlocks the outer ring.** Produces. |
| Transceiver | 1 | 1 | 1 | 3 Sanity | **3 hexes between** it and other Transceivers (distance ≥ 4); limit 3 | +3 local Sanity |
| Laboratory | 8 | 5 | 2 | 6 Automatrons | limit 1 | +3 local Automatrons. Enables Craft Automatron. **Once Full: one free tech.** |
| Workshop | 7 | 6 | 2 | 6 Batteries | limit 1; needs a complete Laboratory | Enables Craft Battery. |

**Construction:**
- **Paying:** one die (or a combined pair) with value ≥ the AP cost. No change is given back.
- **Materials:** paid from buildings, then the Depot, then Automatrons for any shortfall.
- **Power:** paid from the Depot only.
- **Completion:** everything except the setup buildings completes instantly.
- **Error priority:** when a building can't be built, the reason shown follows this order:
  1. AP too low.
  2. Can't afford it (shown first so the player sees "Needs 2 Power (you have 0)", not "no valid hex").
  3. Placement.

## Turn sequence (`apply()` in `game.ts`)

`state.day` = days **completed**. The current day is `day + 1`.

1. **Roll** (`roll`): 3 d6 from the seeded RNG.
   - **Three 1s:** one locked 6 AP die and no accident. Go straight to the action phase.
   - **Two 1s:** a locked 2 AP die plus the third die, and no accident. Go straight to the action phase.
   - **Otherwise:** the `choose` phase.
2. **Choose the accident die** (`chooseAccident`). The other two dice become the action dice.
3. **Actions** (`actions` phase):
   - Each action die is used once. The UI can apply actions to either die.
   - `combine` merges two unused dice into one die worth their sum. That includes a locked 2.
   - `split` undoes a combine, as long as the combined die is unused.
   - Action costs:

     | Action | AP | Result |
     |---|---|---|
     | Set up Separator | 1 | 1 step per AP |
     | Recycle | 2 | 1 Material per 2 AP, max 3 |
     | Produce | 2 | 1 per 2 AP, max 3 |
     | Salvage | 3 | 1 Material per 3 AP, max 2 |
     | Set up Recycler | 3 | 1 step per 3 AP |
     | Study | 5 | +1 Sanity |
     | Craft (Automatron or Battery) | 6 | +1 |
     | Fix Rad Fuse | 7 | +1 Radiation |
     | Construction | card's AP | |

   - **Repeatable actions** (Produce, Recycle, Salvage, setup steps) repeat as many times as fit into
     the die, up to their caps. Each repeat targets the **one** chosen building and stops when that
     building is Full.
   - **Produce at a plant:** overflows into the plant's joined Cryo Tank.
   - **Combined dice:** buy only one setup step.
4. **End turn** (`endActions`), in this exact order:
   1. Sanity penalty for unused dice.
   2. Accident: the kept die plus a fresh d6 (2–12) looks up the accident table. Positive effects go to
      the Depot.
   3. On days divisible by 5, consumption for the current stage:

      | Days | Consumption every 5th day |
      |---|---|
      | 1–10 | −1 Food, −1 Oxygen |
      | 11–25 | adds −1 Sanity |
      | 26–50 | adds −1 Radiation |
      | 51–65 | −2 Sanity, −1 Radiation |
      | 66–75 | −2 Sanity, −2 Radiation |

   4. `day++`.
   5. If `day == 75`, **win**.

   The vital check runs after each of these steps. The first resource to hit 0 ends the game, and the
   rest of the turn doesn't happen.

## Accident table (2–12)

| Roll | Accident | Effect |
|---|---|---|
| 2 | Power outage | −2 Radiation, −2 Sanity |
| 3 | Spacesuit breach | −2 Radiation |
| 4 | Overexposure | −1 Radiation |
| 5 | Injury | −2 Sanity |
| 6 | Food poisoning | −1 Sanity, −1 Food |
| 7 | Anxiety attack | −1 Sanity |
| 8 | Oxygen leak | −1 Oxygen |
| 9 | Infection | −1 Food |
| 10 | Reading at work | +1 Sanity |
| 11 | Surplus produce | +1 Food |
| 12 | Motor overdrive | +1 Materials |

## Tech bonuses

- **Triggers:**
  - Any Sanity gain whose box reaches **8, 16, 23 or 31**.
  - A Laboratory becoming Full.
- **Choices:** five boxes, each usable once: `[+3 Power, +3 Power, +3 Radiation, +3 Radiation,
  +3 Radiation]` (the `techTaken` index order).
- **Pending:**
  - `techPending` counts choices owed, capped at the boxes still free.
  - While it's above 0, **every command except `tech` is refused**, and the UI shows a pop-up.
  - Once all five boxes are taken, further triggers do nothing.

## End conditions

- **Win by launch** (`launch`):
  - **When:** whenever `phase` is `roll`/`choose`/`actions`, no tech choice is pending, and you have
    **3 complete Transceivers, 6 crafted Batteries, total Oxygen ≥ 5 and total Food ≥ 5**.
  - **Resources:** none are consumed.
  - **Result:** an immediate win.
- **Win by survival:** finishing day 75's End turn without losing.
- **Lose:** the total of a vital resource reaches 0. The message is "You lost your last unit of X."
  It's always the last log line.

## Edge cases that aren't obvious from the code

- **Automatron life-saving:** it only triggers when the total of that resource is ≤ 1. It spends an
  Automatron *instead of* the unit, which keeps you at 1.
- **Choosing the join partner:**
  - **With one candidate** (an adjacent, complete, un-joined plant or Separator), it's joined
    automatically.
  - **With more than one,** the command needs `params.joinTo` (that building's hex). Without it the
    engine refuses with "Choose which plant the Cryo Tank joins." / "Choose which Separator the Recycler
    joins.". The UI then asks with a second click on the map.
  - **For a Recycler,** this only matters on its first setup step; later steps continue the same site.
- **Amplifier bonus scope:** "Adjacent to six Pods" counts only **complete** Pods. The check runs after
  every completed building.
- **Research Site bonus timing:** the Full bonus counts *other* Full Research Sites at the moment this
  one fills. It isn't paid again later.
- **Combining a locked die:** combining the locked 2 (double 1s) with the other die is allowed. The
  merged die is then an ordinary combined die and can be split back.
- **Undo** (UI only): Undo works within a turn and can't go back past `roll` or `endActions`, so you
  can't reroll or redo an accident.
