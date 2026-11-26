import { CONSUMPTION, DEPOT_BOXES, TECH_BONUSES } from '../data/rules';
import { DEPOT_ROWS, type Res } from '../data/types';
import { depotStock, launchStatus, localStock, total, type GameState } from '../engine/game';
import { DEPOT } from './art';
import { ResIcon } from './Icons';

const LABELS: Partial<Record<Res, string>> = {
  food: 'Food',
  oxygen: 'Oxygen',
  sanity: 'Sanity',
  radiation: 'Rad. prot.',
  power: 'Power',
  materials: 'Materials',
  automatron: 'Automat.',
};

const STOCK_ORDER: Res[] = ['food', 'oxygen', 'sanity', 'radiation', 'power', 'materials', 'automatron'];

/** Totals at a glance: Depot + local building storage. */
export function StockBar({ state }: { state: GameState }) {
  return (
    <div className="stockbar" role="list" aria-label="Resources">
      {STOCK_ORDER.map((r) => {
        const t = total(state, r);
        const low = (['food', 'oxygen', 'sanity', 'radiation'] as Res[]).includes(r) && t <= 2;
        return (
          <div
            key={r}
            className={`stock${low ? ' low' : ''}`}
            role="listitem"
            title={`${depotStock(state, r)} in Depot + ${localStock(state, r)} in buildings`}
          >
            <ResIcon r={r} size={26} />
            <span className="stock-n">{t}</span>
            <span className="stock-label">{LABELS[r]}</span>
          </div>
        );
      })}
    </div>
  );
}

// Positions on the printed Depot (Sheet 1, 300 dpi pixels). See tools/extract_art.py.
const STAGE_BARS: [number, number][] = [
  [122, 392],
  [422, 845],
  [873, 1590],
  [1623, 2045],
  [2075, 2345],
];
const TALLY_Y: [number, number] = [262, 348];
const TECH_BOXES = [790, 995, 1240, 1488, 1732].map((x) => ({ x, y: 487, s: 42 }));
const COUNTER = { x: 227, pitch: 50.7, y: 603, rowPitch: 75, w: 36, h: 62 };
const MANUAL = {
  transceivers: { x: 2085, pitch: 53.3, y: 1130, w: 52, h: 52 },
  batteries: { x: 2085, pitch: 54.2, y: 1192, w: 52, h: 50 },
  oxygen: { x: 2300, y: 1290 },
  food: { x: 2300, y: 1350 },
};

/** x position of a day's tally mark. */
function dayX(day: number): number {
  const i = CONSUMPTION.findIndex((c) => day >= c.fromDay && day <= c.toDay);
  const c = CONSUMPTION[i];
  const [a, b] = STAGE_BARS[i];
  const len = c.toDay - c.fromDay + 1;
  return a + ((day - c.fromDay + 0.5) * (b - a)) / len;
}

/**
 * The printed Recycle Depot and launch manual, marked up like you would with a pen:
 * tally marks for days, X in taken tech boxes, circled stock and darkened spent boxes,
 * ticks in the manual.
 */
