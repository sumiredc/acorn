import { canAddMission, canFinishMissions, ensureWeek, missionTarget } from '@/domain/week';
import type { AcornData, Judgement, Locale, MissionKind, MissionUnit } from '@/domain/types';

export type ScoredMission = { id: string; pt: number; judgement: Judgement };

export type Action =
  | { type: 'tick' }
  | { type: 'setUserName'; name: string }
  | { type: 'setBudget'; budgetUsd: number }
  | {
      type: 'addMission';
      id: string;
      name: string;
      kind: MissionKind;
      unit: MissionUnit;
      target: number;
    }
  | { type: 'removeMission'; id: string }
  | { type: 'missionsScored'; results: ScoredMission[] }
  | { type: 'setLocale'; locale: Locale };

// Every change to saved data goes through here. Invalid actions return the data unchanged.
export function reduce(data: AcornData, action: Action, now: number): AcornData {
  const current = ensureWeek(data, now);
  const week = current.week!;

  switch (action.type) {
    case 'tick':
      return current;

    case 'setUserName': {
      const name = action.name.trim();
      if (!name) return current;
      return { ...current, userName: name };
    }

    case 'setBudget':
      if (!(action.budgetUsd > 0)) return current;
      return { ...current, budgetUsd: action.budgetUsd };

    case 'addMission': {
      const name = action.name.trim();
      const target = missionTarget(action.unit, action.target);
      if (week.status !== 'setup' || !name || target === null) return current;
      if (!canAddMission(week.missions, action.kind)) return current;
      const { id, kind, unit } = action;
      const mission = { id, name, kind, unit, target, pt: null, judgement: null };
      return { ...current, week: { ...week, missions: [...week.missions, mission] } };
    }

    case 'removeMission':
      if (week.status !== 'setup') return current;
      return {
        ...current,
        week: { ...week, missions: week.missions.filter((m) => m.id !== action.id) },
      };

    case 'missionsScored': {
      if (week.status !== 'setup' || !canFinishMissions(week.missions)) return current;
      const byId = new Map(action.results.map((r) => [r.id, r]));
      if (week.missions.some((m) => !byId.has(m.id))) return current;
      const missions = week.missions.map((m) => {
        const r = byId.get(m.id)!;
        return { ...m, pt: r.pt, judgement: r.judgement };
      });
      return { ...current, week: { ...week, status: 'active', missions } };
    }

    case 'setLocale':
      return { ...current, locale: action.locale };
  }
}
