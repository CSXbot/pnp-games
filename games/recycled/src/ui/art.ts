// The game's own art, cut from the print-and-play sheets by tools/extract_art.py.
// Vite inlines these into the single recycled.html file.

import type { BuildingType, Res } from '../data/types';
import board from '../assets/art/board.webp';
import boardGeo from '../assets/art/board.json';
import banner from '../assets/art/banner.webp';
import logo from '../assets/art/logo.webp';
import depot from '../assets/art/depot.webp';
import depotGeo from '../assets/art/depot.json';
import cutoutSizes from '../assets/cutouts/sizes.json';

const files = import.meta.glob('../assets/art/*.webp', { eager: true, import: 'default' }) as Record<string, string>;
const file = (name: string) => files[`../assets/art/${name}.webp`];

export const ART = { banner, logo };

/**
 * Cut-outs: the publisher's illustration with the paper removed, so pen marks sit on the hex
 * rather than on an opaque rectangle. One per building eventually; `tileArt` is the fallback
 * until they all exist.
 */
const cutouts = import.meta.glob('../assets/cutouts/*.webp', { eager: true, import: 'default' }) as Record<string, string>;
export const cutoutArt = (t: BuildingType): string | undefined =>
  Object.entries(cutouts).find(([k]) => k.endsWith(`/${t}.webp`))?.[1];

/**
 * How much to magnify a cut-out so it fills its box instead of sitting in the frame's margin.
 *
 * The board wants one scale for all twelve - that is what the shared frame is for, and a
 * Transceiver really is smaller than a Laboratory. A card in the construction picker wants the
 * opposite: its illustration should fill the card, the way the printed card's does. `sizes.json`
 * records each silhouette inside the frame, so the picker can undo the margin.
 */
export const cutoutZoom = (t: BuildingType): number => {
  const sizes: Record<string, number[]> = cutoutSizes;
  const size = sizes[t];
  if (!size) return 1;
  const [fw, fh] = sizes.frame;
  return Math.min(fw / size[0], fh / size[1]);
};

export const tileArt = (t: BuildingType) => file(`tile-${t}`);
export const cardArt = (t: BuildingType) => file(`card-${t}`);
export const iconArt = (r: Res | 'ap') => file(`icon-${r}`);

/** Board image per map, and where its centre hex is, so hexes line up with the art. */
export const BOARDS: Record<
  string,
  { src: string; width: number; height: number; centerX: number; centerY: number; spacing: number; rowSpacing: number }
> = {
  planet1: { src: board, ...boardGeo },
};

/** The printed Depot machine and launch manual; x0/y0 is its top-left on the 300 dpi sheet. */
export const DEPOT = { src: depot, ...depotGeo };
