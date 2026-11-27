/**
 * How the map is drawn. Two independent choices, so all four pairs have to work.
 *
 * Deliberately **not** in `GameState`: this is a preference for one device, not part of the shift.
 * Saves stay version 1 and cross-device sync is untouched by it.
 */
export type BuildingLook = 'modern' | 'pen';
export type StockLook = 'modern' | 'pen';

export interface Display {
  /** `pen`: the legend's symbol over the illustration, as the printed starting buildings look. */
  buildings: BuildingLook;
  /** `pen`: an open ring per unit gained, filled in when spent, blank where nothing was drawn. */
  stock: StockLook;
}

const KEY = 'pnp:recycled:display';

export const DEFAULT_DISPLAY: Display = { buildings: 'modern', stock: 'pen' };

export function readDisplay(): Display {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_DISPLAY;
    const d = JSON.parse(raw) as Partial<Display>;
    return {
      buildings: d.buildings === 'pen' || d.buildings === 'modern' ? d.buildings : DEFAULT_DISPLAY.buildings,
      stock: d.stock === 'pen' || d.stock === 'modern' ? d.stock : DEFAULT_DISPLAY.stock,
    };
  } catch {
    return DEFAULT_DISPLAY;
  }
}

export function writeDisplay(d: Display) {
  try {
    localStorage.setItem(KEY, JSON.stringify(d));
  } catch {
    /* storage unavailable: the choice just won't survive a reload */
  }
}
