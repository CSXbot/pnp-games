# pnp-games

My personal shelf of solo print-and-play games, converted into browser games. I own the physical/PnP
games. The site is for my own play only, on a Mac laptop and an iPad Pro 12.9" in landscape.

Faithfulness to the original rules comes first. Never invent house rules or quietly simplify a
mechanic. When a rule is unclear, ask me, and record my answer.

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
  HTML file**: JS, CSS, art and fonts all inlined, no network needed. "Single file" describes the
  build output, not the source.
- **Rules in a pure engine.** Put them in `src/engine/` (no React, no DOM) and the game content in data
  tables (`src/data/`). The UI never changes state directly. It sends commands to `act(state, cmd)`,
  which checks them against the rules and returns a new state.
- **Vitest** for rules tests and for UI tests in jsdom. **Playwright** for screen checks in a real
  browser.
- `games/recycled/` is the reference implementation. Copy its structure for new games. When a second
  game needs a feature the first one has (save export, manual dice, top bar), move it into a shared
  workspace `packages/kit/` instead of copying it.

## Repo layout

```
package.json        npm workspaces: ["shelf", "games/*", "packages/*"]
.nvmrc              22
shelf/              launcher page (Vite, single file) -> dist/index.html
games/<slug>/       one game per folder: src/, test/ (or tests/), tools/, vite.config.ts,
                    CLAUDE.md (status, agreements, save schema, architecture),
                    SPEC.md (the rules as implemented), ROADMAP.md (what is left, decisions),
                    RULES-NOTES.md (rule interpretations), README.md (how to run it)
packages/           shared code, once two games need it
scripts/            build-all script that assembles dist/
sources/            my PnP PDFs and scans; gitignored, never commit anything from here
dist/               build output (gitignored); wrangler publishes this folder
wrangler.jsonc      Workers config: ./dist as static assets, no Worker script
```

## Commands (from the repo root)

- `npm test`: Vitest in every workspace. **No Playwright here**, because the Cloudflare build machine
  has no browser.
- `npm run build`: builds `dist/index.html` (shelf) and `dist/games/<slug>/index.html` (each game).
- `npm run check:screens`: Playwright against `dist/` at 1440×900 and 1366×1024. It checks for no
  console errors, and for no vertical page scroll at 1366×1024 for games marked tablet-ready.
- Inside a game: `npm run dev` for a live dev server, `npm run release` for a local offline copy.

## Deployment

- **Cloudflare Workers with static assets** (not Pages). `wrangler.jsonc` at the repo root serves
  `./dist` as assets, with no Worker script. The build and deploy are
  `npm ci && npm test && npm run build`, then `npx wrangler deploy`. A failing test stops the deploy,
  because the chain stops. Add `--dry-run` to check the config without publishing.
- `html_handling: "auto-trailing-slash"` means `/games/<slug>/` is the real URL; a request for
  `/games/<slug>/index.html` is redirected to it. Keep the shelf's links pointing at `index.html`
  anyway, so the same `dist/` also works when opened as plain files.
- **Commit and push freely, without asking** (my instruction, 2026-11-26). Pushing to `main` triggers
  a Workers build (`npm ci && npm test && npm run build`, then `npx wrangler deploy`), so every push
  deploys. A failing test stops it before anything is published.
- **What a build costs:** Workers Builds gives **3,000 build minutes a month free**, and serving the
  built site is free and unlimited, because static assets aren't billed. Our builds run about 4
  minutes warm and 12 minutes cold (`npm ci` dominates: `wrangler` pulls a `workerd` binary), so
  roughly 700 pushes a month fit in the allowance. Don't batch commits to save builds; it isn't worth
  the bookkeeping.
- **The only way in is `https://games.csx.tools`,** a custom domain on the `pnp-games` Worker.
  `workers_dev` and `preview_urls` are `false` in `wrangler.jsonc`: no `*.workers.dev` URL, no preview
  URLs. Keep them off — the games contain the publishers' art. Never link to the site anywhere.
