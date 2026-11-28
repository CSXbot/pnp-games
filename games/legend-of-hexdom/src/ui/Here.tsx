// The table cells that matter where the player stands: the Explore and Adventure columns of the
// current hex's terrain, and of its Village or Castle - cut from the printed sidesheet, so the
// player reads the same icons as on paper. Rows light up for the dice in hand.

import { useLayoutEffect, useRef, useState } from 'react';
import { COLUMNS, rowOfDie, type Column } from '../data/types';
import { columnFor, enemyAt, lootLeft, position, sheetOf, mapOf, type GameState } from '../engine/game';
import { hexLabel } from '../engine/hex';
import { BOSS_ART, GEO, GIFT_ART, TABLE_ART } from './art';

const T = GEO.tables;

function Cell({ sheet, table, row, col, k, lit, taken }: { sheet: string; table: 'explore' | 'adventure'; row: number; col: number; k: number; lit: boolean; taken: boolean }) {
  const ys = T[table];
  const x = T.cols[col];
  const y = ys[row];
  const w = T.cols[col + 1] - x;
  const h = ys[row + 1] - y;
  return (
    <div
      className={`cell ${table}${lit ? ' lit' : ''}`}
      style={{
        width: w * k,
        height: h * k,
        backgroundImage: `url(${TABLE_ART[sheet]})`,
        backgroundSize: `${T.width * k}px ${T.height * k}px`,
        backgroundPosition: `${-x * k}px ${-y * k}px`,
      }}
    >
      {taken && <span className="taken" title="Gem or Treasure already taken">taken</span>}
    </div>
  );
}

/** Measures an element, so the printed cells can be scaled to the space they actually have. */
function useBox<T extends HTMLElement>(): [React.RefObject<T | null>, { w: number; h: number }] {
  const ref = useRef<T>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setBox({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, box];
}

export function Here({ s, litRows }: { s: GameState; litRows: number[] }) {
  const sheet = sheetOf(s);
  const here = position(s);
  // Before the start roll there is no position yet.
  const cols = here ? (['terrain', 'poi'] as const).map((w) => columnFor(s, w)).filter((c): c is Column => !!c) : [];
  const [ref, box] = useBox<HTMLDivElement>();
  const grid = useRef<HTMLTableElement>(null);
  const [fit, setFit] = useState(1);
  // One grid: a label column, then the Explore cells and the Adventure cells of each column, the
  // three die rows shared. Scale the printed cells to fit the measured box (less the two-line
  // header and the cells' borders), never above their extracted size.
  const cellW = cols.map((c) => T.cols[COLUMNS.indexOf(c) + 1] - T.cols[COLUMNS.indexOf(c)]);
  const sumW = 2 * cellW.reduce((a, b) => a + b, 0);
  const rowH = Math.max(...[0, 1, 2].map((r) => T.adventure[r + 1] - T.adventure[r]));
  const LABEL = 30;
  const k = cols.length ? Math.max(0.3, Math.min(1, (box.w - LABEL - cols.length * 2 * 6) / sumW, (box.h - 46 - 3 * 4) / (3 * rowH))) : 1;
  // Then measure what was really drawn (headers, borders) and shrink it into the box if needed.
  useLayoutEffect(() => {
    const t = grid.current;
    if (!t || !box.h) return;
    setFit(Math.min(1, box.w / t.offsetWidth, box.h / t.offsetHeight));
  }, [box.w, box.h, k, cols.length, here]);
  return (
    <section className="here panel" aria-label="The tables for this hex">
      <div className="panel-title">
        {here ? hexLabel(mapOf(s), here) : 'Not on the map yet'}
        <span className="muted"> · sidesheet {sheet.id}</span>
      </div>
      <div className="here-box" ref={ref}>
        {here && box.w > 0 && (
          <table className="here-grid" ref={grid} style={{ transform: `scale(${fit})`, transformOrigin: 'top left' }}>
            <thead>
              <tr>
                <th />
                {(['explore', 'adventure'] as const).flatMap((table) =>
                  cols.map((col) => (
                    <th key={table + col} className={table}>
                      {table === 'explore' ? 'Explore' : 'Adventure'}
                      <br />
                      <span className="col-name">{col}</span>
                    </th>
                  )),
                )}
              </tr>
            </thead>
            <tbody>
              {[0, 1, 2].map((row) => {
                const die = row * 2 + 1;
                return (
                  <tr key={row} style={{ height: rowH * k }}>
                    <td className="dice-label">{`${row * 2 + 1}-${row * 2 + 2}`}</td>
                    {(['explore', 'adventure'] as const).flatMap((table) =>
                      cols.map((col) => {
                        const full = table === 'adventure' ? enemyAt(s, die, col).loot.length : 0;
                        const left = table === 'adventure' ? lootLeft(s, die, col).length : 0;
                        return (
                          <td key={table + col}>
                            <Cell sheet={sheet.id} table={table} row={row} col={COLUMNS.indexOf(col)} k={k} lit={litRows.includes(row)} taken={left < full} />
                          </td>
                        );
                      }),
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}

/** The Boss and Gift strips, cut from the sidesheet, with defeated Bosses and taken Gifts crossed. */
export function Strips({ s }: { s: GameState }) {
  const sheet = sheetOf(s);
  const [ref, box] = useBox<HTMLDivElement>();
  const width = Math.max(200, box.w);
  const st = GEO.strips;
  const bossH = (st.boss.height / st.boss.width) * width;
  const giftH = (st.gifts.height / st.gifts.width) * width;
  const slot = width / 6;
  return (
    <section className="strips panel" aria-label="Bosses and Gifts" ref={ref}>
      <div className="strip" style={{ width, height: bossH }}>
        <img src={BOSS_ART} alt="Boss table" width={width} height={bossH} />
        {s.bossesDefeated.map((d) => (
          <span key={d} className="strip-cross" style={{ left: slot * (d - 1) + 4, width: slot - 8 }} />
        ))}
      </div>
      <div className="strip" style={{ width, height: giftH }}>
        <img src={GIFT_ART[sheet.id]} alt="Gift table" width={width} height={giftH} />
        {sheet.gifts.map((g, i) =>
          s.giftsTaken.includes(g) ? <span key={g} className="strip-cross" style={{ left: slot * i + 4, width: slot - 8 }} /> : null,
        )}
      </div>
    </section>
  );
}

export const rowsOf = (dice: number[], used: boolean[]) => [...new Set(dice.filter((_, i) => !used[i]).map(rowOfDie))];
