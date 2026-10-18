import {
  clampProgress,
  currentProgress,
  periodEnd,
  progressKey,
  progressStep,
  snapProgress,
  stepProgress,
} from '../progress';
import type { Mission, Week } from '../types';

describe('progressStep', () => {
  it('moves 10% at a time for a mission tracked in %', () => {
    expect(progressStep('percent', 100)).toBe(10);
  });

  it.each([
    [1, 1],
    [20, 1],
    [21, 5],
    [50, 5],
    [51, 10],
    [300, 10],
  ])('moves a goal of %i by %i, for both count and time', (target, step) => {
    expect(progressStep('count', target)).toBe(step);
    expect(progressStep('minutes', target)).toBe(step);
  });
});

describe('stepProgress', () => {
  it('stops at 0 and at the goal', () => {
    expect(stepProgress(0, 'count', 30, -1)).toBe(0);
    expect(stepProgress(28, 'count', 30, 1)).toBe(30);
    expect(stepProgress(10, 'count', 30, 1)).toBe(15);
  });
});

describe('clampProgress', () => {
  it('keeps typed values between 0 and the goal, as whole numbers', () => {
    expect(clampProgress(-3, 20)).toBe(0);
    expect(clampProgress(25, 20)).toBe(20);
    expect(clampProgress(7.6, 20)).toBe(8);
    expect(clampProgress(Number.NaN, 20)).toBe(0);
  });
});

describe('snapProgress', () => {
  it('snaps to the nearest step along the bar', () => {
    expect(snapProgress(0.04, 'percent', 100)).toBe(0);
    expect(snapProgress(0.36, 'percent', 100)).toBe(40);
    expect(snapProgress(1.2, 'percent', 100)).toBe(100);
    expect(snapProgress(-1, 'percent', 100)).toBe(0);
  });

  it('can reach a goal that is not a multiple of the step', () => {
    // Goal 23 times moves by 5: notches at 0, 5, 10, 15, 20 and 23.
    expect(snapProgress(21 / 23, 'count', 23)).toBe(20);
    expect(snapProgress(22 / 23, 'count', 23)).toBe(23);
  });
});

describe('progressKey', () => {
  const week: Week = { weekStart: '2026-10-19', status: 'active', missions: [], progress: {} };
  const mission = (kind: Mission['kind']): Mission => ({
    id: 'm',
    name: 'M',
    kind,
    unit: 'count',
    target: 10,
    pt: 5,
    judgement: null,
  });

  it('starts daily goals over each day and keeps weekly goals for the week', () => {
    expect(progressKey(mission('daily'), week, '2026-10-21')).toBe('m/2026-10-21');
    expect(progressKey(mission('weekly'), week, '2026-10-21')).toBe('m/2026-10-19');
  });

  it('reads 0 before anything is recorded today', () => {
    const recorded = { ...week, progress: { 'm/2026-10-20': 6 } };
    const wednesday = new Date(2026, 9, 21, 9).getTime();
    expect(currentProgress(mission('daily'), recorded, wednesday)).toBe(0);
    expect(currentProgress(mission('weekly'), recorded, wednesday)).toBe(0);
  });

  it('ends a daily period tonight and a weekly one on Sunday night', () => {
    const wednesday = new Date(2026, 9, 21, 9).getTime();
    expect(periodEnd(mission('daily'), week, wednesday)).toBe(new Date(2026, 9, 22).getTime());
    expect(periodEnd(mission('weekly'), week, wednesday)).toBe(new Date(2026, 9, 26).getTime());
  });
});
