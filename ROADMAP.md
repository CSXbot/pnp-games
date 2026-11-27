# Shelf roadmap

Open work that belongs to the shelf rather than to one game. Each game keeps its own
`games/<slug>/ROADMAP.md`; `CLAUDE.md` describes how things already are. Items marked **(you)** wait
on the owner.

## Tooling

From the review session's proposal, 2026-11-27 (`claude_exchange/2026-11-27 pnp-games tooling
proposal.md`), ranked by value for effort.

Done: one API client, not three (`gen-image.mjs` is gone); the Art Director's notebook; privacy as a
test (`packages/worker/test/privacy.test.mjs` fails the build if `workers_dev` or `preview_urls` is
ever true, or if the Worker answers on anything but the custom domain - verified by breaking it on
purpose); and the split of this file's big sibling, `CLAUDE.md`, from 449 lines to under 200, with
the rest in `.claude/rules/` and `.claude/skills/`. The `paths:` mechanism was verified here first:
a fresh session asked with no tools did not have a scoped rule's contents, and the same question
after it read a matching file did.

| | What | Why it earns its place |
|---|---|---|
| **Pre-push gate** | Tracked `.githooks/pre-push` running tests, build and screen check; `git config core.hooksPath .githooks` | A push deploys, so a broken push is a broken site. The suite is ~30s |
| **Owner's queue at session start** | `SessionStart` hook running `grep -n "(you)" */ROADMAP.md` | Makes the "tell me what you're waiting on" rule mechanical instead of remembered |
| **Sheet audit** | A `sheet-audit` skill and a fresh-context agent: crop every table and card at 300 dpi, compare against `src/data/`, produce a `### Data Review Request` | The Research Site misread survived a status line claiming every rule was re-checked. Art gets a second reader; numbers get none |
| **Resolution check in `check:screens`** | Compare each image's native size against its displayed size at 2x; report anything stretched | Would have caught the 400px cards being upscaled, and the blurred manual, without anyone looking |
| **`/intake` skill** | Render pages once to a gitignored cache, record native resolution and text layer, write the inventory, then run the direction job | Stage 0 is four commands every time, and the direction job is the one that gets skipped |
| **WebKit for the iPad check** | `npx playwright-core install webkit`, local only | Everything so far has been checked in Chrome; the iPad is Safari |
| **Python deps declared** | A dependency header in each tool plus `uv` | Pillow, numpy, opencv and poppler are installed by hand today, recorded only in prose |
| **Cloudflare MCP swap** | `claude mcp add --transport http cloudflare` | The connected one calls itself deprecated and needed an explicit account id for every call |

Not worth adding, with reasons: a Playwright MCP, a GitHub MCP, an image-generation MCP, a second
image provider. The scripts, `gh` and one client already cover them.

## Open from the cold read of the split (2026-11-27)

A fresh agent was given stages 0 to 2 of a new game using only what the files say
(`claude_exchange/2026-11-27 cold read of the CLAUDE.md split (a7f35ca).md`). Guess points fell
from 17 to 10. Fixed since: the three-part form was used in the root file and defined only in the
stage file, the art stub was missing the geometry and mask-and-composite clause, `scripts/art.mjs`
and three lines of `stages.md` still pointed at sections that had moved, and "if none is listed"
didn't say where consultants are listed. **Still open, all of them older than the split:**

- **Stage 0 has no home for what it produces.** Where the inventory is written and where rendered
  pages are cached; and when `games/<slug>/` and its five documents come into existence.
- **A stage-2 workspace on `main` either breaks the deploy or goes live before stage 5.** Every
  push deploys, and a half-built game is in the build. Needs an answer: a branch, or a `pnp.draft`
  flag the shelf and `build-all` skip.
- **The `packages/kit` move has no stage.** When it happens, whether it has its own tests, which
  document describes it. It will land in game 2's stage 3 either way.

## Housekeeping

- **(you) Turn off the connectors this project doesn't use** - Airtable, Notion, Gmail, Drive,
  Calendar. Roughly 150 tool names and their instructions load into every session here. Two ways:
  `/mcp` switches a server off per project (saved in `~/.claude.json`), or
  `{"disableClaudeAiConnectors": true}` in `.claude/settings.json` turns them all off for anyone
  who opens this repo. The second is all-or-nothing and costs us nothing: nothing here uses a
  connector, and the deprecated Cloudflare one is unused too (everything goes through `npx
  wrangler`). **Say the word and I'll add the line** - it's config, so it waits for yours.
  **Measured 2026-11-27:** a headless session in this repo starts with 238 tools and ~290,000
  tokens of context before it does anything, $2.40 for a single turn. With the connectors off: 22
  tools, 15,730 tokens, $0.13. That is 95% of start-up context, and every agent we run pays it.
- **A shelf icon of its own.** The cosmonaut helmet is Recycled's identity and currently serves both
  pages. When a second game lands, the shelf wants its own and each game links its own.
- **`packages/kit`.** Save sync, the new-game dialog, the top bar and display settings are all shelf
  features living in one game. They move the second time a game needs them, not the first - but the
  stage map has no step for that extraction, and game 2's stage 3 is where it will land.
