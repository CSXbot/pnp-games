#!/usr/bin/env python3
"""Cut the game's own art out of the print-and-play PDFs into src/assets/art/.

Usage:
    python3 tools/extract_art.py SHEET1_PLANET1.pdf SHEET2.pdf RULEBOOK_PAGE1.pdf

Needs `pdftoppm` (poppler), Pillow, numpy and opencv-python-headless. Coordinates below are pixels at 300 dpi on the
A4 sheets (2480 x 3508).
"""

import json
import math
import subprocess
import sys
import tempfile
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

OUT = Path(__file__).resolve().parent.parent / 'src' / 'assets' / 'art'

# --- Planet 1 hex grid on Sheet 1 (pointy-top hexes, rows of 5..9..5).
# Measured by fitting every printed hex frame (tools/calibrate_grid.py). The printed hexes are
# slightly squashed: rows are 209.3 px apart, where regular hexes would be 214.0.
ROW0_X, DX, ROW0_Y, DY = 747.95, 247.099, 1307.81, 209.281
ROWS = [5, 6, 7, 8, 9, 8, 7, 6, 5]
HEX_R = DX / math.sqrt(3)  # centre-to-corner radius in px, horizontally
HEX_RY = DY / 1.5  # ... and vertically


def hex_center(row: int, col: int) -> tuple[float, float]:
    off = abs(4 - row)
    return ROW0_X - (4 - off) * DX / 2 + col * DX, ROW0_Y + row * DY


def hex_points(cx: float, cy: float, r: float) -> list[tuple[float, float]]:
    """Corners of a (squashed) hex; r is the horizontal radius, the vertical one follows DY."""
    ry = r * HEX_RY / HEX_R
    return [(cx + r * math.cos(math.radians(60 * i - 30)), cy + ry * math.sin(math.radians(60 * i - 30))) for i in range(6)]


def render(pdf: str, tmp: Path, name: str) -> Image.Image:
    base = tmp / name
    subprocess.run(['pdftoppm', '-r', '300', '-png', '-singlefile', pdf, str(base)], check=True)
    return Image.open(f'{base}.png').convert('RGB')


def save(img: Image.Image, name: str, width: int | None = None, quality: int = 82) -> None:
    if width and img.width != width:
        img = img.resize((width, round(img.height * width / img.width)), Image.LANCZOS)
    path = OUT / f'{name}.webp'
    img.save(path, 'WEBP', quality=quality, method=6)
    print(f'{path.relative_to(OUT.parent.parent.parent)}  {img.width}x{img.height}  {path.stat().st_size // 1024} KB')


def board(sheet1: Image.Image) -> None:
    """The hex board with the pre-drawn buildings painted over by clean hexes, alpha outside."""
    img = sheet1.copy()
    # Pre-drawn buildings -> paste a clean hex of the same terrain over them.
    clean = {
        (1, 1): (2, 3),  # blank
        (2, 2): (2, 3),  # blank
        (3, 4): (1, 3),  # ice
        (3, 6): (4, 1),  # trash
        (4, 6): (5, 6),  # crater
        (4, 7): (2, 4),  # blank
    }
    for (r, c), (sr, sc) in clean.items():
        dx, dy = hex_center(r, c)
        sx, sy = hex_center(sr, sc)
        R = HEX_R * 1.07
        patch = sheet1.crop((int(sx - R), int(sy - R), int(sx + R), int(sy + R)))
        mask = Image.new('L', patch.size, 0)
        ImageDraw.Draw(mask).polygon(hex_points(R, R, R), fill=255)
        img.paste(patch, (int(dx - R), int(dy - R)), mask)

    # Remove what is left of the marker ink (joined contours run along neighbouring edges).
    arr = np.array(img)
    ink = (arr.max(axis=2) < 80) & ((arr.max(axis=2).astype(int) - arr.min(axis=2)) < 40)
    near = np.zeros(ink.shape, np.uint8)
    for (r, c) in clean:
        x, y = hex_center(r, c)
        cv2.circle(near, (int(x), int(y)), int(HEX_R * 1.4), 1, -1)
    sx, sy = hex_center(4, 4)
    cv2.circle(near, (int(sx), int(sy)), int(HEX_R * 0.95), 0, -1)  # leave the shuttle alone
    mask8 = (ink & (near > 0)).astype(np.uint8) * 255
    mask8 = cv2.dilate(mask8, np.ones((9, 9), np.uint8))
    arr = cv2.inpaint(arr, mask8, 7, cv2.INPAINT_TELEA)
    # Inpainting also wiped the hex border lines under the ink: redraw them there.
    lines = Image.fromarray(arr.copy())
    ld = ImageDraw.Draw(lines)
    for r, n in enumerate(ROWS):
        for c in range(n):
            if 0 < r < 8 and 0 < c < n - 1:  # inner hexes only; the outer ring has its own frame
                pts = hex_points(*hex_center(r, c), HEX_R)
                ld.line(pts + [pts[0]], fill=(238, 208, 192), width=13)
    for r, n in enumerate(ROWS):
        for c in range(n):
            if 0 < r < 8 and 0 < c < n - 1:
                pts = hex_points(*hex_center(r, c), HEX_R)
                ld.line(pts + [pts[0]], fill=(178, 146, 130), width=6)
    sel = cv2.dilate(mask8, np.ones((5, 5), np.uint8)) > 0
    arr[sel] = np.array(lines)[sel]
    img = Image.fromarray(arr)

    # Keep only the board: union of hexes, grown to include the rusty rim.
    mask = Image.new('L', img.size, 0)
    d = ImageDraw.Draw(mask)
    for r, n in enumerate(ROWS):
        for c in range(n):
            d.polygon(hex_points(*hex_center(r, c), HEX_R * 1.0), fill=255)
    wide = np.array(mask.filter(ImageFilter.MaxFilter(37)))
    tight = np.array(mask.filter(ImageFilter.MaxFilter(15)))
    # Above the top row and below the bottom row the sheet has other art (Depot plate,
    # astronaut) right against the rim, so keep the outline tight there.
    rows_y = np.arange(wide.shape[0])[:, None]
    edge = (rows_y < ROW0_Y) | (rows_y > ROW0_Y + 8 * DY)
    mask = Image.fromarray(np.where(edge, tight, wide).astype(np.uint8)).filter(ImageFilter.GaussianBlur(2))
    img.putalpha(mask)
    x0, y0, x1, y1 = mask.getbbox()
    out = img.crop((x0, y0, x1, y1))
    # Where the centre hex (row 4, col 4) is in the saved image, for the game to align it.
    cx, cy = hex_center(4, 4)
    width = 1800
    k = width / out.width
    geo = {
        'width': width,
        'height': round(out.height * k),
        'centerX': round((cx - x0) * k, 2),
        'centerY': round((cy - y0) * k, 2),
        'spacing': round(DX * k, 3),
        'rowSpacing': round(DY * k, 3),
    }
    (OUT / 'board.json').write_text(json.dumps(geo, indent=2) + '\n')
    print('board geometry', geo)
    save(out, 'board', width)


