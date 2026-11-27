// Measures the hex grid of each A5 map from the publisher's PDF, and draws an overlay to check it.
//
//   node games/legend-of-hexdom/tools/measure_maps.mjs <outDir> [mapNumber...]
//
// Reads sources/Legend of Hexdom/Hex Forest/Hex Forest - A5 Pack/Hexforest-Maps/<n>.pdf (a single
// 1754x2480 raster at 300 dpi; extracted losslessly with `pdfimages -png`), finds the white gutters
// between hexes along each row's centre line and down each column, and fits a regular grid to them by
// least squares. Writes <outDir>/map-<n>-grid.json and <outDir>/map-<n>-overlay.png.
//
// The grid: 10 rows of 6 pointy-top hexes. Rows 1, 3, 5, 7, 9 (1-based) sit half a hex to the RIGHT
// of rows 2, 4, 6, 8, 10. Every coordinate is in the A5 raster's pixels.

import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, mkdtempSync } from 'node:fs';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const sharp = require('sharp');

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const MAPS = path.join(ROOT, 'sources/Legend of Hexdom/Hex Forest/Hex Forest - A5 Pack/Hexforest-Maps');
const ROWS = 10;
const COLS = 6;

const [outDir, ...which] = process.argv.slice(2);
if (!outDir) throw new Error('usage: measure_maps.mjs <outDir> [mapNumber...]');
mkdirSync(outDir, { recursive: true });
const maps = which.length ? which.map(Number) : [1, 2, 3];

/** Least-squares line through (i, v) pairs: v = a + b*i. */
function fit(pairs) {
  const n = pairs.length;
  const si = pairs.reduce((s, [i]) => s + i, 0);
  const sv = pairs.reduce((s, [, v]) => s + v, 0);
  const sii = pairs.reduce((s, [i]) => s + i * i, 0);
  const siv = pairs.reduce((s, [i, v]) => s + i * v, 0);
  const b = (n * siv - si * sv) / (n * sii - si * si);
  const a = (sv - b * si) / n;
  const resid = Math.max(...pairs.map(([i, v]) => Math.abs(v - (a + b * i))));
  return { a, b, resid };
}

