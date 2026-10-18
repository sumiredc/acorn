import { availableRewards } from './rewards';
import type { AcornData } from './types';

export type SetupStep = 'language' | 'name' | 'budget' | 'rewards' | 'missions';

// null means setup is done and the week is active.
export function nextSetupStep(data: AcornData): SetupStep | null {
  if (data.locale === null) return 'language';
  if (data.userName === null) return 'name';
  if (data.budgetUsd === null) return 'budget';
  if (!data.week || data.week.status === 'setup') {
    // Only while getting the week ready, so redeeming the last reward mid-week sends no one here.
    return availableRewards(data.rewards).length === 0 ? 'rewards' : 'missions';
  }
  return null;
}
