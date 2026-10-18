import type { AcornData } from './types';

// Never stored, so undoing a clear or redeeming a reward can't make it drift.
export function balance(data: Pick<AcornData, 'clears' | 'rewards'>): number {
  const earned = data.clears.reduce((sum, c) => sum + c.pt, 0);
  const spent = data.rewards
    .filter((r) => r.status === 'redeemed')
    .reduce((sum, r) => sum + r.pt, 0);
  return earned - spent;
}