- **Cloudflare Access** guards it, and the Access application's destination is the *Worker*, not a
  hostname, so every URL the Worker ever answers on is covered. One policy, `Only tuzikov@gmail.com`,
  allows that one email; login is by one-time PIN (or Cloudflare account login, same address) and a
  session lasts 1 month (`730h`). Team domain: `tuzikov.cloudflareaccess.com`.
- That policy is **reusable** (account-level), so edit it at `/accounts/<id>/access/policies/<id>`.
  The application endpoint refuses with `can not update reusable policies through this endpoint`.
- **Verified on 2026-11-26:** from a fresh browser session `https://games.csx.tools` asks for login,
  the one-time PIN to that inbox gets in, and the shelf and Recycled load with their art.

## The life of a game

Every game goes through these stages in order. The expensive mistakes on Recycled all came from
starting a stage before the one before it was settled.

**This is a map for both of us, not a checklist I run alone.** Each stage says what I do and what I
need from you. When something of yours is missing I ask for it by name - which file, which answer,
which switch in a dashboard - rather than guessing or going quiet, and I keep working on whatever
isn't blocked while I wait.

**0. Intake.** The PDFs land in `sources/<slug>/`, gitignored, never committed. Inventory what
arrived - base game, expansions, extra maps - and write the list down before reading any of it
closely. PnP PDFs are usually image-only with no text layer, so render pages at 150-300 dpi and look
at them.
**You:** put the files there - every sheet, every rulebook page, and any expansion. If something
looks missing (a Sheet 2, a page 4, a map referred to by another file) I name the file I need.

**1. Spec, no code.** Write `games/<slug>/SPEC.md` covering:
1. Components and setup, including the exact starting state of the sheet.
2. Sheet anatomy: every grid, track, box, counter and bonus mark.
3. The turn loop, step by step.
4. Legality rules, and what happens when no move is legal.
5. End of game, scoring formulas, or win/lose conditions.
6. Asset triage (see **Art**).
7. **Ambiguities:** a numbered list of questions for me.

Then stop and wait for my answers or "Approved". **Rules are the exception to "decide it yourself":**
how an ambiguous rule should read is mine to settle, because faithfulness to the original comes
first. Record each answer in `RULES-NOTES.md` and each ruling in the game's `CLAUDE.md`.
**You:** answer the numbered questions. This is the one stage that genuinely blocks - guessing a rule
here is how a game ends up quietly wrong.

**2. Engine and data.** Content as tables in `src/data/`, rules as pure functions in `src/engine/`,
tests alongside: exact-wording cases for every effect, plus simulated games asserting every log line
against the real change in state. Check every number against the sheets at full resolution. Misreads
are the most common bug, cheap to fix now and expensive later.
**You:** nothing, unless a number on a sheet is unreadable even at full resolution - then I show you
the crop and ask rather than picking the likelier digit.

**3. UI, responsive from the start.** The screen never changes state directly; it sends commands to
`act(state, cmd)`. Highlight only legal targets, from the same function the engine uses, so
highlighting can't drift from the rules, and show the exact reason anything is unavailable. Build
**both arrangements together** (see **Layout**) rather than fitting a laptop layout to a tablet
afterwards - Recycled needed a second pass only because it was built before the iPad was a target.
Flip `pnp.tabletReady: true` only once `npm run check:screens` passes with it enforced.
**You:** try it on the real device once it fits. I can measure that nothing scrolls; I can't feel
whether a tick box is big enough for a finger.

**4. Art.** Triage per **Art**, cut from the PDFs in `games/<slug>/tools/`, inline everything, and
finish with an `### Art Review Request`. Art is never done on your say-so.
**You:** look at that review, with ChatGPT where a second eye helps, and make any art that isn't in
the PDFs from the `### External Image Request` I give you. I build against a placeholder so nothing
waits on it.

**5. Shelf and ship.** Register the game on the shelf, push, confirm the deploy, and play it on the
real device.
**You:** anything that needs your account rather than an API token - billing, a plan upgrade, an
account-level switch in a dashboard. I tell you exactly what to click.

