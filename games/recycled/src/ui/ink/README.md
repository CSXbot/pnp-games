# Pen marks

Vendored from ChatGPT's PnP art kit (`claude_exchange/PnP-art-workflow.zip`, 2026-11-27), which
traced these from the publisher's own sheets: the 12 building strokes and the storage loop come from
the legend on Planet 1 Sheet 1, the Separator's three stages and the single Recycler arrow from
Sheet 2.

Why this exists: on paper the player **draws**. A building is its pen symbol from the legend, a unit
gained is an open ring at a fixed position in the hex, a unit spent is that ring filled in, and a
joined pair gets one contour around both hexes. Verified against a 300 dpi crop of the printed
starting cells - see `.screens/art/sheet1-starting-cells.png`.

- `marks.json` - 18 traced paths in a 150x160 cell space (12 buildings, setup stages, open/spent ring).
- `planet1-starting-anchors.json` - ring positions measured from the printed starting cells; the
  unprinted positions are inferred from the legend and are the least certain part of the kit.
- `ink.mjs` / `BuildingInk.tsx` - project `drawn`, `used`, `step`, `complete` onto marks.
- `shared-contour.mjs` - one closed ten-edge path from two of the game's own `hexCorners` strings.

Mount inside the measured cell: scale `Math.sqrt(3) * SIZE / 150` by `2 * SIZE / 160`, anchored at
(75, 80).
