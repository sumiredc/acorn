import { type AcornData, initialData } from '@/domain/types';

// Fills fields added since the data was saved, so older saves still load.
export function parseSaved(raw: string | null): AcornData {
  if (!raw) return initialData;
  try {
    const saved = JSON.parse(raw) as Partial<AcornData>;
    const data = { ...initialData, ...saved };
    if (data.week && data.week.status !== 'active') {
      data.week = { ...data.week, status: 'setup' };
    }
    return data;
  } catch {
    return initialData;
  }
}
