import { isMessageKey, resolveLocale, translate } from '..';

describe('resolveLocale', () => {
  it('follows the device when nothing is chosen', () => {
    expect(resolveLocale(null, 'ja')).toBe('ja');
    expect(resolveLocale(null, 'fr')).toBe('en');
    expect(resolveLocale(null, null)).toBe('en');
  });

  it('prefers the chosen language over the device', () => {
    expect(resolveLocale('en', 'ja')).toBe('en');
    expect(resolveLocale('ja', 'en')).toBe('ja');
  });
});

describe('translate', () => {
  it('fills parameters', () => {
    expect(translate('en', 'status.confidence', { value: 42 })).toBe('confidence 42%');
  });

  it('has Japanese for Jev categories', () => {
    expect(translate('ja', 'level_4')).toBe('とても難しい');
  });
});

describe('isMessageKey', () => {
  it('recognises Jev category keys', () => {
    expect(isMessageKey('level_0')).toBe(true);
    expect(isMessageKey('nope')).toBe(false);
  });
});

describe('category names', () => {
  // The keys the API server answers with (spec.md > Judgement Keys).
  const keys = [
    ...['level_0', 'level_1', 'level_2', 'level_3', 'level_4'],
    ...['usd_10', 'usd_30', 'usd_100', 'usd_300', 'usd_1000', 'usd_3000'],
    ...['usd_10000', 'usd_30000', 'usd_100000', 'no_price'],
    ...['d1', 'd3', 'w1', 'w2', 'm1', 'm3', 'm6', 'y1'],
  ];

  it('has a name for every key the server sends, in both languages', () => {
    for (const key of keys) {
      expect(isMessageKey(key)).toBe(true);
      if (!isMessageKey(key)) continue;
      expect(translate('en', key)).not.toBe('');
      expect(translate('ja', key)).not.toBe('');
    }
  });
});
