import {
  canAddMission,
  canFinishMissions,
  carryableMissions,
  ensureWeek,
  missionSlots,
  missionTarget,
  untilNextMonday,
} from '../week';
import { initialData, type Mission, type MissionKind } from '../types';

const mission = (kind: MissionKind, id: string = kind): Mission => ({
  id,
  name: id,
  kind,
  unit: 'percent',
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
  it('is always 100 for a mission tracked in %', () => {
    expect(missionTarget('percent', 0)).toBe(100);
  });

  it('accepts whole numbers from 1 for counts and minutes', () => {
    expect(missionTarget('count', 20)).toBe(20);
    expect(missionTarget('minutes', 30)).toBe(30);
    expect(missionTarget('count', 0)).toBeNull();
    expect(missionTarget('minutes', 2.5)).toBeNull();
    expect(missionTarget('count', Number.NaN)).toBeNull();
  });
});

describe('missionSlots', () => {
  it('lists 3 daily and 1 weekly slot, filled ones first', () => {
    const slots = missionSlots([mission('weekly', 'w'), mission('daily', 'd')]);
    expect(slots.map((s) => [s.kind, s.mission?.id ?? null])).toEqual([
      ['daily', 'd'],
      ['daily', null],
      ['daily', null],
      ['weekly', 'w'],
    ]);
  });
});

describe('ensureWeek', () => {
  const at = (y: number, m: number, d: number, h = 12, min = 0) =>
    new Date(y, m - 1, d, h, min).getTime();
  const scored = { ...mission('daily', 'a'), pt: 4, judgement: null };
  const active = {
    ...initialData,
    week: {
      weekStart: '2026-10-19',
      status: 'active' as const,
      missions: [scored],
      progress: { 'a/2026-10-25': 3 },
    },
    clears: [
      {
        id: 'c',
        missionId: 'a',
        weekStart: '2026-10-19',
        date: '2026-10-25',
        pt: 4,
        clearedAt: 0,
        progressBefore: 0,
      },
    ],
  };

  it('keeps the week until Sunday night', () => {
    expect(ensureWeek(active, at(2026, 10, 25, 23, 59))).toBe(active);
  });

  it('starts a new week on Monday, keeping last week to carry over without points', () => {
    const next = ensureWeek(active, at(2026, 10, 26, 0, 0));
    expect(next.week).toEqual({
      weekStart: '2026-10-26',
      status: 'setup',
      missions: [],
      progress: {},
    });
    expect(next.previousMissions).toEqual([{ ...scored, pt: null }]);
  });

  it('keeps every clear, so the balance carries over', () => {
    expect(ensureWeek(active, at(2026, 10, 27)).clears).toEqual(active.clears);
  });

  it('jumps straight to the current week after several weeks away', () => {
    const next = ensureWeek(active, at(2026, 11, 18));
    expect(next.week!.weekStart).toBe('2026-11-16');
    expect(next.previousMissions.map((m) => m.id)).toEqual(['a']);
  });

  it('keeps the older missions after a week that had none', () => {
    const skipped = ensureWeek(active, at(2026, 10, 27));
    expect(ensureWeek(skipped, at(2026, 11, 3)).previousMissions.map((m) => m.id)).toEqual(['a']);
  });
});

describe('carryableMissions', () => {
  it('leaves out missions already on this week', () => {
    const previous = [mission('daily', 'a'), mission('weekly', 'w')];
    const current = [{ ...mission('daily', 'a'), id: 'new-a' }];
    expect(carryableMissions(previous, current).map((m) => m.id)).toEqual(['w']);
  });
});

describe('untilNextMonday', () => {
  it('reaches next Monday at the same time of day', () => {
    const wednesday = new Date(2026, 9, 21, 9).getTime();
    const sunday = new Date(2026, 9, 25, 9).getTime();
    expect(new Date(wednesday + untilNextMonday(wednesday))).toEqual(new Date(2026, 9, 26, 9));
    expect(new Date(sunday + untilNextMonday(sunday))).toEqual(new Date(2026, 9, 26, 9));
  });
});
