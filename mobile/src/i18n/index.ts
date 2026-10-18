import type { Locale } from '@/domain/types';

import { en } from './en';
import { ja } from './ja';

// ja must have exactly the keys en has; tsc fails on a missing or extra key.
export type Dictionary = Record<keyof typeof en, string>;
export type MessageKey = keyof Dictionary;

const dictionaries: Record<Locale, Dictionary> = { en, ja };

export function resolveLocale(preference: Locale | null, deviceLanguage: string | null): Locale {
  if (preference) return preference;
  return deviceLanguage === 'ja' ? 'ja' : 'en';
}

export function translate(
  locale: Locale,
  key: MessageKey,
  params: Record<string, string | number> = {},
): string {
  // `{name}` fills a parameter; `{name:one|other}` picks a word by whether it is 1.
  return dictionaries[locale][key].replace(
    /\{(\w+)(?::([^|}]*)\|([^}]*))?\}/g,
    (match, name: string, one?: string, other?: string) => {
      if (!(name in params)) return match;
      if (one === undefined) return String(params[name]);
      return Number(params[name]) === 1 ? one : other!;
    },
  );
}

export function isMessageKey(key: string): key is MessageKey {
  return key in en;
}
