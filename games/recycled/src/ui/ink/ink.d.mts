import type marks from './assets/marks.json';
type MarkId = keyof typeof marks;
type BuildingId = Exclude<MarkId, 'separatorOutline' | 'separatorHalf' | 'separatorFull'
  | 'recyclerSingle' | 'openRing' | 'spentRing'>;
type Points = ReadonlyArray<readonly number[]>;
export function buildingInkProps(
  artId: BuildingId,
  instance: { drawn: number; used: number; step: number; complete: boolean },
  anchors: Points
): { building: BuildingId; completedSteps: number; slots: Points; spentSlots: Points };
export function markFor(type: MarkId, completedSteps: number): MarkId | null;
export function inkLayer(atlas: typeof marks, type: MarkId, completedSteps: number, slots?: ReadonlyArray<readonly number[]>, spentSlots?: ReadonlyArray<readonly number[]>): string;
export function pairContour(joined: boolean, leftOccupied: boolean, rightOccupied: boolean): string;
