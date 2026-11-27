"""Cut a building out of its printed ground, keeping the publisher's pixels.

    python3 tools/make_cutouts.py            # every building that has no cut-out yet
    python3 tools/make_cutouts.py rover      # just these

The model never contributes colour. It is asked for the same image with the ground removed, and
only its **alpha** is used: the publisher's RGB from `tile-<type>.webp` is composited through that
matte. Every run checks that no pixel inside the silhouette changed, and refuses to write if one
did. Output is lossless WebP, which halves the file against PNG for a game downloaded whole.

Needs Pillow and an OpenAI key in ~/.openai-token (see the Art section of the root CLAUDE.md).
The API call goes through scripts/art.mjs, which is the only client.
"""
from __future__ import annotations

import subprocess
import sys
import tempfile
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

GAME = Path(__file__).resolve().parent.parent
ART = GAME / 'src/assets/art'
OUT = GAME / 'src/assets/cutouts'
CLIENT = GAME.parent.parent / 'scripts/art.mjs'
# Mattes are cached so refining the local step costs nothing. Delete one to re-ask the model.
CACHE = GAME.parent.parent / '.screens/art/mattes'

PROMPT = (
    'Cut the building out so that it stands on nothing at all. Keep the building, its roof, walls, '
    'steps, railings, masts and any attached structures exactly as they are, in the same position, '
    'at the same scale, with the same framing. '
    'EVERYTHING that is not the building itself must be fully transparent, with no exceptions: the '
    'orange sand and soil it stands on, the shadow it casts on that ground, the patch of ground '
    'directly beneath it, dust, debris and loose rocks. Do not leave a halo, a shadow pool or any '
    'orange fringe around the base - transparency must run right up to where the structure meets '
    'the ground. Do not redraw, restyle, sharpen or recolour the building itself. Do not add '
    'anything. No text.'
)
# A cut-out that keeps this much of the printed sand has kept the ground or the cast shadow.
# The kit's hand-traced reference scores about 8 percent.
MAX_SAND_PCT = 12
# How far from this tile's own ground colour a pixel may be and still count as ground.
GROUND_TOLERANCE = 38
# A trim that removes this much of the model's silhouette is eating the building, not the ground.
MAX_EATEN_PCT = 25

# The gates are heuristics: they flag an asset for a human look, and two buildings were looked at
# and judged fine. Each exception says why, so it can be re-argued rather than inherited blindly.
OVERRIDES = {
    'rover': dict(
        trim=False, max_sand=25,
        reason="its own bodywork is tan, so the sand test counts the vehicle; trimming ate holes in the roof",
    ),
    'transceiver': dict(
        min_coverage=8,
        reason='a genuinely small building in a large tile, so 9% of the tile is the whole of it',
    ),
}


def pad_square(tile: Image.Image) -> tuple[Image.Image, int, int]:
    """Square the tile with its own edge rows, so the edit comes back in the same framing."""
    side = max(tile.size)
    ox, oy = (side - tile.width) // 2, (side - tile.height) // 2
    canvas = Image.new('RGB', (side, side))
    canvas.paste(tile, (ox, oy))
    for y in range(oy):
        canvas.paste(tile.crop((0, 0, tile.width, 1)), (ox, y))
    for y in range(side - (oy + tile.height)):
        canvas.paste(tile.crop((0, tile.height - 1, tile.width, tile.height)), (ox, oy + tile.height + y))
    return canvas, ox, oy


def ground_colour(tile: np.ndarray, kept: np.ndarray) -> np.ndarray | None:
    """This tile's printed ground, sampled from what the model called background."""
    outside = ~kept
    if outside.sum() < 50:
        return None
    return np.median(tile[outside].reshape(-1, 3), axis=0)


def ground_fraction(tile: np.ndarray, kept: np.ndarray, ground: np.ndarray | None) -> float:
    """How much of what we kept is that same printed ground.

    Measured against this tile's own ground rather than "anything saturated and warm", which
    counted the Rover's tan bodywork and the Cryo Tank's panels as sand.
    """
    if ground is None or not kept.any():
        return 0.0
    near = np.abs(tile.astype(float) - ground).max(axis=2) <= GROUND_TOLERANCE
    return (near & kept).sum() / kept.sum()


