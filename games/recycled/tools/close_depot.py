"""Give the Depot console the bottom edge the printed sheet never shows.

    python3 tools/close_depot.py           # add the lip, if it isn't there yet
    python3 tools/close_depot.py --force   # ask the model again (deletes the cached fill)

On Sheet 1 the hex board is printed over the console's lower body, so there is no bottom edge to
extract: `extract_art.py` cuts along the board and the console ends in a flat slice. The Game
Director asked for exactly this to be filled in - "you could just ask OpenAI to fill in the parts
covered with hexes".

**This is the one reconstructed part of the Depot.** The model draws only inside a band below the
printed console; every pixel the publisher printed is composited back over the result and the run
refuses to write if one of them moved. Nothing here invents a control, a number or a word: the band
is plain lower casing.

Run it after `extract_art.py`, which overwrites `depot.webp` with the sliced version. The model's
fill is cached, so a re-run costs nothing.

Needs Pillow, numpy and an OpenAI key in ~/.openai-token. The call goes through scripts/art.mjs.
"""
from __future__ import annotations

import subprocess
import sys
import tempfile
from pathlib import Path

import numpy as np
from PIL import Image

GAME = Path(__file__).resolve().parent.parent
ART = GAME / 'src/assets/art'
CLIENT = GAME.parent.parent / 'scripts/art.mjs'
CACHE = GAME.parent.parent / '.screens/art/depot-lip.png'

# The console's own width, and the band of the image it may be extended into. The console is cut
# off at about y=1034 and `depot.webp` is 1335 tall, so the room is already in the frame.
SPLIT_X = 1700
BAND_TOP, BAND_BOTTOM = 1020, 1165
# Left of this the console has its own printed bottom corner, higher up, and the sheet continues
# into a control panel that is not part of this crop. The lip starts where the flat cut starts.
BAND_LEFT = 430
# The edit is sent square so the model returns the same framing, and at the API's own size.
SIDE = 1024

PROMPT = (
    'This is a retro Soviet-style control console, photographed flat, with its lower edge missing: '
    'the image simply stops part-way down and everything below is transparent. '
    'Draw the bottom of the console, and nothing else. Continue the panels, seams and rusted '
    'off-white painted metal straight down for a short distance and close them with the console\'s '
    'own bottom lip - a darker rolled edge with a line of rivets, in the same lighting, the same '
    'palette and the same hand-painted comic style, with the same wear and rust streaks. '
    'Do not change one pixel of the console above. Do not add dials, switches, screens, labels, '
    'legs, shadows or any text or numbers whatsoever. Everything outside the console stays fully '
    'transparent.'
)


def already_closed(alpha: np.ndarray) -> bool:
    """A lip has been added if the console's left half reaches below the printed cut."""
    return bool(alpha[BAND_TOP + 30 : BAND_BOTTOM, :SPLIT_X].any())


def ask(src: Path, mask: Path, out: Path) -> subprocess.CompletedProcess:
    return subprocess.run(
        ['node', str(CLIENT), 'edit', '--quality', 'high', '--size', f'{SIDE}x{SIDE}',
         '--background', 'transparent', '--image', str(src), '--mask', str(mask),
         '--out', str(out), '--prompt', PROMPT],
        capture_output=True, text=True,
    )


def main() -> None:
    force = '--force' in sys.argv
    depot = Image.open(ART / 'depot.webp').convert('RGBA')
    arr = np.array(depot)
    if already_closed(arr[:, :, 3] > 10) and not force:
        print('depot.webp already has its lower edge; --force to ask again')
        return
    if force:
        CACHE.unlink(missing_ok=True)

    w, h = depot.size
    # Square the image with transparency so the edit comes back in the same framing, then work at
    # the API's size. Only the band is ever taken from what comes back.
    square = Image.new('RGBA', (w, w), (0, 0, 0, 0))
    square.paste(depot, (0, 0))
    k = SIDE / w

    CACHE.parent.mkdir(parents=True, exist_ok=True)
    if not CACHE.exists():
        with tempfile.TemporaryDirectory() as tmp:
            src = Path(tmp) / 'depot-in.png'
            square.resize((SIDE, SIDE), Image.LANCZOS).save(src)
            # The API edits where the mask is transparent; everything else is out of reach.
            mask = Image.new('RGBA', (SIDE, SIDE), (255, 255, 255, 255))
            band = Image.new('RGBA', (SIDE, round((BAND_BOTTOM - BAND_TOP) * k)), (0, 0, 0, 0))
            mask.paste(band, (0, round(BAND_TOP * k)))
            mpath = Path(tmp) / 'depot-mask.png'
            mask.save(mpath)
            run = ask(src, mpath, CACHE)
            if run.returncode != 0 or not CACHE.exists():
                print(f'FAILED - {(run.stderr or run.stdout).strip().splitlines()[-1][:120]}')
                sys.exit(1)

    got = Image.open(CACHE).convert('RGBA').resize((w, w), Image.LANCZOS).crop((0, 0, w, h))
    fill = np.array(got)

    # Take the model's pixels only inside the band, only left of the note, and only where the
    # publisher printed nothing. Everything else is the original, untouched by construction.
    region = np.zeros(arr.shape[:2], bool)
    region[BAND_TOP:BAND_BOTTOM, BAND_LEFT:SPLIT_X] = True
    usable = region & (arr[:, :, 3] <= 10) & (fill[:, :, 3] > 140)
    out = arr.copy()
    out[usable] = fill[usable]

    moved = int(((np.abs(out.astype(int) - arr.astype(int)).sum(axis=2) > 0) & ~usable).sum())
    if moved:
        print(f'REFUSED - {moved} publisher pixels moved outside the band')
        sys.exit(1)
    added = int(usable.sum())
    if not 20_000 < added < 320_000:
        print(f'SUSPECT - the fill covers {added} px; not written, look at {CACHE}')
        sys.exit(1)
    # A lip has to hang off the console, not float under it: in most columns the first filled
    # pixel is directly below the last printed one.
    printed = arr[:, :, 3] > 10
    gaps = []
    for x in range(BAND_LEFT, SPLIT_X):
        above = np.where(printed[:BAND_BOTTOM, x])[0]
        below = np.where(usable[:, x])[0]
        if len(above) and len(below):
            gaps.append(below.min() - above.max() - 1)
    seam = float(np.median(gaps)) if len(gaps) > 800 else 1e9
    if seam > 3:
        print(f'SUSPECT - the fill hangs {seam:.0f}px clear of the console in half its columns; not written')
        sys.exit(1)

    Image.fromarray(out).save(ART / 'depot.webp', 'WEBP', quality=88, method=6)
    size = (ART / 'depot.webp').stat().st_size // 1024
    print(f'depot.webp: lower edge reconstructed, {added} px added, seam {seam:.0f}px, {size} KB')


if __name__ == '__main__':
    main()