for (const n of maps) {
  const tmp = mkdtempSync(path.join(os.tmpdir(), 'hexdom-map-'));
  execFileSync('pdfimages', ['-png', path.join(MAPS, `${n}.pdf`), path.join(tmp, 'm')]);
  const png = path.join(tmp, 'm-000.png');
  const { data, info } = await sharp(png).flatten({ background: '#ffffff' }).raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: C } = info;
  const white = (x, y) => {
    const i = (y * W + x) * C;
    return data[i] > 245 && data[i + 1] > 245 && data[i + 2] > 245;
  };

  // A first guess, from a hand probe of map 1; the fit below replaces it.
  const guess = { x0: 314.5, dx: 251.5, y0: 323, dy: 211.4 };
  const cx = (r, c, g = guess) => g.x0 + g.dx * c - (r % 2 === 1 ? g.dx / 2 : 0); // r, c 0-based
  const cy = (r, g = guess) => g.y0 + g.dy * r;

  // Horizontal gutters: between neighbours in a row, on the row's centre line.
  const xPairs = []; // (half-steps from column 0 of an unshifted row, gutter x)
  for (let r = 0; r < ROWS; r++) {
    const y = Math.round(cy(r));
    for (let c = 0; c < COLS - 1; c++) {
      const mid = Math.round((cx(r, c) + cx(r, c + 1)) / 2);
      // the white run nearest the expected gutter, within 30 px
      let best = null;
      for (let x = mid - 30; x <= mid + 30; x++) {
        if (!white(x, y)) continue;
        let a = x;
        let b = x;
        while (a > 0 && white(a - 1, y)) a--;
        while (b < W - 1 && white(b + 1, y)) b++;
        if (b - a < 25 && (!best || Math.abs((a + b) / 2 - mid) < Math.abs(best - mid))) best = (a + b) / 2;
        x = b;
      }
      if (best !== null) xPairs.push([2 * c + 1 - (r % 2), best]);
    }
  }
  // Vertical extent of each hex down its centre column: top and bottom points of the pointy hex.
  const yPairs = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const x = Math.round(cx(r, c));
      let top = Math.round(cy(r)) - 100;
      while (top > 0 && !(white(x, top) && white(x, top - 1) && white(x, top - 2))) top--;
      let bot = Math.round(cy(r)) + 100;
      while (bot < H - 1 && !(white(x, bot) && white(x, bot + 1) && white(x, bot + 2))) bot++;
      yPairs.push([r, (top + bot) / 2, bot - top]);
    }
  }
  // Gutter between columns c and c+1 of row r: x = x0 + (dx/2) * (2c + 1 - (r odd ? 1 : 0)), so the
  // fit's intercept is x0 and its slope is half a hex. Refit without outliers (art can touch white).
  let fx = fit(xPairs);
  fx = fit(xPairs.filter(([h, x]) => Math.abs(x - (fx.a + fx.b * h)) < 3));
  const heights = yPairs.map(([, , h]) => h).sort((p, q) => p - q);
  const medianH = heights[Math.floor(heights.length / 2)];
  // Use only hexes whose measured height is normal (a white patch inside the art can cut a scan short).
  const normal = yPairs.filter(([, , h]) => Math.abs(h - medianH) < 4).map(([r, y]) => [r, y]);
  let fy = fit(normal);
  fy = fit(normal.filter(([r, y]) => Math.abs(y - (fy.a + fy.b * r)) < 3));
  const grid = {
    map: n,
    source: `Hexforest-Maps/${n}.pdf, ${W}x${H} px at 300 dpi`,
    rows: ROWS,
    cols: COLS,
    // centre of hex (row, col), both 1-based: x = x0 + dx*(col-1) - (row even ? dx/2 : 0), y = y0 + dy*(row-1)
    dx: +(fx.b * 2).toFixed(2),
    x0: +fx.a.toFixed(2),
    dy: +fy.b.toFixed(2),
    y0: +fy.a.toFixed(2),
    hexHeight: medianH,
    fit: { xGutters: xPairs.length, xResidual: +fx.resid.toFixed(2), yHexes: yPairs.length, yResidual: +fy.resid.toFixed(2) },
  };
  // Rows: the first is shifted RIGHT, so with 0-based r, odd r (rows 2, 4, ...) are shifted left.
  writeFileSync(path.join(outDir, `map-${n}-grid.json`), JSON.stringify(grid, null, 2));
  console.log(JSON.stringify(grid));

  // Overlay: a small red cross on each fitted centre, and row/col labels.
  const g = { x0: grid.x0, dx: grid.dx, y0: grid.y0, dy: grid.dy };
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">`;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const x = cx(r, c, g);
      const y = cy(r, g);
      const R = grid.hexHeight / 2;
      const pts = [0, 1, 2, 3, 4, 5].map((k) => {
        const a = (Math.PI / 180) * (60 * k - 90);
        return `${(x + R * Math.cos(a)).toFixed(1)},${(y + R * Math.sin(a)).toFixed(1)}`;
      });
      svg += `<polygon points="${pts.join(' ')}" fill="none" stroke="red" stroke-width="3"/>`;
      svg += `<text x="${x}" y="${y - 70}" font-size="44" font-family="Arial" font-weight="bold" fill="red" stroke="white" stroke-width="2" text-anchor="middle">${r + 1}.${c + 1}</text>`;
    }
  }
  svg += '</svg>';
  const full = await sharp(png).flatten({ background: '#ffffff' }).composite([{ input: Buffer.from(svg) }]).png().toBuffer();
  await sharp(full).resize(1100).png().toFile(path.join(outDir, `map-${n}-overlay.png`));
}