def trim_ground(tile: np.ndarray, kept: np.ndarray, ground: np.ndarray | None) -> np.ndarray:
    """Drop printed ground the model left inside its silhouette.

    The ground colour is **measured from this tile**, not guessed: pixels the model already called
    background are the sample. Only colours close to that sample are passable, so the flood eats
    the shadow pool and the orange fringe but not the building's own warm paint - which an
    "anything saturated and warm" test did, hollowing out the Cryo Tank and the Nuclear Pod.

    Flooding from the border, rather than subtracting every matching pixel, keeps ground-coloured
    areas that are enclosed by structure.
    """
    if ground is None:
        return kept
    near = np.abs(tile.astype(float) - ground).max(axis=2) <= GROUND_TOLERANCE

    passable = (~kept | near).astype(np.uint8)
    h, w = passable.shape
    flood = np.zeros((h + 2, w + 2), np.uint8)
    border = [(x, y) for x in range(w) for y in (0, h - 1)] + [(x, y) for y in range(h) for x in (0, w - 1)]
    for x, y in border:
        if passable[y, x] == 1:
            cv2.floodFill(passable, flood, (x, y), 2)
    return kept & (passable != 2)


def cut(kind: str, work: Path) -> str:
    tile = Image.open(ART / f'tile-{kind}.webp').convert('RGB')
    padded, ox, oy = pad_square(tile)
    src = work / f'{kind}-in.png'
    padded.save(src)

    CACHE.mkdir(parents=True, exist_ok=True)
    matte = CACHE / f'{kind}.png'
    run = subprocess.CompletedProcess([], 0, '', '')
    if not matte.exists():
        run = subprocess.run(
            ['node', str(CLIENT), 'edit', '--quality', 'high', '--size', '1024x1024',
             '--background', 'transparent', '--image', str(src), '--out', str(matte), '--prompt', PROMPT],
            capture_output=True, text=True,
        )
    if run.returncode != 0 or not matte.exists():
        return f'{kind}: FAILED - {(run.stderr or run.stdout).strip().splitlines()[-1][:90]}'

    side = padded.width
    alpha = Image.open(matte).convert('RGBA').split()[3]
    alpha = alpha.resize((side, side), Image.LANCZOS).crop((ox, oy, ox + tile.width, oy + tile.height))
    rule = OVERRIDES.get(kind, {})
    raw = np.array(alpha) > 127
    ground = ground_colour(np.array(tile), raw)
    kept = trim_ground(np.array(tile), raw, ground) if rule.get('trim', True) else raw
    eaten = (raw.sum() - kept.sum()) / max(raw.sum(), 1) * 100
    coverage = kept.mean() * 100

    out = tile.copy()
    out.putalpha(Image.fromarray((kept * 255).astype(np.uint8)))
    changed = int(((np.abs(np.array(tile).astype(int) - np.array(out.convert('RGB')).astype(int)).sum(axis=2) > 0) & kept).sum())
    if changed:
        return f'{kind}: REFUSED - {changed} publisher pixels altered inside the silhouette'
    if not rule.get('min_coverage', 15) <= coverage <= 85:
        return f'{kind}: SUSPECT - keeps {coverage:.0f}% of the tile; not written, look at the matte'

    if eaten > rule.get('max_eaten', MAX_EATEN_PCT):
        return f'{kind}: TRIM ATE IT - removed {eaten:.0f}% of the silhouette; not written'

    sand = ground_fraction(np.array(tile), kept, ground) * 100
    if sand > rule.get('max_sand', MAX_SAND_PCT):
        return f'{kind}: GROUND LEFT - {sand:.0f}% of what it keeps is printed sand; not written'

    out.save(OUT / f'{kind}.webp', 'WEBP', lossless=True, quality=100, method=6)
    size = (OUT / f'{kind}.webp').stat().st_size // 1024
    note = f" [exception: {rule['reason']}]" if rule else ''
    return f'{kind}: kept {coverage:.0f}%, sand {sand:.0f}%, trim took {eaten:.0f}%, {size} KB{note}'


def main() -> None:
    wanted = sys.argv[1:]
    kinds = wanted or sorted(
        p.name[len('tile-'):-len('.webp')] for p in ART.glob('tile-*.webp')
        if not (OUT / f"{p.name[len('tile-'):-len('.webp')]}.webp").exists()
    )
    if not kinds:
        print('every building already has a cut-out')
        return
    print(f'cutting {len(kinds)}: {", ".join(kinds)}')
    with tempfile.TemporaryDirectory() as tmp:
        for kind in kinds:
            print(cut(kind, Path(tmp)), flush=True)


if __name__ == '__main__':
    main()
