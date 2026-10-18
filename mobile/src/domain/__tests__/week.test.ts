import { canAddMission, canFinishMissions, missionTarget } from '../week';
import type { Mission, MissionKind } from '../types';

const mission = (kind: MissionKind, id: string = kind): Mission => ({
  id,
  name: id,
  kind,
  unit: 'none',
  target: 1,
  pt: null,
  judgement: null,
});

describe('mission limits', () => {
  it('allows up to 3 daily missions', () => {
    const missions = [mission('daily', 'a'), mission('daily', 'b')];
    expect(canAddMission(missions, 'daily')).toBe(true);
    expect(canAddMission([...missions, mission('daily', 'c')], 'daily')).toBe(false);
  });

  it('allows only 1 weekly mission', () => {
    expect(canAddMission([], 'weekly')).toBe(true);
    expect(canAddMission([mission('weekly')], 'weekly')).toBe(false);
  });

  it('counts daily and weekly separately', () => {
    const fullDaily = [mission('daily', 'a'), mission('daily', 'b'), mission('daily', 'c')];
    expect(canAddMission(fullDaily, 'weekly')).toBe(true);
  });

  it('needs at least one mission to finish', () => {
    expect(canFinishMissions([])).toBe(false);
    expect(canFinishMissions([mission('weekly')])).toBe(true);
  });
});

describe('missionTarget', () => {
  it('is always 1 for a one-off mission', () => {
    expect(missionTarget('none', 0)).toBe(1);
  });

  it('accepts whole numbers from 1 for counts and minutes', () => {
    expect(missionTarget('count', 20)).toBe(20);
    expect(missionTarget('minutes', 30)).toBe(30);
    expect(missionTarget('count', 0)).toBeNull();
    expect(missionTarget('minutes', 2.5)).toBeNull();
    expect(missionTarget('count', Number.NaN)).toBeNull();
  });
});
