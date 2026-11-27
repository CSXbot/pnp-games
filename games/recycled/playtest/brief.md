# Recycled: the playtest brief

What fills the braces in the playtest prompt (`.claude/skills/playtest/SKILL.md`). The shelf's
`CLAUDE.md` has the role and why it exists; this file is only the particulars.

| Brace | Value |
|---|---|
| Game and scope | Recycled, base game, Planet 1 |
| Address | `https://games.csx.tools/games/recycled/?playtest=1` — **the `?playtest=1` is not optional.** It gives the game its own save key and turns cloud sync off, so a playtest cannot overwrite the Game Director's shift or offer it to their iPad |
| The rules | `sources/recycled/`: the four rulebook pages, `EN A4 Sheet1 Planet1`, `EN A4 Sheet2`. Image-only PDFs, so attach them as images |
| Rulings already made | `games/recycled/RULES-NOTES.md`. **Not `SPEC.md`** — that describes the code, and the playtester should not inherit the code's reading of a rule |
| The notebook | `games/recycled/playtest/notebook.md` |
| Controls | `R` rolls · `1` / `2` select a die · `U` undoes within a turn · `Esc` cancels. Hover or tap a hex to inspect it; click to pin |
| Finding your place | The top bar shows `PLAYTEST · step N · seed S`. **Copy journal** puts the whole position on the clipboard as JSON; paste it into a report. **Load** replays a pasted journal |
| Budget | One full game. A shift is 75 days, or a launch ends it sooner |

## What to attach when the Game Director runs it by hand

The playtester has no repo access, so everything above that is a file has to be attached to the
chat: the rulebook pages and both sheets as images, `RULES-NOTES.md`, and `notebook.md`.

## What comes back

Three blocks. A goes to `playtest/reports/<date>-<n>.md`, B replaces the playtester's sections of
`notebook.md`, and C is read and routed: findings to the Tech Lead, anything about how a rule reads
or how the game looks to the Game Director.
