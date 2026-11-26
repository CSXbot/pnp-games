import { useState } from 'react';
import { MAPS } from '../data/maps';

/**
 * Expansions the player can switch on for a new game. Empty until an expansion's rules are read
 * and implemented; while it is empty the dialog renders no expansion section at all, so adding
 * one later is a data change rather than a UI change.
 */
export const EXPANSIONS: { id: string; name: string; note: string }[] = [];

/**
 * Replaces `confirm()`: it has to work on touch, and it is where the planet picker and the
 * expansion switches belong once there is more than one of either.
 */
export function NewGameDialog({
  mapId,
  inProgress,
  onCancel,
  onStart,
}: {
  mapId: string;
  inProgress: boolean;
  onCancel: () => void;
  onStart: (mapId: string, expansions: string[]) => void;
}) {
  const [picked, setPicked] = useState(mapId);
  const [on, setOn] = useState<string[]>([]);
  const maps = Object.values(MAPS);

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal newgame" role="dialog" aria-label="New game" onClick={(e) => e.stopPropagation()}>
        <header>
          <h2>New game</h2>
        </header>

        {maps.length > 1 && (
          <>
            <h3>Planet</h3>
            <ul className="map-picker">
              {maps.map((m) => (
                <li key={m.id}>
                  <button
                    className={`map-option${picked === m.id ? ' selected' : ''}`}
                    aria-pressed={picked === m.id}
                    onClick={() => setPicked(m.id)}
                  >
                    {m.name}
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}

        {EXPANSIONS.length > 0 && (
          <>
            <h3>Expansions</h3>
            <ul className="expansion-picker">
              {EXPANSIONS.map((e) => (
                <li key={e.id}>
                  <label>
                    <input
                      type="checkbox"
                      checked={on.includes(e.id)}
                      onChange={() => setOn((p) => (p.includes(e.id) ? p.filter((x) => x !== e.id) : [...p, e.id]))}
                    />
                    <span>
                      {e.name} <em>{e.note}</em>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </>
        )}

        <p className={inProgress ? 'warn' : 'muted'}>
          {inProgress ? 'This ends the shift you are playing.' : 'Start a fresh shift.'}
        </p>

        <div className="btn-row end">
          <button className="btn" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-go" onClick={() => onStart(picked, on)}>
            Start
          </button>
        </div>
      </div>
    </div>
  );
}
