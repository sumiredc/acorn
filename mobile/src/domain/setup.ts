import type { AcornData } from './types';

export type SetupStep = 'budget' | 'missions' | 'scoring';

// null means setup is done and the week is active.
export function nextSetupStep(data: AcornData): SetupStep | null {
  if (data.budgetUsd === null) return 'budget';
  if (!data.week || data.week.status === 'setup') return 'missions';
  if (data.week.status === 'scoring') return 'scoring';
  return null;
}
