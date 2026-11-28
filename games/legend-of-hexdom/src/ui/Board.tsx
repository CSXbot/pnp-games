// The map: the publisher's art with the player's pen marks drawn over it, in the A5 raster's own
// pixel coordinates (src/data/maps.ts `grid`), so the marks land on the measured hexes.

import type { MapDef } from '../data/maps';
import type { Leg } from '../engine/game';
import { COLS, ROWS, key, parseKey } from '../engine/hex';
import { GEO, MAP_ART } from './art';

const CROP = GEO.maps.crop;

export function hexCentre(map: MapDef, k: string): [number, number] {
  const { row, col } = parseKey(k);
  const g = map.grid;
  const x = g.x0 + g.dx * (col - 1) - (row % 2 === 0 ? g.dx / 2 : 0) - CROP.left;
  const y = g.y0 + g.dy * (row - 1) - CROP.top;
  return [x, y];
}

function hexPoints(map: MapDef, k: string, inset = 8): string {
  const [x, y] = hexCentre(map, k);
  const r = map.grid.hexHeight / 2 - inset;
  return [0, 1, 2, 3, 4, 5]
    .map((i) => {
      const a = (Math.PI / 180) * (60 * i - 90);
      return `${(x + r * Math.cos(a)).toFixed(1)},${(y + r * Math.sin(a)).toFixed(1)}`;
    })
    .join(' ');
}

export function Board(props: {
  map: MapDef;
  visited: string[];
  legs: Leg[];
  /** Hexes the player may tap now (the next step of a legal path). */
  targets: Set<string>;
  /** The path being chosen, not yet committed. */
  draft: string[];
  onHex: (k: string) => void;
}) {
  const { map, visited, legs, targets, draft } = props;
  const start = visited[0];
  const here = visited[visited.length - 1];
  const all: string[] = [];
  for (let r = 1; r <= ROWS; r++) for (let c = 1; c <= COLS; c++) all.push(key(r, c));
  let from = start;
  const legLines = legs.map((leg) => {
    const pts = [from, ...leg.path].map((k) => hexCentre(map, k).join(',')).join(' ');
    from = leg.path[leg.path.length - 1];
    return { pts, penalty: leg.penalty, round: leg.round };
  });
  const draftPts = draft.length ? [here, ...draft].map((k) => hexCentre(map, k).join(',')).join(' ') : '';

  return (
    <svg className="board" viewBox={`0 0 ${CROP.width} ${CROP.height}`} role="img" aria-label={`Map ${map.id}, ${map.name}`}>
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" className="ink-fill" />
        </marker>
        <marker id="arrow-red" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" className="ink-red-fill" />
        </marker>
      </defs>
      <image href={MAP_ART[map.id]} x="0" y="0" width={CROP.width} height={CROP.height} preserveAspectRatio="none" />
      {legLines.map((l, i) => (
        <polyline key={i} points={l.pts} className={l.penalty ? 'ink-line red' : 'ink-line'} markerEnd={l.penalty ? 'url(#arrow-red)' : 'url(#arrow)'} />
      ))}
      {start && <XMark at={hexCentre(map, start)} />}
      {draftPts && <polyline points={draftPts} className="draft-line" />}
      {here && <circle cx={hexCentre(map, here)[0]} cy={hexCentre(map, here)[1]} r={map.grid.hexHeight / 2 - 22} className="here-ring" />}
      {all.map((k) => (
        <polygon
          key={k}
          points={hexPoints(map, k)}
          className={targets.has(k) ? 'hex target' : 'hex'}
          onClick={() => targets.has(k) && props.onHex(k)}
          data-hex={k}
        />
      ))}
    </svg>
  );
}

function XMark({ at: [x, y] }: { at: [number, number] }) {
  const d = 40;
  return (
    <g className="ink-x">
      <line x1={x - d} y1={y - d} x2={x + d} y2={y + d} />
      <line x1={x - d} y1={y + d} x2={x + d} y2={y - d} />
    </g>
  );
}
