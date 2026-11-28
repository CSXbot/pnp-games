import { useCallback, useEffect, useMemo, useState } from 'react';
import { ago, cloudEnabled, deviceLabel, type RemoteSave } from '@pnp/kit/cloudSave';
import { CHARACTERS, SKILL_TEXT, type CharacterId } from '../data/characters';
import { MAPS } from '../data/maps';
import { BOSSES, TRAVEL } from '../data/rules';
import { ATTR_NAME, ATTRS, rowOfDie, TREASURES, TREASURE_NAME, type Attr, type Column } from '../data/types';
import {
  act,
  actionError,
  availableGifts,
  columnFor,
  enemyAt,
  food,
  GIFT_NAME,
  giftEndsGame,
  giftFaces,
  hasSkill,
  hearts,
  mapOf,
  migrateSave,
  newGame,
  position,
  score,
  sheetOf,
  travelOptions,
  type Command,
  type GameState,
} from '../engine/game';
import { hexLabel, key, poiAt } from '../engine/hex';
import { PORTRAIT, SCORE_ART, TRAVEL_ART, TREASURE_ART } from './art';
import { Board } from './Board';
import { FullTables, Here, rowsOf, Strips } from './Here';
import { AttrIcon, Die } from './Icons';
import { cloud, exportName, loadGame, storeGame } from './persist';
import { journalOf, parseJournal, PLAYTEST, readJournal, replay, writeJournal } from './playtest';
import { Sheet } from './Sheet';
import { applyLook, currentLook } from './look';

declare const __BUILD__: string | undefined;
const BUILD = typeof __BUILD__ === 'string' ? __BUILD__ : 'dev';
const HOSTED = typeof location !== 'undefined' && location.protocol !== 'file:';

// ---------------------------------------------------------------------------------------------
// What an action would do, worked out by running it on a copy: the engine is pure.

function preview(s: GameState, cmd: Command): string {
  let next: GameState;
  try {
    next = act(s, cmd);
  } catch (e) {
    return (e as Error).message;
  }
  if (next.phase === 'lost') return 'you would die';
  const parts: string[] = [];
  const dh = hearts(next) - hearts(s);
  const df = food(next) - food(s);
  if (dh) parts.push(`${dh > 0 ? '+' : ''}${dh} ${Math.abs(dh) === 1 ? 'heart' : 'hearts'}`);
  if (df) parts.push(`${df > 0 ? '+' : ''}${df} food`);
  for (const a of ATTRS) if (next.attrs[a] !== s.attrs[a]) parts.push(`+${next.attrs[a] - s.attrs[a]} ${ATTR_NAME[a]}`);
  if (next.foodPainted >= 20 && s.foodPainted < 20) parts.push(`unlocks ${SKILL_TEXT[CHARACTERS[s.character].skills[1]].name}`);
  if (next.foodPainted >= 40 && s.foodPainted < 40) parts.push(`unlocks ${SKILL_TEXT[CHARACTERS[s.character].skills[2]].name}`);
  for (const p of next.pending.slice(s.pending.length)) {
    if (p.kind === 'gem') parts.push('a gem');
    else if (p.kind === 'points') parts.push(`${p.n} attribute point${p.n > 1 ? 's' : ''} to place`);
    else if (p.kind === 'treasure') parts.push('a Treasure to choose');
    else parts.push('a Gift to choose');
  }
  if (next.treasures.length > s.treasures.length) parts.push(next.treasures.filter((t) => !s.treasures.includes(t)).map((t) => TREASURE_NAME[t]).join(', '));
  if (next.bossesDefeated.length > s.bossesDefeated.length) parts.push('Boss defeated');
  return parts.join(', ') || (cmd.t === 'travel' ? 'free' : 'no change');
}

// ---------------------------------------------------------------------------------------------

