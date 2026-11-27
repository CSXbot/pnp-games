---
paths:
  - "games/*/art/**"
  - "games/*/tools/**"
  - "games/*/src/assets/**"
  - "scripts/art.mjs"
  - "shelf/icons/**"
---

# Art

**Sharing the publishers' art is allowed** with any human or AI working on this project. The owner's
decision, 2026-11-26 and confirmed 2026-11-27: "It's my purchase and my decision, and I allow it."
So send the real pages and crops to whatever model or person is doing the work, without asking. The
*site* stays private behind Access, unchanged - that is a separate thing, and it does not move.

## The Art Director has a notebook, because it has no memory

Every game keeps `games/<slug>/art/`:

- **`art-direction.md`** - the standing brief. What the player physically does on paper, which
  visual details carry rules, the sizes things are actually drawn at, what must never change, and
  the Game Director's taste decisions.
- **`decisions.md`** - dated, newest first. What was asked, what came back, what was accepted or
  rejected and **why**. Append after every art call.

`scripts/art.mjs --game <slug>` attaches both to the call, labelled so the model knows the
decisions are not open for reopening. Without it the Art Director re-decides settled questions: it
twice proposed work that had already been rejected. Files rather than the provider's stored
conversations, because they are visible, versioned, survive a change of model, and the next tech
lead or consultant can read them.

**A second Art Director that looks for itself.** `codex exec -s read-only -C <repo> -i <image> -`
with the prompt on stdin gives a reviewer that reads the repo rather than only what you chose to
send, which makes a blind review harder to bias. It has no memory either, so point it at the
notebook. It authenticates with ChatGPT tokens, not the API key.

## Give the model the originals

"Retro sci-fi building" throws away information we already own. Send the real thing, through
`scripts/art.mjs review` (Responses API) for judgement and `art.mjs edit` (Images API) for work:

- the **whole component** for context - the full card, the whole sheet region;
- the **best available crop** of the target, at native resolution;
- **one or two related components** from the same game - one card establishes the palette, another
  the perspective and lighting;
- and say in the prompt **what each reference is for**. References are context, never to be copied
  into the output.

A good first call is to ask the art director, before editing anything: what must be preserved for
this to still read as the same component, what is actually degraded at its in-game size, and how a
re-render would most likely betray the original. That third answer becomes the acceptance checklist.

## Choose the method per part of the component

**Look in the PDF first.** `pdfimages -list` says what is really in there. If a clean original or a
vector exists, extract it directly - no model involved. Recycled's sheets turned out to hold a
single 300 dpi JPEG per A4 page, no text layer: that is the ceiling, and `extract_art.py` was
downscaling cards to 400 px from a 530 px native crop, which was pure loss for nothing.

Reach for a **reference-guided edit** only when the source genuinely cannot answer: an illustration
flattened, damaged or visibly soft at the size it is drawn; a clipped edge to repair; a subject to
isolate from paper; an asset missing from a set. **Say in the commit and the asset's notes when
detail has been reconstructed** rather than extracted.

## What may change, and proving it

- **Never regenerate a whole component that carries geometry.** The board's grid is measured into
  `board.json` and the Depot's pen marks into its pixels; a redraw moves them.
- **Mask what must not move**, and **composite locally** afterwards: take the model's pixels only
  inside the mask and the original's everywhere else, so titles, numbers, resource symbols, rules
  text and measured geometry are physically out of reach.
- **Prove it with a pixel diff** outside the mask. Zero changed pixels, or it is a redraw.
- **Never let a model write text.** Rebuild a title or a cost from verified game data and composite
  it, or keep the original pixels. Invented rules on a game component are worse than blur.

## Close the loop before you show me

**Review blind.** Render one legal interaction, capture it at both sizes, and ask the model what
visibly changed *before* telling it what should have. Then check its answer against the engine's
state. A reviewer told the expected answer will confirm it.

Give the vision model the original, the candidate, **and a screenshot at actual play size**, and ask
it to name specific regressions - not whether it likes it. Then show me the original and the best
candidate side by side in both layouts. **If the original looks better at play size, use the
original**; a reconstruction that is only better when zoomed in is not an improvement.

## Tool facts, checked 2026-11-27

`gpt-image-1` does not exist on this account; the image models are `gpt-image-2.6-flare` and
`gpt-image-1.5`, neither accepts `input_fidelity`, and the vision reviewer is `gpt-4.1`. Edits
return fixed aspect ratios, so pad the target to the output aspect and crop back, or the subject
gets reframed.

## Everything else

Simple geometry (dice, checkboxes, tracks, plain icons) is SVG/CSS. Art that does not exist in the
sheets - a Home Screen icon, a texture - is `art.mjs generate`; render it at the size it will
actually be seen before shipping, and keep the master and the prompt beside the output, as
`shelf/icons/README.md` does. Save art under `games/<slug>/src/assets/` and **import** it so it is
inlined; **don't use `public/`**, which breaks the single file. The original art wins when it is
available; otherwise a clean paper look (off-white `#f8f6f0`, dark ink `#1f2421`).
