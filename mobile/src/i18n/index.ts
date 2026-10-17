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
  return dictionaries[locale][key].replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match,
  );
}

export function isMessageKey(key: string): key is MessageKey {
  return key in en;
}