export function App() {
  const [state, setState] = useState<GameState | null>(() => loadGame());
  const [history, setHistory] = useState<GameState[]>([]);
  const [dialog, setDialog] = useState<null | 'new' | 'help' | 'menu' | 'import'>(() => (loadGame() ? null : 'new'));
  const [conflict, setConflict] = useState<RemoteSave<GameState> | null>(null);
  const [die, setDie] = useState<number | null>(null);
  const [draft, setDraft] = useState<string[]>([]);
  const [shield, setShield] = useState(false);
  const [enchant, setEnchant] = useState(false);
  const [tables, setTables] = useState(false);
  // The action list (the playtester's favourite) shows by default when it fits; with four or more
  // cell actions (a Village or Castle) the printed cells carry them. Either can be switched on.
  const [listPref, setListPref] = useState<'auto' | 'list' | 'cells'>('auto');
  // Playtest mode: every command since the start, so a reported position can be replayed exactly.
  const [cmds, setCmds] = useState<Command[]>(() => (PLAYTEST ? (readJournal()?.cmds ?? []) : []));

  // Save every change; push it to the cloud when hosted.
  useEffect(() => {
    storeGame(state);
    if (state && cloudEnabled()) {
      const meta = { savedAt: Date.now(), device: deviceLabel() };
      cloud.writeMeta(meta);
      cloud.schedulePush(state, meta);
    }
  }, [state]);

  // On load: is there a newer copy of this game on another device?
  useEffect(() => {
    if (!cloudEnabled()) return;
    cloud.holdPush();
    const local = loadGame();
    void cloud.fetchRemote().then((remote) => {
      const d = cloud.decide(local, cloud.readMeta(), remote);
      const migrated = remote ? migrateSave(remote.state) : null;
      if (d === 'adopt' && remote && migrated) {
        setState(migrated);
        setDialog(null);
        cloud.releasePush();
      } else if (d === 'ask' && remote && migrated) setConflict({ ...remote, state: migrated });
      else cloud.releasePush();
    });
    const hide = () => document.visibilityState === 'hidden' && cloud.flushPush();
    document.addEventListener('visibilitychange', hide);
    return () => document.removeEventListener('visibilitychange', hide);
  }, []);

  const commit = useCallback(
    (cmd: Command) => {
      if (!state) return;
      const next = act(state, cmd);
      // Undo never reaches back past a random event (a die roll).
      setHistory((h) => (next.epoch !== state.epoch ? [] : [...h, state]));
      setState(next);
      if (PLAYTEST)
        setCmds((c) => {
          const all = [...c, cmd];
          writeJournal(journalOf(next, all));
          return all;
        });
      setDie(null);
      setDraft([]);
      setShield(false);
      setEnchant(false);
    },
    [state],
  );
  const undo = useCallback(() => {
    setHistory((h) => {
      if (!h.length) return h;
      const prev = h[h.length - 1];
      setState(prev);
      if (PLAYTEST)
        setCmds((c) => {
          const all = c.slice(0, -1);
          writeJournal(journalOf(prev, all));
          return all;
        });
      setDie(null);
      setDraft([]);
      return h.slice(0, -1);
    });
  }, []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === 'u' || e.key === 'U') && !dialog && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) undo();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [undo, dialog]);

  const startNew = (mapId: number, character: CharacterId, manualDice: boolean) => {
    const s = newGame({ mapId, character, manualDice });
    setState(s);
    if (PLAYTEST) {
      setCmds([]);
      writeJournal(journalOf(s, []));
    }
    setHistory([]);
    setDialog(null);
    setDie(null);
    setDraft([]);
  };

  // Travel: the next steps of every legal path for the chosen die that starts with the draft.
  const travelling = !!state && state.phase === 'round' && !state.travelled && !state.pending.length && die !== null;
  const paths = useMemo(() => {
    if (!state || !travelling) return [];
    return travelOptions(state).find((o) => o.die === die)?.paths ?? [];
  }, [state, travelling, die]);
  const targets = useMemo(() => {
    const t = new Set<string>();
    for (const p of paths) if (draft.every((k, i) => p.path[i] === k) && p.path.length > draft.length) t.add(p.path[draft.length]);
    return t;
  }, [paths, draft]);
  const complete = paths.find((p) => p.path.length === draft.length && p.path.every((k, i) => draft[i] === k));
  const ends = useMemo(() => {
    const e = new Set<string>();
    for (const p of paths) if (draft.every((k, i) => p.path[i] === k)) e.add(p.path[p.path.length - 1]);
    return e;
  }, [paths, draft]);

  return (
    <div className={`app${PLAYTEST ? ' playtest' : ''}`}>
      <header className="topbar">
        <div className="title">
          <span className="name">Legend of Hexdom</span>
          <span className="build" aria-hidden="true">{BUILD}</span>
        </div>
        {state && (
          <div className="where">
            Map {state.mapId}, {MAPS[state.mapId].name} · the {CHARACTERS[state.character].name}
            {state.round > 0 && ` · round ${state.round}`}
            {PLAYTEST && <b className="pt"> · PLAYTEST · step {cmds.length} · seed {state.seed ?? '?'}</b>}
          </div>
        )}
        <div className="top-actions">
          {HOSTED && (
            <a className="btn ghost" href="../../index.html" title="Back to the shelf">
              Shelf
            </a>
          )}
          <button className="btn" onClick={undo} disabled={!history.length} title="Undo your last action this round (U)">
            Undo
          </button>
          <button className="btn" onClick={() => setDialog('help')}>
            How to play
          </button>
          <button className="btn" onClick={() => setDialog('menu')}>
            Menu
          </button>
        </div>
      </header>

      {state ? (
        <main className="main">
          <div className="board-wrap">
            <Board
              map={mapOf(state)}
              visited={state.visited}
              legs={state.legs}
              targets={targets}
              ends={ends}
              draft={draft}
              onHex={(k) => setDraft((d) => [...d, k])}
            />
            <ScoreLine s={state} />
          </div>
          <div className="play">
            <Turn
              s={state}
              die={die}
              setDie={(d) => {
                setDie(d);
                setDraft([]);
              }}
              draft={draft}
              setDraft={setDraft}
              complete={complete?.path ?? null}
              extendable={targets.size > 0}
              shield={shield}
              setShield={setShield}
              enchant={enchant}
              setEnchant={setEnchant}
              list={listPref === 'list' || (listPref === 'auto' && die !== null && mainOptions(state, die, shield, enchant).filter((o) => o.table !== 'boss').length <= 3)}
              setList={(b) => setListPref(b ? 'list' : 'cells')}
              commit={commit}
              onNew={() => setDialog('new')}
            />
            <Here
              s={state}
              at={draft.length ? draft[draft.length - 1] : undefined}
              litRows={die !== null && state.travelled ? rowsOf([state.dice[die]], [false]) : state.phase === 'round' ? rowsOf(state.dice.filter((_, i) => i !== die || !travelling), state.used.filter((_, i) => i !== die || !travelling)) : []}
              onTables={() => setTables(true)}
              actRow={die !== null && state.travelled && !state.used[die] && !state.pending.length ? rowOfDie(state.dice[die]) : null}
              acts={(die !== null && !state.pending.length ? mainOptions(state, die, shield, enchant) : [])
                .filter((o) => o.table !== 'boss')
                .map((o) => ({ table: o.table as 'explore' | 'adventure', column: o.column!, short: o.short, label: o.label, cmd: o.cmd, err: actionError(state, o.cmd), preview: preview(state, o.cmd) }))}
              onAct={commit}
            />
          </div>
          <div className="side">
            <Sheet s={state} />
            <Strips s={state} />
            <Log s={state} />
          </div>
        </main>
      ) : (
        <main className="main empty" />
      )}

      {dialog === 'new' && <NewGameDialog inProgress={!!state && state.phase !== 'won' && state.phase !== 'lost' && state.round > 0} onCancel={state ? () => setDialog(null) : undefined} onStart={startNew} />}
      {dialog === 'help' && <HelpDialog onClose={() => setDialog(null)} />}
      {tables && state && <FullTables s={state} onClose={() => setTables(false)} />}
      {dialog === 'menu' && state && (
        <MenuDialog
          s={state}
          journal={PLAYTEST ? JSON.stringify(journalOf(state, cmds)) : null}
          onJournal={(text) => {
            const p = parseJournal(text);
            if (!p.ok) return p.error;
            try {
              const s = replay(p.journal);
              setState(s);
              setHistory([]);
              setCmds(p.journal.cmds);
              writeJournal(p.journal);
              setDialog(null);
              return null;
            } catch (e) {
              return `The journal does not replay: ${(e as Error).message}`;
            }
          }}
          onClose={() => setDialog(null)}
          onNew={() => setDialog('new')}
          onImport={() => setDialog('import')}
          onManual={(on) => setState({ ...state, manualDice: on })}
        />
      )}
      {dialog === 'import' && (
        <ImportDialog
          onClose={() => setDialog(null)}
          onLoad={(s) => {
            setState(s);
            setHistory([]);
            setDialog(null);
          }}
        />
      )}
      {conflict && (
        <div className="modal" role="dialog" aria-modal="true">
          <div className="dialog">
            <h2>A newer game on another device</h2>
            <p>
              {conflict.device ?? 'Another device'} saved this game {ago(conflict.savedAt)}, round {conflict.state.round}. This browser has round {state?.round ?? 0}.
            </p>
            <div className="row">
              <button
                className="btn primary"
                onClick={() => {
                  setState(conflict.state);
                  setHistory([]);
                  setConflict(null);
                  setDialog(null);
                  cloud.releasePush();
                }}
              >
                Use the newer game
              </button>
              <button
                className="btn"
                onClick={() => {
                  setConflict(null);
                  cloud.releasePush();
                }}
              >
                Keep this one
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// The turn: dice, what to do next, and the actions with their outcome shown first.

function Turn(props: {
  s: GameState;
  die: number | null;
  setDie: (d: number | null) => void;
  draft: string[];
  setDraft: (d: string[]) => void;
  complete: string[] | null;
  extendable: boolean;
  shield: boolean;
  setShield: (b: boolean) => void;
  enchant: boolean;
  setEnchant: (b: boolean) => void;
  list: boolean;
  setList: (b: boolean) => void;
  commit: (c: Command) => void;
  onNew: () => void;
}) {
  const { s, die, commit } = props;
  const [manual, setManual] = useState<number[]>([0, 0, 0]);

  if (s.phase === 'won' || s.phase === 'lost') {
    return (
      <section className={`turn panel result ${s.phase}`}>
        <h2>{s.phase === 'won' ? 'Victory!' : 'Game over'}</h2>
        <p>{s.result?.reason}</p>
        {s.phase === 'won' ? <ScoreLines s={s} /> : <p className="muted">A defeat is not scored (RULES-NOTES Q7).</p>}
        <button className="btn primary" onClick={props.onNew}>
          New game
        </button>
      </section>
    );
  }

  if (s.phase === 'start') {
    return (
      <section className="turn panel">
        <div className="prompt">Roll one die for your starting Village.</div>
        {s.manualDice ? (
          <div className="row">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <button key={n} className="die-btn" onClick={() => commit({ t: 'start', die: n })} aria-label={`Start at Village ${n}`}>
                <Die n={n} size={40} />
              </button>
            ))}
          </div>
        ) : (
          <button className="btn primary big" onClick={() => commit({ t: 'start' })}>
            Roll for the start
          </button>
        )}
      </section>
    );
  }

  if (s.phase === 'roll') {
    const magicBlood = !actionError(s, { t: 'magicBlood' });
    return (
      <section className="turn panel">
        <div className="prompt">Round {s.round + 1}: roll the three dice.</div>
        {s.manualDice ? (
          <div className="manual">
            {[0, 1, 2].map((i) => (
              <div key={i} className="row">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <button key={n} className={`die-btn small${manual[i] === n ? ' on' : ''}`} onClick={() => setManual(manual.map((m, j) => (j === i ? n : m)))}>
                    <Die n={n} size={30} />
                  </button>
                ))}
              </div>
            ))}
            <button className="btn primary" disabled={manual.some((m) => !m)} onClick={() => { commit({ t: 'roll', dice: manual }); setManual([0, 0, 0]); }}>
              Use these dice
            </button>
          </div>
        ) : (
          <button className="btn primary big" onClick={() => commit({ t: 'roll' })}>
            Roll the dice
          </button>
        )}
        {magicBlood && (
          <button className="btn skill" onClick={() => commit({ t: 'magicBlood' })}>
            Skill - Magic Blood: lose a heart, +1 Magic ({preview(s, { t: 'magicBlood' })}). Only before the roll.
          </button>
        )}
      </section>
    );
  }

  // phase 'round'
  const pending = s.pending[0];
  const mageShield = hasSkill(s, 'manaShield') && !s.manaShieldUsed && food(s) > 0;
  const withShield = <T extends Command>(c: T): T => (props.shield ? { ...c, shield: true } : c);

  return (
    <section className="turn panel">
      <div className="dice-row">
        {s.dice.map((d, i) => (
          <button
            key={i}
            className={`die-btn${s.used[i] ? ' used' : ''}${die === i ? ' on' : ''}`}
            disabled={s.used[i] || !!pending}
            onClick={() => props.setDie(die === i ? null : i)}
            aria-label={`Die ${i + 1}: ${d}${s.used[i] ? ', used' : ''}`}
          >
            <Die n={d} size={46} />
          </button>
        ))}
        {!s.travelled && <TravelBox dice={s.dice.filter((_, i) => !s.used[i])} chosen={die !== null ? s.dice[die] : null} />}
      </div>

      {pending ? (
        <Pending s={s} commit={commit} />
      ) : !s.travelled ? (
        <>
          <div className="prompt">
            {die === null
              ? 'Choose a die to travel with.'
              : props.draft.length === 0
                ? `Tap the hexes of your path, one by one (${TRAVEL[s.dice[die]].hexes} with a ${s.dice[die]}).`
                : props.complete
                  ? 'Path complete.'
                  : 'Keep going.'}
          </div>
          {travelOptions(s).length === 0 && <p className="warn">No die can travel.</p>}
          {travelOptions(s).some((o) => o.unstuck) && <p className="warn">Stuck: no die can move normally, so any die may cross Mountains and Water for 2 hearts each (p41).</p>}
          <div className="actions">
            {die !== null && !travelOptions(s).some((o) => o.die === die) && <p className="warn">That die has no path from here.</p>}
            {props.complete && (
              <button className="btn primary" onClick={() => commit(withShield({ t: 'travel', die: die!, path: props.complete! }))}>
                Travel to {hexLabel(mapOf(s), props.complete[props.complete.length - 1])} ({preview(s, withShield({ t: 'travel', die: die!, path: props.complete }))})
              </button>
            )}
            {props.complete && props.extendable && <p className="muted">Or carry on one more hex (Sail Boat / Trusty Donkey).</p>}
            {props.draft.length > 0 && (
              <button className="btn" onClick={() => props.setDraft([])}>
                Clear the path
              </button>
            )}
            {props.draft.length === 0 &&
              giftFaces(s).map((f) => {
                const g = sheetOf(s).gifts[f - 1];
                const ends = giftEndsGame(s, f);
                // The die left to travel: the one not spent on the double (on a triple, another of the same).
                let spent = 0;
                const third = s.dice.find((d, i) => !s.used[i] && (d !== f || ++spent > 2));
                return (
                  <button key={f} className={`btn${ends ? ' danger' : ''}`} onClick={() => commit({ t: 'gift', face: f })}>
                    Double {f}s: take {GIFT_NAME[g]}
                    {ends ? ` - the ${third} left could not travel: game over` : ` (then travel with the ${third})`}
                  </button>
                );
              })}
          </div>
          {!actionError(s, { t: 'crossTraining' }) && (
            <div className="skills-bar">
              <span className="skills-label">Skill</span>
              <button className="btn skill" onClick={() => commit({ t: 'crossTraining' })}>
                Cross Training: 2 food for +1 Strength ({preview(s, { t: 'crossTraining' })}) - then travel
              </button>
            </div>
          )}
        </>
      ) : (
        <MainPhase s={s} die={die} commit={commit} shield={props.shield} enchant={props.enchant} list={props.list} setList={props.setList} />
      )}

      {!pending && (mageShield || (hasSkill(s, 'enchant') && s.travelled)) && (
        <div className="skills-bar">
          <span className="skills-label">Skills</span>
          {hasSkill(s, 'enchant') && s.travelled && (
            <label className="toggle skill">
              <input type="checkbox" checked={props.enchant} onChange={(e) => props.setEnchant(e.target.checked)} /> Enchant: the next fight uses Magic for Strength (costs a heart)
            </label>
          )}
          {mageShield && (
            <label className="toggle skill">
              <input type="checkbox" checked={props.shield} onChange={(e) => props.setShield(e.target.checked)} /> Mana Shield: a food stops the next action's first lost heart
            </label>
          )}
        </div>
      )}
    </section>
  );
}

