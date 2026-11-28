// Simple SVG versions of the sheet's icons, for marks and buttons. Simple geometry is SVG
// (.claude/rules/art.md); the illustrated art comes from the sheets themselves.

import type { Attr, TreasureId } from '../data/types';

const HEART = 'M12 21 C5 15 2 12 2 8 C2 5 4.5 3 7 3 C9 3 11 4.5 12 6 C13 4.5 15 3 17 3 C19.5 3 22 5 22 8 C22 12 19 15 12 21 Z';

export function HeartIcon({ state = 'painted', size = 16 }: { state?: 'painted' | 'empty' | 'crossed'; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={`ic heart ${state}`} aria-hidden="true">
      <path d={HEART} />
      {state === 'crossed' && <path d="M4 4 L20 20 M20 4 L4 20" className="pen" />}
    </svg>
  );
}

export function FoodIcon({ state = 'painted', size = 16, mark }: { state?: 'painted' | 'empty' | 'slashed'; size?: number; mark?: 'plus' | 'skill' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={`ic food ${state}${mark === 'skill' ? ' skill' : ''}`} aria-hidden="true">
      <path d="M12 2 L22 12 L12 22 L2 12 Z" />
      {mark === 'plus' && <path d="M12 8 V16 M8 12 H16" className="plus" />}
      {state === 'slashed' && <path d="M5 19 L19 5" className="pen" />}
    </svg>
  );
}

export function AttrIcon({ a, size = 18 }: { a: Attr; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={`ic attr ${a}`} aria-label={a === 'str' ? 'Strength' : a === 'agi' ? 'Agility' : 'Magic'}>
      {a === 'str' && (
        <>
          <path d="M18 3 L21 3 L21 6 L9 18 L6 15 Z" className="blade" />
          <path d="M4 14 L10 20 M6 18 L3 21" className="hilt" />
        </>
      )}
      {a === 'agi' && (
        <>
          <path d="M5 3 Q20 6 21 19" className="bow" />
          <path d="M5 3 L21 19" className="string" />
          <path d="M3 12 L14 12 M11 9 L14 12 L11 15" className="hilt" />
        </>
      )}
      {a === 'mag' && (
        <>
          <path d="M6 21 L15 8 Q17 4 14 3 Q11 3 12 6" className="staff" />
          <rect x="16" y="2" width="5" height="5" className="gem" />
        </>
      )}
    </svg>
  );
}

export function TreasureIcon({ t, size = 18 }: { t: TreasureId; size?: number }) {
  const d: Record<TreasureId, string> = {
    spear: 'M4 20 L17 7 M15 3 L21 3 L21 9 L17 7 Z',
    hook: 'M14 21 L14 9 Q14 3 9 3 Q5 3 5 7 Q5 10 8 10',
    crow: 'M3 14 Q8 7 14 9 L20 6 L17 11 Q15 16 8 16 Z M8 16 L6 21 M11 16 L11 21',
    hammer: 'M10 21 L10 10 M5 4 L15 4 L15 10 L5 10 Z',
    skull: 'M5 11 Q5 3 12 3 Q19 3 19 11 L17 14 L17 19 L7 19 L7 14 Z M9 10 A1.5 1.5 0 1 0 9 10.1 M15 10 A1.5 1.5 0 1 0 15 10.1',
    book: 'M5 4 L17 4 Q19 4 19 6 L19 21 L7 21 Q5 21 5 19 Z M8 4 L8 21',
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={`ic treasure ${t}`} aria-hidden="true">
      <path d={d[t]} />
    </svg>
  );
}

const PIPS: Record<number, [number, number][]> = {
  1: [[12, 12]],
  2: [[7, 7], [17, 17]],
  3: [[7, 7], [12, 12], [17, 17]],
  4: [[7, 7], [17, 7], [7, 17], [17, 17]],
  5: [[7, 7], [17, 7], [12, 12], [7, 17], [17, 17]],
  6: [[7, 6], [17, 6], [7, 12], [17, 12], [7, 18], [17, 18]],
};

export function Die({ n, size = 40 }: { n: number; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className="die-face" aria-label={`a ${n}`}>
      <rect x="1" y="1" width="22" height="22" rx="4" />
      {PIPS[n].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2.2" />
      ))}
    </svg>
  );
}