**6. Retro, before the next game.** Stop and improve the process while it is fresh:

- What cost more than it should have, and which stage it leaked out of.
- What I got wrong **twice**. That is a line in this file, not something to remember harder.
- Move finished work out of the game's `ROADMAP.md` into its `CLAUDE.md`.
- Correct this file where it proved wrong - the stages, the sequencing rules, the art triage. A
  workflow that never changes is a workflow nobody is reading.

**You:** tell me what annoyed you that I didn't notice.

Don't save it all for the end. Stop and update this file whenever you correct me twice on the same
thing, a stage costs a multiple of what I predicted, or a tool keeps fighting us.

### When it isn't working

**The template is a default, not a constraint.** It was derived from one game. A game that doesn't
fit it is information, not a failure - and bending the game to fit is the one thing that is never
allowed, because faithfulness to the original comes first.

Say it out loud early, with the cost so far and the estimated cost to continue, and propose one of:
deviate for this game, change the shelf's default, switch tools, or don't convert this game at all.
The cheapest moment to notice a game doesn't fit is stage 1. The most expensive is stage 4.

Signals worth stopping on:

- A rule that can't be expressed in the data model. The model is wrong, not the rule.
- The same class of bug returning after two fixes.
- Art that won't come out of the PDF cleanly however the mask is drawn - a sign the wrong tool is
  being used, as with generative cleanup for anything that carries no geometry.
- Tests that have become the obstacle rather than the safety net.
- A third attempt at the same approach. There is rarely a good fourth.

This applies to my own work first: I'd rather report "this approach is wrong, here's what I'd do
instead" after two hours than hand over something that technically works.

### Sequencing rules learned the hard way

- **Layout before art.** The layout fixes the size each asset is displayed at, and a resolution
  defect only exists relative to a size. Art first means doing it twice.
- **Infrastructure before content.** Access, routing and the deploy chain get settled while there is
  nothing to lose.
- **Shared code moves to `packages/kit` the second time it is needed, not the first.** Save sync,
  manual dice, the top bar and the new-game dialog are shelf features wearing a game's clothes.
- **Anything an expansion will vary must be data from day one:** board aspect ratio from
  `BOARDS[mapId]`, a stock bar that wraps, tabs as an array, per-map Depot art. Cheap now,
  structural surgery later.
- **The save schema is a contract.** Every load goes through `migrateSave()`; stored ids are never
  renamed, only added.
- **`CLAUDE.md` describes how things are; `ROADMAP.md` holds only what is open.** Finished work moves
  from one to the other. A roadmap that accumulates history stops being a roadmap. Anything that
  needs me rather than you is marked **(you)** there, so the queue is readable at a glance.

## Art

Triage every visual:
1. **Simple geometry** (dice, checkboxes, tracks, plain icons): build it in SVG/CSS.
2. **Original art from the PDFs** (boards, cards, illustrations, icons): cut it out with Python
   (`pdftoppm`, Pillow, numpy, OpenCV) in a script saved under `games/<slug>/tools/`. Measure grids by
   fitting them, not by eye (see `games/recycled/tools/calibrate_grid.py`). Save the art under
   `games/<slug>/src/assets/` and **import** it, so it's inlined.
   **Don't use `public/`:** files there aren't inlined, which breaks the single file.

   **Only two kinds of image carry geometry:** the board (its grid is measured into `board.json` and
   the UI stretches the image to match) and the Depot (its pen-mark coordinates are measured in its
   own pixel space). Those two must be cleaned by **inpainting in code**, because a generative redraw
   moves the grid. Everything else - building tiles, cards, icons, logo, banner - carries no geometry,
   so generative cleanup is allowed there and usually beats a hand-written mask.

   **Cuts follow the shape of the thing.** A machine with rounded corners and pipes is not a
   rectangle; cutting a straight box through it is a bug, not a simplification.
