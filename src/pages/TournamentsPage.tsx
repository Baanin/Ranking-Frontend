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
    <div>
      {/* Page header */}
      <div className="border-b border-zinc-800 bg-zinc-950">
        <div className="mx-auto max-w-7xl px-6 pt-10 pb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-[2px] w-8 bg-red-600" />
            <span className="font-condensed text-xs uppercase tracking-[0.3em] text-red-500">Circuit</span>
          </div>
          <h1 className="font-fighting text-5xl md:text-7xl text-white tracking-wider leading-none">
            Les <span className="text-red-500">tournois</span>
          </h1>
          <p className="font-condensed text-xs uppercase tracking-[0.25em] text-zinc-600 mt-2">
            Importés depuis start.gg · pris en compte dans le classement
          </p>
        </div>

        {/* Filter bar */}
        <div className="mx-auto max-w-7xl px-6 pb-0 flex flex-wrap items-end gap-2">
          {statusFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={cn(
                'font-condensed text-xs font-bold uppercase tracking-[0.15em] px-5 py-2.5 border-t border-x transition-colors',
                statusFilter === f.value
                  ? 'bg-[#0a0a0a] border-zinc-700 text-white'
                  : 'bg-zinc-900 border-transparent text-zinc-500 hover:text-zinc-200',
              )}
            >
              {f.label}
            </button>
          ))}
          <div className="ml-auto pb-px">
            <select
              value={gameId}
              onChange={(e) => setGameId(e.target.value)}
              className="font-condensed text-xs uppercase tracking-[0.1em] border border-zinc-700 bg-zinc-900 text-zinc-300 px-3 py-2 focus:outline-none focus:border-red-600"
            >
              <option value="">Tous les jeux</option>
              {games.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {loading ? (
          <p className="py-16 text-center font-condensed uppercase tracking-widest text-zinc-700 text-sm">
            Chargement...
          </p>
        ) : tournaments.length === 0 ? (
          <p className="py-16 text-center font-condensed uppercase tracking-widest text-zinc-700 text-sm">
            Aucun tournoi dans cette catégorie.
          </p>
        ) : (
          <div className="grid gap-px md:grid-cols-2 lg:grid-cols-3 border border-zinc-800 bg-zinc-800">
            {tournaments.map((t) => (
              <TournamentCard key={t.id} tournament={t} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
