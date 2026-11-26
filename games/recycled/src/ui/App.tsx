import { useCallback, useEffect, useMemo, useState } from 'react';
import { BUILDINGS } from '../data/buildings';
import { MAPS } from '../data/maps';
import { RES_NAMES, TECH_BONUSES, TOTAL_DAYS } from '../data/rules';
import {
  buildingAt,
  capacity,
  hexesOf,
  isUnlocked,
  joinCandidates,
  joinType,
  migrateSave,
  needsHex,
  needsJoinChoice,
  nextConsumption,
  storedRes,
  tryAct,
  validTargets,
  newGame,
  type ActionKind,
  type ActionParams,
  type Command,
  type GameState,
} from '../engine/game';
import { DepotArt, StockBar } from './Depot';
import { HexMap } from './HexMap';
import { ART, cardArt } from './art';
import { ResIcon } from './Icons';
import { AccidentTable, ActionMenu, BuildPicker, DicePanel, type Pending } from './TurnPanel';
import { Help } from './Help';
import { NewGameDialog } from './NewGameDialog';
import { LEGACY_SAVE_KEY, SAVE_KEY } from './save';

/** The panels that share one tabbed area on tablet width and stack on a laptop. */
const TABS = [
  { id: 'depot', label: 'Depot' },
  { id: 'accidents', label: 'Accidents' },
  { id: 'log', label: 'Log' },
] as const;
type TabId = (typeof TABS)[number]['id'];

function load(): GameState | null {
  try {
    // The old key is read only while the new one is empty, so a game in progress survives
    // the move into pnp-games. The next save writes SAVE_KEY.
    const raw = localStorage.getItem(SAVE_KEY) ?? localStorage.getItem(LEGACY_SAVE_KEY);
    if (!raw) return null;
    return migrateSave(JSON.parse(raw));
  } catch {
    return null;
  }
}

function save(s: GameState) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(s));
  } catch {
    /* storage unavailable: play without saving */
  }
}

