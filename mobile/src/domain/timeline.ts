import { dateKey, weekDateKeys } from './clock';
import type { Clear, Week } from './types';

export type TimelineDay = {
  date: string;
  isToday: boolean;
  // How many daily missions were cleared that day, out of `total`.
  cleared: number;
  total: number;
};

export function timelineDays(week: Week, clears: Clear[], now: number): TimelineDay[] {
  const today = dateKey(now);
  const daily = new Set(week.missions.filter((m) => m.kind === 'daily').map((m) => m.id));
  return weekDateKeys(week.weekStart).map((date) => {
    const cleared = clears.filter(
      (c) => c.weekStart === week.weekStart && c.date === date && daily.has(c.missionId),
    ).length;
    return { date, isToday: date === today, cleared, total: daily.size };
  });
}
