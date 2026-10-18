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
