import { DAY_MS, mondayKey } from './clock';
import type { AcornData, Mission, MissionKind, MissionUnit, Week } from './types';

export const MISSION_LIMITS: Record<MissionKind, number> = { daily: 3, weekly: 1 };

export function countByKind(missions: Mission[], kind: MissionKind): number {
  return missions.filter((m) => m.kind === kind).length;
}

export function canAddMission(missions: Mission[], kind: MissionKind): boolean {
  return countByKind(missions, kind) < MISSION_LIMITS[kind];
}

export function canFinishMissions(missions: Mission[]): boolean {
  return missions.length >= 1;
}

export const MAX_TARGET = 10000;

export type MissionSlot = { kind: MissionKind; mission: Mission | null };

// Every place a mission can go this week, filled ones first within each kind.
export function missionSlots(missions: Mission[]): MissionSlot[] {
  return (['daily', 'weekly'] as const).flatMap((kind) => {
    const filled = missions.filter((m) => m.kind === kind);
    return Array.from({ length: MISSION_LIMITS[kind] }, (_, i) => ({
      kind,
      mission: filled[i] ?? null,
    }));
  });
}

// The goal to store, or null when the target does not fit the unit.
export function missionTarget(unit: MissionUnit, target: number): number | null {
  if (unit === 'percent') return 100;
  return Number.isInteger(target) && target >= 1 && target <= MAX_TARGET ? target : null;
}

export function newWeek(now: number): Week {
  return { weekStart: mondayKey(now), status: 'setup', missions: [], progress: {} };
}

// Starts this week when the saved one is missing or from an earlier week. Last week's missions
// are kept, unscored, to carry over; after a week with none, the older ones stay. Clears (and so
// the balance) are never touched.
export function ensureWeek(data: AcornData, now: number): AcornData {
  if (data.week?.weekStart === mondayKey(now)) return data;
  const ended = data.week?.missions ?? [];
  const previousMissions =
    ended.length > 0
      ? ended.map((m) => ({ ...m, pt: null, judgement: null }))
      : data.previousMissions;
  return { ...data, week: newWeek(now), previousMissions };
}

// The same mission as one already on this week's list, judged by what it asks for.
function sameGoal(a: Mission, b: Mission): boolean {
  return a.name === b.name && a.kind === b.kind && a.unit === b.unit && a.target === b.target;
}

// Last week's missions that aren't on this week's list yet.
export function carryableMissions(previous: Mission[], current: Mission[]): Mission[] {
  return previous.filter((p) => !current.some((c) => sameGoal(p, c)));
}

// How far to move the clock to reach next Monday at the same time of day.
export function untilNextMonday(now: number): number {
  const sinceMonday = (new Date(now).getDay() + 6) % 7;
  return (7 - sinceMonday) * DAY_MS;
}
