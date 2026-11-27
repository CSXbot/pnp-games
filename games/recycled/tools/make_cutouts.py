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
import subprocess
import sys
import tempfile
from pathlib import Path

import numpy as np
from PIL import Image

GAME = Path(__file__).resolve().parent.parent
ART = GAME / 'src/assets/art'
OUT = GAME / 'src/assets/cutouts'
CLIENT = GAME.parent.parent / 'scripts/art.mjs'

PROMPT = (
    'Isolate the building from its ground. Keep the building, its roof, walls, steps, railings, '
    'masts and any attached structures exactly as they are, in the same position, at the same '
    'scale, with the same framing. Delete everything that is not the building: the orange sand, '
    'the cast shadow on the ground, dust, scattered debris and loose rocks. The removed area must '
    'be fully transparent. Do not redraw, restyle, sharpen or recolour the building itself. Do not '
    'add anything. No text.'
)


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


def cut(kind: str, work: Path) -> str:
    tile = Image.open(ART / f'tile-{kind}.webp').convert('RGB')
    padded, ox, oy = pad_square(tile)
    src = work / f'{kind}-in.png'
    matte = work / f'{kind}-matte.png'
    padded.save(src)

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
    kept = np.array(alpha) > 127
    coverage = kept.mean() * 100

    out = tile.copy()
    out.putalpha(alpha)
    changed = int(((np.abs(np.array(tile).astype(int) - np.array(out.convert('RGB')).astype(int)).sum(axis=2) > 0) & kept).sum())
    if changed:
        return f'{kind}: REFUSED - {changed} publisher pixels altered inside the silhouette'
    if not 15 <= coverage <= 85:
        return f'{kind}: SUSPECT - keeps {coverage:.0f}% of the tile; not written, look at the matte'

    out.save(OUT / f'{kind}.webp', 'WEBP', lossless=True, quality=100, method=6)
    size = (OUT / f'{kind}.webp').stat().st_size // 1024
    return f'{kind}: kept {coverage:.0f}%, 0 pixels altered, {size} KB'


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
