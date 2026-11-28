# Legend of Hexdom: the playtest brief

What fills the braces in the playtest prompt (`.claude/skills/playtest/prompt.md`). The shelf's
`CLAUDE.md` has the role and why it exists; this file is only the particulars.

| Brace | Value |
|---|---|
| Game and scope | Legend of Hexdom, the Hex Forest campaign: maps 1-3 (each with its own sidesheet A, B, C), solo, normal mode, characters Warrior, Archer and Mage |
| Address | `https://games.csx.tools/games/legend-of-hexdom/?playtest=1` - **the `?playtest=1` is not optional.** It gives the game its own save key and turns cloud sync off |
| The rules | `sources/Legend of Hexdom/English_Legend of Hexdom - Rulebook 1.2.pdf` (112 A5 pages with a text layer: the rules are p10-73, the three characters p76-77 Archer, p94-95 Mage, p106-107 Warrior); the assembled sheets `sources/Legend of Hexdom/Hex Forest/HexForest-Warrior/HF_1_Warrior-A4.pdf`, `HF_2_...`, `HF_3_...` (map + sidesheet + the Warrior's card); the Archer's and the Mage's cards in `.../A5-Classes/A5-CharacterSheet-Archer.pdf` and `-Mage.pdf` |
| Rulings already made | `games/legend-of-hexdom/RULES-NOTES.md`. **Not `SPEC.md`** - that describes the code |
| The notebook | `games/legend-of-hexdom/playtest/notebook.md` |
| Controls | Pick a die, then tap the hexes of the path one by one (green outline: the next step; green dot: a hex the die can end on); every action button shows what it will do before you press it; skills are under "Skill"/"Skills" in the turn panel; "Tables, Bosses, Gifts" opens the whole sidesheet; `U` undoes within a round, never past a roll |
| Finding your place | The top bar shows `PLAYTEST · step N · seed S`. **Menu** shows the journal (select the box and copy it), and loads a pasted one |
| Budget | One full game, to two Bosses or to the end. If there is room, a second with another character on another map |

## What to attach when the Game Director runs it by hand

The playtester has no repo access, so everything above that is a file has to be attached: the
rulebook PDF, the three A4 sheets, the Archer's and the Mage's cards, `RULES-NOTES.md` and
`notebook.md`.

## What comes back

Three blocks. A goes to `playtest/reports/<date>-<n>.md`, B replaces the playtester's sections of
`notebook.md`, and C is read and routed: findings to the Tech Lead, anything about how a rule reads
or how the game looks to the Game Director.
