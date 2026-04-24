import { apiFetch } from '@/lib/apiClient';
import type { Player } from '@/types/domain';

export function listPlayers(q?: string): Promise<Player[]> {
  const qs = q ? `?q=${encodeURIComponent(q)}` : '';
  return apiFetch<Player[]>(`/players${qs}`);
}

export function getPlayer(id: string): Promise<Player> {
  return apiFetch<Player>(`/players/${id}`);
}

export function updatePlayer(
  id: string,
  data: Partial<Pick<Player, 'tag' | 'name' | 'country' | 'avatarColor' | 'startggUserId' | 'startggSlug'>>,
): Promise<Player> {
  return apiFetch<Player>(`/players/${id}`, { method: 'PATCH', body: data });
}

export function deletePlayer(id: string): Promise<void> {
  return apiFetch<void>(`/players/${id}`, { method: 'DELETE' });
}
