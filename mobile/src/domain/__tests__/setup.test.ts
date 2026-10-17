import { nextSetupStep } from '../setup';
import { type AcornData, initialData } from '../types';

const week = (status: 'setup' | 'scoring' | 'active') => ({
  weekStart: '2026-10-19',
  status,
  missions: [],
});

describe('nextSetupStep', () => {
  it('asks for the budget first', () => {
    expect(nextSetupStep(initialData)).toBe('budget');
  });

  it('skips the budget once it is set', () => {
    const data: AcornData = { ...initialData, budgetUsd: 500, week: week('setup') };
    expect(nextSetupStep(data)).toBe('missions');
  });

  it('stays on scoring until Jev has answered', () => {
    const data: AcornData = { ...initialData, budgetUsd: 500, week: week('scoring') };
    expect(nextSetupStep(data)).toBe('scoring');
  });

  it('is done when the week is active', () => {
    const data: AcornData = { ...initialData, budgetUsd: 500, week: week('active') };
    expect(nextSetupStep(data)).toBeNull();
  });
});
