import { apiFetch } from '@/lib/apiClient';
import type { Tournament, TournamentStatus } from '@/types/domain';

export interface ListTournamentsParams {
  status?: TournamentStatus;
  gameId?: string;
  gameSlug?: string;
  seasonId?: string;
}

export function listTournaments(params: ListTournamentsParams = {}): Promise<Tournament[]> {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== '') qs.set(k, String(v));
  });
  const query = qs.toString();
  return apiFetch<Tournament[]>(`/tournaments${query ? `?${query}` : ''}`);
}

export function getTournament(id: string): Promise<Tournament> {
  return apiFetch<Tournament>(`/tournaments/${id}`);
}

export function deleteTournament(id: string): Promise<void> {
  return apiFetch<void>(`/tournaments/${id}`, { method: 'DELETE' });
}

// Admin-only import/resync endpoints
export interface ImportResult {
  tournamentId: string;
  tournamentName: string;
  game: { id: string; name: string };
  season: { id: string; name: string };
  totalEntrants: number;
  participationsCreated: number;
  playersCreated: number;
  playersSkipped: number;
  status: TournamentStatus;
}

export function importTournament(input: {
  url: string;
  gameId?: string;
  seasonId?: string;
}): Promise<ImportResult> {
  return apiFetch<ImportResult>('/admin/tournaments/import', {
    method: 'POST',
    body: input,
  });
}

export function resyncTournament(id: string): Promise<ImportResult> {
  return apiFetch<ImportResult>(`/admin/tournaments/${id}/resync`, { method: 'POST' });
}
