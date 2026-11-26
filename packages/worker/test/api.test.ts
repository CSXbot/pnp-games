// The save API, against a stand-in for D1. Identity is taken from DEV_EMAIL here; the real
// assertion path is covered in access.test.ts.
import { expect, it } from 'vitest';
import { handleApi, type Env, type SaveRow } from '../src/index';

function fakeDb() {
  const rows = new Map<string, SaveRow>();
  const db = {
    rows,
    prepare(sql: string) {
      let bound: unknown[] = [];
      const stmt = {
        bind(...v: unknown[]) {
          bound = v;
          return stmt;
        },
        async first<T>(): Promise<T | null> {
          const [email, game] = bound as [string, string];
          return (rows.get(`${email}/${game}`) as T) ?? null;
        },
        async run() {
          if (!sql.startsWith('INSERT')) throw new Error(`unexpected write: ${sql}`);
          const [email, game, state, savedAt, device] = bound as [string, string, string, number, string | null];
          rows.set(`${email}/${game}`, { state, saved_at: savedAt, device });
          return {};
        },
      };
      return stmt;
    },
  };
  return db;
}

function env(db = fakeDb()): Env & { SAVES: ReturnType<typeof fakeDb> } {
  return {
    SAVES: db,
    ASSETS: { fetch: async () => new Response('assets') },
    ACCESS_TEAM_DOMAIN: 'team.cloudflareaccess.com',
    ACCESS_AUD: 'aud',
    DEV_EMAIL: 'owner@example.com',
  };
}

const url = (p: string) => `https://games.example${p}`;
const put = (game: string, body: unknown) =>
  new Request(url(`/api/save?game=${game}`), { method: 'PUT', body: JSON.stringify(body) });

it('refuses everything when there is no identity', async () => {
  const e = env();
  e.DEV_EMAIL = undefined;
  const res = await handleApi(new Request(url('/api/save?game=recycled')), e);
  expect(res.status).toBe(401);
});

it('says who you are', async () => {
  const res = await handleApi(new Request(url('/api/whoami')), env());
  expect(await res.json()).toEqual({ email: 'owner@example.com' });
});

it('answers 204, not 404, when there is no save yet', async () => {
  const res = await handleApi(new Request(url('/api/save?game=recycled')), env());
  expect(res.status).toBe(204);
});

it('round-trips a save', async () => {
  const e = env();
  const state = { version: 1, day: 12, log: ['a'] };
  const written = await handleApi(put('recycled', { state, savedAt: 1700, device: 'Mac' }), e);
  expect(written.status).toBe(200);

  const read = await handleApi(new Request(url('/api/save?game=recycled')), e);
  expect(await read.json()).toEqual({ state, savedAt: 1700, device: 'Mac' });
});

it('overwrites the row for the same game and keeps games apart', async () => {
  const e = env();
  await handleApi(put('recycled', { state: { day: 1 }, savedAt: 1 }), e);
  await handleApi(put('recycled', { state: { day: 2 }, savedAt: 2 }), e);
  await handleApi(put('other', { state: { day: 9 }, savedAt: 3 }), e);
  expect(e.SAVES.rows.size).toBe(2);
  const read = await handleApi(new Request(url('/api/save?game=recycled')), e);
  expect(await read.json()).toMatchObject({ state: { day: 2 }, savedAt: 2 });
});

it('rejects a bad game name rather than touching the database', async () => {
  const e = env();
  for (const g of ['', 'Recycled', '../etc', 'a'.repeat(40)]) {
    const res = await handleApi(new Request(url(`/api/save?game=${encodeURIComponent(g)}`)), e);
    expect(res.status).toBe(400);
  }
  expect(e.SAVES.rows.size).toBe(0);
});

it('rejects a body without state or savedAt', async () => {
  const e = env();
  for (const body of [{}, { state: { a: 1 } }, { savedAt: 1 }, { state: { a: 1 }, savedAt: 'soon' }]) {
    expect((await handleApi(put('recycled', body), e)).status).toBe(400);
  }
  expect((await handleApi(new Request(url('/api/save?game=recycled'), { method: 'PUT', body: '{' }), e)).status).toBe(400);
});

it('rejects a state that is absurdly large', async () => {
  const res = await handleApi(put('recycled', { state: { blob: 'x'.repeat(1_000_001) }, savedAt: 1 }), env());
  expect(res.status).toBe(413);
});

it('refuses methods it does not implement', async () => {
  const res = await handleApi(new Request(url('/api/save?game=recycled'), { method: 'DELETE' }), env());
  expect(res.status).toBe(405);
});

it('404s unknown api paths', async () => {
  const res = await handleApi(new Request(url('/api/nope')), env());
  expect(res.status).toBe(404);
});
