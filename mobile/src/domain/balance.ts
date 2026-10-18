import type { AcornData } from './types';

// Never stored, so undoing a clear or redeeming a reward can't make it drift.
export function balance(data: Pick<AcornData, 'clears' | 'rewards'>): number {
  const earned = totalEarned(data.clears);
  const spent = data.rewards
    .filter((r) => r.status === 'redeemed')
    .reduce((sum, r) => sum + r.pt, 0);
  return earned - spent;
}

// Every point ever earned, before spending; shown at the top of home.
export function totalEarned(clears: AcornData['clears']): number {
  return clears.reduce((sum, c) => sum + c.pt, 0);
}
