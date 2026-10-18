import { timelineDays } from '../timeline';
import type { Clear, Mission, Week } from '../types';

const mission = (id: string, kind: Mission['kind']): Mission => ({
  id,
  name: id,
  kind,
  unit: 'percent',
  target: 100,
  pt: 5,
  judgement: null,
});
const week: Week = {
  weekStart: '2026-10-19',
  status: 'active',
  missions: [mission('a', 'daily'), mission('w', 'weekly'), mission('b', 'daily')],
  progress: {},
};
const clear = (missionId: string, date: string): Clear => ({
  id: `${missionId}-${date}`,
  missionId,
  weekStart: '2026-10-19',
  date,
  pt: 5,
  clearedAt: 0,
  progressBefore: 0,
});

describe('timelineDays', () => {
  it('shows Monday to Sunday with today marked and past clears kept', () => {
    const wednesday = new Date(2026, 9, 21, 9).getTime();
    const days = timelineDays(
      week,
      [clear('a', '2026-10-19'), clear('b', '2026-10-21'), clear('w', '2026-10-20')],
      wednesday,
    );
    expect(days.map((d) => d.date)).toEqual([
      '2026-10-19',
      '2026-10-20',
      '2026-10-21',
      '2026-10-22',
      '2026-10-23',
      '2026-10-24',
      '2026-10-25',
    ]);
    expect(days.map((d) => d.isToday)).toEqual([false, false, true, false, false, false, false]);
    expect(days[0]).toMatchObject({ daily: [true, false], weeklyCleared: false });
    expect(days[1]).toMatchObject({ daily: [false, false], weeklyCleared: true });
    expect(days[2]).toMatchObject({ daily: [false, true], weeklyCleared: false });
  });
});
