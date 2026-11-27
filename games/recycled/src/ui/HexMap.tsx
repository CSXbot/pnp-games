import { useMemo } from 'react';
import { BUILDINGS } from '../data/buildings';
import marks from './ink/assets/marks.json';
import startingAnchors from './ink/assets/planet1-starting-anchors.json';
import { buildingInkProps, markFor } from './ink/ink.mjs';
import { sharedContour } from './ink/shared-contour.mjs';
import { type Display } from './display';
import type { BuildingType } from '../data/types';
import {
  byId,
  capacity,
  hexesOf,
  isUnlocked,
  storedRes,
  type BuildingState,
  type GameState,
} from '../engine/game';
import { hexCorners, hexToPixel } from '../engine/hex';
import { BOARDS, tileArt, cutoutArt } from './art';
import { ResIcon } from './Icons';

const SIZE = 40;

export const SHORT: Record<BuildingType, string> = {
  foodPlant: 'FOOD',
  oxygenPlant: 'OXYGEN',
  cryoTank: 'CRYO',
  researchSite: 'RESEARCH',
  nuclearPod: 'N-POD',
  amplifier: 'AMP',
  separator: 'SEPARATOR',
  recycler: 'RECYCLER',
  rover: 'ROVER',
  transceiver: 'TRANSCEIVER',
  laboratory: 'LAB',
  workshop: 'WORKSHOP',
};

export function HexMap({
  state,
  targets,
  onHexClick,
  onHover,
  hover,
  display,
}: {
  state: GameState;
  targets: Set<string> | null;
  onHexClick: (hex: string) => void;
  onHover: (hex: string | null) => void;
  hover: string | null;
  display: Display;
}) {
  const hexes = useMemo(() => [...hexesOf(state).values()], [state.mapId]);
  const art = BOARDS[state.mapId];
  // Board image placed so its centre hex sits on hex (0,0) at the right scale.
  const artBox = useMemo(() => {
    if (!art) return null;
    // The printed grid is slightly squashed vertically, so scale x and y separately.
    const kx = (SIZE * Math.sqrt(3)) / art.spacing;
    const ky = (SIZE * 1.5) / art.rowSpacing;
    return { x: -art.centerX * kx, y: -art.centerY * ky, w: art.width * kx, h: art.height * ky };
  }, [art]);
  const box = useMemo(() => {
    if (artBox) return artBox;
    const xs = hexes.map((h) => hexToPixel(h.key, SIZE).x);
    const ys = hexes.map((h) => hexToPixel(h.key, SIZE).y);
    const pad = SIZE + 6;
    return {
      x: Math.min(...xs) - pad,
      y: Math.min(...ys) - pad,
      w: Math.max(...xs) - Math.min(...xs) + pad * 2,
      h: Math.max(...ys) - Math.min(...ys) + pad * 2,
    };
  }, [hexes]);

  const byHex = new Map(state.buildings.map((b) => [b.hex, b]));
  const links = state.buildings.filter((b) => b.link && b.id < b.link);

  return (
    <svg
      className={`hexmap${targets ? ' targeting' : ''}${art ? ' with-art' : ''}`}
      viewBox={`${box.x} ${box.y} ${box.w} ${box.h}`}
      role="grid"
      aria-label="Planet map"
      onMouseLeave={() => onHover(null)}
    >
      {art && artBox && (
        <image
          href={art.src}
          x={artBox.x}
          y={artBox.y}
          width={artBox.w}
          height={artBox.h}
          preserveAspectRatio="none"
          className="board-art"
        />
      )}
      <defs>
        <pattern id="locked" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="7" height="7" className="locked-bg" />
          <line x1="0" y1="0" x2="0" y2="7" className="locked-line" />
        </pattern>
      </defs>
      {hexes.map((h) => {
        const { x, y } = hexToPixel(h.key, SIZE);
        const locked = !isUnlocked(state, h.key);
        const isTarget = targets?.has(h.key);
        const cls = [
          'hex',
          `t-${h.terrain}`,
          h.outer ? 'outer' : '',
          locked ? 'locked' : '',
          isTarget ? 'target' : '',
          targets && !isTarget ? 'dim' : '',
          hover === h.key ? 'hover' : '',
        ].join(' ');
        return (
          <g
            key={h.key}
            className={cls}
            onClick={() => onHexClick(h.key)}
            onMouseEnter={() => onHover(h.key)}
            role="gridcell"
            data-hex={h.key}
            aria-label={`${h.terrain} hex${locked ? ', locked' : ''}`}
          >
            <polygon points={hexCorners(x, y, SIZE - 1.5)} className="hex-bg" />
            {!art && <Terrain terrain={h.terrain} x={x} y={y} />}
            {locked && <polygon points={hexCorners(x, y, SIZE - 1.5)} fill="url(#locked)" className="lock-overlay" />}
          </g>
        );
      })}
      {state.buildings.map((b) => (
        <Building
          key={b.id}
          b={b}
          target={!!targets?.has(b.hex)}
          dim={!!targets && !targets.has(b.hex)}
          mapId={state.mapId}
          display={display}
        />
      ))}
      {/* Shared contour between joined buildings */}
      {links.map((b) => {
        const a = hexToPixel(b.hex, SIZE);
        const c = hexToPixel(byId(state, b.link!).hex, SIZE);
        const lerp = (t: number) => ({ x: a.x + (c.x - a.x) * t, y: a.y + (c.y - a.y) * t });
        const p1 = lerp(0.36);
        const p2 = lerp(0.64);
        if (display.buildings === 'pen') {
          // One outline around both hexes, as the sheet draws a joined pair.
          const d = sharedContour(hexCorners(a.x, a.y, SIZE), hexCorners(c.x, c.y, SIZE));
          return <path key={b.id} className="link-contour" d={d} />;
        }
        return <line key={b.id} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} className="link" />;
      })}
      {/* Click/hover layer on top of buildings */}
      {hexes.map((h) => {
        const { x, y } = hexToPixel(h.key, SIZE);
        return byHex.has(h.key) ? (
          <polygon
            key={h.key}
            points={hexCorners(x, y, SIZE - 1.5)}
            className="hit"
            data-hex={h.key}
            onClick={() => onHexClick(h.key)}
            onMouseEnter={() => onHover(h.key)}
          />
        ) : null;
      })}
      {targets &&
        [...targets].map((k) => {
          const { x, y } = hexToPixel(k, SIZE);
          return <polygon key={k} points={hexCorners(x, y, SIZE - 4)} className="target-ring" data-hex={k} />;
        })}
    </svg>
  );
}

