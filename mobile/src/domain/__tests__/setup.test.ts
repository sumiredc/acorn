import { nextSetupStep } from '../setup';
import { type AcornData, initialData } from '../types';

const week = (status: 'setup' | 'active') => ({
  weekStart: '2026-10-19',
  status,
  missions: [],
  progress: {},
});
const reward = (status: 'available' | 'redeemed') => ({
  id: status,
  name: status,
  pt: 10,
  mode: 'price' as const,
  judgement: { choice: 'usd_10', probabilities: {}, confidence: 1 },
  status,
  createdAt: 0,
});
const ready: AcornData = {
  ...initialData,
  locale: 'ja',
  userName: 'Sumire',
  budgetUsd: 500,
  rewards: [reward('available')],
};

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

  it('asks for a reward while the week is set up and none is waiting', () => {
    expect(nextSetupStep({ ...ready, rewards: [] })).toBe('rewards');
    expect(nextSetupStep({ ...ready, rewards: [reward('redeemed')] })).toBe('rewards');
  });

  it('does not ask for a reward once the week is active', () => {
    expect(nextSetupStep({ ...ready, rewards: [], week: week('active') })).toBeNull();
  });
});
