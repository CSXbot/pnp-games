"""Measure each printed hex centre from its frame and least-squares fit the grid.

Usage: render Sheet 1 at 300 dpi (pdftoppm -r 300 -png -singlefile SHEET1.pdf sheet1), then
    python3 tools/calibrate_grid.py sheet1.png
and copy the result into ROW0_X, DX, ROW0_Y, DY in extract_art.py."""
import sys

import numpy as np
from PIL import Image

im = np.array(Image.open(sys.argv[1]).convert('RGB')).astype(int)
inner = np.array([178, 146, 130])
outer = np.array([110, 45, 30])


def framey(px):
    return min(np.sqrt(((px - inner) ** 2).sum()), np.sqrt(((px - outer) ** 2).sum())) < 45


ROWS = [5, 6, 7, 8, 9, 8, 7, 6, 5]
x0, dx, y0, dy = 739.75, 247.5, 1289.5, 213
xs, ys = [], []  # (u, measured) where u = position index
for r, n in enumerate(ROWS):
    off = abs(4 - r)
    for c in range(n):
        gx = x0 - (4 - off) * dx / 2 + c * dx
        gy = y0 + r * dy
        # horizontal scan from the guess outwards: first frame pixel left and right
        y = int(gy)
        L = next((x for x in range(int(gx), int(gx) - 160, -1) if framey(im[y, x])), None)
        R = next((x for x in range(int(gx), int(gx) + 160) if framey(im[y, x])), None)
        if L is None or R is None or not (180 < R - L < 245):
            continue
        cx = (L + R) / 2
        T = next((yy for yy in range(int(gy), int(gy) - 180, -1) if framey(im[yy, int(cx)])), None)
        B = next((yy for yy in range(int(gy), int(gy) + 180) if framey(im[yy, int(cx)])), None)
        if T is None or B is None or not (200 < B - T < 290):
            continue
        cy = (T + B) / 2
        xs.append((-(4 - off) / 2 + c, cx))
        ys.append((r, cy))

xs, ys = np.array(xs), np.array(ys)
bx, ax = np.polyfit(xs[:, 0], xs[:, 1], 1)
by, ay = np.polyfit(ys[:, 0], ys[:, 1], 1)
rx = xs[:, 1] - (ax + bx * xs[:, 0])
ry = ys[:, 1] - (ay + by * ys[:, 0])
print(f'{len(xs)} hexes measured')
print(f'x0={ax:.2f} dx={bx:.3f}  (residual max {abs(rx).max():.1f}px)')
print(f'y0={ay:.2f} dy={by:.3f}  (residual max {abs(ry).max():.1f}px), regular dy would be {bx * 3 ** 0.5 / 2:.3f}')
