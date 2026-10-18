import { type AcornData, initialData, type Mission } from '@/domain/types';

// Missions saved before units existed were one-off goals.
function withGoal(mission: Mission): Mission {
  return { ...mission, unit: mission.unit ?? 'none', target: mission.target ?? 1 };
}

// Fills fields added since the data was saved, so older saves still load.
export function parseSaved(raw: string | null): AcornData {
  if (!raw) return initialData;
  try {
    const saved = JSON.parse(raw) as Partial<AcornData>;
    const data = { ...initialData, ...saved };
    if (data.week) {
      const status = data.week.status === 'active' ? 'active' : 'setup';
      data.week = { ...data.week, status, missions: data.week.missions.map(withGoal) };
    }
    data.previousMissions = data.previousMissions.map(withGoal);
    return data;
  } catch {
    return initialData;
  }
}
