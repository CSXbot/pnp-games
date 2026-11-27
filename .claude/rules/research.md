---
paths:
  - "games/*/research/**"
  - "games/*/RULES-NOTES.md"
  - "games/*/SPEC.md"
---

# Rules research (the Researcher, Gemini)

The Game Director's decision, 2026-11-27: Gemini is the **Researcher**, and the tech lead, the
consultant and the Researcher form the **rules group** (root `CLAUDE.md`, **Routing**). Learned on
Legend of Hexdom the same day:

- **Two jobs, not one.** It *reads*: `gemini-4-carbon` (Google's strongest, as of that date), blind
  to the tech lead's proposals, gives a reading per question with evidence for and against,
  confidence, and whether the text settles it. And it *searches* for what the publisher and
  players have said.
- **Give it the whole rulebook PDF** (`-i`, Gemini reads the figures too), the sheets and the cards
  - not chapters as text. The first Hexdom reading had only the rule chapters and missed the
  Druid's note on p87 that settled two questions.
- **Long calls go in the background:** `gemini-api agent run -m <model> --background`, then poll
  `agent status`. A streamed ten-minute `generate` died on a connection reset.
- **Deep Research Max is expensive.** One run on 14 questions used 36.6M input tokens - about
  $70-75 against an estimate of $1-3 - and still missed the publisher's own answers. Ask the Game
  Director before running it again. For a known source, a targeted search or reading it in the
  browser is cheaper and better.
- **The publisher's own comments are the first place to look.** On Hexdom the Kickstarter campaign
  had 175 creator comments, several of them rulings. Load them all in the Game Director's Chrome and
  search the creator's replies.
- **Verify every quote on the page itself** before it reaches the Game Director, and write down
  where: `research/verification.md`. Deep Research's links are Google redirects, and one of its post
  IDs was a 404.
- **Write absolute paths.** Relative output from a run started at the repo root landed there.
- Briefs, readings, raw reports and verification all live in `games/<slug>/research/`, because the
  Researcher has no memory between jobs.
