import { BUILDINGS, BUILD_ORDER } from '../data/buildings';
import { ACCIDENTS, ACTION_COST } from '../data/rules';
import type { BuildingType, Res } from '../data/types';
import { actionError, resName, type ActionKind, type ActionParams, type GameState } from '../engine/game';
import { cardArt, cutoutArt, cutoutZoom } from './art';
import { Amount, Die, ResIcon } from './Icons';

export interface Pending {
  action: ActionKind;
  building?: BuildingType;
}

interface MenuItem {
  action: ActionKind;
  label: string;
  cost: number;
  yields?: React.ReactNode;
  params?: ActionParams;
  key: string;
}

export const MENU: MenuItem[] = [
  { key: 'sep', action: 'setupSeparator', label: 'Set up Separator', cost: ACTION_COST.setupSeparator, yields: <span className="muted">1 step per AP</span> },
  { key: 'rec', action: 'recycle', label: 'Recycle', cost: ACTION_COST.recycle, yields: <><Amount n={1} r="materials" /> <span className="muted">per 2 AP, max 3</span></> },
  { key: 'pro', action: 'produce', label: 'Produce', cost: ACTION_COST.produce, yields: <><span className="muted">1 per 2 AP, max 3</span></> },
  { key: 'sal', action: 'salvage', label: 'Salvage', cost: ACTION_COST.salvage, yields: <><Amount n={1} r="materials" /> <span className="muted">per 3 AP, max 2</span></> },
  { key: 'srec', action: 'setupRecycler', label: 'Set up Recycler', cost: ACTION_COST.setupRecycler, yields: <span className="muted">1 step per 3 AP</span> },
  { key: 'stu', action: 'study', label: 'Study', cost: ACTION_COST.study, yields: <Amount n={1} r="sanity" signed /> },
  { key: 'cra', action: 'craft', label: 'Craft Automatron', cost: ACTION_COST.craft, params: { craft: 'automatron' }, yields: <Amount n={1} r="automatron" signed /> },
  { key: 'crb', action: 'craft', label: 'Craft Battery', cost: ACTION_COST.craft, params: { craft: 'battery' }, yields: <Amount n={1} r="battery" signed /> },
  { key: 'fix', action: 'fixFuse', label: 'Fix Rad Fuse', cost: ACTION_COST.fixFuse, yields: <Amount n={1} r="radiation" signed /> },
];