3. **Validate art with me before calling it done.** Don't self-certify how it looks: Claude is weak at
   judging raster quality and has misread its own output. Render each asset **at the size it will
   actually appear**, plus a 2x crop of every edge and seam, and give me an
   `### Art Review Request` block with the files and what to look for. I'll check it, with ChatGPT
   where a second eye helps. Known failure modes to look for first: ragged outlines where a piece was
   cut from its background, hex or rule lines broken by inpainting or by something drawn over them,
   crops that slice through a shape, and small print blurred because it was extracted at too low a dpi
   for its display size.
4. **New art that doesn't exist in the PDFs** (a Home Screen icon, textures): generate it with
   `node scripts/gen-image.mjs --prompt "..." --out <file>` (OpenAI key in `~/.openai-token`), at
   `--quality low` unless there's a reason not to. Render it at the size it will actually be seen -
   an icon at 60 px, not 1024 - and look before shipping. Keep the master and the prompt next to the
   output, as `shelf/icons/README.md` does, so it can be regenerated. Show me the candidates; taste
   is mine, mechanics are yours. If the key is missing, fall back to an `### External Image Request`
   block I can paste into ChatGPT myself, and build against a placeholder so nothing waits.

The original art wins when it's available. Otherwise use a clean paper look (off-white `#f8f6f0`,
dark ink `#1f2421`).

## Game rules for the code

- **Deterministic randomness.** A seeded RNG lives in the state, and every die goes through one
  function. Tests replay games from seeds.
- **Undo never crosses a random event** (dice roll, accident, card draw), so there are no free
  re-rolls. Clear the undo stack whenever randomness resolves. Redo within that window is fine.
- **Saves:**
  - Use `localStorage` key `pnp:<slug>:state`, written after every change. If you persist history, use
    `pnp:<slug>:history`, capped.
  - Every load goes through a `migrateSave()` step, so schema changes never wipe a game in progress.
    Never rename stored ids (building types, map ids); add new ones instead.
- **Standard features in every game:**
  - Export/Import save (download/upload a JSON file, plus copy/paste text), because Mac, Safari and
    the iPad Home Screen app each keep separate saves.
  - A "Manual dice" mode where I type in real dice. Keep the seeded RNG path for normal play and tests.
  - Highlight only the legal targets, and show the exact reason anything is unavailable.
  - A "How to play" panel.
  - A small top-bar link back to the shelf (`../../index.html`), shown only when hosted.
- **Messages must be true.** Log lines and button texts state what actually happened, computed from
  real changes. Test this the way `games/recycled/test/engine.test.ts` (`checkedAct`) and
  `test/ui.test.tsx` (`checkScreen`) do.

## Layout: one build, two arrangements

- **Laptop (≥ 1440 px wide):** everything side by side.
- **Tablet landscape (1024–1439 px, iPad Pro 1366×1024):** board at full height, secondary panels in
  tabs or drawers. Everything fits in `100dvh` with **no page scroll**.
- **Touch** (`@media (pointer: coarse)`): targets ≥ 44 px, `touch-action: manipulation`, nothing that
  only works on hover, tap to inspect, and in-app dialogs instead of `confirm()`.
- **In `<head>`:**
  - `viewport` with `width=device-width, initial-scale=1, viewport-fit=cover`
  - `apple-mobile-web-app-capable` and `mobile-web-app-capable` set to `yes`
  - `apple-mobile-web-app-status-bar-style` set to `black-translucent`
  - an `apple-touch-icon`

  Pad the top bar with `env(safe-area-inset-top)`.

## Done means

1. `npm test` passes.
2. `npm run build` emits single files into `dist/`.
3. `npm run check:screens` passes at both sizes.
4. You've looked at screenshots of both layouts yourself.
5. The game's `CLAUDE.md`, `SPEC.md`, `ROADMAP.md` and `RULES-NOTES.md` are up to date. Finished work
   is described in `CLAUDE.md`; `ROADMAP.md` holds only what is still open.
6. You've told me what's left or uncertain.
