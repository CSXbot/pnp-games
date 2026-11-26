// Screen checks for the built shelf in dist/, in a real browser.
//
// Loads the launcher and every game at 1440x900 (laptop) and 1366x1024 (iPad Pro landscape) and:
//   - fails on console errors, uncaught page errors or failed requests;
//   - fails if the launcher's links don't resolve;
//   - reports pages that scroll, and fails only for games marked "tabletReady" in their
//     package.json ("pnp": { "tabletReady": true }), which is the promise of fitting 100dvh.
// Screenshots of every page and size land in .screens/ (gitignored) to be looked at.
//
// Needs Google Chrome installed (playwright-core drives the installed browser, so npm ci stays
// small and the Cloudflare build never downloads one). It also picks up a Playwright chromium
// if one has been installed.

import { createReadStream, existsSync, mkdirSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
// Its own subfolder: this run wipes it, and anything else kept under .screens/ (art candidates,
// comparisons) has to survive that.
const shots = path.join(root, '.screens', 'shots');

const SIZES = [
  { name: 'laptop', width: 1440, height: 900 },
  { name: 'ipad', width: 1366, height: 1024 },
];

if (!existsSync(path.join(dist, 'index.html'))) {
  console.error('dist/index.html is missing. Run `npm run build` first.');
  process.exit(1);
}

/** Games in dist, with the tabletReady flag from their workspace package.json. */
function games() {
  const dir = path.join(dist, 'games');
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && existsSync(path.join(dir, e.name, 'index.html')))
    .map((e) => {
      const pkgPath = path.join(root, 'games', e.name, 'package.json');
      const pkg = existsSync(pkgPath) ? JSON.parse(readFileSync(pkgPath, 'utf8')) : {};
      return { slug: e.name, url: `/games/${e.name}/index.html`, tabletReady: pkg.pnp?.tabletReady === true };
    })
    .sort((a, b) => a.slug.localeCompare(b.slug));
}

const TYPES = { '.html': 'text/html; charset=utf-8', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.css': 'text/css', '.js': 'text/javascript' };

function serve(dir) {
  const server = createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    let file = path.join(dir, decodeURIComponent(url.pathname));
    if (!path.resolve(file).startsWith(path.resolve(dir))) {
      res.writeHead(403).end();
      return;
    }
    if (file.endsWith(path.sep)) file = path.join(file, 'index.html');
    // dist/ has no API behind it. Answer the save endpoint the way the Worker answers an
    // empty one, so a page that syncs doesn't look like a broken page.
    if (url.pathname.startsWith('/api/')) {
      res.writeHead(204).end();
      return;
    }
    // The browser asks for /favicon.ico on its own; a missing one is not a page error.
    if (url.pathname === '/favicon.ico' && !existsSync(file)) {
      res.writeHead(204).end();
      return;
    }
    if (!existsSync(file)) {
      res.writeHead(404, { 'content-type': 'text/plain' }).end('not found');
      return;
    }
    res.writeHead(200, { 'content-type': TYPES[path.extname(file)] ?? 'application/octet-stream' });
    createReadStream(file).pipe(res);
  });
  return new Promise((ok) => server.listen(0, '127.0.0.1', () => ok({ server, port: server.address().port })));
}

async function launch() {
  try {
    return await chromium.launch({ channel: 'chrome' });
  } catch (e) {
    try {
      return await chromium.launch();
    } catch {
      console.error('No browser to drive. Install Google Chrome, or run `npx playwright-core install chromium`.');
      console.error(String(e.message ?? e).split('\n')[0]);
      process.exit(1);
    }
  }
}

const pages = [{ slug: 'shelf', url: '/index.html', tabletReady: true }, ...games()];
const { server, port } = await serve(dist);
const browser = await launch();
const rows = [];
const failures = [];

rmSync(shots, { recursive: true, force: true });
mkdirSync(shots, { recursive: true });

