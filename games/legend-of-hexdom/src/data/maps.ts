// The Hex Forest maps, read from the publisher's A5 maps (Hexforest-Maps/<n>.pdf) at 300 dpi.
//
// Each row is six letters, left to right, for the printed rows top to bottom. A Village or Castle
// hex holds the letter of the terrain printed UNDER it, which is a playable column (rulebook p48).
// Rows 1, 3, 5, 7, 9 sit half a hex to the right of rows 2, 4, 6, 8, 10 on the sheet.
//
// Read by the tech lead from tools/measure_maps.mjs's overlays and native crops of every Village and
// Castle (2026-11-27), and checked by an independent reading (see test/maps.test.ts).

export type Terrain = 'grove' | 'forest' | 'plains' | 'swamp' | 'valley' | 'mountain' | 'water';

/** The five terrains that are columns on the Explore and Adventure tables. */
export type LandTerrain = Exclude<Terrain, 'mountain' | 'water'>;

export const TERRAIN_LETTER: Record<string, Terrain> = {
  G: 'grove',
  F: 'forest',
  P: 'plains',
  S: 'swamp',
  V: 'valley',
  M: 'mountain',
  W: 'water',
};

export type Sidesheet = 'A' | 'B' | 'C';

/** A hex position on the printed sheet, both 1-based. */
export interface RowCol {
  row: number;
  col: number;
}

export interface MapDef {
  id: number;
  name: string;
  /** Map n uses sidesheet (n-1) mod 10: 1-A, 2-B, 3-C (the publisher's assembled A4 sheets). */
  sidesheet: Sidesheet;
  rows: string[];
  /** Village number (1-6, the starting roll) to its hex. */
  villages: Record<number, RowCol>;
  castles: RowCol[];
  /**
   * Hex centres in the A5 raster (1754x2480 px), measured by tools/measure_maps.mjs:
   * x = x0 + dx*(col-1) - (row even ? dx/2 : 0), y = y0 + dy*(row-1). Hexes are hexHeight px tall.
   */
  grid: { x0: number; dx: number; y0: number; dy: number; hexHeight: number };
}

const rc = (s: string): RowCol => {
  const [row, col] = s.split('.').map(Number);
  return { row, col };
};

export const MAPS: Record<number, MapDef> = {
  1: {
    id: 1,
    name: "The Ranger's Return",
    sidesheet: 'A',
    rows: [
      'PVWGPS',
      'WPMPGV',
      'FVMPGW',
      'SWMPMM',
      'MVMPWF',
      'WPFFMF',
      'PGWSSP',
      'SMMGVW',
      'VPVPWS',
      'VVVFGS',
    ],
    villages: { 1: rc('2.2'), 2: rc('2.6'), 3: rc('5.6'), 4: rc('7.2'), 5: rc('9.6'), 6: rc('10.1') },
    castles: ['1.5', '4.1', '5.4', '9.2'].map(rc),
    grid: { x0: 314.89, dx: 251.84, y0: 318.48, dy: 211.65, hexHeight: 269 },
  },
  2: {
    id: 2,
    name: "The Scout's Folly",
    sidesheet: 'B',
    rows: [
      'SWVPGP',
      'SVVGFV',
      'WMVGPF',
      'VWPGPW',
      'FMVPWM',
      'MWWMPS',
      'PFGSSP',
      'FFPMFW',
      'SVPWPV',
      'PPMVGS',
    ],
    villages: { 1: rc('1.4'), 2: rc('3.5'), 3: rc('7.1'), 4: rc('9.2'), 5: rc('9.6'), 6: rc('10.5') },
    castles: ['2.2', '5.1', '6.6', '7.3'].map(rc),
    grid: { x0: 315.73, dx: 251.61, y0: 318.39, dy: 211.68, hexHeight: 269 },
  },
  3: {
    id: 3,
    name: "The Camper's Pride",
    sidesheet: 'C',
    rows: [
      'WGPSPV',
      'MPGVWP',
      'MPGWFV',
      'SPMMSW',
      'MPWFMV',
      'FFMFWP',
      'WSSPPG',
      'MGVWSM',
      'VPWSVP',
      'VFGSVV',
    ],
    villages: { 1: rc('1.2'), 2: rc('4.2'), 3: rc('4.5'), 4: rc('7.3'), 5: rc('7.5'), 6: rc('10.3') },
    castles: ['2.6', '5.4', '8.2', '9.4'].map(rc),
    grid: { x0: 315.16, dx: 251.84, y0: 318.4, dy: 211.65, hexHeight: 269 },
  },
};
