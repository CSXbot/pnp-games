import type { Res } from '../data/types';
import { RES_NAMES } from '../data/rules';
import { iconArt } from './art';

// Simple resource icons in the spirit of the printed hex badges.
export function ResIcon({
  r,
  size = 18,
  title,
  x,
  y,
}: {
  r: Res | 'ap';
  size?: number;
  title?: string;
  x?: number;
  y?: number;
}) {
  const label = title ?? (r === 'ap' ? 'Action points' : RES_NAMES[r]);
  return (
    <svg
      className={`res-icon res-${r}`}
      width={size}
      height={size}
      x={x}
      y={y}
      viewBox="-12 -12 24 24"
      role="img"
      aria-label={label}
    >
      <title>{label}</title>
      {iconArt(r) ? (
        <image href={iconArt(r)} x="-12" y="-12" width="24" height="24" />
      ) : (
        <>
          <polygon className="badge" points="0,-11.5 10,-5.75 10,5.75 0,11.5 -10,5.75 -10,-5.75" />
          <g className="glyph">{GLYPHS[r]}</g>
        </>
      )}
    </svg>
  );
}

const GLYPHS: Record<Res | 'ap', React.ReactNode> = {
  food: (
    <>
      <path d="M0,-2.5 C-2,-5 -6.5,-4 -6,0.5 C-5.6,4.5 -2.5,6.5 0,5 C2.5,6.5 5.6,4.5 6,0.5 C6.5,-4 2,-5 0,-2.5Z" />
      <path d="M0,-3 C0.3,-5 1.5,-6.5 3,-7" className="stroke" />
    </>
  ),
  oxygen: (
    <text x="0" y="3.6" textAnchor="middle" fontSize="10" fontWeight="700">
      O₂
    </text>
  ),
  sanity: (
    <>
      <path d="M-7,0 C-4,-5 4,-5 7,0 C4,5 -4,5 -7,0Z" className="stroke" />
      <circle r="2.4" />
    </>
  ),
  radiation: (
    <>
      <circle r="1.6" />
      {[0, 120, 240].map((a) => (
        <path key={a} d="M2.2,-1.3 L6.5,-3.8 A7.5,7.5 0 0 1 6.5,3.8 L2.2,1.3 Z" transform={`rotate(${a - 90})`} />
      ))}
    </>
  ),
  power: <path d="M1.5,-8 L-4.5,1 L-0.5,1 L-2,8 L4.5,-1.5 L0.5,-1.5 Z" />,
  materials: (
    <>
      <rect x="-2.6" y="-7" width="5.2" height="5.2" className="stroke" />
      <rect x="-6.5" y="0.5" width="5.2" height="5.2" className="stroke" />
      <rect x="1.3" y="0.5" width="5.2" height="5.2" className="stroke" />
    </>
  ),
  automatron: (
    <>
      <path d="M-6,5 L-1,0 M-1,0 L2,-4 L6,-2" className="stroke thick" />
      <circle cx="-1" cy="0" r="1.8" />
      <path d="M5,-5 L7,-1" className="stroke" />
    </>
  ),
  battery: (
    <>
      <rect x="-4" y="-6" width="8" height="13" rx="1" className="stroke" />
      <rect x="-1.6" y="-8" width="3.2" height="2" />
      <rect x="-2.2" y="-3.5" width="4.4" height="2.4" />
      <rect x="-2.2" y="0.5" width="4.4" height="2.4" />
    </>
  ),
  ap: (
    <>
      <circle r="4.2" className="stroke thick" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
        <rect key={a} x="-1.2" y="-7.2" width="2.4" height="2.6" transform={`rotate(${a})`} />
      ))}
    </>
  ),
};

/** "3 ⚙" style inline amount. */
export function Amount({ n, r, signed }: { n: number; r: Res | 'ap'; signed?: boolean }) {
  return (
    <span className="amount">
      {signed && n > 0 ? '+' : ''}
      {n}
      <ResIcon r={r} size={16} />
    </span>
  );
}

export function Die({
  value,
  state,
  onClick,
  title,
  small,
}: {
  value: number;
  state?: 'idle' | 'selected' | 'used' | 'accident' | 'pickable';
  onClick?: () => void;
  title?: string;
  small?: boolean;
}) {
  const pips: Record<number, [number, number][]> = {
    1: [[0, 0]],
    2: [[-1, -1], [1, 1]],
    3: [[-1, -1], [0, 0], [1, 1]],
    4: [[-1, -1], [1, -1], [-1, 1], [1, 1]],
    5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]],
    6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]],
  };
  const Tag = onClick ? 'button' : 'span';
  return (
    <Tag
      className={`die die-${state ?? 'idle'}${small ? ' die-small' : ''}`}
      onClick={onClick}
      title={title}
      aria-label={title ?? `Die showing ${value}`}
    >
      <svg viewBox="-10 -10 20 20" aria-hidden="true">
        <rect x="-9" y="-9" width="18" height="18" rx="3.5" className="die-face" />
        {(pips[value] ?? []).map(([x, y], i) => (
          <circle key={i} cx={x * 4.6} cy={y * 4.6} r="1.9" className="pip" />
        ))}
      </svg>
    </Tag>
  );
}