/** One thing the chosen die can do here; `table`/`column` place it on a printed cell. */
export interface MainOption {
  label: string;
  /** What the cell overlay shows: the requirement chosen, for an enemy with two. */
  short: string;
  cmd: Command;
  table: 'explore' | 'adventure' | 'boss';
  column?: Column;
}

export function mainOptions(s: GameState, die: number | null, shield: boolean, enchant: boolean): MainOption[] {
  const opts: MainOption[] = [];
  if (die === null || s.used[die] || !s.travelled || s.giftThisRound) return opts;
  const d = s.dice[die];
  const sh = (c: Command): Command => (shield ? ({ ...c, shield: true } as Command) : c);
  for (const which of ['terrain', 'poi'] as const) {
    const col = columnFor(s, which);
    if (!col) continue;
    opts.push({ label: `Explore · ${col}`, short: 'Explore', cmd: sh({ t: 'explore', die, column: which }), table: 'explore', column: col });
    const e = enemyAt(s, d, col);
    const picks = e.req.type === 'unlinked' ? [0, 1] : [undefined];
    for (const pick of picks) {
      const req = pick === undefined ? e.req.reqs.map((r) => `${ATTR_NAME[r.a]} ${r.v}`).join(' and ') : `${ATTR_NAME[e.req.reqs[pick].a]} ${e.req.reqs[pick].v}`;
      opts.push({
        label: `Fight ${e.name}, meet ${req}${enchant ? ', Enchanted' : ''} · ${col}`,
        short: pick === undefined ? 'Fight' : `${ATTR_NAME[e.req.reqs[pick].a]} ${e.req.reqs[pick].v}`,
        cmd: sh({ t: 'adventure', die, column: which, pick, enchant: enchant || undefined }),
        table: 'adventure',
        column: col,
      });
    }
  }
  if (poiAt(mapOf(s), position(s))?.kind === 'castle' && !s.bossesDefeated.includes(d)) {
    const b = BOSSES[d - 1];
    const has = s.treasures.includes(b.treasure);
    opts.push({
      label: `Boss ${b.name}${enchant ? ', Enchanted' : ''} · ${has ? `you have the ${TREASURE_NAME[b.treasure]}` : `without the ${TREASURE_NAME[b.treasure]}: +3 hearts`}`,
      short: b.name,
      cmd: sh({ t: 'boss', die, enchant: enchant || undefined }),
      table: 'boss',
    });
  }
  return opts;
}

