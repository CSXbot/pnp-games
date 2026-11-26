export function Help({ onClose }: { onClose: () => void }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal help" role="dialog" aria-label="How to play" onClick={(e) => e.stopPropagation()}>
        <header>
          <h2>How to play</h2>
          <button className="btn" onClick={onClose}>
            Close <kbd>Esc</kbd>
          </button>
        </header>
        <p>
          You are a waste engineer stuck on an orbital junkyard. <b>Win</b> by surviving 75 days or by gathering
          what the shuttle needs (3 Transceivers, 6 Batteries, 5 Oxygen, 5 Food) and launching. <b>Lose</b> the
          moment your last Food, Oxygen, Sanity or Radiation protection is gone.
        </p>
        <h3>Each turn</h3>
        <ol>
          <li>
            <b>Roll 3 dice</b> and set one aside for the accident check. The other two are your action points (AP).
          </li>
          <li>
            Use each die for one action, or <b>combine</b> both into one bigger action. No change is given: a
            5 AP building needs a die of at least 5. Each unused die costs 1 Sanity.
          </li>
          <li>
            Produce, Recycle and Salvage repeat inside one action: Produce/Recycle give 1 per 2 AP (max 3), Salvage
            1 per 3 AP (max 2), all at a single building with free space.
          </li>
          <li>
            <b>End the turn</b>: the accident die plus a fresh roll (2–12) picks a row on the accident table.
          </li>
          <li>Every 5th day you consume resources, more as the shift goes on (shown under the day track).</li>
        </ol>
        <h3>Buildings and storage</h3>
        <p>
          Each building hex holds a fixed number of circles. A spent circle stays spent, so every building can only
          ever produce up to its capacity. Plan new buildings before the old ones run dry. Separators (on trash) and
          Recyclers (joined to a Separator) are built step by step with their Set up actions. Outer hexes stay locked
          until you build a Rover.
        </p>
        <h3>Shortcuts</h3>
        <p>
          <kbd>R</kbd> roll · <kbd>1</kbd>/<kbd>2</kbd> select die · <kbd>U</kbd> undo · <kbd>Esc</kbd> cancel. You
          can undo actions within a turn, but not a dice roll. The game saves automatically in this browser.
        </p>
        <p className="muted">
          Where the rulebook is ambiguous, see RULES-NOTES.md in the repository for how this version interprets it.
        </p>
      </div>
    </div>
  );
}
