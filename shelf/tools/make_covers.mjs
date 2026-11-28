// Box covers for the shelf, cut from each game's own art (never generated: the titles are text on
// the page, drawn by CSS). Run from the repo root: node shelf/tools/make_covers.mjs
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const sharp = require('sharp');
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = path.join(ROOT, 'shelf/covers');
const W = 360;
const H = 480;

// Recycled: two of its building illustrations (the Recycler and the Rover, cropped clear of the
// cards' text and icons) on the game's rust colour.
const A = path.join(ROOT, 'games/recycled/src/assets/art');
const ill = (card) => sharp(path.join(A, `card-${card}.webp`)).extract({ left: 100, top: 132, width: 216, height: 118 }).resize({ width: 340 }).toBuffer();
const rust = Buffer.from(`<svg width="${W}" height="${H}"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c4683d"/><stop offset="1" stop-color="#5e2414"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#g)"/></svg>`);
await sharp(rust)
  .composite([
    { input: await ill('recycler'), left: 10, top: 30 },
    { input: await ill('rover'), left: 10, top: 226 },
  ])
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile(path.join(OUT, 'recycled.jpg'));

// Legend of Hexdom: the top rows of map 1, The Ranger's Return (two Villages, a Castle, mountains).
await sharp(path.join(ROOT, 'games/legend-of-hexdom/src/assets/map-1.jpg'))
  .extract({ left: 250, top: 40, width: 600, height: 800 })
  .resize(W, H)
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile(path.join(OUT, 'legend-of-hexdom.jpg'));
console.log('covers written');
