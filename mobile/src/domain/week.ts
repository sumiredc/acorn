import { mondayKey } from './clock';
import type { AcornData, Mission, MissionKind, Week } from './types';

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

export function newWeek(now: number): Week {
  return { weekStart: mondayKey(now), status: 'setup', missions: [] };
}

export function ensureWeek(data: AcornData, now: number): AcornData {
  if (data.week) return data;
  return { ...data, week: newWeek(now) };
}
