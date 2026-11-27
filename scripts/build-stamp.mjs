// The build marker every game on the shelf shows under its title.
//
// A screenshot from the iPad is the main way the Game Director reports a problem, and without this
// there is no way to tell which build it shows. That cost a round trip on 2026-11-27: a report
// arrived 90 seconds after a push, the fix looked broken, and it took comparing commit timestamps
// against screenshot timestamps to work out the deploy had not landed yet.
//
// Shared because the next game needs the same thing: `import { buildStamp } from
// '../../scripts/build-stamp.mjs'` in its vite.config.ts.
import { execFileSync } from 'node:child_process';

/** Short commit and date, e.g. "e3d69f5 · 27 Nov 12:41". Never throws: a stamp is not worth a build. */
export function buildStamp() {
  const sha = (process.env.WORKERS_CI_COMMIT_SHA ?? process.env.CF_PAGES_COMMIT_SHA ?? git('rev-parse', 'HEAD'))?.slice(0, 7);
  const when = new Date().toLocaleString('en-GB', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'UTC',
  });
  return sha ? `${sha} · ${when}` : when;
}

function git(...args) {
  try {
    return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return null; // no git on the build machine, or not a checkout
  }
}
