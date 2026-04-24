/**
 * Shared types across the application.
 */
export type ApiResponse<T> = {
  data: T;
  message?: string;
};

export type Game =
  | 'Street Fighter 6'
  | 'Tekken 8'
  | 'Guilty Gear Strive'
  | 'Mortal Kombat 1'
  | 'The King of Fighters XV'
  | 'Granblue Fantasy Versus Rising';

export type Player = {
  id: string;
  tag: string;
  name: string;
  country: string;
  mainGame: Game;
  character: string;
  points: number;
  tournamentsPlayed: number;
  wins: number;
  avatarColor: string;
};

export type TournamentStatus = 'upcoming' | 'ongoing' | 'completed';

export type Tournament = {
  id: string;
  name: string;
  game: Game;
  date: string;
  location: string;
  participants: number;
  status: TournamentStatus;
  prizePool?: string;
  winnerId?: string;
};

export type RankingEntry = {
  rank: number;
  playerId: string;
  points: number;
  evolution: number;
};
