// Cuts the game's art out of the publisher's PDFs into src/assets/ - PROVISIONAL (stage 3).
//
//   node games/legend-of-hexdom/tools/extract_art.mjs
//
// Every source is a 300 dpi raster (`pdfimages -list`), extracted losslessly with `pdfimages -png`,
// cropped to the component's printed bounds and re-encoded at the size the layout shows it. Stage 4
// (art) revisits sizes, encoding and the pen marks; the crops below are measured, not guessed:
//   - maps: the hex area, from the grid tools/measure_maps.mjs fits (src/data/maps.ts `grid`);
//   - sidesheet tables: the printed grid lines, found by scanning for them (same on A, B, C to 2 px);
//   - Boss and Gift strips, Relic and Trade boxes: their frames.
// The geometry the UI needs is written to src/assets/art.json.

import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const sharp = require('sharp');

const GAME = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ROOT = path.resolve(GAME, '../..');
const HF = path.join(ROOT, 'sources/Legend of Hexdom/Hex Forest/Hex Forest - A5 Pack');
const OUT = path.join(GAME, 'src/assets');
mkdirSync(OUT, { recursive: true });

function raster(pdf) {
  const tmp = mkdtempSync(path.join(os.tmpdir(), 'hexdom-art-'));
  execFileSync('pdfimages', ['-png', pdf, path.join(tmp, 'p')]);
  return path.join(tmp, 'p-000.png');
}
const flat = (png) => sharp(png).flatten({ background: '#ffffff' });

const art = { maps: {}, tables: {}, scale: {} };

// Maps: the hex area (with a margin for the outer hexes' frames).
const MAP_CROP = { left: 36, top: 160, width: 1684, height: 2218 };
const MAP_H = 1400;
for (const n of [1, 2, 3]) {
  const png = raster(path.join(HF, `Hexforest-Maps/${n}.pdf`));
  await flat(png).extract(MAP_CROP).resize({ height: MAP_H }).jpeg({ quality: 82, mozjpeg: true }).toFile(path.join(OUT, `map-${n}.jpg`));
}
art.maps = { crop: MAP_CROP, height: MAP_H, scale: MAP_H / MAP_CROP.height };
// The score line printed under map 1 (p25's multipliers, as icons).
{
  const png = raster(path.join(HF, 'Hexforest-Maps/1.pdf'));
  await flat(png).extract({ left: 160, top: 2378, width: 1440, height: 64 }).resize({ width: 720 }).png({ compressionLevel: 9 }).toFile(path.join(OUT, 'score-line.png'));
}

// Sidesheet tables: Explore and Adventure, from the first column's left line to the right frame.
const COLS = [362, 526, 697, 870, 1039, 1214, 1386, 1555];
const EXPLORE_ROWS = [610, 761, 906, 1057];
const ADVENTURE_ROWS = [1117, 1367, 1615, 1863];
const T_CROP = { left: COLS[0], top: EXPLORE_ROWS[0], width: COLS[7] - COLS[0], height: ADVENTURE_ROWS[3] - EXPLORE_ROWS[0] };
const T_SCALE = 0.62;
const BOSS_CROP = { left: 232, top: 1900, width: 1340, height: 250 };
const GIFT_CROP = { left: 232, top: 2168, width: 1340, height: 282 };
const RELIC_CROP = { left: 1126, top: 176, width: 440, height: 290 };
const TRAVEL_CROP = { left: 228, top: 176, width: 652, height: 296 };
const STRIP_SCALE = 0.62;
for (const id of ['A', 'B', 'C']) {
  const png = raster(path.join(HF, `A5-HexForest-TablesCharacters-English/A5-HexForest-Tables/HexForest-A5-Table-${id}.pdf`));
  await flat(png).extract(T_CROP).resize({ width: Math.round(T_CROP.width * T_SCALE) }).jpeg({ quality: 85, mozjpeg: true }).toFile(path.join(OUT, `tables-${id}.jpg`));
  await flat(png).extract(GIFT_CROP).resize({ width: Math.round(GIFT_CROP.width * STRIP_SCALE) }).jpeg({ quality: 85, mozjpeg: true }).toFile(path.join(OUT, `gifts-${id}.jpg`));
  await flat(png).extract(RELIC_CROP).resize({ width: Math.round(RELIC_CROP.width * STRIP_SCALE) }).jpeg({ quality: 85, mozjpeg: true }).toFile(path.join(OUT, `relic-${id}.jpg`));
  // The Boss table, the Travel box and the Treasure box are pixel-identical on A, B and C: cut them once.
  if (id === 'A') {
    await flat(png).extract(TRAVEL_CROP).resize({ width: Math.round(TRAVEL_CROP.width * STRIP_SCALE) }).jpeg({ quality: 88, mozjpeg: true }).toFile(path.join(OUT, 'travel.jpg'));
    await flat(png).extract(BOSS_CROP).resize({ width: Math.round(BOSS_CROP.width * STRIP_SCALE) }).jpeg({ quality: 85, mozjpeg: true }).toFile(path.join(OUT, 'bosses.jpg'));
    // The six Treasure icons, from the Treasure box (centres measured on a native crop), so every
    // Treasure the game shows is the sheet's own picture - the same one the Boss table prints.
    // Each column's box runs from just right of its tick ring to just left of the next column's ring.
    const T_ICONS = { spear: [945, 290], hook: [1042, 290], crow: [945, 355], hammer: [1042, 355], skull: [945, 425], book: [1042, 425] };
    for (const [t, [left, y]] of Object.entries(T_ICONS)) {
      await flat(png).extract({ left, top: y - 35, width: 66, height: 70 }).png({ compressionLevel: 9 }).toFile(path.join(OUT, `treasure-${t}.png`));
    }
  }
}
const rel = (xs, o) => xs.map((v) => +((v - o) * T_SCALE).toFixed(1));
art.tables = {
  scale: T_SCALE,
  cols: rel(COLS, COLS[0]),
  explore: rel(EXPLORE_ROWS, EXPLORE_ROWS[0]),
  adventure: rel(ADVENTURE_ROWS, EXPLORE_ROWS[0]),
  width: Math.round(T_CROP.width * T_SCALE),
  height: Math.round(T_CROP.height * T_SCALE),
};
art.strips = { scale: STRIP_SCALE, boss: BOSS_CROP, gifts: GIFT_CROP, relic: RELIC_CROP, travel: TRAVEL_CROP };

// Portraits: the top-left of each character card (A5-<name>.png~ is the same art as the PDF).
for (const [id, file] of [['warrior', 'A5-warrior.png~'], ['archer', 'A5-archer.png~'], ['mage', 'A5-mage.png~']]) {
  const src = path.join(HF, 'A5-HexForest-TablesCharacters-English/A5-Classes', file);
  await sharp(src).extract({ left: 60, top: 20, width: 150, height: 230 }).resize({ height: 160 }).png({ compressionLevel: 9 }).toFile(path.join(OUT, `portrait-${id}.png`));
}

writeFileSync(path.join(OUT, 'art.json'), JSON.stringify(art, null, 2) + '\n');
console.log(JSON.stringify(art));
