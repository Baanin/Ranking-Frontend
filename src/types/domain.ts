/**
 * Domain types, mirror of the backend Prisma models (subset consumed by the UI).
 */

export interface Game {
  id: string;
  name: string;
  slug: string;
  startggId: number | null;
  iconColor: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: { tournaments: number; seasons: number };
}

export interface Season {
  id: string;
  name: string;
  gameId: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  game?: Pick<Game, 'id' | 'name' | 'slug'>;
  _count?: { tournaments: number };
}

export type TournamentStatus = 'upcoming' | 'ongoing' | 'completed';

export interface Tournament {
  id: string;
  name: string;
  date: string;
  location: string;
  numEntrants: number;
  status: TournamentStatus;
  prizePool: string | null;
  startggSlug: string | null;
  startggEventId: number | null;
  lastSyncedAt: string | null;
  gameId: string;
  seasonId: string;
  winnerId: string | null;
  createdAt: string;
  updatedAt: string;
  game?: Game;
  season?: Season;
  winner?: Player;
  _count?: { entries: number };
  entries?: Array<Participation & { player: Player }>;
}

export interface Player {
  id: string;
  tag: string;
  name: string | null;
  country: string;
  avatarColor: string;
  startggUserId: number | null;
  startggSlug: string | null;
  createdAt: string;
  updatedAt: string;
  participations?: Array<Participation & { tournament: Tournament }>;
}

export interface Participation {
  id: string;
  tournamentId: string;
  playerId: string;
  placement: number;
  pointsEarned: number;
}

export interface RankingEntry {
  rank: number;
  playerId: string;
  tag: string;
  name: string | null;
  country: string;
  avatarColor: string;
  points: number;
  tournamentsPlayed: number;
  wins: number;
}
