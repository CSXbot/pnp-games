/**
 * The shelf's Worker.
 *
 * Static assets are served by the asset layer before this runs, so this only sees `/api/*` and
 * anything the assets don't cover. Its one job is the save API: one row per (player, game), so a
 * shift started on the Mac can be picked up on the iPad.
 *
 * The browser keeps playing from `localStorage` whether or not this is reachable; the cloud copy is
 * a sync layer, never the source of truth.
 */
import { identify, type AccessConfig } from './access';

/** The slice of D1 this Worker uses. */
interface D1Result<T> {
  results?: T[];
}
interface D1Statement {
  bind(...values: unknown[]): D1Statement;
  first<T = unknown>(): Promise<T | null>;
  run(): Promise<D1Result<unknown>>;
}
export interface D1Like {
  prepare(query: string): D1Statement;
}

export interface Env {
  SAVES: D1Like;
  ASSETS: { fetch(request: Request): Promise<Response> };
  ACCESS_TEAM_DOMAIN: string;
  ACCESS_AUD: string;
  /** Only ever set by `wrangler dev`, never in wrangler.jsonc, so production always verifies. */
  DEV_EMAIL?: string;
}

export interface SaveRow {
  state: string;
  saved_at: number;
  device: string | null;
}

const GAME_RE = /^[a-z0-9][a-z0-9-]{0,31}$/;
const MAX_STATE_BYTES = 1_000_000;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });

export async function handleApi(
  request: Request,
  env: Env,
  deps: { fetch?: typeof fetch; now?: () => number } = {},
): Promise<Response> {
  const url = new URL(request.url);
  const cfg: AccessConfig = { teamDomain: env.ACCESS_TEAM_DOMAIN, aud: env.ACCESS_AUD };

  const identity = (await identify(request, cfg, deps)) ?? (env.DEV_EMAIL ? { email: env.DEV_EMAIL } : null);
  if (!identity) return json({ error: 'not signed in' }, 401);

  if (url.pathname === '/api/whoami') return json({ email: identity.email });

  if (url.pathname !== '/api/save') return json({ error: 'not found' }, 404);

  const game = url.searchParams.get('game') ?? '';
  if (!GAME_RE.test(game)) return json({ error: 'bad game' }, 400);

  if (request.method === 'GET') {
    const row = await env.SAVES.prepare('SELECT state, saved_at, device FROM saves WHERE user_email = ? AND game = ?')
      .bind(identity.email, game)
      .first<SaveRow>();
    // 204, not 404: "you have no save yet" is a normal answer, and a 404 would log a console
    // error on every fresh load.
    if (!row) return new Response(null, { status: 204, headers: { 'cache-control': 'no-store' } });
    return json({ state: JSON.parse(row.state), savedAt: row.saved_at, device: row.device });
  }

  if (request.method === 'PUT') {
    let body: { state?: unknown; savedAt?: unknown; device?: unknown };
    try {
      body = (await request.json()) as typeof body;
    } catch {
      return json({ error: 'bad json' }, 400);
    }
    if (body.state == null || typeof body.savedAt !== 'number' || !Number.isFinite(body.savedAt)) {
      return json({ error: 'state and savedAt required' }, 400);
    }
    const state = JSON.stringify(body.state);
    if (state.length > MAX_STATE_BYTES) return json({ error: 'state too large' }, 413);
    const device = typeof body.device === 'string' ? body.device.slice(0, 60) : null;

    await env.SAVES.prepare(
      `INSERT INTO saves (user_email, game, state, saved_at, device, stored_at)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(user_email, game) DO UPDATE SET
         state = excluded.state, saved_at = excluded.saved_at,
         device = excluded.device, stored_at = excluded.stored_at`,
    )
      .bind(identity.email, game, state, Math.round(body.savedAt), device, deps.now?.() ?? Date.now())
      .run();
    return json({ ok: true });
  }

  return json({ error: 'method not allowed' }, 405);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/')) return handleApi(request, env);
    // Everything else belongs to the built shelf.
    return env.ASSETS.fetch(request);
  },
};
