// Plays the built game in a real browser at the three screen sizes, mid-game, and screenshots it.
// `npm run check:screens` only loads the opening dialog; this covers the screens that matter.
//
//   node games/legend-of-hexdom/tools/drive.mjs <outDir> [state.json ...]
//
// For each size: a new game played through the UI (start, roll, choose a die, tap a path, travel,
// pick a die, act, place what was gained), then each given saved state loaded as-is (a die selected,
// the full tables opened). Fails on a console error or a page that scrolls.

import { mkdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright-core');
const FILE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist/index.html');
const [out, ...states] = process.argv.slice(2);
if (!out) throw new Error('usage: drive.mjs <outDir> [state.json ...]');
mkdirSync(out, { recursive: true });
const SAVE_KEY = 'pnp:legend-of-hexdom:state';

const browser = await chromium.launch({ channel: 'chrome' }).catch(() => chromium.launch());
const failures = [];
for (const [w, h] of [[1440, 900], [1366, 865], [1366, 1024]]) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(String(e)));
  const check = async (name) => {
    await page.waitForTimeout(300); // panels re-measure on the next frame (ResizeObserver)
    const [sh, ch] = await page.evaluate(() => [document.documentElement.scrollHeight, document.documentElement.clientHeight]);
    if (sh > ch) failures.push(`${w}x${h} ${name}: page scrolls (${sh} > ${ch})`);
    // The printed cells must fit their panel: the panel clips, so a page that doesn't scroll can still hide a row.
    const [gb, bb] = await page.evaluate(() => {
      const g = document.querySelector('.here-grid')?.getBoundingClientRect();
      const b = document.querySelector('.here-box')?.getBoundingClientRect();
      return g && b ? [g.bottom, b.bottom] : [0, 0];
    });
    if (gb > bb + 1) failures.push(`${w}x${h} ${name}: the cells overflow their panel by ${Math.round(gb - bb)}px`);
    await page.screenshot({ path: path.join(out, `${w}x${h}-${name}.png`) });
  };

  // A new game through the UI.
  await page.goto('file://' + FILE);
  await page.getByRole('button', { name: 'Start', exact: true }).click();
  await page.getByRole('button', { name: 'Roll for the start' }).click();
  await page.getByRole('button', { name: 'Roll the dice' }).click();
  for (let i = 0; i < 3; i++) {
    await page.locator('.dice-row .die-btn').nth(i).click();
    if (await page.locator('.hex.target').count()) break;
  }
  for (let k = 0; k < 4 && (await page.locator('.hex.target').count()); k++) {
    await page.locator('.hex.target').first().dispatchEvent('click');
    if (await page.getByRole('button', { name: /^Travel to/ }).count()) break;
  }
  await check('1-path');
  await page.getByRole('button', { name: /^Travel to/ }).click();
  await page.locator('.dice-row .die-btn:not(.used)').first().click();
  await check('2-main');
  await page.locator('.actions .btn.action:not([disabled])').first().click();
  for (let k = 0; k < 4; k++) {
    const p = page.locator('.pending .btn:not([disabled])');
    if (await p.count()) await p.first().click();
  }
  await page.getByRole('button', { name: 'Tables, Bosses, Gifts' }).click();
  await check('3-tables');
  await page.getByRole('button', { name: 'Close' }).click();

  // Saved positions.
  for (const file of states) {
    const name = path.basename(file, '.json');
    await page.evaluate(([k, v]) => localStorage.setItem(k, v), [SAVE_KEY, readFileSync(file, 'utf8')]);
    await page.reload();
    const free = page.locator('.dice-row .die-btn:not(.used):not([disabled])');
    if (await free.count()) await free.first().click();
    await check(`state-${name}`);
  }
  if (errors.length) failures.push(`${w}x${h}: ${errors.join(' | ')}`);
  await page.close();
}
await browser.close();
if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log(`OK: three sizes, no console errors, no page scroll. Screenshots in ${out}`);
