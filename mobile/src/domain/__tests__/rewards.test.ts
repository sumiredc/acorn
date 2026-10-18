import { canAddReward, canRedeem, MAX_REWARDS } from '../rewards';
import type { Clear, Reward } from '../types';

const reward = (id: string, pt: number, status: Reward['status'] = 'available'): Reward => ({
  id,
  name: id,
  pt,
  mode: 'price',
  judgement: { choice: 'usd_100', probabilities: { usd_100: 1 }, confidence: 1 },
  status,
  createdAt: 0,
});
const clear = (pt: number): Clear => ({
  id: String(pt),
  missionId: 'm',
  weekStart: '2026-10-19',
  date: '2026-10-21',
  pt,
  clearedAt: 0,
  progressBefore: 0,
});

describe('canAddReward', () => {
  it('allows up to 5 rewards waiting to be redeemed', () => {
    const four = Array.from({ length: MAX_REWARDS - 1 }, (_, i) => reward(`r${i}`, 10));
    expect(canAddReward(four)).toBe(true);
    expect(canAddReward([...four, reward('r5', 10)])).toBe(false);
  });

  it('does not count redeemed rewards', () => {
    const full = Array.from({ length: MAX_REWARDS }, (_, i) => reward(`r${i}`, 10));
    full[0] = { ...full[0], status: 'redeemed' };
    expect(canAddReward(full)).toBe(true);
  });
});

describe('canRedeem', () => {
  it('needs enough acorns', () => {
    expect(canRedeem({ clears: [clear(30)], rewards: [] }, reward('a', 30))).toBe(true);
    expect(canRedeem({ clears: [clear(29)], rewards: [] }, reward('a', 30))).toBe(false);
  });

  it('counts acorns already spent', () => {
    const spent = reward('old', 20, 'redeemed');
    expect(canRedeem({ clears: [clear(40)], rewards: [spent] }, reward('a', 30))).toBe(false);
  });

  it('cannot redeem the same reward twice', () => {
    const done = reward('a', 10, 'redeemed');
    expect(canRedeem({ clears: [clear(100)], rewards: [done] }, done)).toBe(false);
  });
});
