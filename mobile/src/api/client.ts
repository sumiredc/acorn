import type { Judgement, MissionKind, MissionUnit } from '@/domain/types';
import type { ScoredMission } from '@/storage/reducer';

export type ApiError = 'jev_failed' | 'network';
export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: ApiError };

export type JudgedReward = { pt: number; mode: 'price' | 'period'; judgement: Judgement };

export type ApiClient = {
  judgeMissions(
    budgetUsd: number,
    missions: { id: string; name: string; kind: MissionKind; unit: MissionUnit; target: number }[],
  ): Promise<ApiResult<ScoredMission[]>>;
  judgeReward(budgetUsd: number, name: string): Promise<ApiResult<JudgedReward>>;
};

type FetchLike = (url: string, init: RequestInit) => Promise<Response>;

export function createApiClient(fetchFn: FetchLike, baseUrl: string): ApiClient {
  async function post<T>(path: string, body: unknown): Promise<ApiResult<T>> {
    let response: Response;
    try {
      response = await fetchFn(`${baseUrl}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } catch {
      return { ok: false, error: 'network' };
    }
    if (!response.ok) {
      return { ok: false, error: response.status === 502 ? 'jev_failed' : 'network' };
    }
    return { ok: true, data: (await response.json()) as T };
  }

  return {
    async judgeMissions(budgetUsd, missions) {
      const result = await post<{ missions: ScoredMission[] }>('/judge/missions', {
        budgetUsd,
        missions,
      });
      return result.ok ? { ok: true, data: result.data.missions } : result;
    },
    judgeReward(budgetUsd, name) {
      return post<JudgedReward>('/judge/reward', { budgetUsd, name });
    },
  };
}

export const apiClient = createApiClient(
  (url, init) => fetch(url, init),
  process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000',
);
