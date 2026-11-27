# Recycled: art decisions

Newest first. One entry per decision that would otherwise have to be rediscovered: what was asked,
what came back, what was accepted or rejected, and why. Reconstructed from commit messages for
everything before 2026-11-27.

## 2026-11-27 · The buildings were never clipped by the sheet, only by our crop

**Game Director, from the iPad:** "The edges can be improved. For some of it you could just ask
OpenAI to fill in the parts covered with hexes."
**What it turned out to be:** not the sheet. A card's illustration band is 360x198 and
`extract_art.py` was taking a **230x196 window** out of it, centred on the median building pixel -
a centre the cast shadow drags off to one side. That window cut the Recycler's right wall, the
Laboratory's frame, the Workshop's doors and the Food Plant's lean-to. The publisher had printed
all of it.
**Fixed by taking the band whole** and letting the model's matte decide where the building ends.
`make_cutouts.py` then centres each silhouette in one shared 290x199 frame, so one printed pixel is
still the same size in all twelve and the board keeps the sheet's relative scale.
**A gate had to change with it.** "The trim removed 25% of the silhouette" measured the model's
generosity, not the trim's accuracy - the trim can only remove ground-coloured pixels, so the
Transceiver loses 57% of its matte to a perfectly correct trim. It now counts enclosed holes, which
is what the one bad trim actually left.
**Not reconstructed:** the masts and chimneys the card's own border cuts off (Oxygen Plant, Cryo
Tank, Workshop). Nothing is printed above them and they read as foreshortened rather than broken.

## 2026-11-27 · The Depot's bottom edge, reconstructed

**Asked for by the Game Director**, in the same note: fill in what the hexes cover.
**The problem:** on Sheet 1 the hex board is printed over the console's lower body, so there is no
bottom edge to extract. The console ended in a flat slice.
**Method** (`tools/close_depot.py`): the model is sent the whole console, square-padded, with a
mask that opens only a 145px band below the printed cut, and asked for the console's own bottom lip
- rolled edge, rivets, same wear - and explicitly no dials, labels, numbers or text. It redrew the
whole console anyway, garbled text and all; **none of that is used.** Only pixels inside the band
where the publisher printed nothing are taken, and the run refuses to write if a printed pixel
moved. The seam is measured: in half the columns the first filled pixel is directly below the last
printed one.
**Result:** accepted. 78k px of lower casing, seam 0px.
**Also looked at and rejected:** extending the crop to keep the PROJAWA control panel that hangs
off the console's lower left. It is real printed art the crop discards, but it is decorative - no
pen marks, no state - and keeping it makes the image 9% taller with a large empty corner, which
shrinks the console in a panel the Game Director had already called too small.

## 2026-11-27 · The board's edge traced instead of approximated

The board's alpha was the union of its hexes grown by a square MaxFilter, with a narrower one above
the top row and below the bottom row. That gave a staircase where the sheet prints a smooth metal
bevel, a step where the two radii met, and pale slivers of the neighbouring art. It is now flooded:
the page and the Mars backdrop are filled inwards from a ring 31px outside the hexes, and the rim's
dark metal stops the flood. One corner needed naming - the cosmonaut is printed over the rim at the
bottom-right - and there only the hexes are kept, so it has no rim rather than fragments of him.

## 2026-11-27 · Codex tried as an Art Director that can look for itself

**Asked:** read this notebook, look at the live board at iPad size, name up to three visual defects
with the file to change, propose nothing the log has settled.
**Result:** it did. Two real defects neither I nor the owner had acted on - the join bars crossing
the CRYO and SEPARATOR name labels, and a stock dot landing on the last letters of RESEARCH. Both
fixed by drawing order: joins now go under the buildings, the name ribbon over the dots.
**Worth knowing:** `codex exec` takes images with `-i`, runs `--sandbox read-only`, and
authenticates with ChatGPT tokens rather than the API key, so it does not bill API spend. The
variadic `-i` swallows a positional prompt - pass the prompt on stdin with a trailing `-`.
**Why it is useful:** unlike the Images/Responses path it reads the repo itself, so a review is
harder for me to bias by choosing what to send.

## 2026-11-27 · All twelve buildings cut out of their ground

**Asked:** isolate each building from the printed sand, keeping the publisher's pixels.
**Method:** the model returns the same image with the ground removed; only its **alpha** is used and
its colour is discarded, with the original RGB composited through that matte. Three gates:
no publisher pixel altered inside the silhouette, a plausible share of the tile kept, and no
printed sand left (the kit's hand-traced reference scores ~8% by `extract_art.py`'s own sand test).
**Result:** the first batch passed the pixel check and still kept sand and cast shadows on 8 of 12,
17-63%. **Hardening the prompt moved almost nothing** - the model keeps the shadow pool. Fixed by
letting the publisher's own pixels decide the edge: sand reachable from outside the silhouette is
ground and goes, sand enclosed by structure stays. Ten then land at 5-11%.
**Two exceptions, looked at rather than forced** (recorded in `tools/make_cutouts.py`):
the **rover** keeps the untrimmed matte, because its own bodywork is tan so the sand test counts the
vehicle and trimming ate holes in its roof; the **transceiver** keeps 9% of its tile, because it is
a small building in a large tile and that 9% is all of it.

## 2026-11-27 · The pen look parked, Modern ships

**Game Director's decision.** Two display settings (pen/modern for buildings and for stock) had been
agreed and half-built; the owner set the whole pen idea aside to get a finished board first. The
settings toggle went with it - with one look there is nothing to switch. Cut-outs stayed, because
they are Modern's building art.

## 2026-11-27 · Cut-outs chosen over tiles

**Game Director's decision**, on looks: "I like cut outs more. Cleaner look." The original reason for
cut-outs - making pen rings readable - had gone with the pen look, so this was taste.

## 2026-11-27 · The sheet's visual language, discovered late

**What went wrong:** two Claude sessions treated art as making each image cleaner - masks, pixel
diffs, a critic for sharpness - without ever asking what the player physically does. The sheet's
answer (pen symbol over illustration, rings for stock, one contour per joined pair) was found only
after the UI had invented tiles, name ribbons, evenly spaced pips and a link bar. **This is why the
direction job now comes at stage 1, before the layout is fixed.**

## 2026-11-26 · Oxygen Plant roof reconstruction rejected, twice

**Asked:** re-render the dome larger and cleaner, with the card and two sibling cards as references.
**Attempt 1, free redraw:** rejected. Stairs, entrance and grate redesigned, palette oversaturated -
a redesign, not a restoration.
**Attempt 2, masked to the roof** and composited locally with a verified zero-pixel diff outside the
mask: rejected. It invented panel lines absent from the source, and at play size the two were
indistinguishable.
**Kept:** the original. A reconstruction that only wins when zoomed in is not an improvement.

## 2026-11-26 · Cards restored to native resolution

`extract_art.py` was downscaling cards to 400 px from a 530 px native crop - pure loss for nothing.
All twelve are now native, with visibly sharper rules text in the build picker, at +122 KB.

## 2026-11-26 · Home Screen icon

**Asked:** three concepts, judged at 60 px - the size the Home Screen actually shows.
**Chosen:** a cosmonaut helmet with a recycling loop in the visor. Rejected: a plain hexagon with
recycling arrows (crispest but anonymous) and a honeycomb with a shuttle (the shuttle turned to mush
at 60 px). Master and prompt in `shelf/icons/README.md`.
