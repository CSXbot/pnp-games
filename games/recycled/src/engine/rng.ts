// Small seeded RNG (mulberry32). The state lives inside the game state so saves,
// undo and tests are fully deterministic.

export function nextRandom(state: number): [number, number] {
  let t = (state + 0x6d2b79f5) | 0;
  const next = t;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  const value = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  return [value, next];
}

export function rollD6(state: number): [number, number] {
  const [v, next] = nextRandom(state);
  return [1 + Math.floor(v * 6), next];
}

export function randomSeed(): number {
  return Math.floor(Math.random() * 2 ** 31);
}
