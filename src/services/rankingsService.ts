import { apiFetch } from '@/lib/apiClient';
import type { RankingEntry } from '@/types/domain';

export interface RankingParams {
  gameId?: string;
  gameSlug?: string;
  seasonId?: string;
}

export interface RankingsResult {
  data: RankingEntry[];
  meta: { gameId: string | null; seasonId: string | null; total: number };
}

export function listRankings(params: RankingParams = {}): Promise<RankingsResult> {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v) qs.set(k, String(v));
  });
  const query = qs.toString();
  return apiFetch<RankingsResult>(`/rankings${query ? `?${query}` : ''}`, { raw: true });
}
