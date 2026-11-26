/**
 * Who is asking, according to Cloudflare Access.
 *
 * Access sits in front of this Worker, so in normal operation a request cannot arrive without
 * having passed login. We verify the assertion anyway: if the Access application is ever
 * misconfigured or removed, an unverified header would leave the save API writable by anyone who
 * sends one. Verification costs one cached JWKS fetch.
 */

export interface AccessConfig {
  /** e.g. `tuzikov.cloudflareaccess.com` */
  teamDomain: string;
  /** The application's AUD tag. */
  aud: string;
}

interface Jwk {
  kid: string;
  kty: string;
  [k: string]: unknown;
}

const JWKS_TTL_MS = 60 * 60 * 1000;
let cache: { url: string; keys: Jwk[]; at: number } | null = null;

/** Exported for tests: forget the cached signing keys. */
export function resetKeyCache() {
  cache = null;
}

// TypeScript 5+ distinguishes the backing buffer; WebCrypto wants the ArrayBuffer flavour.
function base64urlToBytes(s: string): Uint8Array<ArrayBuffer> {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (s.length % 4)) % 4);
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function decodeSegment(s: string): unknown {
  return JSON.parse(new TextDecoder().decode(base64urlToBytes(s)));
}

async function signingKeys(cfg: AccessConfig, fetchImpl: typeof fetch, now: number): Promise<Jwk[]> {
  const url = `https://${cfg.teamDomain}/cdn-cgi/access/certs`;
  if (cache && cache.url === url && now - cache.at < JWKS_TTL_MS) return cache.keys;
  const res = await fetchImpl(url);
  if (!res.ok) throw new Error(`Access certs: ${res.status}`);
  const body = (await res.json()) as { keys?: Jwk[] };
  const keys = body.keys ?? [];
  cache = { url, keys, at: now };
  return keys;
}

export interface Identity {
  email: string;
}

/**
 * Returns the verified identity, or null when the assertion is missing, expired, for another
 * application, or not signed by the team's keys. Never throws for a bad token.
 */
export async function identify(
  request: Request,
  cfg: AccessConfig,
  deps: { fetch?: typeof fetch; now?: () => number } = {},
): Promise<Identity | null> {
  const fetchImpl = deps.fetch ?? fetch;
  const now = deps.now?.() ?? Date.now();

  const token =
    request.headers.get('Cf-Access-Jwt-Assertion') ??
    /(?:^|;\s*)CF_Authorization=([^;]+)/.exec(request.headers.get('Cookie') ?? '')?.[1] ??
    null;
  if (!token) return null;

  const parts = token.split('.');
  if (parts.length !== 3) return null;

  let header: { kid?: string; alg?: string };
  let payload: { aud?: string | string[]; iss?: string; exp?: number; nbf?: number; email?: string };
  try {
    header = decodeSegment(parts[0]) as typeof header;
    payload = decodeSegment(parts[1]) as typeof payload;
  } catch {
    return null;
  }

  if (header.alg !== 'RS256' || !header.kid) return null;
  if (payload.iss !== `https://${cfg.teamDomain}`) return null;

  const auds = Array.isArray(payload.aud) ? payload.aud : payload.aud ? [payload.aud] : [];
  if (!auds.includes(cfg.aud)) return null;

  const seconds = now / 1000;
  if (typeof payload.exp !== 'number' || payload.exp <= seconds) return null;
  if (typeof payload.nbf === 'number' && payload.nbf > seconds + 60) return null;
  if (!payload.email) return null;

  let keys: Jwk[];
  try {
    keys = await signingKeys(cfg, fetchImpl, now);
  } catch {
    return null;
  }
  const jwk = keys.find((k) => k.kid === header.kid);
  if (!jwk) return null;

  try {
    const key = await crypto.subtle.importKey(
      'jwk',
      jwk as JsonWebKey,
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['verify'],
    );
    const ok = await crypto.subtle.verify(
      'RSASSA-PKCS1-v1_5',
      key,
      base64urlToBytes(parts[2]),
      new TextEncoder().encode(`${parts[0]}.${parts[1]}`),
    );
    return ok ? { email: payload.email } : null;
  } catch {
    return null;
  }
}
