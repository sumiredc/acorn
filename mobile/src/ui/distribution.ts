import type { Judgement } from '@/domain/types';

export type DistributionRow = { key: string; percent: number; chosen: boolean };

// The status screen shows Jev's top candidates, highest first.
export function topCandidates(judgement: Judgement, limit = 3): DistributionRow[] {
  return Object.entries(judgement.probabilities)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([key, p]) => ({ key, percent: Math.round(p * 100), chosen: key === judgement.choice }));
}
