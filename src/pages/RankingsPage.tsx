import { useEffect, useMemo, useState } from 'react';
import { Trophy, AlertTriangle } from 'lucide-react';
import PlayerAvatar from '@/components/PlayerAvatar';
import { cn } from '@/lib/utils';
import { listGames } from '@/services/gamesService';
import { listSeasons } from '@/services/seasonsService';
import { listRankings } from '@/services/rankingsService';
import type { Game, Season, RankingEntry } from '@/types/domain';
import { ApiError } from '@/lib/apiClient';

export default function RankingsPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [rows, setRows] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [gameId, setGameId] = useState('');
  const [seasonId, setSeasonId] = useState('');

  // Load refs
  useEffect(() => {
    Promise.all([listGames(), listSeasons()])
      .then(([g, s]) => {
        setGames(g.filter((x) => x.isActive));
        setSeasons(s);
        // default: first game + its active season
        const firstGame = g.find((x) => x.isActive);
        if (firstGame) {
          setGameId(firstGame.id);
          const active = s.find((x) => x.gameId === firstGame.id && x.isActive);
          if (active) setSeasonId(active.id);
        }
      })
      .catch((e) => setError(e instanceof ApiError ? e.message : 'Erreur de chargement'));
  }, []);

  // When gameId changes, pick the active season of that game
  useEffect(() => {
    if (!gameId) return;
    const active = seasons.find((s) => s.gameId === gameId && s.isActive);
    setSeasonId(active?.id ?? '');
  }, [gameId, seasons]);

  // Load rankings whenever filters change
  useEffect(() => {
    setLoading(true);
    setError(null);
    listRankings({
      gameId: gameId || undefined,
      seasonId: seasonId || undefined,
    })
      .then((r) => setRows(r.data))
      .catch((e) => setError(e instanceof ApiError ? e.message : 'Erreur'))
      .finally(() => setLoading(false));
  }, [gameId, seasonId]);

  const filteredSeasons = useMemo(
    () => (gameId ? seasons.filter((s) => s.gameId === gameId) : seasons),
    [gameId, seasons],
  );

  const currentGame = games.find((g) => g.id === gameId);
  const currentSeason = seasons.find((s) => s.id === seasonId);

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-10">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white">
          Classement <span className="text-red-500">général</span>
        </h1>
        <p className="text-slate-400 mt-2">
          {currentGame ? currentGame.name : 'Tous les jeux'}
          {currentSeason && ` · ${currentSeason.name}`}
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-3">
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
        <select
          value={seasonId}
          onChange={(e) => setSeasonId(e.target.value)}
          className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
        >
          <option value="">Toutes les saisons</option>
          {filteredSeasons.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-3 rounded-lg border border-red-900/60 bg-red-950/40 p-3 text-sm text-red-300">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50">
        <table className="w-full">
          <thead className="bg-slate-900 border-b border-slate-800">
            <tr className="text-left text-xs uppercase tracking-wider text-slate-400">
              <th className="px-6 py-4 w-16">Rang</th>
              <th className="px-6 py-4">Joueur</th>
              <th className="px-6 py-4 hidden md:table-cell">Pays</th>
              <th className="px-6 py-4 hidden lg:table-cell text-center">Tournois</th>
              <th className="px-6 py-4 hidden lg:table-cell text-center">Victoires</th>
              <th className="px-6 py-4 text-right">Points</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="py-14 text-center text-slate-500">
                  Chargement...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-14 text-center text-slate-500">
                  Aucun joueur classé pour ce filtre
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr
                  key={r.playerId}
                  className="border-b border-slate-800 last:border-0 hover:bg-slate-800/40 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div
                      className={cn(
                        'inline-flex h-9 w-9 items-center justify-center rounded-full font-black text-sm',
                        r.rank === 1 && 'bg-yellow-500 text-slate-900',
                        r.rank === 2 && 'bg-slate-300 text-slate-900',
                        r.rank === 3 && 'bg-orange-600 text-white',
                        r.rank > 3 && 'bg-slate-800 text-slate-300',
                      )}
                    >
                      {r.rank <= 3 ? <Trophy className="h-4 w-4" /> : r.rank}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <PlayerAvatar player={r} size="md" />
                      <div>
                        <div className="font-bold text-white">{r.tag}</div>
                        {r.name && <div className="text-xs text-slate-400">{r.name}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell text-sm text-slate-300">
                    {r.country}
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell text-center text-slate-300">
                    {r.tournamentsPlayed}
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell text-center font-bold text-yellow-400">
                    {r.wins}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-xl font-black text-red-400">
                      {r.points.toLocaleString('fr-FR')}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
