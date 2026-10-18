import { balance } from './balance';
import type { AcornData, Reward } from './types';

// Redeemed rewards don't count, so the list frees up as rewards are claimed.
export const MAX_REWARDS = 5;

export function availableRewards(rewards: Reward[]): Reward[] {
  return rewards.filter((r) => r.status === 'available');
}

export function canAddReward(rewards: Reward[]): boolean {
  return availableRewards(rewards).length < MAX_REWARDS;
}

export function canRedeem(data: Pick<AcornData, 'clears' | 'rewards'>, reward: Reward): boolean {
  return reward.status === 'available' && balance(data) >= reward.pt;
}
