// Access assertions are the only thing standing between the save API and anyone who can reach it,
// so every way a token can be wrong is checked here.
import { beforeEach, expect, it } from 'vitest';
import { identify, resetKeyCache } from '../src/access';

const TEAM = 'team.cloudflareaccess.com';
const AUD = 'aud-tag-for-this-app';
const CFG = { teamDomain: TEAM, aud: AUD };
const NOW = 1_800_000_000_000;
const now = () => NOW;

function toB64url(bytes: Uint8Array): string {
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
const encodeJson = (o: unknown) => toB64url(new TextEncoder().encode(JSON.stringify(o)));

const keyPair = await crypto.subtle.generateKey(
  { name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
  true,
  ['sign', 'verify'],
);
const publicJwk = { ...(await crypto.subtle.exportKey('jwk', keyPair.publicKey)), kid: 'k1' };

const other = await crypto.subtle.generateKey(
  { name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
  true,
  ['sign', 'verify'],
);

async function sign(payload: object, opts: { kid?: string; key?: CryptoKey } = {}): Promise<string> {
  const h = encodeJson({ alg: 'RS256', kid: opts.kid ?? 'k1', typ: 'JWT' });
  const p = encodeJson(payload);
  const sig = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    opts.key ?? keyPair.privateKey,
    new TextEncoder().encode(`${h}.${p}`),
  );
  return `${h}.${p}.${toB64url(new Uint8Array(sig))}`;
}

const good = () => ({
  iss: `https://${TEAM}`,
  aud: [AUD],
  email: 'owner@example.com',
  exp: NOW / 1000 + 3600,
  nbf: NOW / 1000 - 10,
});

let fetchCalls = 0;
const certs = (keys: unknown[] = [publicJwk]) =>
  (async () => {
    fetchCalls++;
    return { ok: true, json: async () => ({ keys }) } as unknown as Response;
  }) as unknown as typeof fetch;

const withToken = (token: string, asCookie = false) =>
  new Request('https://games.example/api/whoami', {
    headers: asCookie ? { Cookie: `CF_Authorization=${token}; other=1` } : { 'Cf-Access-Jwt-Assertion': token },
  });

beforeEach(() => {
  resetKeyCache();
  fetchCalls = 0;
});

it('accepts a token signed by the team key', async () => {
  const id = await identify(withToken(await sign(good())), CFG, { fetch: certs(), now });
  expect(id).toEqual({ email: 'owner@example.com' });
});

it('reads the token from the CF_Authorization cookie too', async () => {
  const id = await identify(withToken(await sign(good()), true), CFG, { fetch: certs(), now });
  expect(id).toEqual({ email: 'owner@example.com' });
});

it('refuses a request with no assertion, without fetching keys', async () => {
  expect(await identify(new Request('https://games.example/api/save'), CFG, { fetch: certs(), now })).toBeNull();
  expect(fetchCalls).toBe(0);
});

it('refuses an expired token', async () => {
  const token = await sign({ ...good(), exp: NOW / 1000 - 1 });
  expect(await identify(withToken(token), CFG, { fetch: certs(), now })).toBeNull();
});

it('refuses a token for another application', async () => {
  const token = await sign({ ...good(), aud: ['someone-elses-app'] });
  expect(await identify(withToken(token), CFG, { fetch: certs(), now })).toBeNull();
});

it('refuses a token from another team', async () => {
  const token = await sign({ ...good(), iss: 'https://evil.cloudflareaccess.com' });
  expect(await identify(withToken(token), CFG, { fetch: certs(), now })).toBeNull();
});

it('refuses a token signed by a key the team does not publish', async () => {
  const token = await sign(good(), { key: other.privateKey });
  expect(await identify(withToken(token), CFG, { fetch: certs(), now })).toBeNull();
});

it('refuses a token whose kid is unknown', async () => {
  const token = await sign(good(), { kid: 'nope' });
  expect(await identify(withToken(token), CFG, { fetch: certs(), now })).toBeNull();
});

it('refuses a tampered payload', async () => {
  const token = await sign(good());
  const [h, , s] = token.split('.');
  const forged = `${h}.${encodeJson({ ...good(), email: 'intruder@example.com' })}.${s}`;
  expect(await identify(withToken(forged), CFG, { fetch: certs(), now })).toBeNull();
});

it('refuses rubbish instead of throwing', async () => {
  for (const t of ['', 'a.b', 'not.a.jwt', '...']) {
    expect(await identify(withToken(t), CFG, { fetch: certs(), now })).toBeNull();
  }
});

it('caches the signing keys instead of fetching per request', async () => {
  const token = await sign(good());
  const f = certs();
  await identify(withToken(token), CFG, { fetch: f, now });
  await identify(withToken(token), CFG, { fetch: f, now });
  expect(fetchCalls).toBe(1);
});

it('survives the certs endpoint being down', async () => {
  const down = (async () => ({ ok: false, status: 500 }) as unknown as Response) as unknown as typeof fetch;
  expect(await identify(withToken(await sign(good())), CFG, { fetch: down, now })).toBeNull();
});