function Terrain({ terrain, x, y }: { terrain: string; x: number; y: number }) {
  switch (terrain) {
    case 'crater':
      return (
        <g className="terrain-art" transform={`translate(${x},${y})`}>
          <ellipse cx="-6" cy="10" rx="11" ry="7" className="crater-rim" />
          <ellipse cx="-6" cy="10.5" rx="6" ry="3.5" className="crater-in" />
        </g>
      );
    case 'ice':
      return (
        <g className="terrain-art" transform={`translate(${x},${y})`}>
          <ellipse rx="24" ry="14" className="ice" />
          {[0, 30, 60, 90, 120, 150].map((a) => (
            <line key={a} x1="0" y1="0" x2="22" y2="0" transform={`rotate(${a}) scale(1, 0.58)`} className="ice-crack" />
          ))}
        </g>
      );
    case 'trash':
      return (
        <g className="terrain-art" transform={`translate(${x},${y})`}>
          <ellipse cx="0" cy="8" rx="22" ry="9" className="trash-shadow" />
          <rect x="-14" y="-4" width="11" height="9" className="junk" />
          <rect x="-3" y="-10" width="9" height="8" className="junk" />
          <rect x="4" y="0" width="12" height="8" className="junk" />
          <rect x="-6" y="5" width="8" height="6" className="junk" />
        </g>
      );
    case 'shuttle':
      return (
        <g className="terrain-art shuttle" transform={`translate(${x},${y}) rotate(-30)`}>
          <path d="M-20,0 L-6,-7 L14,-5 C20,-3 22,0 22,0 C22,0 20,3 14,5 L-6,7 Z" className="hull" />
          <path d="M-12,-6 L-18,-15 L-6,-7 Z M-12,6 L-18,15 L-6,7 Z" className="fin" />
          <ellipse cx="10" cy="0" rx="5" ry="2.6" className="canopy" />
          <text y="30" textAnchor="middle" className="hex-label" transform="rotate(30)">
            SHUTTLE
          </text>
        </g>
      );
    default:
      return null;
  }
}

type MarkAtlas = Record<string, { d: string; slots?: number[][] }>;
type Anchors = Record<string, { type: string; preprinted: number; anchors: number[][] }>;

/**
 * Pen marks in the kit's 150x160 cell space, scaled onto the game's hex. Ring positions for the six
 * printed starting cells were measured off the sheet; everywhere else they come from the legend.
 */
