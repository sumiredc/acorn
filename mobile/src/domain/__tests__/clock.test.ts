import { dateKey, mondayKey, weekDateKeys } from '../clock';

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
