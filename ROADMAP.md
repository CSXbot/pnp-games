# Shelf roadmap

Open work that belongs to the shelf rather than to one game. Each game keeps its own
`games/<slug>/ROADMAP.md`; `CLAUDE.md` describes how things already are. Items marked **(you)** wait
on the owner.

## Tooling

From the review session's proposal, 2026-11-27 (`claude_exchange/2026-11-27 pnp-games tooling
proposal.md`), ranked by value for effort. Done: one API client, not three (`gen-image.mjs` is gone); the Art Director's notebook; and privacy
as a test - `packages/worker/test/privacy.test.mjs` fails the build if `workers_dev` or
`preview_urls` is ever true, or if the Worker answers on anything but the custom domain. Verified by
breaking it on purpose.

| | What | Why it earns its place |
|---|---|---|
| **Pre-push gate** | Tracked `.githooks/pre-push` running tests, build and screen check; `git config core.hooksPath .githooks` | A push deploys, so a broken push is a broken site. The suite is ~30s |
| **Owner's queue at session start** | `SessionStart` hook running `grep -n "(you)" */ROADMAP.md` | Makes the "tell me what you're waiting on" rule mechanical instead of remembered |
| **Sheet audit** | A `sheet-audit` skill and a fresh-context agent: crop every table and card at 300 dpi, compare against `src/data/`, produce a `### Data Review Request` | The Research Site misread survived a status line claiming every rule was re-checked. Art gets a second reader; numbers get none |
| **Resolution check in `check:screens`** | Compare each image's native size against its displayed size at 2x; report anything stretched | Would have caught the 400px cards being upscaled, and the blurred manual, without anyone looking |
| **`/intake` skill** | Render pages once to a gitignored cache, record native resolution and text layer, write the inventory, then run the direction job | Stage 0 is four commands every time, and the direction job is the one that gets skipped |
| **WebKit for the iPad check** | `npx playwright-core install webkit`, local only | Everything so far has been checked in Chrome; the iPad is Safari |
| **Split the shelf rules** | Move the Art section and per-stage prose out of `CLAUDE.md` into files that load on demand | It is 345 lines and loads into every session. **Verify the mechanism first** - a `paths:`-scoped rules file is not something I have confirmed exists |
| **Python deps declared** | A dependency header in each tool plus `uv` | Pillow, numpy, opencv and poppler are installed by hand today, recorded only in prose |
| **Cloudflare MCP swap** | `claude mcp add --transport http cloudflare` | The connected one calls itself deprecated and needed an explicit account id for every call |

Not worth adding, with reasons: a Playwright MCP, a GitHub MCP, an image-generation MCP, a second
image provider. The scripts, `gh` and one client already cover them.

## Housekeeping

- **(you) Turn off the connectors this project doesn't use** - Airtable, Notion, Gmail, Drive,
  Calendar. Roughly 150 tool names and their instructions load into every session here. `/mcp`
  switches a server off per project.
- **(you) Archive `~/code/recycled-game`.** The pre-migration copy, with its own private GitHub
  repo. A session opened there edits a dead tree.
- **A shelf icon of its own.** The cosmonaut helmet is Recycled's identity and currently serves both
  pages. When a second game lands, the shelf wants its own and each game links its own.
- **`packages/kit`.** Save sync, the new-game dialog, the top bar and display settings are all shelf
  features living in one game. They move the second time a game needs them, not the first - but the
  stage map has no step for that extraction, and game 2's stage 3 is where it will land.
