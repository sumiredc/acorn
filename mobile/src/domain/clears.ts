import { balance } from './balance';
import { dateKey, MINUTE_MS } from './clock';
import type { AcornData, Clear, Mission, Week } from './types';

export const UNDO_MS = 30 * MINUTE_MS;

// The clear for the mission's current period: today for daily, this week for weekly.
export function currentClear(clears: Clear[], mission: Mission, week: Week, now: number) {
  const today = dateKey(now);
  return clears.find(
    (c) =>
      c.missionId === mission.id &&
      c.weekStart === week.weekStart &&
      (mission.kind === 'weekly' || c.date === today),
  );
}

export function canRecord(clears: Clear[], mission: Mission, week: Week, now: number): boolean {
  if (week.status !== 'active' || mission.pt === null) return false;
  return !currentClear(clears, mission, week, now);
}

export function canUndo(data: Pick<AcornData, 'clears' | 'rewards'>, clear: Clear, now: number) {
  return now - clear.clearedAt <= UNDO_MS && balance(data) >= clear.pt;
}
