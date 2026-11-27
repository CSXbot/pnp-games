#!/usr/bin/env python3
"""Cut the game's own art out of the print-and-play PDFs into src/assets/art/.

Usage:
    python3 tools/extract_art.py SHEET1_PLANET1.pdf SHEET2.pdf RULEBOOK_PAGE1.pdf

Needs `pdftoppm` and `pdfimages` (Poppler), Pillow, numpy and opencv-python-headless. Coordinates below are pixels at 300 dpi on the
A4 sheets (2480 x 3508).
"""

from __future__ import annotations

import json
import math
import subprocess
import sys
import tempfile
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw

from close_depot import restore_depot

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


# How far the printed rim reaches past the outermost hexes, in px at 300 dpi.
RIM = 31
# Where another illustration covers the rim. The flood traces the printed outline, but anything
# light and desaturated beside the rim survives it: on Planet 1 the cosmonaut sits against the
# bottom-right corner and his white glove and boot are printed over the rim there. Inside these
# boxes only the hexes themselves are kept, so that corner has no rim rather than fragments of him.
RIMLESS = [(1500, 2900, 2480, 3508)]


def board_alpha(arr: np.ndarray) -> np.ndarray:
    """The board's printed outline, traced rather than approximated.

    The old alpha was the union of the hexes grown by a square MaxFilter, which gave a staircase
    where the printed rim is a smooth bevel, and leaked pale slivers of the art beside it. Here the
    page and the Mars backdrop are flooded inwards from a ring RIM px outside the hexes: the rim's
    dark metal stops the flood, so what is left is the board as printed, steps and all.
    """
    h, w = arr.shape[:2]
    hexes = Image.new('L', (w, h), 0)
    d = ImageDraw.Draw(hexes)
    for r, n in enumerate(ROWS):
        for c in range(n):
            d.polygon(hex_points(*hex_center(r, c), HEX_R), fill=255)
    disc = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (RIM * 2 + 1, RIM * 2 + 1))
    outer = cv2.dilate((np.array(hexes) > 0).astype(np.uint8), disc) > 0

    hsv = cv2.cvtColor(arr, cv2.COLOR_RGB2HSV).astype(int)
    hue, sat, val = hsv[:, :, 0], hsv[:, :, 1], hsv[:, :, 2]
    mars = ((hue < 25) | (hue > 170)) & (sat > 70)
    paper = (val > 243) & (sat < 18)
    passable = ((mars | paper) & outer).astype(np.uint8)
    flood = np.zeros((h + 2, w + 2), np.uint8)
    ring = outer & ~cv2.erode(outer.astype(np.uint8), np.ones((3, 3), np.uint8)).astype(bool)
    for y, x in zip(*np.where(ring)):
        if passable[y, x] == 1:
            cv2.floodFill(passable, flood, (int(x), int(y)), 2)

    kept = outer & (passable != 2)
    inside = np.array(hexes) > 0
    for x0, y0, x1, y1 in RIMLESS:
        kept[y0:y1, x0:x1] &= inside[y0:y1, x0:x1]
    kept = cv2.morphologyEx(kept.astype(np.uint8), cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8), 2)
    n, lab, stats, _ = cv2.connectedComponentsWithStats(kept, 8)
    return lab == max(range(1, n), key=lambda i: stats[i, cv2.CC_STAT_AREA])


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

    img.putalpha(Image.fromarray((board_alpha(np.array(img)) * 255).astype(np.uint8)))
    mask = img.split()[3]
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


CARD_X = [120, 690, 1250, 1810]
CARD_Y = [1220, 1970, 2710]
CARD_W, CARD_H = 530, 705
CARDS = [
    'foodPlant', 'oxygenPlant', 'cryoTank', 'researchSite',
    'nuclearPod', 'amplifier', 'separator', 'recycler',
    'rover', 'transceiver', 'laboratory', 'workshop',
]
# The illustration band inside a card, card-relative: left of the cream border, below the title
# strip, above the rules text, and stopping where the cost chips begin. The whole band is taken
# for every card. Picking a smaller window and centring it on the building was what cut the
# Recycler's right wall and the Laboratory's frame off: the sheet had printed all of it.
BAND = (12, 96, 372, 294)
# The type badge is printed over the band's top-left corner; there is no art under it to recover.
BADGE = (42, -13, 80)          # centre x, centre y, radius - band-relative
CRYO_BADGE = (42, 104, 80)     # the Cryo Tank carries a second one lower down


def cards(sheet2: Image.Image) -> None:
    for i, name in enumerate(CARDS):
        x, y = CARD_X[i % 4], CARD_Y[i // 4]
        card = sheet2.crop((x, y - 5, x + CARD_W, y + CARD_H))
        m = Image.new('L', card.size, 0)
        ImageDraw.Draw(m).rounded_rectangle((0, 0, card.width - 1, card.height - 1), radius=22, fill=255)
        card.putalpha(m)
        save(card, f'card-{name}')  # native 530px: the sheet is 300 dpi and that is the ceiling

        # The whole illustration band, at print resolution. make_cutouts.py takes it from here:
        # the model's matte decides where the building ends, not a crop window.
        bx0, by0, bx1, by1 = BAND
        band = sheet2.crop((x + bx0, y + by0, x + bx1, y + by1))
        # The card's corner badge(s) are printed over the art: paint them out with the sand
        # around them. Nothing is recoverable under a badge - it was never printed.
        badge = np.zeros((band.height, band.width), np.uint8)
        cv2.circle(badge, BADGE[:2], BADGE[2], 255, -1)
        if name == 'cryoTank':
            cv2.circle(badge, CRYO_BADGE[:2], CRYO_BADGE[2], 255, -1)
        band = Image.fromarray(cv2.inpaint(np.array(band), badge, 9, cv2.INPAINT_TELEA))
        save(band, f'tile-{name}')


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
    restore_depot(Path(sys.argv[1]), OUT)
    cards(sheet2)
    icons(sheet2)
    header(page1)


if __name__ == '__main__':
    main()
