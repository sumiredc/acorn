// All dates are local time. `now` is always passed in so rules stay testable.

export const MINUTE_MS = 60 * 1000;
export const HOUR_MS = 60 * MINUTE_MS;
export const DAY_MS = 24 * HOUR_MS;

export function appNow(realNow: number, clockOffsetMs: number): number {
  return realNow + clockOffsetMs;
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

export function dateKey(ms: number): string {
  const d = new Date(ms);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function mondayKey(ms: number): string {
  const d = new Date(ms);
  // getDay(): Sunday = 0, so Sunday belongs to the week that started six days earlier.
  const sinceMonday = (d.getDay() + 6) % 7;
  return dateKey(new Date(d.getFullYear(), d.getMonth(), d.getDate() - sinceMonday).getTime());
}

export function weekDateKeys(weekStart: string): string[] {
  const [y, m, d] = weekStart.split('-').map(Number);
  return Array.from({ length: 7 }, (_, i) => dateKey(new Date(y, m - 1, d + i).getTime()));
}

// Midnight `days` days after the start of `day` ("YYYY-MM-DD").
export function midnightAfter(day: string, days: number): number {
  const [y, m, d] = day.split('-').map(Number);
  return new Date(y, m - 1, d + days).getTime();
}

export type Remaining =
  | { unit: 'minutes'; minutes: number }
  | { unit: 'hours'; hours: number }
  | { unit: 'days'; days: number; hours: number };

// Under an hour shows minutes (rounded up), under a day whole hours, otherwise days and hours.
export function remainingTime(ms: number): Remaining {
  if (ms < HOUR_MS) return { unit: 'minutes', minutes: Math.max(0, Math.ceil(ms / MINUTE_MS)) };
  const hours = Math.floor(ms / HOUR_MS);
  if (hours < 24) return { unit: 'hours', hours };
  return { unit: 'days', days: Math.floor(hours / 24), hours: hours % 24 };
}
