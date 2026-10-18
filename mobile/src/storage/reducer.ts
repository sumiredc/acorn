import { canRecord, canUndo } from '@/domain/clears';
import { canAddReward, canRedeem } from '@/domain/rewards';
import { dateKey, DAY_MS } from '@/domain/clock';
import { clampProgress, progressKey } from '@/domain/progress';
import { canAddMission, canFinishMissions, ensureWeek, missionTarget } from '@/domain/week';
import type {
  AcornData,
  Judgement,
  Locale,
  MissionKind,
  MissionUnit,
  Reward,
} from '@/domain/types';

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
  // Reaching the goal clears the mission, under `clearId`.
  | { type: 'recordProgress'; missionId: string; value: number; clearId: string }
  | { type: 'undoClear'; clearId: string }
  | {
      type: 'addReward';
      id: string;
      name: string;
      pt: number;
      mode: Reward['mode'];
      judgement: Judgement;
    }
  | { type: 'redeemReward'; id: string }
  | { type: 'advanceDay' }
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

    case 'recordProgress': {
      const mission = week.missions.find((m) => m.id === action.missionId);
      if (!mission || !canRecord(current.clears, mission, week, now)) return current;
      const key = progressKey(mission, week, dateKey(now));
      const before = week.progress[key] ?? 0;
      const value = clampProgress(action.value, mission.target);
      const next = { ...current, week: { ...week, progress: { ...week.progress, [key]: value } } };
      if (value < mission.target) return next;
      const clear = {
        id: action.clearId,
        missionId: mission.id,
        weekStart: week.weekStart,
        date: dateKey(now),
        pt: mission.pt!,
        clearedAt: now,
        progressBefore: before,
      };
      return { ...next, clears: [...current.clears, clear] };
    }

    case 'undoClear': {
      const clear = current.clears.find((c) => c.id === action.clearId);
      if (!clear || !canUndo(current, clear, now)) return current;
      const clears = current.clears.filter((c) => c.id !== clear.id);
      const mission = week.missions.find((m) => m.id === clear.missionId);
      if (!mission || clear.weekStart !== week.weekStart) return { ...current, clears };
      // The clear's own day, which may differ from today for a daily mission.
      const key = progressKey(mission, week, clear.date);
      const progress = { ...week.progress, [key]: clear.progressBefore };
      return { ...current, clears, week: { ...week, progress } };
    }

    case 'addReward': {
      const name = action.name.trim();
      if (!name || !(action.pt >= 1) || !canAddReward(current.rewards)) return current;
      const { id, pt, mode, judgement } = action;
      const reward: Reward = { id, name, pt, mode, judgement, status: 'available', createdAt: now };
      return { ...current, rewards: [...current.rewards, reward] };
    }

    case 'redeemReward': {
      const reward = current.rewards.find((r) => r.id === action.id);
      if (!reward || !canRedeem(current, reward)) return current;
      const rewards = current.rewards.map((r) =>
        r.id === reward.id ? { ...r, status: 'redeemed' as const, redeemedAt: now } : r,
      );
      return { ...current, rewards };
    }

    case 'advanceDay':
      return { ...current, clockOffsetMs: current.clockOffsetMs + DAY_MS };

    case 'setLocale':
      return { ...current, locale: action.locale };
  }
}
