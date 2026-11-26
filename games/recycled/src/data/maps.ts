import type { MapDef } from './types';

// Planet 1 (Sheet 1). Rows read top to bottom from the printed sheet.
// B = blank, C = crater, I = ice deposit, T = trash, S = base shuttle.
export const PLANET_1: MapDef = {
  id: 'planet1',
  name: 'Planet 1',
  rows: [
    'BITBT',
    'BBBIBB',
    'BBBBBBB',
    'CCBBIBTT',
    'TTBBSBCBB',
    'TBBBBBCT',
    'TTBBBBB',
    'CCBBBB',
    'TBBIB',
  ],
  // Buildings pre-drawn on the sheet.
  prebuilt: [
    { type: 'oxygenPlant', at: [3, 4], drawn: 6 },
    { type: 'foodPlant', at: [2, 2], drawn: 3 },
    { type: 'cryoTank', at: [1, 1], drawn: 2, res: 'food', linkTo: [2, 2] },
    { type: 'researchSite', at: [4, 6], drawn: 4 },
    { type: 'separator', at: [3, 6], drawn: 3 },
    { type: 'recycler', at: [4, 7], drawn: 2, linkTo: [3, 6] },
  ],
  depot: {
    sanity: { gained: 2, lost: 0 },
    food: { gained: 4, lost: 0 },
    radiation: { gained: 4, lost: 0 },
    power: { gained: 3, lost: 1 },
    materials: { gained: 6, lost: 0 },
  },
};

export const MAPS: Record<string, MapDef> = {
  [PLANET_1.id]: PLANET_1,
};
