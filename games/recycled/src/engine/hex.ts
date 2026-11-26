// Pointy-top hexes in axial coordinates (q, r). See redblobgames.com/grids/hexagons.

import type { MapDef, Terrain } from '../data/types';

export interface Hex {
  key: string;
  q: number;
  r: number;
  /** Row / index on the printed sheet, for humans. */
  row: number;
  col: number;
  terrain: Terrain;
  outer: boolean;
}

export const hexKey = (q: number, r: number) => `${q},${r}`;

const DIRS = [
  [1, 0],
  [1, -1],
  [0, -1],
  [-1, 0],
  [-1, 1],
  [0, 1],
];

export function neighbors(key: string): string[] {
  const [q, r] = key.split(',').map(Number);
  return DIRS.map(([dq, dr]) => hexKey(q + dq, r + dr));
}

export function distance(a: string, b: string): number {
  const [aq, ar] = a.split(',').map(Number);
  const [bq, br] = b.split(',').map(Number);
  const dq = aq - bq;
  const dr = ar - br;
  return (Math.abs(dq) + Math.abs(dr) + Math.abs(dq + dr)) / 2;
}

const TERRAIN: Record<string, Terrain> = {
  B: 'blank',
  C: 'crater',
  I: 'ice',
  T: 'trash',
  S: 'shuttle',
};

/** Builds the hex list for a hexagon-shaped map from its terrain rows. */
export function buildHexes(map: MapDef): Map<string, Hex> {
  const radius = (map.rows.length - 1) / 2;
  const out = new Map<string, Hex>();
  map.rows.forEach((rowStr, row) => {
    const r = row - radius;
    const qStart = Math.max(-radius, -radius - r);
    [...rowStr].forEach((ch, col) => {
      const q = qStart + col;
      const key = hexKey(q, r);
      const terrain = TERRAIN[ch];
      if (!terrain) throw new Error(`Unknown terrain '${ch}' in map ${map.id}`);
      out.set(key, {
        key,
        q,
        r,
        row,
        col,
        terrain,
        outer: distance(key, '0,0') === radius,
      });
    });
  });
  return out;
}

export function rowColToKey(map: MapDef, row: number, col: number): string {
  const radius = (map.rows.length - 1) / 2;
  const r = row - radius;
  const qStart = Math.max(-radius, -radius - r);
  return hexKey(qStart + col, r);
}

/** Pixel centre of a hex for rendering. */
export function hexToPixel(key: string, size: number): { x: number; y: number } {
  const [q, r] = key.split(',').map(Number);
  return { x: size * Math.sqrt(3) * (q + r / 2), y: size * 1.5 * r };
}

export function hexCorners(cx: number, cy: number, size: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 180) * (60 * i - 30);
    pts.push(`${(cx + size * Math.cos(a)).toFixed(2)},${(cy + size * Math.sin(a)).toFixed(2)}`);
  }
  return pts.join(' ');
}