function MainPhase({ s, die, commit, shield, enchant, list, setList }: { s: GameState; die: number | null; commit: (c: Command) => void; shield: boolean; enchant: boolean; list: boolean; setList: (b: boolean) => void }) {
  const won = s.bossesDefeated.length >= 2;
  const magicBlood = !actionError(s, { t: 'magicBlood' });
  const all = mainOptions(s, die, shield, enchant);
  // The Explore and Adventure choices are made on the printed cells themselves (tap a lit cell);
  // the list stays available. A Boss has no cell in the panel, so it is always a button here.
  const opts = list ? all : all.filter((o) => o.table === 'boss');
  return (
    <>
      <div className="prompt">
        {won
          ? 'Two Bosses down: use the die left, or finish.'
          : die === null
            ? 'Choose a die for each of the other two actions: both must be used.'
            : list
              ? `With the ${s.dice[die]} (or tap its lit cell):`
              : `With the ${s.dice[die]}: tap a lit cell below to Explore or fight - each shows what it will do.`}
        {die !== null && (
          <button className="btn small list-toggle" onClick={() => setList(!list)}>
            {list ? 'Use the cells' : 'Show as a list'}
          </button>
        )}
      </div>
      <div className="actions">
        {magicBlood && (
          <button className="btn skill" onClick={() => commit({ t: 'magicBlood' })}>
            Skill - Magic Blood: lose a heart, +1 Magic ({preview(s, { t: 'magicBlood' })}). Only now, before any other action.
          </button>
        )}
        {opts.map((o, i) => {
          const err = actionError(s, o.cmd);
          return (
            <button key={i} className="btn action" disabled={!!err} title={err ?? undefined} onClick={() => commit(o.cmd)}>
              <span className="label">{o.label}</span>
              <span className="pv">{err ?? preview(s, o.cmd)}</span>
            </button>
          );
        })}
        {won && (
          <button className="btn primary" onClick={() => commit({ t: 'finish' })}>
            Finish the game
          </button>
        )}
      </div>
    </>
  );
}

