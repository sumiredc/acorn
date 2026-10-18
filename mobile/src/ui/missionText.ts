import type { Mission } from '@/domain/types';
import type { MessageKey } from '@/i18n';

type Translate = (key: MessageKey, params?: Record<string, string | number>) => string;

// "20 times" / "20回"; empty for a one-off mission.
export function goalLabel(mission: Pick<Mission, 'unit' | 'target'>, t: Translate): string {
  if (mission.unit === 'percent') return '';
  return t(`goal.${mission.unit}`, { target: mission.target });
}

// "40%" / "12 / 20 times".
export function progressLabel(
  mission: Pick<Mission, 'unit' | 'target'>,
  value: number,
  t: Translate,
): string {
  return t(`progress.${mission.unit}`, { value, target: mission.target });
}

// "10%" / "5 times": how much one step moves.
export function amountLabel(unit: Mission['unit'], amount: number, t: Translate): string {
  return unit === 'percent' ? `${amount}%` : t(`goal.${unit}`, { target: amount });
}