for (const page of pages) {
  for (const size of SIZES) {
    const context = await browser.newContext({
      viewport: { width: size.width, height: size.height },
      // The tablet size is a touch device, so the coarse-pointer rules must be in play.
      hasTouch: size.name === 'ipad',
    });
    const tab = await context.newPage();
    const problems = [];
    tab.on('console', (m) => m.type() === 'error' && problems.push(`console: ${m.text()}`));
    tab.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));
    tab.on('requestfailed', (r) => problems.push(`request failed: ${r.url().slice(0, 80)}`));

    await tab.goto(`http://127.0.0.1:${port}${page.url}`, { waitUntil: 'load' });
    await tab.waitForTimeout(500);

    // A first visit opens the "How to play" modal; close it so the layout underneath is measured.
    const help = tab.locator('.modal.help .btn');
    if (await help.count()) {
      await help.first().click();
      await tab.waitForTimeout(200);
    }

    // What "fits" has to mean here, because the app shell is `height: 100dvh; overflow: hidden`
    // and so the document can never report a scroll:
    //   - the page itself must not scroll (kept as a guard in case the shell changes);
    //   - the board must be fully visible - it is the one thing you cannot usefully scroll;
    //   - any column whose content is taller than itself must be scrollable, so the content is
    //     reachable rather than clipped;
    //   - how much taller than the window the content wants to be is reported, not failed: a side
    //     panel scrolling inside itself is the designed escape valve.
    const box = await tab.evaluate(() => {
      const cols = [...document.querySelectorAll('.col')].map((c) => ({
        name: c.className.replace('col ', ''),
        over: c.scrollHeight - c.clientHeight,
        scrollable: ['auto', 'scroll'].includes(getComputedStyle(c).overflowY),
      }));
      const app = document.querySelector('.app');
      const before = app ? { height: app.style.height, overflow: app.style.overflow } : null;
      if (app) {
        app.style.height = 'auto';
        app.style.overflow = 'visible';
      }
      const d = document.documentElement;
      const wanted = Math.max(0, d.scrollHeight - window.innerHeight);
      if (app && before) {
        app.style.height = before.height;
        app.style.overflow = before.overflow;
      }
      return { scrollH: d.scrollHeight, clientH: d.clientHeight, scrollW: d.scrollWidth, clientW: d.clientWidth, cols, wanted };
    });

    for (const c of box.cols) {
      if (c.over > 0 && !c.scrollable) {
        failures.push(`${page.slug} @ ${size.width}x${size.height}: ${c.name} clips ${c.over}px with no way to scroll to it`);
      }
      if (c.name === 'col-map' && c.over > 0) {
        failures.push(`${page.slug} @ ${size.width}x${size.height}: the board doesn't fit (${c.over}px cut off)`);
      }
    }

    const overflowY = Math.max(0, box.scrollH - box.clientH);
    const overflowX = Math.max(0, box.scrollW - box.clientW);

    await tab.screenshot({ path: path.join(shots, `${page.slug}-${size.width}x${size.height}.png`) });
    await context.close();

    for (const p of problems) failures.push(`${page.slug} @ ${size.width}x${size.height}: ${p}`);
    const scrolls = overflowY > 0 || overflowX > 0;
    if (scrolls && page.tabletReady) {
      failures.push(`${page.slug} @ ${size.width}x${size.height}: page scrolls (+${overflowY}px down, +${overflowX}px across)`);
    }
    rows.push({
      page: page.slug,
      size: `${size.width}x${size.height}`,
      errors: problems.length,
      scroll: scrolls ? `+${overflowY}px down${overflowX ? `, +${overflowX}px across` : ''}` : 'fits',
      note: box.wanted ? `content wants +${box.wanted}px, panels absorb it` : '',
    });
  }
}

// The launcher is useless if its links are dead, so follow every one of them.
{
  const context = await browser.newContext();
  const tab = await context.newPage();
  await tab.goto(`http://127.0.0.1:${port}/index.html`, { waitUntil: 'load' });
  const hrefs = await tab.$$eval('a[href]', (as) => as.map((a) => a.getAttribute('href')));
  if (!hrefs.length) failures.push('shelf: no links to any game');
  for (const href of hrefs) {
    const target = new URL(href, `http://127.0.0.1:${port}/index.html`);
    const res = await tab.request.get(target.href);
    if (!res.ok()) failures.push(`shelf: link ${href} -> ${res.status()}`);
  }
  await context.close();
}

await browser.close();
server.close();

console.table(rows);
console.log(`screenshots: ${path.relative(root, shots)}/`);

if (failures.length) {
  console.error('\nFAILED');
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log('\nOK: no console errors.');