export function DicePanel({
  state,
  die,
  onSelectDie,
  onRoll,
  onChooseAccident,
  onCombine,
  onSplit,
  onEndTurn,
}: {
  state: GameState;
  die: number | null;
  onSelectDie: (i: number) => void;
  onRoll: () => void;
  onChooseAccident: (i: number) => void;
  onCombine: () => void;
  onSplit: () => void;
  onEndTurn: () => void;
}) {
  const { phase } = state;
  const unused = state.actionDice.filter((d) => !d.used);
  const penalty = unused.reduce((n, d) => n + (d.locked ? 1 : d.parts.length), 0);
  const canCombine =
    phase === 'actions' && state.actionDice.length === 2 && state.actionDice.every((d) => !d.used);
  const canSplit = phase === 'actions' && state.actionDice.length === 1 && state.actionDice[0].parts.length === 2 && !state.actionDice[0].used;

  return (
    <section className="panel dice-panel" aria-label="Dice">
      <h2>
        Day {state.day + 1}
        <span className="phase">
          {phase === 'roll' && 'Roll for action points'}
          {phase === 'choose' && 'Set one die aside for the accident check'}
          {phase === 'actions' && 'Action phase'}
        </span>
      </h2>

      {phase === 'roll' && (
        <div className="roll-row">
          <button className="btn btn-primary btn-big" onClick={onRoll} autoFocus>
            Roll 3 dice <kbd>R</kbd>
          </button>
          {state.lastAccident && (
            <p className="last-accident">
              Last accident: {state.lastAccident.dice.join(' + ')} = {state.lastAccident.roll}, <b>{state.lastAccident.name}</b>
            </p>
          )}
        </div>
      )}

      {phase === 'choose' && (
        <>
          <div className="dice-row">
            {state.dice.map((v, i) => (
              <Die key={i} value={v} state="pickable" onClick={() => onChooseAccident(i)} title={`Use ${v} for the accident check`} />
            ))}
          </div>
          <p className="hint">
            Click the die to keep for the accident check. The other two become your action dice. A low die here means a
            worse accident: the check is this die plus a new roll.
          </p>
        </>
      )}

      {phase === 'actions' && (
        <>
          <div className="dice-row">
            {state.actionDice.map((d, i) => (
              <div key={i} className="die-slot">
                {d.parts.length > 1 ? (
                  <button
                    className={`combo${d.used ? ' used' : die === i ? ' selected' : ''}`}
                    onClick={() => !d.used && onSelectDie(i)}
                    disabled={d.used}
                  >
                    <Die value={d.parts[0]} small />
                    <span>+</span>
                    <Die value={d.parts[1]} small />
                    <span className="combo-total">= {d.value} AP</span>
                  </button>
                ) : (
                  <Die
                    value={d.value}
                    state={d.used ? 'used' : die === i ? 'selected' : 'idle'}
                    onClick={d.used ? undefined : () => onSelectDie(i)}
                    title={d.used ? 'Used' : `${d.value} AP${d.locked ? ' (not splittable)' : ''}`}
                  />
                )}
                <span className="die-caption">{d.used ? 'used' : `${d.value} AP`}</span>
              </div>
            ))}
            {state.accidentIdx !== null && !state.noAccident && (
              <div className="die-slot accident-slot">
                <Die value={state.dice[state.accidentIdx]} state="accident" title="Accident die" />
                <span className="die-caption">accident</span>
              </div>
            )}
          </div>
          <div className="btn-row">
            {canCombine && (
              <button className="btn" onClick={onCombine} title="Use both dice for one action">
                Combine dice
              </button>
            )}
            {canSplit && (
              <button className="btn" onClick={onSplit}>
                Split dice
              </button>
            )}
            <button className={`btn ${penalty ? 'btn-warn' : 'btn-primary'}`} onClick={onEndTurn}>
              {state.noAccident ? 'End turn' : 'End turn & roll accident'}
              {penalty ? ` (−${penalty} Sanity, unused dice)` : ''}
            </button>
          </div>
          {state.noAccident && <p className="hint good">No accident this turn.</p>}
        </>
      )}
    </section>
  );
}

/** Why the action menu is inactive when there is no die to use. */
export function noDieReason(state: GameState): string {
  if (state.phase === 'won' || state.phase === 'lost') return 'The game is over.';
  if (state.techPending) return 'Choose your tech bonus first.';
  if (state.phase === 'roll') return 'Roll the dice first.';
  if (state.phase === 'choose') return 'Set one die aside for the accident check first.';
  return 'Both dice are used. End the turn.';
}

export function ActionMenu({
  state,
  die,
  pending,
  onPick,
  onOpenBuild,
}: {
  state: GameState;
  die: number | null;
  pending: Pending | null;
  onPick: (item: { action: ActionKind; params?: ActionParams }) => void;
  onOpenBuild: () => void;
}) {
  const active = state.phase === 'actions' && die !== null;
  const buildable = active && BUILD_ORDER.some((b) => !actionError(state, die!, 'build', { building: b }));
  return (
    <section className="panel action-menu" aria-label="Actions">
      <h2>Actions {active && <span className="phase">with {state.actionDice[die!].value} AP</span>}</h2>
      <ul>
        {MENU.map((m) => {
          const err = active ? actionError(state, die!, m.action, m.params ?? {}) : noDieReason(state);
          const isPending = pending?.action === m.action && !pending.building;
          return (
            <li key={m.key}>
              <button
                className={`action${isPending ? ' pending' : ''}`}
                disabled={!!err}
                title={err ?? undefined}
                onClick={() => onPick({ action: m.action, params: m.params })}
              >
                <span className="cost">
                  {m.cost}
                  <ResIcon r="ap" size={16} />
                </span>
                <span className="name">{m.label}</span>
                <span className="yields">{m.yields}</span>
              </button>
              {active && err && !err.startsWith('Needs') && <span className="why">{err}</span>}
            </li>
          );
        })}
        <li>
          <button
            className={`action construction${pending?.action === 'build' ? ' pending' : ''}`}
            disabled={!buildable}
            title={
              buildable
                ? undefined
                : active
                  ? 'Nothing you can build with this die and your resources.'
                  : noDieReason(state)
            }
            onClick={onOpenBuild}
          >
            <span className="cost">
              <ResIcon r="ap" size={16} />
            </span>
            <span className="name">Construction…</span>
            <span className="yields muted">new building</span>
          </button>
        </li>
      </ul>
    </section>
  );
}

