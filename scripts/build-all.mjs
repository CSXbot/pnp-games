// Builds the whole shelf into dist/:
//
//   dist/index.html                     the launcher (shelf/)
//   dist/games/<slug>/index.html        one game per folder in games/
//
// Every file is self-contained: vite-plugin-singlefile inlines the JS, CSS, art and fonts,
// so a built page needs no network and can be opened by double-clicking it.

import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readdirSync, rmSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');

/** Every folder under games/ that is an npm workspace. The folder name is the game's slug. */
function gameSlugs() {
  const dir = path.join(root, 'games');
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && existsSync(path.join(dir, e.name, 'package.json')))
    .map((e) => e.name)
    .sort();
}

const targets = [
  { ws: 'shelf', out: 'index.html' },
  ...gameSlugs().map((slug) => ({ ws: `games/${slug}`, out: path.join('games', slug, 'index.html') })),
];

rmSync(dist, { recursive: true, force: true });

for (const { ws, out } of targets) {
  console.log(`\n=== ${ws} -> dist/${out}`);
  execFileSync('npm', ['run', 'build', '-w', ws], { cwd: root, stdio: 'inherit' });

  const built = path.join(root, ws, 'dist');
  const index = path.join(built, 'index.html');
  if (!existsSync(index)) throw new Error(`${ws}: no dist/index.html after its build script`);

  // A page that still needs separate assets is not a single file, so fail loudly instead of
  // shipping something that only works with its folder next to it.
  const stray = readdirSync(built).filter((f) => f !== 'index.html' && !f.startsWith('.'));
  if (stray.length) throw new Error(`${ws}: build left assets outside index.html: ${stray.join(', ')}`);

  mkdirSync(path.dirname(path.join(dist, out)), { recursive: true });
  copyFileSync(index, path.join(dist, out));
}

console.log('\n=== dist');
for (const { out } of targets) {
  const kb = Math.round(statSync(path.join(dist, out)).size / 1024);
  console.log(`  ${out}  ${kb} KB`);
}
