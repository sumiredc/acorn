import { dateKey, midnightAfter } from './clock';
import type { Mission, MissionUnit, Week } from './types';

// How much one button press or one notch of the bar moves.
export function progressStep(unit: MissionUnit, target: number): number {
  if (unit === 'percent') return 10;
  if (target <= 20) return 1;
  if (target <= 50) return 5;
  return 10;
}

// Daily goals restart each day; weekly goals add up over the week.
// `day` is a dateKey(); weekly goals ignore it.
export function progressKey(mission: Pick<Mission, 'id' | 'kind'>, week: Week, day: string) {
  return `${mission.id}/${mission.kind === 'daily' ? day : week.weekStart}`;
}

export function currentProgress(mission: Mission, week: Week, now: number): number {
  return week.progress[progressKey(mission, week, dateKey(now))] ?? 0;
}

export function clampProgress(value: number, target: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(target, Math.max(0, Math.round(value)));
}

// One step up or down from `value`, never past 0 or the goal.
export function stepProgress(value: number, unit: MissionUnit, target: number, dir: 1 | -1) {
  return clampProgress(value + dir * progressStep(unit, target), target);
}

// The notch nearest to `ratio` (0–1 along the bar). Notches are every step, plus the goal itself.
export function snapProgress(ratio: number, unit: MissionUnit, target: number): number {
  const step = progressStep(unit, target);
  const raw = Math.min(1, Math.max(0, ratio)) * target;
  const lastNotch = Math.floor((target - 1) / step) * step;
  if (raw > (lastNotch + target) / 2) return target;
  return Math.min(lastNotch, Math.round(raw / step) * step);
}

// When the current period ends: tonight for daily, Sunday night for weekly.
export function periodEnd(mission: Pick<Mission, 'kind'>, week: Week, now: number): number {
  return mission.kind === 'daily'
    ? midnightAfter(dateKey(now), 1)
    : midnightAfter(week.weekStart, 7);
}
