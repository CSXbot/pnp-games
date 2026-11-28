// The table cells that matter where the player stands: the Explore and Adventure columns of the
// current hex's terrain, and of its Village or Castle - cut from the printed sidesheet, so the
// player reads the same icons as on paper. Rows light up for the dice in hand.

import { useLayoutEffect, useRef, useState } from 'react';
import { COLUMNS, rowOfDie, type Column } from '../data/types';
import { BOSSES } from '../data/rules';
import { enemyAt, hasSkill, lootLeft, position, sheetOf, mapOf, type GameState } from '../engine/game';
import { hexLabel, isLand, poiAt, terrainAt } from '../engine/hex';
import type { Command } from '../engine/game';
import { BOSS_ART, GEO, GIFT_ART, TABLE_ART } from './art';

/** An action a printed cell offers the chosen die, with what it would do (from the engine). */
export interface CellAct {
  table: 'explore' | 'adventure';
  column: Column;
  short: string;
  label: string;
  cmd: Command;
  err: string | null;
  preview: string;
}

const T = GEO.tables;

/** The table columns a hex offers: its terrain, and its Village or Castle (p14, p48). */
function columnsAt(s: GameState, hex: string): Column[] {
  const map = mapOf(s);
  const out: Column[] = [];
  const t = terrainAt(map, hex);
  if (isLand(t)) out.push(t as Column);
  const poi = poiAt(map, hex);
  if (poi) out.push(poi.kind === 'village' ? 'village' : 'castle');
  return out;
}

/** What an Adventure cell has lost (Q5): its gem or Treasure is crossed off, the enemy stays. */
function takenAt(s: GameState, row: number, col: Column): string | null {
  const left = lootLeft(s, row * 2 + 1, col);
  const gone = enemyAt(s, row * 2 + 1, col).loot.filter((l) => !left.includes(l));
  if (!gone.length) return null;
  return gone.map((l) => (l.k === 'gem' ? 'gem' : l.k === 'treasure' ? l.t : '')).join(', ') + ' taken';
}

