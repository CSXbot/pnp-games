// Written as JavaScript on purpose: the Worker's tsconfig carries no Node types, and this check
// reads the repo from disk. Vitest runs it; tsc leaves it alone.
// The site holds publishers' art and is for one person. These are the settings whose quiet failure
// would publish it, so they are a test rather than a line in a document. If one of these fails,
// don't relax the test: a push deploys, and the deploy is what this is guarding.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
// wrangler.jsonc allows comments; strip them before parsing.
const raw = readFileSync(path.join(root, 'wrangler.jsonc'), 'utf8').replace(/^\s*\/\/.*$/gm, '');
const config = JSON.parse(raw);

it('serves no *.workers.dev URL', () => {
  expect(config.workers_dev, 'workers_dev must stay false: it is an unguarded second way in').toBe(false);
});

it('serves no preview URLs', () => {
  expect(config.preview_urls, 'preview_urls must stay false: previews are not behind the Access app').toBe(false);
});

it('answers on exactly one hostname, and it is a custom domain', () => {
  const routes = config.routes ?? [];
  expect(routes).toHaveLength(1);
  expect(routes[0].custom_domain).toBe(true);
  expect(routes[0].pattern).toBe('games.csx.tools');
});

it('still serves the built shelf, so this file is about the real deployment', () => {
  expect(config.assets?.directory).toBe('./dist');
  expect(config.main).toBeTruthy();
});