export function BuildPicker({
  state,
  die,
  onPick,
  onClose,
}: {
  state: GameState;
  die: number;
  onPick: (b: BuildingType) => void;
  onClose: () => void;
}) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal build-picker" role="dialog" aria-label="Choose a building" onClick={(e) => e.stopPropagation()}>
        <header>
          <h2>Construction · {state.actionDice[die].value} AP</h2>
          <button className="btn" onClick={onClose}>
            Close <kbd>Esc</kbd>
          </button>
        </header>
        <div className="cards">
          {BUILD_ORDER.map((t) => {
            const def = BUILDINGS[t];
            const viaSetup = !!def.setupSteps;
            const err = viaSetup ? `Use the “Set up ${def.name}” action.` : actionError(state, die, 'build', { building: t });
            return (
              <button key={t} className="card" disabled={!!err} onClick={() => onPick(t)} title={def.text}>
                <span className="card-top">
                  <ResIcon r={def.icon} size={18} />
                  <b className="card-name">{def.name}</b>
                </span>
                <span className="card-cost">
                    <span className="chip chip-ap">{viaSetup ? `${def.cost.ap}/step` : `${def.cost.ap} AP`}</span>
                    {def.cost.materials > 0 && (
                      <span className="chip">
                        {def.cost.materials}
                        <ResIcon r="materials" size={14} />
                      </span>
                    )}
                    {def.cost.power > 0 && (
                      <span className="chip">
                        {def.cost.power}
                        <ResIcon r="power" size={14} />
                      </span>
                    )}
                </span>
                {/* The cut-out, not the printed card: the card's own rules text is a raster that
                    goes to mush at this size, and the words below are the same text, set live. */}
                <span className="card-img">
                  <img
                    src={cutoutArt(t) ?? cardArt(t)}
                    alt=""
                    // A cut-out carries the shared frame's transparent margin, which is right on
                    // the board and wrong here: scaled to fit, the Transceiver is a speck on its
                    // card. The span clips whatever the zoom pushes past the box.
                    style={cutoutArt(t) ? { transform: `scale(${cutoutZoom(t).toFixed(3)})` } : undefined}
                  />
                </span>
                <span className="card-text">{def.text}</span>
                <div className="card-foot">
                  <span className="muted">
                    {def.capacity > 0
                      ? `Storage: ${def.capacity} ${def.stores.map((r) => resName(r, def.capacity)).join(' or ')}`
                      : 'No storage'}
                  </span>
                  {err && <span className="why">{err}</span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function AccidentTable({ state }: { state: GameState }) {
  const kept = state.accidentIdx !== null && !state.noAccident && state.phase === 'actions' ? state.dice[state.accidentIdx] : null;
  const last = state.phase === 'roll' ? state.lastAccident?.roll : undefined;
  return (
    <section className="panel accidents" aria-label="Accident table">
      <h2>
        Accidents
        {kept !== null && <span className="phase">possible: {kept + 1}–{kept + 6}</span>}
      </h2>
      <table>
        <tbody>
          {ACCIDENTS.map((a) => {
            const inRange = kept !== null && a.roll >= kept + 1 && a.roll <= kept + 6;
            const good = Object.values(a.effects).every((v) => (v ?? 0) > 0);
            return (
              <tr key={a.roll} className={`${inRange ? 'in-range' : ''}${a.roll === last ? ' last' : ''}${good ? ' good' : ''}`}>
                <td className="roll">{a.roll}</td>
                <td className="fx">
                  {Object.entries(a.effects).map(([r, n]) => (
                    <Amount key={r} n={n!} r={r as Res} signed />
                  ))}
                </td>
                <td className="nm">{a.name}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}
