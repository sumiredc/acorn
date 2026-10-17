import { canAddMission, canFinishMissions } from '../week';
import type { Mission, MissionKind } from '../types';

const mission = (kind: MissionKind, id: string = kind): Mission => ({
  id,
  name: id,
  kind,
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
