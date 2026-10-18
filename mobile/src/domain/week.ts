import { mondayKey } from './clock';
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

// The goal to store, or null when the target does not fit the unit.
export function missionTarget(unit: MissionUnit, target: number): number | null {
  if (unit === 'none') return 1;
  return Number.isInteger(target) && target >= 1 && target <= MAX_TARGET ? target : null;
}

export function newWeek(now: number): Week {
  return { weekStart: mondayKey(now), status: 'setup', missions: [] };
}

export function ensureWeek(data: AcornData, now: number): AcornData {
  if (data.week) return data;
  return { ...data, week: newWeek(now) };
}