# Depot machine + launch manual from the top of Sheet 1, as one L-shaped image.
DEPOT_BOX = (95, 110, 2440, 1445)


def depot_alpha(arr: np.ndarray) -> np.ndarray:
    """The console's own outline, not a rectangle through it.

    The sheet's Mars backdrop is a saturated orange-red while the console is desaturated metal and
    the manual is pale paper, so flooding that backdrop inwards from the border traces the real
    silhouette - rounded corners, side pipes and all. The old straight-edged alpha sliced the
    machine across its lower body, losing the switch bank and the dials.

    The crop runs past the console into the hex board, so the machine and the note get separate
    lower limits: the note hangs below the machine, and one flat cut could not keep both.
    """
    h, w = arr.shape[:2]
    hsv = cv2.cvtColor(arr, cv2.COLOR_RGB2HSV).astype(int)
    hue, sat = hsv[:, :, 0], hsv[:, :, 1]
    passable = (((hue < 25) | (hue > 170)) & (sat > 70)).astype(np.uint8)
    flood = np.zeros((h + 2, w + 2), np.uint8)
    border = [(x, y) for x in range(w) for y in (0, h - 1)] + [(x, y) for y in range(h) for x in (0, w - 1)]
    for x, y in border:
        if passable[y, x] == 1:
            cv2.floodFill(passable, flood, (x, y), 2)
    kept = cv2.morphologyEx((passable != 2).astype(np.uint8), cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8), 2).astype(bool)

    SPLIT_X, MACHINE_BOTTOM, NOTE_BOTTOM = 1700, 1035, 1290
    rows = np.arange(h)[:, None]
    kept &= rows < np.where(np.arange(w)[None, :] < SPLIT_X, MACHINE_BOTTOM, NOTE_BOTTOM)

    n, lab, stats, _ = cv2.connectedComponentsWithStats(kept.astype(np.uint8), 8)
    return np.isin(lab, [i for i in range(1, n) if stats[i, cv2.CC_STAT_AREA] > 8000])


def depot(sheet1: Image.Image) -> None:
    x0, y0, x1, y1 = DEPOT_BOX
    arr = np.array(sheet1.crop(DEPOT_BOX))
    # The map board pokes into the manual's lower-left corner: paint it out with paper.
    m = np.zeros(arr.shape[:2], np.uint8)
    corner = [(1800, 1150), (1898, 1198), (1908, 1300), (1962, 1380), (2008, 1460), (1800, 1460)]
    cv2.fillPoly(m, [np.array([(x - x0, y - y0) for x, y in corner], np.int32)], 255)
    arr = cv2.inpaint(arr, m, 9, cv2.INPAINT_TELEA)
    img = Image.fromarray(arr)
    img.putalpha(Image.fromarray((depot_alpha(arr) * 255).astype(np.uint8)))
    save(img, 'depot', None, 88)  # native: the manual's small print needs every pixel the scan has
    (OUT / 'depot.json').write_text(json.dumps({'x0': x0, 'y0': y0, 'width': x1 - x0, 'height': y1 - y0}) + '\n')


