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
- **Don't use Deep Research for rules questions** (the Game Director, 2026-11-27: "Just ask a good
  Gemini model without research, it can google"). One Deep Research Max run on 14 questions cost
  **£26.16** (36.6M input tokens; the tech lead's estimate from listed prices was about $70, the
  brief's $1-3) and still missed the publisher's own answers. Use a strong model with the
  `google_search` tool, or read a known source in the browser.
- **The publisher's own comments are the first place to look.** On Hexdom the Kickstarter campaign
  had 175 creator comments, several of them rulings. Load them all in the Game Director's Chrome and
  search the creator's replies.
- **Verify every quote on the page itself** before it reaches the Game Director, and write down
  where: `research/verification.md`. Deep Research's links are Google redirects, and one of its post
  IDs was a 404.
- **When the group is still split, ask the Art Director for one more reading** before the question
  goes to the Game Director (their decision, 2026-11-27: "That's what humans do"). Its value is being
  a different model: give it the Researcher's blind pack - the whole rulebook PDF, the sheets, the
  cards and the neutral question - not the art notebook, no proposals, and no hint of who holds which
  reading. Its answer is one more reading with reasons, not a vote: an argument that persuades the
  group settles it; if the group is still split, the question goes up with every reading attached.
  On Hexdom's question A all three of the group leaned "optional" and the Game Director ruled
  "mandatory": more opinions find arguments, they don't predict the Game Director.
- **Write absolute paths.** Relative output from a run started at the repo root landed there.
- Briefs, readings, raw reports and verification all live in `games/<slug>/research/`, because the
  Researcher has no memory between jobs.