function Pending({ s, commit }: { s: GameState; commit: (c: Command) => void }) {
  const p = s.pending[0];
  const sheet = sheetOf(s);
  if (p.kind === 'points')
    return (
      <div className="pending">
        <div className="prompt">Place {p.n === 1 ? 'an attribute point' : `${p.n} attribute points`}:</div>
        <div className="row">
          {ATTRS.map((a: Attr) => (
            <button key={a} className="btn" disabled={!!actionError(s, { t: 'point', attr: a })} onClick={() => commit({ t: 'point', attr: a })}>
              <AttrIcon a={a} /> {ATTR_NAME[a]} {s.attrs[a]} → {s.attrs[a] + 1}
            </button>
          ))}
        </div>
      </div>
    );
  if (p.kind === 'gem')
    return (
      <div className="pending">
        <div className="prompt">A gem: keep it in the Relic box, or trade it now.</div>
        <div className="row">
          <button className="btn" disabled={!!actionError(s, { t: 'gem', to: 'relic' })} onClick={() => commit({ t: 'gem', to: 'relic' })}>
            Relic box ({s.relic}/{sheet.relic.size})
          </button>
          <button className="btn" onClick={() => commit({ t: 'gem', to: 'trade' })}>
            Trade ({preview(s, { t: 'gem', to: 'trade' })})
          </button>
        </div>
      </div>
    );
  if (p.kind === 'treasure')
    return (
      <div className="pending">
        <div className="prompt">The Treasure Crate: choose a Treasure.</div>
        <div className="row wrap">
          {TREASURES.filter((t) => !s.treasures.includes(t)).map((t) => (
            <button key={t} className="btn treasure-pick" onClick={() => commit({ t: 'treasure', treasure: t })}>
              <img src={TREASURE_ART[t]} alt="" />
              <span>
                {TREASURE_NAME[t]}
                <small>{BOSSES.filter((b) => b.treasure === t).map((b) => `for ${b.name}`).join('')}</small>
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  return (
    <div className="pending">
      <div className="prompt">Your reward: choose a Gift.</div>
      <div className="row wrap">
        {availableGifts(s).map((g) => (
          <button key={g} className="btn" onClick={() => commit({ t: 'chooseGift', gift: g })}>
            {GIFT_NAME[g]}
          </button>
        ))}
      </div>
    </div>
  );
}

/** The Travel box as the sheet prints it, the rows of the dice in hand outlined (p34). */
function TravelBox({ dice, chosen }: { dice: number[]; chosen: number | null }) {
  // The box's rows (1-2, 3-4, 5-6 top to bottom) and columns (odd left, even right), as fractions of the image.
  const rowY = [0.25, 0.48, 0.71];
  return (
    <div className="travel-box">
      <img src={TRAVEL_ART} alt="The Travel box" />
      {[...new Set(dice)].map((d) => (
        <span
          key={d}
          className={`travel-mark${chosen === d ? ' on' : ''}`}
          style={{ left: `${d % 2 ? 1 : 51.5}%`, top: `${rowY[Math.floor((d - 1) / 2)] * 100}%` }}
          title={`${d}: ${TRAVEL[d].hexes} hex${TRAVEL[d].hexes > 1 ? 'es' : ''}, ${TRAVEL[d].food} food${TRAVEL[d].mountain ? ', may cross Mountains' : ''}${TRAVEL[d].water ? ', may cross Water' : ''}`}
        />
      ))}
    </div>
  );
}

/** The score line printed under the map (p25), with the counts it would multiply now. */
function ScoreLine({ s }: { s: GameState }) {
  const atMax = ATTRS.filter((a) => s.attrs[a] >= 12).length;
  const skills = s.foodPainted >= 40 ? 2 : s.foodPainted >= 20 ? 1 : 0;
  const parts = [atMax, skills, hearts(s), s.treasures.length, s.relic, s.bossesDefeated.length, Math.max(0, s.visited.length - 1)];
  return (
    <div className="score-line" aria-label={`Score if you won now: ${score(s)}`}>
      <img src={SCORE_ART} alt="Score: 3 per attribute at 12, 3 per skill unlocked, 5 per heart, 5 per Treasure, 4 per Relic gem, 10 per Boss, 1 per hex travelled" />
      <span className="score-now">
        now {parts.join(' · ')}
        {s.giftsTaken.includes('cat') ? ' · cat +30' : ''} = <b>{score(s)}</b> <span className="muted">{s.phase === 'won' ? 'final score' : s.phase === 'lost' ? 'not scored: a defeat' : 'if you win'}</span>
        {s.phase !== 'won' && s.phase !== 'lost' && <CastlesLeft s={s} />}
      </span>
    </div>
  );
}

/**
 * Castles not yet visited. A Boss is fought only in a Castle, and a hex is never entered twice, so
 * each Castle visited is one fewer place for the Bosses: playtest 2 found this the game's real clock.
 */
function CastlesLeft({ s }: { s: GameState }) {
  const all = mapOf(s).castles.map((p) => key(p.row, p.col));
  const here = position(s);
  const left = all.filter((k) => !s.visited.includes(k)).length;
  const inOne = here !== undefined && all.includes(here);
  return (
    <span className="castles-left" title="A Boss is fought only in a Castle, and a hex is never entered twice">
      {' · '}Castles not yet visited: <b>{left}</b> of {all.length}
      {inOne ? ', and you are in one' : ''}
    </span>
  );
}

function ScoreLines({ s }: { s: GameState }) {
  return (
    <p className="score">
      Final score <b>{score(s)}</b>
    </p>
  );
}

/** Newest first: the log box is small on a tablet, and the last line is the one that matters. */
function Log({ s }: { s: GameState }) {
  return (
    <section className="log panel" aria-label="Log">
      <div className="panel-title">Log</div>
      <ol reversed>
        {s.log
          .map((l, i) => <li key={i}>{l.text}</li>)
          .reverse()}
      </ol>
    </section>
  );
}

// ---------------------------------------------------------------------------------------------
// Dialogs. In-app, never confirm(): they have to work on touch.

function NewGameDialog({ inProgress, onCancel, onStart }: { inProgress: boolean; onCancel?: () => void; onStart: (m: number, c: CharacterId, manual: boolean) => void }) {
  const [mapId, setMap] = useState(1);
  const [ch, setCh] = useState<CharacterId>('warrior');
  const [manual, setManual] = useState(false);
  return (
    <div className="modal" role="dialog" aria-modal="true">
      <div className="dialog wide">
        <h2>New game</h2>
        <div className="pick-row">
          {Object.values(MAPS).map((m) => (
            <button key={m.id} className={`pick${mapId === m.id ? ' on' : ''}`} onClick={() => setMap(m.id)}>
              <b>Map {m.id}</b>
              <span>{m.name}</span>
            </button>
          ))}
        </div>
        <div className="pick-row">
          {Object.values(CHARACTERS).map((c) => (
            <button key={c.id} className={`pick${ch === c.id ? ' on' : ''}`} onClick={() => setCh(c.id)}>
              <img src={PORTRAIT[c.id]} alt="" height={64} />
              <b>the {c.name}</b>
            </button>
          ))}
        </div>
        <label className="toggle">
          <input type="checkbox" checked={manual} onChange={(e) => setManual(e.target.checked)} /> Manual dice: I roll real dice and type them in
        </label>
        {inProgress && <p className="warn">This replaces the game in progress.</p>}
        <div className="row">
          <button className="btn primary" onClick={() => onStart(mapId, ch, manual)}>
            Start
          </button>
          {onCancel && (
            <button className="btn" onClick={onCancel}>
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function MenuDialog({
  s,
  journal,
  onJournal,
  onClose,
  onNew,
  onImport,
  onManual,
}: {
  s: GameState;
  journal: string | null;
  onJournal: (text: string) => string | null;
  onClose: () => void;
  onNew: () => void;
  onImport: () => void;
  onManual: (b: boolean) => void;
}) {
  const text = JSON.stringify(s);
  const [copied, setCopied] = useState(false);
  const [look, setLook] = useState(currentLook);
  const [paste, setPaste] = useState('');
  const [jerr, setJerr] = useState<string | null>(null);
  const download = () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
    a.download = exportName(s);
    a.click();
  };
  return (
    <div className="modal" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
        <h2>Menu</h2>
        <div className="col">
          <button className="btn" onClick={onNew}>
            New game…
          </button>
          <button className="btn" onClick={download}>
            Export this game to a file
          </button>
          <button
            className="btn"
            onClick={() => {
              void navigator.clipboard?.writeText(text).then(() => setCopied(true));
            }}
          >
            {copied ? 'Copied' : 'Copy this game as text'}
          </button>
          <button className="btn" onClick={onImport}>
            Import a game…
          </button>
          <label className="toggle">
            <input type="checkbox" checked={s.manualDice} onChange={(e) => onManual(e.target.checked)} /> Manual dice
          </label>
          <label className="toggle">
            <input
              type="checkbox"
              checked={look === 'sheet'}
              onChange={(e) => {
                const l = e.target.checked ? 'sheet' : 'current';
                applyLook(l, true);
                setLook(l);
              }}
            />{' '}
            Try the sheet's look: dark header bars, squarer boxes (a taste question for you, on this device only)
          </label>
          {journal !== null && (
            <div className="journal">
              <span>
                <b>Playtest journal:</b> the start and every step, to replay this exact position.
              </span>
              <textarea readOnly value={journal} rows={4} onFocus={(e) => e.target.select()} aria-label="Playtest journal" />
              <button className="btn" onClick={() => void navigator.clipboard?.writeText(journal)}>
                Copy journal
              </button>
              <textarea value={paste} onChange={(e) => setPaste(e.target.value)} rows={3} placeholder="Paste a journal to replay it" aria-label="Journal to load" />
              {jerr && <p className="warn">{jerr}</p>}
              <button className="btn" disabled={!paste.trim()} onClick={() => setJerr(onJournal(paste))}>
                Load the journal
              </button>
            </div>
          )}
          <button className="btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function ImportDialog({ onClose, onLoad }: { onClose: () => void; onLoad: (s: GameState) => void }) {
  const [text, setText] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const tryLoad = (raw: string) => {
    try {
      const s = migrateSave(JSON.parse(raw));
      if (s) onLoad(s);
      else setErr('That is not a Legend of Hexdom save.');
    } catch {
      setErr('That is not JSON.');
    }
  };
  return (
    <div className="modal" role="dialog" aria-modal="true">
      <div className="dialog">
        <h2>Import a game</h2>
        <input type="file" accept="application/json,.json" onChange={(e) => void e.target.files?.[0]?.text().then(tryLoad)} />
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="…or paste a saved game here" rows={6} />
        {err && <p className="warn">{err}</p>}
        <div className="row">
          <button className="btn primary" disabled={!text.trim()} onClick={() => tryLoad(text)}>
            Load
          </button>
          <button className="btn" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function HelpDialog({ onClose }: { onClose: () => void }) {
  return (
    <div className="modal" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="dialog wide help" onClick={(e) => e.stopPropagation()}>
        <h2>How to play</h2>
        <p>Each round you roll three dice. <b>One die travels</b>: it costs food and moves exactly its number of hexes, never back onto your path, never ending on a Mountain or Water (the Travel box: 1 and 2 cost one food, 3-5 two, 6 none; 3 and 5 may cross Mountains, 4 and 5 Water).</p>
        <p>
          <b>The other two dice must both be used</b>, in any order: <b>Explore</b> (the cell in your hex's column, for that die's row) or <b>Adventure</b> (fight the enemy there: for every requirement you don't meet,
          lose the difference in hearts; dashed boxes let you pick one, joined boxes need both). In a <b>Castle</b> you may instead fight the <b>Boss</b> your die selects. In a Village or Castle you may use its column or the terrain's.
        </p>
        <p>A <b>double</b> may be spent on that double's <b>Gift</b>; the third die still travels. Beat <b>two Bosses</b> to win. Food is also experience: the marked food boxes give attribute points and unlock your skills.</p>
        <p>
          <b>On this screen.</b> To travel, pick a die and tap the hexes of your path one by one: green outlines are the next step, green dots are where that die can end, and the
          table panel shows the cells of the hex you would end on. After travelling, pick a die and tap one of its lit cells: each one says what it will do before you commit
          ("Show as a list" gives the same choices as buttons). "Tables, Bosses, Gifts" shows the whole sidesheet.
        </p>
        <p>
          <b>Skills</b> are on your card, each saying how it works: automatic ones fire by themselves (the log says so), buttons and switches sit under "Skills" in the turn panel,
          and the second and third skills unlock at the 20th and 40th food you gather (the red diamonds).
        </p>
        <p className="muted">Undo works within a round, never past a roll. How unclear rules are read: RULES-NOTES.md in the project.</p>
        <button className="btn primary" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
