// @vitest-environment jsdom
// Which copy of a shift wins, and the rules that keep syncing from ever interrupting a game.
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { newGame, type GameState } from '../src/engine/game';
import {
  ago,
  cloudEnabled,
  decide,
  deviceLabel,
  fetchRemote,
  flushPush,
  holdPush,
  isUntouched,
  pushRemote,
  readMeta,
  releasePush,
  schedulePush,
  writeMeta,
} from '../src/ui/cloudSave';

const played = (day: number): GameState => {
  const s = newGame('planet1', 5);
  s.day = day;
  s.phase = 'actions';
  return s;
};
const remote = (savedAt: number, day = 30) => ({ state: played(day), savedAt, device: 'iPad · Safari' });

beforeEach(() => localStorage.clear());
afterEach(() => vi.unstubAllGlobals());

it('pushes when the cloud has nothing', () => {
  expect(decide(played(4), { savedAt: 100, device: 'Mac' }, null)).toBe('push');
});

it('adopts the cloud copy over an untouched game, without asking', () => {
  expect(decide(newGame('planet1', 1), null, remote(999))).toBe('adopt');
  expect(decide(null, null, remote(999))).toBe('adopt');
});

it('asks before replacing a game in progress with a newer one', () => {
  expect(decide(played(4), { savedAt: 1000, device: 'Mac' }, remote(9000))).toBe('ask');
});

it('keeps playing locally when our copy is the newer one', () => {
  expect(decide(played(9), { savedAt: 9000, device: 'Mac' }, remote(1000))).toBe('push');
});

it('ignores clock skew of a couple of seconds', () => {
  expect(decide(played(9), { savedAt: 10_000, device: 'Mac' }, remote(11_500))).toBe('push');
  expect(decide(played(9), { savedAt: 10_000, device: 'Mac' }, remote(13_000))).toBe('ask');
});

it('asks when we have no record of when our game was saved', () => {
  // A save from before sync existed, or meta cleared: we can't claim ours is the newer one.
  expect(decide(played(4), null, remote(1_764_000_000_000))).toBe('ask');
});

it('knows an untouched game from a played one', () => {
  expect(isUntouched(newGame('planet1', 2))).toBe(true);
  expect(isUntouched(played(1))).toBe(false);
});

it('stays off for a file:// copy and in tests, and can be forced on', () => {
  expect(cloudEnabled()).toBe(false); // jsdom runs on http, but PROD is false under vitest
  localStorage.setItem('pnp:cloud', 'on');
  expect(cloudEnabled()).toBe(true);
  localStorage.setItem('pnp:cloud', 'off');
  expect(cloudEnabled()).toBe(false);
});

it('round-trips the save meta and names the device', () => {
  writeMeta({ savedAt: 42, device: 'Mac · Chrome' });
  expect(readMeta()).toEqual({ savedAt: 42, device: 'Mac · Chrome' });
  expect(deviceLabel()).toMatch(/\S/);
  expect(deviceLabel()).toBe(deviceLabel()); // stable across calls
});

it('survives rubbish in the meta key', () => {
  localStorage.setItem('pnp:recycled:meta', 'not json');
  expect(readMeta()).toBeNull();
});

it('treats a network failure as "no cloud copy" rather than throwing', async () => {
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
  await expect(fetchRemote()).resolves.toBeNull();
  await expect(pushRemote(played(1), { savedAt: 1, device: 'Mac' })).resolves.toBe(false);
});

it('treats a 401 or a broken body as no cloud copy', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 401 }));
  await expect(fetchRemote()).resolves.toBeNull();
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ nonsense: true }) }));
  await expect(fetchRemote()).resolves.toBeNull();
});

it('sends the state, the timestamp and the device label', async () => {
  const f = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) });
  vi.stubGlobal('fetch', f);
  await pushRemote(played(3), { savedAt: 77, device: 'iPad · Safari' });
  const [path, init] = f.mock.calls[0];
  expect(path).toBe('/api/save?game=recycled');
  expect(init.method).toBe('PUT');
  const body = JSON.parse(init.body);
  expect(body.savedAt).toBe(77);
  expect(body.device).toBe('iPad · Safari');
  expect(body.state.day).toBe(3);
});

it('sends nothing while a load-time decision is pending, then sends once released', async () => {
  vi.useFakeTimers();
  const f = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) });
  vi.stubGlobal('fetch', f);

  holdPush();
  schedulePush(played(2), { savedAt: 1, device: 'Mac' });
  await vi.advanceTimersByTimeAsync(10_000);
  expect(f).not.toHaveBeenCalled(); // our copy might be the older one

  flushPush(); // even a page being closed must not jump the queue
  expect(f).not.toHaveBeenCalled();

  releasePush();
  await vi.advanceTimersByTimeAsync(4000);
  expect(f).toHaveBeenCalledTimes(1);
  vi.useRealTimers();
});

it('coalesces a burst of saves into one push, keeping the newest', async () => {
  vi.useFakeTimers();
  const f = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) });
  vi.stubGlobal('fetch', f);

  for (let day = 1; day <= 20; day++) schedulePush(played(day), { savedAt: day, device: 'Mac' });
  await vi.advanceTimersByTimeAsync(4000);
  expect(f).toHaveBeenCalledTimes(1);
  expect(JSON.parse(f.mock.calls[0][1].body).state.day).toBe(20);
  vi.useRealTimers();
});

it('describes when a save happened in words', () => {
  const now = 1_764_000_000_000;
  expect(ago(now - 5_000, now)).toBe('just now');
  expect(ago(now - 60_000, now)).toBe('1 minute ago');
  expect(ago(now - 20 * 60_000, now)).toBe('20 minutes ago');
  expect(ago(now - 3 * 3_600_000, now)).toBe('3 hours ago');
  expect(ago(now - 50 * 3_600_000, now)).toBe('2 days ago');
  expect(ago(now + 5_000, now)).toBe('just now'); // a device whose clock runs fast
});
