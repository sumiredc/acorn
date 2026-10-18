import { nextSetupStep } from '../setup';
import { type AcornData, initialData } from '../types';

const week = (status: 'setup' | 'active') => ({
  weekStart: '2026-10-19',
  status,
  missions: [],
  progress: {},
});
const ready: AcornData = { ...initialData, locale: 'ja', userName: 'Sumire', budgetUsd: 500 };

describe('nextSetupStep', () => {
  it('asks for the language first', () => {
    expect(nextSetupStep(initialData)).toBe('language');
  });

  it('asks for the name after the language', () => {
    expect(nextSetupStep({ ...initialData, locale: 'en' })).toBe('name');
  });

  it('asks for the budget after the name', () => {
    expect(nextSetupStep({ ...ready, budgetUsd: null })).toBe('budget');
  });

  it('asks for missions until the week is active', () => {
    expect(nextSetupStep(ready)).toBe('missions');
    expect(nextSetupStep({ ...ready, week: week('setup') })).toBe('missions');
  });

  it('is done when the week is active', () => {
    expect(nextSetupStep({ ...ready, week: week('active') })).toBeNull();
  });
});
