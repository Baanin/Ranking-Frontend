import { apiFetch } from '@/lib/apiClient';
import type { Season } from '@/types/domain';

export interface SeasonInput {
  name: string;
  gameId: string;
  startDate: string; // ISO
  endDate: string;   // ISO
  isActive?: boolean;
}

export function listSeasons(gameId?: string): Promise<Season[]> {
  const qs = gameId ? `?gameId=${encodeURIComponent(gameId)}` : '';
  return apiFetch<Season[]>(`/seasons${qs}`);
}

export function createSeason(input: SeasonInput): Promise<Season> {
  return apiFetch<Season>('/seasons', { method: 'POST', body: input });
}

export function updateSeason(
  id: string,
  input: Partial<Omit<SeasonInput, 'gameId'>>,
): Promise<Season> {
  return apiFetch<Season>(`/seasons/${id}`, { method: 'PATCH', body: input });
}

export function deleteSeason(id: string): Promise<void> {
  return apiFetch<void>(`/seasons/${id}`, { method: 'DELETE' });
}
