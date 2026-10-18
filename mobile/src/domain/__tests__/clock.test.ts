import { dateKey, HOUR_MS, MINUTE_MS, mondayKey, remainingTime, weekDateKeys } from '../clock';

const at = (y: number, m: number, d: number, h = 12) => new Date(y, m - 1, d, h).getTime();

describe('mondayKey', () => {
  it('returns the same day on a Monday', () => {
    expect(mondayKey(at(2026, 10, 19))).toBe('2026-10-19');
  });

  it('treats Sunday as the end of the week that started on Monday', () => {
    expect(mondayKey(at(2026, 10, 25, 23))).toBe('2026-10-19');
  });

  it('crosses month boundaries', () => {
    expect(mondayKey(at(2026, 11, 1))).toBe('2026-10-26');
  });
});

describe('weekDateKeys', () => {
  it('lists Monday to Sunday', () => {
    expect(weekDateKeys('2026-10-26')).toEqual([
      '2026-10-26',
      '2026-10-27',
      '2026-10-28',
      '2026-10-29',
      '2026-10-30',
      '2026-10-31',
      '2026-11-01',
    ]);
  });
});

describe('dateKey', () => {
  it('uses local time and zero-pads', () => {
    expect(dateKey(at(2026, 1, 5, 0))).toBe('2026-01-05');
  });
});

describe('remainingTime', () => {
  it('shows minutes under an hour, rounded up', () => {
    expect(remainingTime(59 * MINUTE_MS + 1)).toEqual({ unit: 'minutes', minutes: 60 });
    expect(remainingTime(30 * 1000)).toEqual({ unit: 'minutes', minutes: 1 });
    expect(remainingTime(0)).toEqual({ unit: 'minutes', minutes: 0 });
  });

  it('shows whole hours from an hour up to a day', () => {
    expect(remainingTime(HOUR_MS)).toEqual({ unit: 'hours', hours: 1 });
    expect(remainingTime(23 * HOUR_MS + 59 * MINUTE_MS)).toEqual({ unit: 'hours', hours: 23 });
  });

  it('shows days and hours from a day up', () => {
    expect(remainingTime(24 * HOUR_MS)).toEqual({ unit: 'days', days: 1, hours: 0 });
    expect(remainingTime(130 * HOUR_MS + 30 * MINUTE_MS)).toEqual({
      unit: 'days',
      days: 5,
      hours: 10,
    });
  });
});