CARD_X = [120, 690, 1250, 1810]
CARD_Y = [1220, 1970, 2710]
CARD_W, CARD_H = 530, 705
CARDS = [
    'foodPlant', 'oxygenPlant', 'cryoTank', 'researchSite',
    'nuclearPod', 'amplifier', 'separator', 'recycler',
    'rover', 'transceiver', 'laboratory', 'workshop',
]


def is_building(p: tuple[int, int, int]) -> bool:
    """Not sand: sand is saturated orange; buildings are greys, whites and dark shadows of metal."""
    r, g, b = p
    mx, mn = max(p), min(p)
    sat = (mx - mn) / mx if mx else 0
    return sat < 0.28 or (mx < 90)


def cards(sheet2: Image.Image) -> None:
    for i, name in enumerate(CARDS):
        x, y = CARD_X[i % 4], CARD_Y[i // 4]
        card = sheet2.crop((x, y - 5, x + CARD_W, y + CARD_H))
        m = Image.new('L', card.size, 0)
        ImageDraw.Draw(m).rounded_rectangle((0, 0, card.width - 1, card.height - 1), radius=22, fill=255)
        card.putalpha(m)
        save(card, f'card-{name}')  # native 530px: the sheet is 300 dpi and that is the ceiling

        # Illustration band (below the title strip): find the building and crop around it.
        band = sheet2.crop((x + 10, y + 100, x + 380, y + 298))
        # The card's corner badge(s) overlap the art: paint them out with the surrounding sand.
        badge = np.zeros((band.height, band.width), np.uint8)
        cv2.circle(badge, (40, -17), 80, 255, -1)
        if name == 'cryoTank':
            cv2.circle(badge, (40, 100), 80, 255, -1)
        band = Image.fromarray(cv2.inpaint(np.array(band), badge, 9, cv2.INPAINT_TELEA))
        small = band.resize((band.width // 4, band.height // 4))
        xs, ys = [], []
        for yy in range(small.height):
            for xx in range(small.width):
                if badge[yy * 4, xx * 4]:
                    continue
                if is_building(small.getpixel((xx, yy))):
                    xs.append(xx)
                    ys.append(yy)
        cx = (sorted(xs)[len(xs) // 2]) * 4 if xs else band.width // 2
        cy = (sorted(ys)[len(ys) // 2]) * 4 if ys else band.height // 2
        w, h = 230, 196
        left = min(max(cx - w // 2, 0), band.width - w)
        top = min(max(cy - h // 2, 0), band.height - h)
        tile = band.crop((left, top, left + w, top + h))
        save(tile, f'tile-{name}', 230)


def icons(sheet2: Image.Image) -> None:
    badge_cards = {
        'food': 0, 'oxygen': 1, 'sanity': 3, 'power': 4, 'materials': 6, 'automatron': 10, 'battery': 11,
    }
    for res, i in badge_cards.items():
        x, y = CARD_X[i % 4], CARD_Y[i // 4]
        cx, cy, r = x + 50, y + 83, 70
        icon = sheet2.crop((cx - r, cy - r, cx + r, cy + r))
        hexmask(icon)
        save(icon, f'icon-{res}', 96, 90)
    # Radiation and action-point icons come from the action/accident board.
    for res, (cx, cy, r) in {'radiation': (1040, 412, 34), 'ap': (247, 377, 34)}.items():
        icon = sheet2.crop((cx - r, cy - r, cx + r, cy + r))
        hexmask(icon)
        save(icon, f'icon-{res}', 96, 90)


def hexmask(img: Image.Image) -> None:
    w, h = img.size
    m = Image.new('L', (w * 4, h * 4), 0)
    pts = [(w * 2 + w * 2 * 0.98 * math.cos(math.radians(60 * i - 90)), h * 2 + h * 2 * 0.98 * math.sin(math.radians(60 * i - 90))) for i in range(6)]
    ImageDraw.Draw(m).polygon(pts, fill=255)
    img.putalpha(m.resize((w, h), Image.LANCZOS))


def header(page1: Image.Image) -> None:
    save(page1.crop((0, 0, 1300, 175)), 'banner', 1300, 70)
    logo = page1.crop((1380, 90, 2330, 230))
    alpha = Image.new('L', logo.size)
    px = logo.load()
    ap = alpha.load()
    for yy in range(logo.height):
        for xx in range(logo.width):
            r, g, b = px[xx, yy]
            light = min(r, g, b)
            ap[xx, yy] = max(0, min(255, (light - 150) * 4))
    logo.putalpha(alpha)
    save(logo, 'logo', 600, 90)


def main() -> None:
    if len(sys.argv) != 4:
        sys.exit(__doc__)
    OUT.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory() as t:
        tmp = Path(t)
        sheet1 = render(sys.argv[1], tmp, 'sheet1')
        sheet2 = render(sys.argv[2], tmp, 'sheet2')
        page1 = render(sys.argv[3], tmp, 'page1')
    board(sheet1)
    depot(sheet1)
    cards(sheet2)
    icons(sheet2)
    header(page1)


if __name__ == '__main__':
    main()
