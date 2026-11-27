# Recycled: standing art brief

For the Art Director, who has no memory between jobs. Everything a visual decision needs is here or
in `decisions.md` beside it. Attach both to every art call for this game (`scripts/art.mjs --game
recycled`).

## What the player physically does

Recycled is a roll-and-write on two printed A4 sheets. **The player draws.** That is the whole
visual language of the original:

- A **building** is a pen symbol from the legend on Sheet 1, drawn over the illustration printed in
  that hex.
- A **unit gained** is an open ring at a fixed position in the hex; a **unit spent** is that same
  ring filled in. Positions that were never drawn stay blank.
- A **joined pair** of buildings gets one heavy contour drawn around both hexes.
- The **Depot** is marked with tally strokes, crosses in tech boxes, circled and darkened boxes.

Verified at 300 dpi against the printed starting cells: `.screens/art/sheet1-starting-cells.png`.

## What the web game draws instead, and why

**One look ships: "Modern".** The illustration cut out of the sheet, its name label, a dot per
storage position, setup as text, a short bar between joined buildings. The Game Director set the
pen look aside on 2026-11-27 to get a finished board first.

The traced pen marks are kept, unrendered, in `src/ui/ink/` - cut from the publisher's own sheets
and expensive to redo. Do not propose reviving them as an art decision; that is the Game Director's
call, already made.

## Sizes that decide everything

- A **hex is 87 CSS px** on the iPad layout. Any mark has to read at that size, not at 1024 px.
- A **building cut-out** is drawn about 66 x 60 px inside that hex.
- A **card** in the build picker is about 230 px wide; the source is 530 x 710.
- Judge every candidate at these sizes first. A reconstruction that only wins when zoomed in is not
  an improvement.

## The source has a ceiling

Each sheet is **one 300 ppi JPEG per A4 page** (2480 x 3508, heavily compressed), with no text or
vector layer. Re-extracting at 600 dpi upscales and recovers nothing. If something is too soft at
its display size the answer is a better source file, a smaller display size, or redrawing that one
element in SVG - never a bigger number in `extract_art.py`.

## What must never change

- **Measured geometry.** The board's grid is measured into `board.json` and the Depot's pen-mark
  coordinates into its own pixel space. Never regenerate either whole. Masked edits only, composited
  locally, with a pixel diff proving nothing outside the mask moved.
- **Text.** No model-written words anywhere. A card's text is verbatim from the card; our readings
  of the rules live in `RULES-NOTES.md`.
- **The publisher's pixels.** Where art is edited, the model supplies the matte or the masked
  region; colour comes from the original and is checked.

## The palette, from the sheets

Dusty orange ground, cream and off-white structures, dark rust-brown ink, the hex paper at
`#f7f3ee`. Muted and hand-painted, not glossy, not saturated, not concept art.
