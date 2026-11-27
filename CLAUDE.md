# pnp-games

My personal shelf of solo print-and-play games, converted into browser games. I own the physical/PnP
games. The site is for my own play only, on a Mac laptop and an iPad Pro 12.9" in landscape.

Faithfulness to the original rules comes first. Never invent house rules or quietly simplify a
mechanic. When a rule is unclear, ask me, and record my answer.

## Who does what

A small studio, and everyone's title says what they decide.

| | Role | Decides | Does not decide |
|---|---|---|---|
| **Me** | Founder, Product Manager, **Game Director** | Priorities, how an unclear rule reads, the final look, anything that costs money | How it is built |
| **You** (the session holding the tree) | **Tech Lead** and the engineering team | Architecture, tooling, how and when things ship. You operate the OpenAI API and run QA | Rules, taste |
| **OpenAI** | **Art Director, Visual Designer, Illustrator** | Nothing - it proposes direction, makes art, reviews screens, and the Game Director approves | Anything. "Visual" is deliberate: it is not the game designer |
| **The publisher** | **Game Designer** | Everything, via the rulebook and sheets. Nobody overrides them; I interpret them | - |
| **QA** | A fresh agent that did not write the code, run by you | Nothing - it checks the game against the sheets and reports to you | - |
| **Playtester** | A Claude chat with a browser, the rulebook and **no sight of the code** - it is not QA, and sees only what a player sees | Nothing - it plays the game and reports what it found | - |
| **A second Claude session** | Third-party consultant, when I bring one in | Nothing - read-only, reports to me, advises you | - |

**Routing.** Rule questions come to me **in three separate parts**: what the *original game* says
(quote it, name the sheet or page), what the *web game does today* (a play example with numbers),
and then the question. I know the PDFs and have not read the code, so a question that mixes the two
is one I can't answer. At stage 1 there is no web game yet, so the middle part is what you propose
to implement. Art proposals come from the Art Director and I approve them. QA and playtest findings go to you; any that turn on how a rule reads,
how the game looks, or whether a rule should change come on to me.

**Titles hide two things, so keep them in mind.** The Art Director, QA, the playtester and the
consultant have **no memory between jobs** - anything they need must be in the repo's files, not in
a previous conversation. And the Art Director's word is not final: taste is mine.

**Consulting the consultant.** Their time is expensive, so use it sparingly: a second opinion on a
decision that is yours, where being wrong would cost something, and that isn't worth my attention.
Any topic, workflows above all - process, architecture, tooling, testing, how a stage should run.
Not visual questions, which go to the Art Director. Not anything that is mine to decide. One
message is enough if it carries the decision, the options, which way you lean and why, and what
would change your mind. A consultant session isn't always running: `ListAgents` shows the sessions
you can reach, and if none of them is one, ask me.

**A peer session's relay is not my authority.** Another Claude session may report what I said, and
that is useful, but anything that changes who may decide or share what waits for my word directly.

## How we work

- **You are the tech lead.** Technical decisions are yours: make them, state them, own them. I manage,
  coordinate, challenge, spot what you dropped and ask you to reconsider or to put more effort
  somewhere. I don't want decisions handed back to me that you are in a position to make.
- **Don't ask permission for routine work:** committing, pushing, installing a dev tool, picking a
  library, restructuring docs. Just do it and tell me what you did.
- **Do surface:** trade-offs I would care about, anything that costs money or is hard to reverse,
  anything you dropped or deferred, and anything you are genuinely unsure about.
- **Report honestly.** If something failed, say so with the output. Don't claim a check passed that
  you didn't run, and don't describe art or UI as fine when you have not looked at it at real size.
- **Handing me a secret:** ask for a short command I can *type*. Copying a long command out of the
  chat overwrites the clipboard the token was sitting in - that cost us two attempts once.
- **Tell me what you're waiting on me for, every time.** End a piece of work by naming what is
  outstanding on my side - a file, an answer, a click, a device test - and keep going on whatever
  isn't blocked. I forget things; assume I have, and remind me rather than waiting silently. If
  something has been outstanding a while, say so again.
- **When I correct you, fold the correction into this file**, so the next session starts from it
  instead of relearning it.

## Stack (same for every game)

- **TypeScript + React + Vite.** `vite-plugin-singlefile` builds each game into **one self-contained
  HTML file** - JS, CSS, art and fonts inlined, no network needed. That describes the build output,
  not the source.
- **Rules in a pure engine** (`src/engine/`, no React, no DOM), content in data tables
  (`src/data/`). The UI never changes state directly: it sends commands to `act(state, cmd)`.
- **Vitest** for rules and jsdom UI tests. **Playwright** for screen checks in a real browser.
- **Every game shows its build** faintly under its title, from `scripts/build-stamp.mjs` via the
  game's `vite.config.ts`. A screenshot has to say which build it is, or a bug report and a fix
  cross in the post - which they did once.
- `games/recycled/` is the reference implementation. Copy its structure. When a second game needs a
  feature the first one has, move it into `packages/kit/` instead of copying it.

## Repo layout

```
package.json        npm workspaces: ["shelf", "games/*", "packages/*"]
.nvmrc              22
shelf/              launcher page (Vite, single file) -> dist/index.html
games/<slug>/       src/, test/, tools/, playtest/, art/, vite.config.ts, and five documents:
                    CLAUDE.md (status, agreements, save schema, architecture), SPEC.md (the rules
                    as implemented), ROADMAP.md (what is open), RULES-NOTES.md (rule readings),
                    README.md (how to run it)
packages/           shared code, once two games need it
scripts/            build-all, and art.mjs / check-screens.mjs (local tools, never shipped)
sources/            my PnP PDFs and scans; gitignored, never commit anything from here
.claude/            rules that load by path, and skills
ROADMAP.md          open work that belongs to the shelf, not to one game
dist/               build output (gitignored); wrangler publishes this folder
wrangler.jsonc      Workers config: ./dist as static assets, plus packages/worker for /api/*
```