function Cell({ sheet, table, row, col, k, lit, taken, onClick, acts, onAct }: { sheet: string; table: 'explore' | 'adventure'; row: number; col: number; k: number; lit: boolean; taken: string | null; onClick?: () => void; acts?: CellAct[]; onAct?: (c: Command) => void }) {
  const ys = T[table];
  const x = T.cols[col];
  const y = ys[row];
  const w = T.cols[col + 1] - x;
  const h = ys[row + 1] - y;
  return (
    <div
      onClick={acts?.length ? undefined : onClick}
      className={`cell ${table}${lit ? ' lit' : ''}${acts?.length ? ' act' : ''}`}
      style={{
        width: w * k,
        height: h * k,
        backgroundImage: `url(${TABLE_ART[sheet]})`,
        backgroundSize: `${T.width * k}px ${T.height * k}px`,
        backgroundPosition: `${-x * k}px ${-y * k}px`,
      }}
    >
      {taken && <span className="taken" title={taken}>{taken}</span>}
      {acts?.length ? (
        <div className={`cell-acts n${acts.length}`}>
          {acts.map((a) => (
            <button key={a.label} className="cell-act" disabled={!!a.err} title={a.err ?? a.label} aria-label={`${a.label}: ${a.err ?? a.preview}`} onClick={() => onAct?.(a.cmd)}>
              {acts.length > 1 && <b>{a.short}</b>}
              <span>{a.err ?? a.preview}</span>
            </button>
          ))}
        </div>
      ) : null}
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

/**
 * `at`: a hex other than the player's, shown while a path is being drawn - "what would I find
 * there" is what planning a Travel needs.
 */
export function Here({
  s,
  litRows,
  at,
  onTables,
  actRow = null,
  acts = [],
  onAct,
}: {
  s: GameState;
  litRows: number[];
  at?: string;
  onTables: () => void;
  /** The chosen die's row, whose cells can be tapped to act. */
  actRow?: number | null;
  acts?: CellAct[];
  onAct?: (c: Command) => void;
}) {
  const sheet = sheetOf(s);
  const here = at ?? position(s);
  // Before the start roll there is no position yet.
  const allCols = here ? columnsAt(s, here) : [];
  const [ref, box] = useBox<HTMLDivElement>();
  const [tab, setTab] = useState(0);
  // Four columns (a Village or Castle) shrink the cells below reading size on a tablet: then show
  // one column at a time, in tabs (Art Director's review, 2026-11-28).
  const LABEL = 30;
  const rowH = Math.max(...[0, 1, 2].map((r) => T.adventure[r + 1] - T.adventure[r]));
  const widthOf = (cs: Column[]) => 2 * cs.reduce((t, c) => t + T.cols[COLUMNS.indexOf(c) + 1] - T.cols[COLUMNS.indexOf(c)], 0);
  const fitK = (cs: Column[]) => Math.min(1, (box.w - LABEL - cs.length * 2 * 6) / widthOf(cs), (box.h - 46 - 3 * 4) / (3 * rowH));
  const tabbed = allCols.length === 2 && box.w > 0 && fitK(allCols) < 0.72;
  const cols = tabbed ? [allCols[Math.min(tab, 1)]] : allCols;
  const grid = useRef<HTMLTableElement>(null);
  const [fit, setFit] = useState(1);
  // One grid: a label column, then the Explore cells and the Adventure cells of each column, the
  // three die rows shared. Scale the printed cells to fit the measured box (less the two-line
  // header and the cells' borders), never above their extracted size.
  const k = cols.length ? Math.max(0.3, fitK(cols)) : 1;
  // Then measure what was really drawn (headers, borders) and shrink it into the box if needed.
  useLayoutEffect(() => {
    const t = grid.current;
    if (!t || !box.h) return;
    setFit(Math.min(1, box.w / t.offsetWidth, box.h / t.offsetHeight));
  }, [box.w, box.h, k, cols.length, here]);
  return (
    <section className="here panel" aria-label="The tables for this hex">
      <div className="panel-title here-title">
        <span>
          {at ? 'If you end at ' : ''}
          {here ? hexLabel(mapOf(s), here) : 'Not on the map yet'}
          <span className="muted"> · sidesheet {sheet.id}</span>
        </span>
        {tabbed && (
          <span className="col-tabs" role="tablist">
            {allCols.map((c, i) => (
              <button key={c} role="tab" aria-selected={i === Math.min(tab, 1)} className={`btn small${i === Math.min(tab, 1) ? ' on' : ''}`} onClick={() => setTab(i)}>
                {c}
              </button>
            ))}
          </span>
        )}
        <button className="btn small" onClick={onTables}>
          Tables, Bosses, Gifts
        </button>
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
                        void die;
                        return (
                          <td key={table + col}>
                            <Cell
                              sheet={sheet.id}
                              table={table}
                              row={row}
                              col={COLUMNS.indexOf(col)}
                              k={k}
                              lit={!at && litRows.includes(row)}
                              taken={table === 'adventure' ? takenAt(s, row, col) : null}
                              onClick={onTables}
                              acts={!at && row === actRow ? acts.filter((x) => x.table === table && x.column === col) : undefined}
                              onAct={onAct}
                            />
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
export function Strips({ s, fixedWidth }: { s: GameState; fixedWidth?: number }) {
  const sheet = sheetOf(s);
  const [ref, box] = useBox<HTMLDivElement>();
  const width = fixedWidth ?? Math.max(200, box.w);
  const st = GEO.strips;
  const bossH = (st.boss.height / st.boss.width) * width;
  const giftH = (st.gifts.height / st.gifts.width) * width;
  const slot = width / 6;
  return (
    <section className="strips panel" aria-label="Bosses and Gifts" ref={ref}>
      <div className="strip" style={{ width, height: bossH }}>
        <img src={BOSS_ART} alt="Boss table" width={width} height={bossH} />
        {BOSSES.map((b, i) =>
          bossLive(s, b) ? <span key={b.name} className="strip-live" style={{ left: slot * i + 3, width: slot - 6 }} title={`${b.name} is live: you meet both requirements and have the Treasure`} /> : null,
        )}
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

/** A Boss you could fight now without losing a heart to its requirements or its Treasure (the second playtester's "live" Boss). */
function bossLive(s: GameState, b: (typeof BOSSES)[number]): boolean {
  if (s.bossesDefeated.includes(b.die) || !s.treasures.includes(b.treasure)) return false;
  const enchant = hasSkill(s, 'enchant');
  return b.reqs.every((r) => Math.max(s.attrs[r.a], enchant && r.a === 'str' ? s.attrs.mag : 0) >= r.v);
}

export const rowsOf = (dice: number[], used: boolean[]) => [...new Set(dice.filter((_, i) => !used[i]).map(rowOfDie))];

/** The whole sidesheet, large: Explore and Adventure for every terrain, the Bosses and the Gifts. */
export function FullTables({ s, onClose }: { s: GameState; onClose: () => void }) {
  const sheet = sheetOf(s);
  // The tables as large as the screen's height allows; the Bosses and Gifts below them at full
  // width, readable, and the dialog scrolls rather than shrinking them (Art Director, 2026-11-28).
  const h = Math.min(window.innerHeight - 140, 777 * 1.25);
  const k = h / T.height;
  const stripW = Math.min(window.innerWidth - 80, Math.max(T.width * k, 900));
  return (
    <div className="modal" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="dialog tables-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="row tables-head">
          <h2>Sidesheet {sheet.id}: Explore, Adventure, Bosses, Gifts</h2>
          <button className="btn" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="tables-body">
          <div className="full-table" style={{ width: T.width * k, height: T.height * k, backgroundImage: `url(${TABLE_ART[sheet.id]})`, backgroundSize: `${T.width * k}px ${T.height * k}px` }}>
            {COLUMNS.flatMap((col, c) =>
              [0, 1, 2].map((row) => {
                const t = takenAt(s, row, col);
                return t ? (
                  <span key={`${c}.${row}`} className="taken full" style={{ left: T.cols[c] * k + 4, top: T.adventure[row + 1] * k - 22, maxWidth: (T.cols[c + 1] - T.cols[c]) * k - 8 }}>
                    {t}
                  </span>
                ) : null;
              }),
            )}
          </div>
          <Strips s={s} fixedWidth={stripW} />
        </div>
      </div>
    </div>
  );
}
