import type { Locale } from '@/domain/types';

// Language names stay in their own language so either reader can find theirs.
export const LANGUAGES: { value: Locale; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'ja', label: '日本語' },
];

export const NAME_MAX = 20;
