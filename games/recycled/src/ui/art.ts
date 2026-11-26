// The game's own art, cut from the print-and-play sheets by tools/extract_art.py.
// Vite inlines these into the single recycled.html file.

import type { BuildingType, Res } from '../data/types';
import board from '../assets/art/board.webp';
import boardGeo from '../assets/art/board.json';
import banner from '../assets/art/banner.webp';
import logo from '../assets/art/logo.webp';
import depot from '../assets/art/depot.webp';
import depotGeo from '../assets/art/depot.json';

const files = import.meta.glob('../assets/art/*.webp', { eager: true, import: 'default' }) as Record<string, string>;
const file = (name: string) => files[`../assets/art/${name}.webp`];

export const ART = { banner, logo };

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
