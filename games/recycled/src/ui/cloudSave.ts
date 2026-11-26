/**
 * Keeping one shift in step across devices.
 *
 * `localStorage` stays the source of truth for playing: the game works offline, from a `file://`
 * copy, and when the network is down. On top of that, when the game is served from the shelf, each
 * save is pushed to the player's own row in D1 and the newest copy is offered on load.
 *
 * Nothing here may ever block or break a turn. Every network path fails silently.
 */
import type { GameState } from '../engine/game';

export const GAME_SLUG = 'recycled';
/** Alongside SAVE_KEY rather than inside it, so the saved value stays a plain GameState. */
export const META_KEY = 'pnp:recycled:meta';
const ENABLED_KEY = 'pnp:cloud';
const DEVICE_KEY = 'pnp:device';
/** Clock skew between two devices we don't treat as "newer". */
const SKEW_MS = 2000;
const PUSH_DEBOUNCE_MS = 3000;
const TIMEOUT_MS = 8000;

export interface SaveMeta {
  savedAt: number;
  device: string;
}
export interface RemoteSave {
  state: GameState;
  savedAt: number;
  device: string | null;
}

/** A fresh game nobody has played yet: adopting the cloud copy over it loses nothing. */
export const isUntouched = (s: GameState) => s.day === 0 && s.phase === 'roll' && s.buildings.every((b) => b.used === 0);

/**
 * What to do with the two copies. Pure, so the awkward cases are testable:
 *   push  - the cloud is missing or behind; send ours
 *   adopt - take the cloud copy without asking, because ours is fresh or absent
 *   ask    - the cloud copy is newer and ours is a game in progress; the player decides
 */
export function decide(local: GameState | null, localMeta: SaveMeta | null, remote: RemoteSave | null): 'push' | 'adopt' | 'ask' {
  if (!remote) return 'push';
  if (!local || isUntouched(local)) return 'adopt';
  const ours = localMeta?.savedAt ?? 0;
  if (remote.savedAt > ours + SKEW_MS) return 'ask';
  return 'push';
}

export function cloudEnabled(): boolean {
  if (typeof location === 'undefined' || location.protocol === 'file:') return false;
  try {
    const flag = localStorage.getItem(ENABLED_KEY);
    if (flag === 'off') return false;
    if (flag === 'on') return true;
  } catch {
    /* storage unavailable */
  }
  return import.meta.env?.PROD === true;
}

/** A label the other device can be named by in a conflict prompt. */
export function deviceLabel(): string {
  try {
    const kept = localStorage.getItem(DEVICE_KEY);
    if (kept) return kept;
  } catch {
    /* storage unavailable */
  }
  const ua = typeof navigator === 'undefined' ? '' : navigator.userAgent;
  const machine = /iPad/.test(ua) ? 'iPad' : /iPhone/.test(ua) ? 'iPhone' : /Macintosh/.test(ua) ? 'Mac' : 'This browser';
  const browser = /CriOS|Chrome/.test(ua) ? 'Chrome' : /Firefox/.test(ua) ? 'Firefox' : /Safari/.test(ua) ? 'Safari' : '';
  const label = browser ? `${machine} · ${browser}` : machine;
  try {
    localStorage.setItem(DEVICE_KEY, label);
  } catch {
    /* storage unavailable */
  }
  return label;
}

/** "4 minutes ago". Day numbers alone don't separate two shifts saved on the same day. */
export function ago(then: number, now = Date.now()): string {
  const secs = Math.max(0, Math.round((now - then) / 1000));
  if (secs < 45) return 'just now';
  const mins = Math.round(secs / 60);
  if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'} ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

export function readMeta(): SaveMeta | null {
  try {
    const raw = localStorage.getItem(META_KEY);
    if (!raw) return null;
    const m = JSON.parse(raw) as SaveMeta;
    return typeof m?.savedAt === 'number' ? m : null;
  } catch {
    return null;
  }
}

export function writeMeta(meta: SaveMeta) {
  try {
    localStorage.setItem(META_KEY, JSON.stringify(meta));
  } catch {
    /* storage unavailable: the cloud copy just won't be compared accurately */
  }
}

async function call(path: string, init?: RequestInit): Promise<Response | null> {
  const ctl = typeof AbortController === 'undefined' ? null : new AbortController();
  const timer = ctl ? setTimeout(() => ctl.abort(), TIMEOUT_MS) : null;
  try {
    return await fetch(path, { ...init, signal: ctl?.signal, credentials: 'same-origin' });
  } catch {
    return null;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export async function fetchRemote(): Promise<RemoteSave | null> {
  const res = await call(`/api/save?game=${GAME_SLUG}`);
  if (!res || !res.ok || res.status === 204) return null; // 204 = signed in, no save yet
  try {
    const body = (await res.json()) as RemoteSave;
    return body && body.state && typeof body.savedAt === 'number' ? body : null;
  } catch {
    return null;
  }
}

export async function pushRemote(state: GameState, meta: SaveMeta): Promise<boolean> {
  const res = await call(`/api/save?game=${GAME_SLUG}`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ state, savedAt: meta.savedAt, device: meta.device }),
  });
  return !!res && res.ok;
}

let timer: ReturnType<typeof setTimeout> | null = null;
let queued: { state: GameState; meta: SaveMeta } | null = null;
let held = false;

/**
 * Stop sending until the load-time comparison is settled. Without this, the save the app writes
 * on mount would be pushed a few seconds later and overwrite a newer shift from another device
 * before the player had answered the prompt.
 */
export function holdPush() {
  held = true;
}

/** Allow sending again, and send anything that piled up while held. */
export function releasePush() {
  if (!held) return;
  held = false;
  if (queued) schedulePush(queued.state, queued.meta);
}

/**
 * Pushes at most once every few seconds. The game writes state on every change - thousands of
 * writes a game - and D1 doesn't need to hear about each one.
 */
export function schedulePush(state: GameState, meta: SaveMeta) {
  queued = { state, meta };
  if (held || timer) return;
  timer = setTimeout(() => {
    timer = null;
    const job = queued;
    queued = null;
    if (job) void pushRemote(job.state, job.meta);
  }, PUSH_DEBOUNCE_MS);
}

/** Send anything queued right now: the page is being hidden or closed. */
export function flushPush() {
  if (held) return; // a decision is pending; our copy may be the older one
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  const job = queued;
  queued = null;
  if (job) void pushRemote(job.state, job.meta);
}
