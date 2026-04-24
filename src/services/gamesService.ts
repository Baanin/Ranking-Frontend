import { apiFetch } from '@/lib/apiClient';
import type { Game } from '@/types/domain';

export type GameInput = {
  name: string;
  slug: string;
  startggId?: number | null;
  iconColor?: string;
  isActive?: boolean;
};

export function listGames(): Promise<Game[]> {
  return apiFetch<Game[]>('/games');
}

export function createGame(input: GameInput): Promise<Game> {
  return apiFetch<Game>('/games', { method: 'POST', body: input });
}

export function updateGame(id: string, input: Partial<GameInput>): Promise<Game> {
  return apiFetch<Game>(`/games/${id}`, { method: 'PATCH', body: input });
}

export function deleteGame(id: string): Promise<void> {
  return apiFetch<void>(`/games/${id}`, { method: 'DELETE' });
}
