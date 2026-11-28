/**
 * Keeping one shift in step across devices.
 *
 * `localStorage` stays the source of truth for playing: the game works offline, from a `file://`
 * copy, and when the network is down. On top of that, when the game is served from the shelf, each
 * save is pushed to the player's own row in D1 and the newest copy is offered on load.
 *
 * Nothing here may ever block or break a turn. Every network path fails silently.
 */
// The logic lives in packages/kit (moved 2026-11-28 when a second game needed it); this file
// configures it for Recycled and keeps the names App.tsx and the tests import.
import { ago, cloudEnabled, createCloudSave, deviceLabel, type RemoteSave as KitRemoteSave, type SaveMeta } from '@pnp/kit/cloudSave';
import type { GameState } from '../engine/game';

export type { SaveMeta };
export type RemoteSave = KitRemoteSave<GameState>;
export { ago, cloudEnabled, deviceLabel };

const cloud = createCloudSave<GameState>({
  slug: 'recycled',
  /** A fresh game nobody has played yet: adopting the cloud copy over it loses nothing. */
  isUntouched: (s) => s.day === 0 && s.phase === 'roll' && s.buildings.every((b) => b.used === 0),
});
export const { GAME_SLUG, META_KEY, isUntouched, decide, readMeta, writeMeta, fetchRemote, pushRemote, holdPush, releasePush, schedulePush, flushPush } = cloud;