export function App() {
  const [state, setState] = useState<GameState>(() => load() ?? newGame());
  const [history, setHistory] = useState<GameState[]>([]);
  const [dieSel, setDieSel] = useState<number | null>(null);
  const [pending, setPending] = useState<(Pending & { params?: ActionParams; joining?: boolean }) | null>(null);
  const [picker, setPicker] = useState(false);
  const [hover, setHover] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [help, setHelp] = useState(() => !load());
  const [tab, setTab] = useState<TabId>('depot');
  const [newGameOpen, setNewGameOpen] = useState(false);

  useEffect(() => save(state), [state]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  // The die actions apply to: the selected one if still unused, else the first unused.
  const die = useMemo(() => {
    if (state.phase !== 'actions') return null;
    if (dieSel !== null && state.actionDice[dieSel] && !state.actionDice[dieSel].used) return dieSel;
    const i = state.actionDice.findIndex((d) => !d.used);
    return i >= 0 ? i : null;
  }, [state, dieSel]);

  const commit = useCallback(
    (cmd: Command) => {
      const r = tryAct(state, cmd);
      if (!r.ok) {
        setToast(r.error);
        return false;
      }
      // Undo never reaches back past a dice roll or the end of a turn.
      setHistory((h) => (cmd.t === 'roll' || cmd.t === 'endActions' ? [] : [...h, state]));
      setState(r.state);
      setPending(null);
      setPicker(false);
      if (cmd.t !== 'action') setDieSel(null);
      return true;
    },
    [state],
  );

  const undo = useCallback(() => {
    setHistory((h) => {
      if (!h.length) return h;
      setState(h[h.length - 1]);
      setPending(null);
      return h.slice(0, -1);
    });
  }, []);

  /** A hex was chosen: do the action, or first ask which neighbour a new Cryo Tank/Recycler joins. */
  const placeAt = (action: ActionKind, params: ActionParams, hex: string) => {
    if (die === null) return;
    const p = { ...params, hex };
    if (needsJoinChoice(state, action, p)) {
      setPending({ action, building: params.building, params: p, joining: true });
      return;
    }
    commit({ t: 'action', die, action, params: p });
  };

  const pickAction = (item: { action: ActionKind; params?: ActionParams }) => {
    if (die === null) return;
    if (!needsHex(item.action)) {
      commit({ t: 'action', die, action: item.action, params: item.params });
      return;
    }
    // If there's exactly one valid target, just do it.
    const targets = validTargets(state, die, item.action, item.params);
    if (targets.length === 1) {
      placeAt(item.action, item.params ?? {}, targets[0]);
      return;
    }
    setPending({ action: item.action, params: item.params });
  };

  const targets = useMemo(() => {
    if (!pending || die === null) return null;
    if (pending.joining) {
      const type = joinType(state, pending.action, pending.params!)!;
      return new Set(joinCandidates(state, type, pending.params!.hex!).map((b) => b.hex));
    }
    return new Set(
      validTargets(state, die, pending.action, { ...pending.params, building: pending.building }),
    );
  }, [pending, die, state]);

  const onHexClick = (hex: string) => {
    if (pending && die !== null) {
      if (!targets?.has(hex)) {
        setToast('Pick one of the highlighted hexes, or press Esc to cancel.');
        return;
      }
      if (pending.joining) {
        commit({ t: 'action', die, action: pending.action, params: { ...pending.params, joinTo: hex } });
        return;
      }
      placeAt(pending.action, { ...pending.params, building: pending.building }, hex);
      return;
    }
    setPinned((p) => (p === hex ? null : hex));
  };

  const startNewGame = (mapId: string) => {
    setState(newGame(mapId));
    setHistory([]);
    setPending(null);
    setDieSel(null);
    setNewGameOpen(false);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'Escape') {
        setPending(null);
        setPicker(false);
        setHelp(false);
        setNewGameOpen(false);
      } else if (e.key === 'r' && state.phase === 'roll' && !state.techPending) {
        commit({ t: 'roll' });
      } else if (e.key === 'u') {
        undo();
      } else if ((e.key === '1' || e.key === '2') && state.phase === 'actions') {
        setDieSel(Number(e.key) - 1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [state, commit, undo]);

  // The shelf only exists when the game is served from it, not when the file is opened directly.
  const hosted = typeof location !== 'undefined' && location.protocol !== 'file:';
  const next = nextConsumption(state);
  const over = state.phase === 'won' || state.phase === 'lost';
  const inspect = hover ?? pinned;

  return (
    <div className="app">
      <header className="topbar" style={{ backgroundImage: `linear-gradient(90deg, rgba(42,21,14,.92), rgba(42,21,14,.55) 45%, rgba(42,21,14,.85)), url(${ART.banner})` }}>
        <h1>
          <img src={ART.logo} alt="Recycled" className="logo" />
          <span className="sub">· {MAPS[state.mapId]?.name ?? state.mapId}</span>
        </h1>
        <div className="day-info">
          <b>
            Day {Math.min(state.day + 1, TOTAL_DAYS)}
          </b>{' '}
          / {TOTAL_DAYS}
          {next && !over && (
            <span className="next-loss">
              · Day {next.day}:
              {Object.entries(next.loss).map(([r, n]) => (
                <span key={r} className="amount">
                  −{n}
                  <ResIcon r={r as never} size={20} />
                </span>
              ))}
            </span>
          )}
        </div>
        <div className="top-actions">
          {hosted && (
            <a className="btn btn-shelf" href="../../index.html" title="Back to the shelf">
              ← Shelf
            </a>
          )}
          <button className="btn" onClick={undo} disabled={!history.length} title="Undo your last action this turn (U)">
            Undo
          </button>
          <button className="btn" onClick={() => setHelp(true)}>
            How to play
          </button>
          <button className="btn" onClick={() => setNewGameOpen(true)}>
            New game
          </button>
        </div>
      </header>

      <main className="layout">
        <div className="col col-map">
          <StockBar state={state} />
          <div className="map-wrap">
            <HexMap state={state} targets={targets} onHexClick={onHexClick} onHover={setHover} hover={hover} />
            {pending && (
              <div className="map-prompt" role="status">
                {pending.joining
                  ? joinType(state, pending.action, pending.params!) === 'cryoTank'
                    ? 'Which plant does the Cryo Tank join?'
                    : 'Which Separator does the Recycler join?'
                  : pending.building
                    ? `Place your ${BUILDINGS[pending.building].name}`
                    : 'Choose a highlighted hex'}
                <button className="btn btn-small" onClick={() => setPending(null)}>
                  Cancel <kbd>Esc</kbd>
                </button>
              </div>
            )}
          </div>
          <Inspector state={state} hex={inspect} />
        </div>

        <div className="col col-play">
          <DicePanel
            state={state}
            die={die}
            onSelectDie={(i) => {
              setDieSel(i);
              setPending(null);
            }}
            onRoll={() => commit({ t: 'roll' })}
            onChooseAccident={(i) => commit({ t: 'chooseAccident', idx: i })}
            onCombine={() => commit({ t: 'combine' })}
            onSplit={() => commit({ t: 'split' })}
            onEndTurn={() => commit({ t: 'endActions' })}
          />
          <ActionMenu state={state} die={die} pending={pending} onPick={pickAction} onOpenBuild={() => setPicker(true)} />
        </div>

        {/* One area, three panels: stacked on a laptop, one at a time behind tabs on a tablet. */}
        <div className="col col-ref" data-tab={tab}>
          <nav className="tabs" role="tablist" aria-label="Panels">
            {TABS.map((t) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={tab === t.id}
                className={`tab${tab === t.id ? ' selected' : ''}`}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </nav>
          <div className="tabpanel" data-panel="depot">
            <DepotArt state={state} onLaunch={() => commit({ t: 'launch' })} />
          </div>
          <div className="tabpanel" data-panel="accidents">
            <AccidentTable state={state} />
          </div>
          <div className="tabpanel" data-panel="log">
            <Log state={state} />
          </div>
        </div>
      </main>

      {toast && (
        <div className="toast" role="alert" onClick={() => setToast(null)}>
          {toast}
        </div>
      )}

      {picker && die !== null && (
        <BuildPicker
          state={state}
          die={die}
          onClose={() => setPicker(false)}
          onPick={(b) => {
            setPicker(false);
            const t = validTargets(state, die, 'build', { building: b });
            if (t.length === 1) placeAt('build', { building: b }, t[0]);
            else setPending({ action: 'build', building: b });
          }}
        />
      )}

      {state.techPending > 0 && !over && (
        <div className="modal-backdrop">
          <div className="modal tech" role="dialog" aria-label="Choose a tech bonus">
            <h2>Research a technology</h2>
            <p>Pick one bonus. Each box can only be taken once.</p>
            <div className="tech-choices">
              {TECH_BONUSES.map((t, i) => (
                <button key={i} className="btn btn-big" disabled={state.techTaken[i]} onClick={() => commit({ t: 'tech', idx: i })}>
                  {t.label}
                  {Object.keys(t.gain).map((r) => (
                    <ResIcon key={r} r={r as never} size={20} />
                  ))}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {over && (
        <div className="modal-backdrop">
          <div className={`modal gameover ${state.phase}`} role="dialog" aria-label="Game over">
            <h2>{state.phase === 'won' ? 'Shift complete, comrade' : 'Shift terminated'}</h2>
            <p>{state.endReason}</p>
            <p className="muted">
              Days survived: {state.day} · Buildings: {state.buildings.length} · Batteries: {state.batteries}
            </p>
            <div className="btn-row">
              <button className="btn btn-primary btn-big" onClick={() => setNewGameOpen(true)}>
                New game
              </button>
            </div>
          </div>
        </div>
      )}

      {help && <Help onClose={() => setHelp(false)} />}

      {newGameOpen && (
        <NewGameDialog
          mapId={state.mapId}
          inProgress={!over && state.day > 0}
          onCancel={() => setNewGameOpen(false)}
          onStart={startNewGame}
        />
      )}
    </div>
  );
}

function Inspector({ state, hex }: { state: GameState; hex: string | null }) {
  if (!hex) {
    return (
      <div className="inspector muted">
        <span className="when-fine">Hover a hex to see what's there. Click to pin it.</span>
        <span className="when-coarse">Tap a hex to see what's there.</span>
      </div>
    );
  }
  const h = hexesOf(state).get(hex)!;
  const b = buildingAt(state, hex);
  const terrainText = {
    blank: 'Blank: build anything without special placement requirements.',
    crater: 'Crater: Research Site, or anything without special placement requirements.',
    ice: 'Ice deposit: Oxygen Plant, or anything without special placement requirements.',
    trash: 'Trash: Separator, or anything without special placement requirements.',
    shuttle: 'Base shuttle: nothing can be built here.',
  }[h.terrain];
  return (
    <div className="inspector">
      {b ? (
        <div className="insp-building">
          <img src={cardArt(b.type)} alt="" className="insp-card" />
          <div>
          <div className="insp-head">
            <ResIcon r={BUILDINGS[b.type].icon} size={22} />
            <b>{BUILDINGS[b.type].name}</b>
            {!b.complete && <span className="tag">setup {b.step}/{BUILDINGS[b.type].setupSteps}</span>}
            {b.link && <span className="tag">joined</span>}
            {capacity(b) > 0 && (
              <span className="tag">
                {b.drawn - b.used} {RES_NAMES[storedRes(b)!]} · {capacity(b) - b.drawn} space left
              </span>
            )}
          </div>
          <p>{BUILDINGS[b.type].text}</p>
          </div>
        </div>
      ) : (
        <p>
          {terrainText}
          {!isUnlocked(state, hex) && ' Locked until you build a Rover.'}
        </p>
      )}
    </div>
  );
}

function Log({ state }: { state: GameState }) {
  const entries = state.log.slice(-40).reverse();
  return (
    <section className="panel log" aria-label="Log">
      <h2>Shift log</h2>
      <ol>
        {entries.map((e, i) => (
          <li key={state.log.length - i} className={e.tone ?? ''}>
            <span className="log-day">{e.day}</span> {e.text}
          </li>
        ))}
      </ol>
    </section>
  );
}
