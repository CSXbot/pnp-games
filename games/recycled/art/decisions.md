# Recycled: art decisions

Newest first. One entry per decision that would otherwise have to be rediscovered: what was asked,
what came back, what was accepted or rejected, and why. Reconstructed from commit messages for
everything before 2026-11-27.

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
