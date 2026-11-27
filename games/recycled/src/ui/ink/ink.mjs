// Call with counts already resolved by the rules engine. This module only draws.
const setupMarks = {
  separator: [null, 'separatorOutline', 'separatorHalf', 'separatorFull'],
  recycler: [null, 'recyclerSingle', 'recycler']
};

export function markFor(type, completedSteps) {
  const sequence = setupMarks[type];
  if (!sequence) return type;
  if (!Number.isInteger(completedSteps) || completedSteps < 0 || completedSteps >= sequence.length) {
    throw new RangeError('Expected a completed setup step for ' + type);
  }
  return sequence[completedSteps];
}

// Project the documented GameState building counters onto a stable sequence of
// positions in the local cell. The first positions should match any marks
// already drawn on the initial sheet for this cell.
export function buildingInkProps(artId, instance, anchors) {
  const { drawn, used, step, complete } = instance;
  if (!Number.isInteger(drawn) || !Number.isInteger(used) ||
      used < 0 || used > drawn || drawn > anchors.length) {
    throw new RangeError('Expected 0 <= used <= drawn <= number of storage positions');
  }
  const sequence = setupMarks[artId];
  const completedSteps = complete && sequence ? sequence.length - 1 : step;
  return {
    building: artId, completedSteps,
    slots: anchors.slice(used, drawn),
    spentSlots: anchors.slice(0, used)
  };
}

function printPath(d) {
  return '<path fill="#171310" fill-rule="evenodd" d="' + d + '"/>';
}

// Positions with unused capacity have no ink. An open mark is one available
// unit, a darkened mark is one used unit, and both occupy the position.
export function inkLayer(atlas, type, completedSteps, slots = [], spentSlots = []) {
  const id = markFor(type, completedSteps);
  if (!id) return '';
  if (!Object.hasOwn(atlas, id)) throw new Error('Unknown mark: ' + id);
  function drawSlots(positions, stroke) {
    return positions.map(([x,y]) => {
      if (!Number.isFinite(x) || !Number.isFinite(y)) throw new Error('Invalid slot centre');
      return '<g transform="translate('+x+' '+y+') scale(.43) translate(-34 -37)">'+
        printPath(stroke.d)+'</g>';
    }).join('');
  }
  return '<g pointer-events="none">'+printPath(atlas[id].d)+drawSlots(slots,atlas.openRing)+
    drawSlots(spentSlots,atlas.spentRing)+'</g>';
}

// A heavy outer contour for this adjacent, horizontal pair in the demonstration.
// The live renderer supplies the real neighbour orientation and board transform.
export function pairContour(joined, leftOccupied, rightOccupied) {
  const left='M75 2 Q111 23 148 42 L148 118 Q111 139 75 157 L2 118 L2 43 Z';
  const right='M223 2 L296 42 L297 117 L223 158 L149 118 L149 42 Z';
  const shared='M75 2 Q112 23 149 42 Q186 20 223 2 L296 42 L297 117 L223 158 L149 118 Q111 139 75 157 L2 118 L2 43 Z';
  const d=joined && leftOccupied && rightOccupied ? shared :
    (leftOccupied?left:'') + (rightOccupied?right:'');
  return '<path d="'+d+'" fill="none" stroke="#191511" stroke-width="4.6" stroke-linejoin="round" pointer-events="none"/>';
}
