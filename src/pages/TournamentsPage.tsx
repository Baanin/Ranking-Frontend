import { useEffect, useState } from 'react';
import TournamentCard from '@/components/TournamentCard';
import { listTournaments } from '@/services/tournamentsService';
import { listGames } from '@/services/gamesService';
import type { Tournament, Game, TournamentStatus } from '@/types/domain';
import { cn } from '@/lib/utils';

const statusFilters: { value: TournamentStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Tous' },
  { value: 'completed', label: 'Terminés' },
  { value: 'ongoing', label: 'En cours' },
  { value: 'upcoming', label: 'À venir' },
];

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState<TournamentStatus | 'all'>('all');
  const [gameId, setGameId] = useState('');

  useEffect(() => {
    listGames().then((g) => setGames(g.filter((x) => x.isActive))).catch(() => undefined);
  }, []);

  useEffect(() => {
    setLoading(true);
    listTournaments({
      status: statusFilter === 'all' ? undefined : statusFilter,
      gameId: gameId || undefined,
    })
      .then(setTournaments)
      .catch(() => setTournaments([]))
      .finally(() => setLoading(false));
  }, [statusFilter, gameId]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-10">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white">
          Les <span className="text-red-500">tournois</span>
        </h1>
        <p className="text-slate-400 mt-2">
          Tournois importés depuis start.gg et pris en compte dans le classement.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-8">
        {statusFilters.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={cn(
              'px-4 py-2 rounded-md text-sm font-semibold uppercase tracking-wider transition-colors',
              statusFilter === f.value
                ? 'bg-red-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700',
            )}
          >
            {f.label}
          </button>
        ))}
        <div className="ml-auto">
          <select
            value={gameId}
            onChange={(e) => setGameId(e.target.value)}
            className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
          >
            <option value="">Tous les jeux</option>
            {games.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <p className="text-center text-slate-500 py-12">Chargement...</p>
      ) : tournaments.length === 0 ? (
        <p className="text-center text-slate-500 py-12">Aucun tournoi dans cette catégorie.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tournaments.map((t) => (
            <TournamentCard key={t.id} tournament={t} />
          ))}
        </div>
      )}
    </div>
  );
}