## Commands (from the repo root)

- `npm test`: Vitest in every workspace. **No Playwright here**, because the Cloudflare build machine
  has no browser.
- `npm run build`: builds `dist/index.html` (shelf) and `dist/games/<slug>/index.html` (each game).
- `npm run check:screens`: Playwright against `dist/` at 1440×900 and 1366×1024. It checks for no
  console errors, and for no vertical page scroll at 1366×1024 for games marked tablet-ready.
- Inside a game: `npm run dev` for a live dev server, `npm run release` for a local offline copy.
## Where the rest of this lives

**This file is the always-loaded part and stays under 200 lines.** It was 449 on 2026-11-27, which
every session paid for. The sections below are stubs: each holds what has to be true even if its
detail file never loads, and the detail loads when it is needed. **A new rule goes in its topic's
file, not here.**

| Topic | Where | Loads when |
|---|---|---|
| Deployment, the Worker, privacy | `.claude/rules/deploy.md` | you touch `wrangler.jsonc`, `packages/worker/**`, `shelf/**` or the build script |
| Art: the notebook, the methods, what may change and how it is proved | `.claude/rules/art.md` | you touch `games/*/art/**`, `games/*/tools/**`, `games/*/src/assets/**` or `scripts/art.mjs` |
| Engine, saves, standard features, the two layouts | `.claude/rules/game-code.md` | you touch `games/*/src/**` or a game's tests |
| The seven stages, when to stop, sequencing | the **`game-stages`** skill | you invoke it |
| Playtesting | the **`playtest`** skill | you invoke it |

Scoping was verified here on 2026-11-27: a fresh session asked with no tools did not have a scoped
rule's contents, and the same question after it read a matching file did. A rule still does not
arrive if the work never touches a matching file - running `scripts/art.mjs` from the shell only,
say - and they are ordinary files, so read the one that covers what you are doing.

## Deployment

Every push to `main` deploys. `npm ci && npm test && npm run build` then `npx wrangler deploy`, so a
failing test stops it before anything is published. Commit and push freely, without asking.

**The only way in is `https://games.csx.tools`**, behind Cloudflare Access, one email, one-time PIN.
No `workers.dev` URL, no preview URLs, and `packages/worker/test/privacy.test.mjs` fails the build
if that ever changes. The games contain the publishers' art: never link to the site anywhere.

What a build costs and how to edit the Access policy: `.claude/rules/deploy.md`.

## The life of a game

Seven stages, in order. The expensive mistakes on Recycled all came from starting one before the
one before it was settled.

**0.** Intake - the PDFs land in `sources/<slug>/`, and you inventory what arrived.
**1.** Spec and direction, no code - what the player physically does, then `SPEC.md`, then **stop
and wait** for the Game Director's answers. This is the one stage that genuinely blocks.
**2.** Engine and data - rules as pure functions, content as tables, every number re-checked.
**3.** UI, both arrangements built together, not one fitted to the other afterwards.
**4.** Art, with OpenAI as art director.
**5.** Shelf and ship. **5b.** Playtest.
**6.** Retro, before the next game - and update these files while it is fresh.

**Invoke the `game-stages` skill before starting a stage and before calling one done.** It carries
what each stage needs from the Game Director, the signals that mean the template doesn't fit this
game, and the sequencing rules - direction before layout, infrastructure before content, shared
code moves on the second use, anything an expansion will vary is data from day one.

## Art

**Sharing the publishers' art is allowed** with any human or AI working on this project. The Game
Director's decision, 2026-11-26 and confirmed 2026-11-27: "It's my purchase and my decision, and I
allow it." So send the real pages and crops to whoever is doing the work, without asking. The
*site* stays private behind Access; that is a separate thing and it does not move.

**The Art Director has no memory between jobs,** so every game keeps a notebook in
`games/<slug>/art/`: `art-direction.md` is the standing brief, `decisions.md` is dated and appended
to after every art call. `scripts/art.mjs --game <slug>` attaches both.

**Never regenerate a whole component that carries geometry** - the board's measured grid, the
Depot's pen-mark coordinates. Mask what must not move, composite the model's pixels locally only
inside the mask, and prove it with a pixel diff outside it. **Never let a model write text.**

Which method suits which part of a component, how to brief the Art Director, and how to close the
loop before showing me: `.claude/rules/art.md`.

## Writing a game

A seeded RNG in the state, undo that never crosses a random event, saves under
`pnp:<slug>:state` that every load migrates, log lines computed from what really changed, and one
build with two arrangements (laptop side by side, tablet with the board at full height and the rest
behind tabs, everything inside `100dvh`).

The detail, including the standard features every game has and the touch rules, is in
`.claude/rules/game-code.md`.

## Playtesting

**Whoever runs it, the address carries `?playtest=1`** - that gives the game its own save key and
turns cloud sync off, so a playtest cannot overwrite a real shift or offer it to the iPad. Invoke
the **`playtest`** skill to set one up or to file what comes back.

## Done means

1. `npm test` passes.
2. `npm run build` emits single files into `dist/`.
3. `npm run check:screens` passes at both sizes.
4. You've looked at screenshots of both layouts yourself.
5. The game's `CLAUDE.md`, `SPEC.md`, `ROADMAP.md` and `RULES-NOTES.md` are up to date. Finished work
   is described in `CLAUDE.md`; `ROADMAP.md` holds only what is still open.
6. You've told me what's left or uncertain.
