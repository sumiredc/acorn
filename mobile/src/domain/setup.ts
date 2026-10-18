import type { AcornData } from './types';

export type SetupStep = 'language' | 'name' | 'budget' | 'missions';

// null means setup is done and the week is active.
export function nextSetupStep(data: AcornData): SetupStep | null {
  if (data.locale === null) return 'language';
  if (data.userName === null) return 'name';
  if (data.budgetUsd === null) return 'budget';
  if (!data.week || data.week.status === 'setup') return 'missions';
  return null;
}
