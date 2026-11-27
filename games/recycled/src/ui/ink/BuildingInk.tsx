import marks from './assets/marks.json';
import { markFor } from './ink.mjs';

type Building = Exclude<keyof typeof marks,
  'separatorOutline' | 'separatorHalf' | 'separatorFull' | 'recyclerSingle' | 'openRing' | 'spentRing'>;
type Props = {
  building: Building;
  completedSteps?: number;
  /** Open circles for available local units, in the 150 × 160 cell. */
  slots?: ReadonlyArray<readonly number[]>;
  /** Darkened circles for units already spent. */
  spentSlots?: ReadonlyArray<readonly number[]>;
};

/** Mount inside an SVG <g> transformed to the game's measured cell.
 * With a printed base, omit original open circles; overlay the spent fill when used. */
export function BuildingInk({ building, completedSteps = 0, slots = [], spentSlots = [] }: Props) {
  const id = markFor(building, completedSteps);
  if (!id) return null;
  return (
    <g fill="#171310" fillRule="evenodd" pointerEvents="none" aria-hidden="true">
      <path d={marks[id].d} />
      {([['openRing', slots], ['spentRing', spentSlots]] as const).map(([kind, positions]) => (
        <g key={kind}>
          {positions.map(([x, y]) => (
            <path key={x + ',' + y} data-ink-stock={kind === 'openRing' ? 'available' : 'spent'} d={marks[kind].d}
              transform={'translate(' + x + ' ' + y + ') scale(.43) translate(-34 -37)'} />
          ))}
        </g>
      ))}
    </g>
  );
}
