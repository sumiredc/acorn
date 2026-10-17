import { canAddMission, canFinishMissions, ensureWeek } from '@/domain/week';
import type { AcornData, Judgement, Locale, MissionKind } from '@/domain/types';

export type ScoredMission = { id: string; pt: number; judgement: Judgement };

export type Action =
  | { type: 'tick' }
  | { type: 'setBudget'; budgetUsd: number }
  | { type: 'addMission'; id: string; name: string; kind: MissionKind }
  | { type: 'removeMission'; id: string }
  | { type: 'submitMissions' }
  | { type: 'missionsScored'; results: ScoredMission[] }
  | { type: 'setLocale'; locale: Locale | null };

// Every change to saved data goes through here. Invalid actions return the data unchanged.
export function reduce(data: AcornData, action: Action, now: number): AcornData {
  const current = ensureWeek(data, now);
  const week = current.week!;

  switch (action.type) {
    case 'tick':
      return current;

    case 'setBudget':
      if (!(action.budgetUsd > 0)) return current;
      return { ...current, budgetUsd: action.budgetUsd };

    case 'addMission': {
      const name = action.name.trim();
      if (week.status !== 'setup' || !name || !canAddMission(week.missions, action.kind)) {
        return current;
      }
      const mission = { id: action.id, name, kind: action.kind, pt: null, judgement: null };
      return { ...current, week: { ...week, missions: [...week.missions, mission] } };
    }

    case 'removeMission':
      if (week.status !== 'setup') return current;
      return {
        ...current,
        week: { ...week, missions: week.missions.filter((m) => m.id !== action.id) },
      };

    case 'submitMissions':
      if (week.status !== 'setup' || !canFinishMissions(week.missions)) return current;
      return { ...current, week: { ...week, status: 'scoring' } };

    case 'missionsScored': {
      if (week.status !== 'scoring') return current;
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
