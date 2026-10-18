import { dateKey, weekDateKeys } from './clock';
import type { Clear, Week } from './types';

export type TimelineDay = {
  date: string;
  isToday: boolean;
  // One entry per daily mission, in the order they were registered.
  daily: boolean[];
  weeklyCleared: boolean;
};

export function timelineDays(week: Week, clears: Clear[], now: number): TimelineDay[] {
  const today = dateKey(now);
  const thisWeek = clears.filter((c) => c.weekStart === week.weekStart);
  const cleared = (missionId: string, date: string) =>
    thisWeek.some((c) => c.missionId === missionId && c.date === date);
  return weekDateKeys(week.weekStart).map((date) => ({
    date,
    isToday: date === today,
    daily: week.missions.filter((m) => m.kind === 'daily').map((m) => cleared(m.id, date)),
    weeklyCleared: week.missions.some((m) => m.kind === 'weekly' && cleared(m.id, date)),
  }));
}
