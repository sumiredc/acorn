import { type AcornData, initialData, type Mission } from '@/domain/types';

// Missions saved before units existed, or with the old 'none' unit, track progress in %.
function withGoal(mission: Mission): Mission {
  const unit = (mission.unit as string | undefined) ?? 'none';
  if (unit !== 'none') return mission;
  return { ...mission, unit: 'percent', target: 100 };
}

// Fills fields added since the data was saved, so older saves still load.
export function parseSaved(raw: string | null): AcornData {
  if (!raw) return initialData;
  try {
    const saved = JSON.parse(raw) as Partial<AcornData>;
    const data = { ...initialData, ...saved };
    if (data.week) {
      const status = data.week.status === 'active' ? 'active' : 'setup';
      const missions = data.week.missions.map(withGoal);
      data.week = { ...data.week, status, missions, progress: data.week.progress ?? {} };
    }
    data.previousMissions = data.previousMissions.map(withGoal);
    data.clears = data.clears.map((c) => ({ ...c, progressBefore: c.progressBefore ?? 0 }));
    return data;
  } catch {
    return initialData;
  }
}
