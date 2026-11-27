"""Lay every cut-out beside the tile it came from, at the size the player sees them.

    python3 tools/cutout_sheet.py [out.png]

A hex is about 87 CSS px on the iPad layout, so each pair is drawn at that width on the game's own
hex colour, then doubled for looking at. Anything that reads worse than its tile at this size is a
cut-out to redo, whatever it looks like at full resolution.
"""
import sys
from pathlib import Path

from PIL import Image, ImageDraw

GAME = Path(__file__).resolve().parent.parent
ART = GAME / 'src/assets/art'
CUT = GAME / 'src/assets/cutouts'
HEX_BG = (247, 243, 238)
PLAY_W = 87


def main() -> None:
    out = Path(sys.argv[1]) if len(sys.argv) > 1 else GAME.parent.parent / '.screens/art/cutout-sheet.png'
    kinds = sorted(p.stem for p in CUT.glob('*.webp'))
    if not kinds:
        print('no cut-outs yet')
        return

    cell_w, cell_h, gap, label = PLAY_W * 2 + 8, 0, 18, 16
    tiles = {}
    for k in kinds:
        tile = Image.open(ART / f'tile-{k}.webp').convert('RGBA')
        cut = Image.open(CUT / f'{k}.webp').convert('RGBA')
        h = round(PLAY_W * tile.height / tile.width)
        tiles[k] = (tile.resize((PLAY_W, h), Image.LANCZOS), cut.resize((PLAY_W, h), Image.LANCZOS))
        cell_h = max(cell_h, h)

    cols = 4
    rows = (len(kinds) + cols - 1) // cols
    sheet = Image.new('RGB', (cols * (cell_w + gap) + gap, rows * (cell_h + label + gap) + gap), HEX_BG)
    d = ImageDraw.Draw(sheet)
    for i, k in enumerate(kinds):
        x = gap + (i % cols) * (cell_w + gap)
        y = gap + (i // cols) * (cell_h + label + gap)
        tile, cut = tiles[k]
        sheet.paste(tile, (x, y), tile)
        sheet.paste(cut, (x + PLAY_W + 8, y), cut)
        d.text((x, y + cell_h + 3), f'{k}  (tile | cut)', fill=(80, 50, 35))

    out.parent.mkdir(parents=True, exist_ok=True)
    sheet.resize((sheet.width * 2, sheet.height * 2), Image.LANCZOS).save(out)
    print(f'{len(kinds)} cut-outs -> {out}')


if __name__ == '__main__':
    main()