export function DepotArt({ state, onLaunch }: { state: GameState; onLaunch: () => void }) {
  const { x0, y0, width, height } = DEPOT;
  const X = (x: number) => x - x0;
  const Y = (y: number) => y - y0;
  const over = state.phase === 'won' || state.phase === 'lost';
  const ls = launchStatus(state);
  const today = Math.min(state.day + 1, 75);
  const marks = [];
  for (let d = 1; d <= state.day; d++) {
    if (d % 5 === 0) {
      marks.push(
        <line key={d} x1={X(dayX(d - 4)) - 14} x2={X(dayX(d - 1)) + 14} y1={Y(310)} y2={Y(300)} className="ink" />,
      );
    } else {
      marks.push(<line key={d} x1={X(dayX(d))} x2={X(dayX(d)) + 2} y1={Y(TALLY_Y[0])} y2={Y(TALLY_Y[1])} className="ink" />);
    }
  }
  const dayW = (STAGE_BARS[0][1] - STAGE_BARS[0][0]) / 10;
  return (
    <section className="panel depot depot-art-panel" aria-label="Recycle Depot">
      <div className="depot-art-wrap">
      <svg viewBox={`0 0 ${width} ${height}`} className="depot-art" role="img" aria-label={`Day ${state.day} of 75 completed`}>
        <image href={DEPOT.src} width={width} height={height} />
        {!over && (
          <rect
            x={X(dayX(today)) - dayW / 2}
            y={Y(TALLY_Y[0]) - 6}
            width={dayW}
            height={TALLY_Y[1] - TALLY_Y[0] + 12}
            className="today"
          >
            <title>{`Today: day ${today}`}</title>
          </rect>
        )}
        <g className="tally">{marks}</g>

        {TECH_BOXES.map((b, i) => (
          <g key={i} className={`techbox${state.techTaken[i] ? ' taken' : ''}`}>
            <title>{`${TECH_BONUSES[i].label}${state.techTaken[i] ? ' (taken)' : ''}`}</title>
            {state.techTaken[i] && (
              <path
                d={`M${X(b.x) + 6},${Y(b.y) + 6} L${X(b.x) + b.s - 6},${Y(b.y) + b.s - 6} M${X(b.x) + b.s - 6},${Y(b.y) + 6} L${X(b.x) + 6},${Y(b.y) + b.s - 6}`}
                className="ink"
              />
            )}
          </g>
        ))}

        {DEPOT_ROWS.map((r, row) => {
          const c = state.depot[r];
          const cy = Y(COUNTER.y + row * COUNTER.rowPitch);
          return (
            <g key={r} className="crow" data-res={r}>
              <title>{`${c.gained - c.lost} ${r} in Depot`}</title>
              {Array.from({ length: Math.min(c.gained, DEPOT_BOXES) }, (_, i) => {
                const cx = X(COUNTER.x + i * COUNTER.pitch);
                return i < c.lost ? (
                  <rect
                    key={i}
                    x={cx - COUNTER.w / 2 + 2}
                    y={cy - COUNTER.h / 2 + 2}
                    width={COUNTER.w - 4}
                    height={COUNTER.h - 4}
                    className="box-lost ink-fill"
                  />
                ) : (
                  <ellipse key={i} cx={cx} cy={cy} rx={COUNTER.w / 2 - 3} ry={COUNTER.h / 2 - 5} className="box-have ink" />
                );
              })}
            </g>
          );
        })}

        {(['transceivers', 'batteries'] as const).map((k, idx) => {
          const m = MANUAL[k];
          const check = ls.checks[idx];
          return (
            <g key={k} className={`launch-row${check.have >= check.need ? ' ok' : ''}`} data-label={check.label}>
              <title>{`${check.label}: ${check.have} of ${check.need}`}</title>
              {Array.from({ length: check.need }, (_, i) => {
                const bx = X(m.x + i * m.pitch);
                const by = Y(m.y);
                return (
                  <g key={i} className={`pip-box${i < check.have ? ' on' : ''}`}>
                    <rect x={bx} y={by} width={m.w} height={m.h} className="hit-box" />
                    {i < check.have && (
                      <path d={`M${bx + 9},${by + m.h * 0.55} L${bx + m.w * 0.42},${by + m.h - 9} L${bx + m.w - 7},${by + 7}`} className="ink tick" />
                    )}
                  </g>
                );
              })}
            </g>
          );
        })}
        {(['oxygen', 'food'] as const).map((k, idx) => {
          const m = MANUAL[k];
          const check = ls.checks[idx + 2];
          const ok = check.have >= check.need;
          return (
            <g key={k} className={`launch-row${ok ? ' ok' : ''}`} data-label={check.label}>
              <text x={X(m.x)} y={Y(m.y)} className={`status ${ok ? 'ok' : 'short'}`}>
                {`${check.have}/${check.need}${ok ? ' ✓' : ''}`}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="depot-corner">
        <button className="btn btn-launch" disabled={!ls.ready || over} onClick={onLaunch}>
          Launch shuttle
        </button>
        <p className="hint">
          {ls.ready
            ? 'Everything is ready. Launching wins the game.'
            : `Still needed: ${ls.checks
                .filter((c) => c.have < c.need)
                .map((c) => `${c.need - c.have} ${c.label}`)
                .join(', ')}.`}
        </p>
      </div>
      </div>
    </section>
  );
}
