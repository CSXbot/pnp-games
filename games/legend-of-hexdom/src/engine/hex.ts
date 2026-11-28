// The printed hex grid: 10 rows of 6 pointy-top hexes, rows 1, 3, 5, 7, 9 shifted half a hex right.
// A hex is named "row.col", both 1-based, as on the sheet.

import { MAPS, TERRAIN_LETTER, type MapDef, type RowCol, type Terrain } from '../data/maps';

export const ROWS = 10;
export const COLS = 6;

export const key = (row: number, col: number) => `${row}.${col}`;
export const parseKey = (k: string): RowCol => {
  const [row, col] = k.split('.').map(Number);
  return { row, col };
};

/** The six neighbours that exist on the sheet. */
export function neighbours(k: string): string[] {
  const { row, col } = parseKey(k);
  const shiftedRight = row % 2 === 1;
  const up = shiftedRight ? [col, col + 1] : [col - 1, col];
  const cand: [number, number][] = [
    [row, col - 1],
    [row, col + 1],
    [row - 1, up[0]],
    [row - 1, up[1]],
    [row + 1, up[0]],
    [row + 1, up[1]],
  ];
  return cand.filter(([r, c]) => r >= 1 && r <= ROWS && c >= 1 && c <= COLS).map(([r, c]) => key(r, c));
}

export function terrainAt(map: MapDef, k: string): Terrain {
  const { row, col } = parseKey(k);
  return TERRAIN_LETTER[map.rows[row - 1][col - 1]];
}

export type Poi = { kind: 'village'; n: number } | { kind: 'castle' } | null;

export function poiAt(map: MapDef, k: string): Poi {
  for (const [n, p] of Object.entries(map.villages)) if (key(p.row, p.col) === k) return { kind: 'village', n: Number(n) };
  if (map.castles.some((p) => key(p.row, p.col) === k)) return { kind: 'castle' };
  return null;
}

export const isLand = (t: Terrain) => t !== 'mountain' && t !== 'water';

export const mapOf = (id: number) => MAPS[id];

/** "Forest (row 3, col 1)" - how a hex is named in the log. */
export function hexLabel(map: MapDef, k: string): string {
  const { row, col } = parseKey(k);
  const poi = poiAt(map, k);
  const t = terrainAt(map, k);
  const name = t[0].toUpperCase() + t.slice(1);
  const where = poi?.kind === 'village' ? `Village ${poi.n}, ${name}` : poi?.kind === 'castle' ? `Castle, ${name}` : name;
  return `${where} (row ${row}, col ${col})`;
}