function Ink({ b, mapId, symbol, stock }: { b: BuildingState; mapId: string; symbol: boolean; stock: boolean }) {
  const atlas = marks as MarkAtlas;
  const printed = mapId === 'planet1' ? (startingAnchors as Anchors)[b.hex] : undefined;
  const anchors = printed?.type === b.type ? printed.anchors : atlas[b.type]?.slots;
  if (!anchors) return null;
  const props = buildingInkProps(b.type, b, anchors);
  const glyph = symbol ? markFor(b.type, props.completedSteps) : null;
  const { x, y } = hexToPixel(b.hex, SIZE);
  const ring = (kind: 'openRing' | 'spentRing', positions: readonly (readonly number[])[]) =>
    positions.map(([px, py]) => (
      <path
        key={`${kind}${px},${py}`}
        data-ink-stock={kind === 'openRing' ? 'available' : 'spent'}
        d={atlas[kind].d}
        transform={`translate(${px} ${py}) scale(.43) translate(-34 -37)`}
      />
    ));
  return (
    <g
      className="ink"
      transform={`translate(${x},${y}) scale(${(Math.sqrt(3) * SIZE) / 150},${(2 * SIZE) / 160}) translate(-75,-80)`}
      pointerEvents="none"
      aria-hidden="true"
    >
      {glyph && <path className="ink-mark" d={atlas[glyph].d} />}
      {stock && b.complete && (
        <>
          {ring('openRing', props.slots)}
          {ring('spentRing', props.spentSlots)}
        </>
      )}
    </g>
  );
}

function Building({
  b,
  target,
  dim,
  mapId,
  display,
}: {
  b: BuildingState;
  target: boolean;
  dim: boolean;
  mapId: string;
  display: Display;
}) {
  const def = BUILDINGS[b.type];
  const { x, y } = hexToPixel(b.hex, SIZE);
  const cap = capacity(b);
  const res = storedRes(b);
  const ringR = SIZE * 0.7;
  const slotR = cap > 6 ? 4.4 : 5.2;
  const steps = def.setupSteps ?? 0;
  const clip = `clip-b${b.id}`;
  const cut = cutoutArt(b.type);
  const img = cut ?? tileArt(b.type);
  return (
    <g
      data-building={b.id}
      className={`building b-${b.type}${b.complete ? '' : ' incomplete'}${target ? ' is-target' : ''}${dim ? ' dim' : ''}`}
      aria-hidden="true"
    >
      <clipPath id={clip}>
        <polygon points={hexCorners(x, y, SIZE - 2)} />
      </clipPath>
      {!cut && <polygon points={hexCorners(x, y, SIZE - 2)} className="b-bg" />}
      {img && (
        <image
          href={img}
          x={x - SIZE * 1.0}
          y={y - SIZE * 1.02}
          width={SIZE * 2}
          height={SIZE * 1.8}
          preserveAspectRatio={cut ? 'xMidYMid meet' : 'xMidYMid slice'}
          clipPath={cut ? undefined : `url(#${clip})`}
          className={cut ? 'b-art b-cut' : 'b-art'}
        />
      )}
      {!cut && <polygon points={hexCorners(x, y, SIZE - 3)} className="b-outline" />}
      <Ink b={b} mapId={mapId} symbol={display.buildings === 'pen'} stock={display.stock === 'pen'} />
      {display.buildings === 'modern' && (
      <g className="b-ribbon">
        <rect x={x - 25} y={y + 12} width={50} height={11} rx={2} />
        <ResIcon r={res && b.type === 'cryoTank' ? res : def.icon} size={11} x={x - 24.5} y={y + 12} />
        <text
          x={x + 5}
          y={y + 20.5}
          textAnchor="middle"
          className="b-label"
          {...(SHORT[b.type].length > 7 ? { textLength: 37, lengthAdjust: 'spacingAndGlyphs' } : {})}
        >
          {SHORT[b.type]}
        </text>
      </g>
      )}
      {display.buildings === 'modern' && !b.complete && (
        <text x={x} y={y - 4} textAnchor="middle" className="b-steps">
          SETUP {b.step}/{steps}
        </text>
      )}
      {display.stock === 'modern' &&
        b.complete &&
        Array.from({ length: cap }, (_, i) => {
          const a = (-90 + (360 / cap) * i) * (Math.PI / 180);
          const cx = x + ringR * Math.cos(a);
          const cy = y + ringR * Math.sin(a);
          const st = i < b.used ? 'used' : i < b.drawn ? 'full' : 'empty';
          return <circle key={i} cx={cx} cy={cy} r={slotR} className={`slot slot-${st}`} />;
        })}
    </g>
  );
}
