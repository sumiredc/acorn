import { balance } from '../balance';
import { canRecord, canUndo, currentClear, UNDO_MS } from '../clears';
import type { Clear, Mission, Reward, Week } from '../types';

const NOW = new Date(2026, 9, 21, 9).getTime(); // Wednesday
const mission = (kind: Mission['kind'], pt: number | null = 5): Mission => ({
  id: kind,
  name: kind,
  kind,
  unit: 'count',
  target: 10,
  pt,
  judgement: null,
});
const week: Week = {
  weekStart: '2026-10-19',
  status: 'active',
  missions: [mission('daily'), mission('weekly')],
  progress: {},
};
const clear = (missionId: string, date: string, extra: Partial<Clear> = {}): Clear => ({
  id: `${missionId}-${date}`,
  missionId,
  weekStart: '2026-10-19',
  date,
  pt: 5,
  clearedAt: NOW,
  progressBefore: 0,
  ...extra,
});
const reward = (pt: number, status: Reward['status']): Reward => ({
  id: String(pt),
  name: 'R',
  pt,
  mode: 'price',
  judgement: { choice: 'x', probabilities: {}, confidence: 1 },
  status,
  createdAt: NOW,
});

describe('canRecord', () => {
  it('needs points to be set first', () => {
    expect(canRecord([], mission('daily', null), week, NOW)).toBe(false);
    expect(canRecord([], mission('daily'), { ...week, status: 'setup' }, NOW)).toBe(false);
    expect(canRecord([], mission('daily'), week, NOW)).toBe(true);
  });

  it('allows a daily mission once a day', () => {
    expect(canRecord([clear('daily', '2026-10-21')], mission('daily'), week, NOW)).toBe(false);
    expect(canRecord([clear('daily', '2026-10-20')], mission('daily'), week, NOW)).toBe(true);
  });

  it('allows a weekly mission once a week', () => {
    expect(canRecord([clear('weekly', '2026-10-19')], mission('weekly'), week, NOW)).toBe(false);
    const lastWeek = clear('weekly', '2026-10-14', { weekStart: '2026-10-12' });
    expect(canRecord([lastWeek], mission('weekly'), week, NOW)).toBe(true);
  });

  it('finds the clear of the current period only', () => {
    const clears = [clear('daily', '2026-10-20'), clear('daily', '2026-10-21')];
    expect(currentClear(clears, mission('daily'), week, NOW)?.date).toBe('2026-10-21');
  });
});

describe('balance', () => {
  it('is points earned minus rewards redeemed', () => {
    const clears = [clear('daily', '2026-10-20'), clear('weekly', '2026-10-21', { pt: 20 })];
    const rewards = [reward(8, 'redeemed'), reward(100, 'available')];
    expect(balance({ clears, rewards })).toBe(17);
  });
});

describe('canUndo', () => {
  const c = clear('daily', '2026-10-21');

  it('allows undo for 30 minutes', () => {
    expect(canUndo({ clears: [c], rewards: [] }, c, NOW + UNDO_MS)).toBe(true);
    expect(canUndo({ clears: [c], rewards: [] }, c, NOW + UNDO_MS + 1)).toBe(false);
  });

  it('refuses when the balance would go below 0', () => {
    expect(canUndo({ clears: [c], rewards: [reward(1, 'redeemed')] }, c, NOW)).toBe(false);
  });
});
