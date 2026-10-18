import type { Mission } from '@/domain/types';
import type { MessageKey } from '@/i18n';

type Translate = (key: MessageKey, params?: Record<string, string | number>) => string;

// "20 times" / "20回"; empty for a one-off mission.
export function goalLabel(mission: Pick<Mission, 'unit' | 'target'>, t: Translate): string {
  if (mission.unit === 'percent') return '';
  return t(`goal.${mission.unit}`, { target: mission.target });
}
