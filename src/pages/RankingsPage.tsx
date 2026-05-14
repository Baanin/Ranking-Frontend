import { useEffect, useMemo, useRef, useState } from 'react';
import { Trophy, AlertTriangle } from 'lucide-react';
import PlayerAvatar from '@/components/PlayerAvatar';
import { cn } from '@/lib/utils';
import { listGames } from '@/services/gamesService';
import { listSeasons } from '@/services/seasonsService';
import { listRankings } from '@/services/rankingsService';
import { getPlayerResults, type PlayerResult } from '@/services/playersService';
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

  const [hoveredPlayerId, setHoveredPlayerId] = useState<string | null>(null);
  const [hoverResults, setHoverResults] = useState<PlayerResult[] | null>(null);
  const [hoverPos, setHoverPos] = useState<{ top: number; right: number } | null>(null);
  const hoverCache = useRef<Record<string, PlayerResult[]>>({});
  const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  function handleRowEnter(playerId: string, e: { currentTarget: HTMLTableRowElement }) {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    const rect = e.currentTarget.getBoundingClientRect();
    setHoverPos({ top: rect.top, right: window.innerWidth - rect.right + 8 });
    setHoveredPlayerId(playerId);
    if (hoverCache.current[playerId]) {
      setHoverResults(hoverCache.current[playerId]);
    } else {
      setHoverResults(null);
      getPlayerResults(playerId, { gameId: gameId || undefined, seasonId: seasonId || undefined })
        .then((res) => {
          hoverCache.current[playerId] = res;
          setHoverResults(res);
        })
        .catch(() => setHoverResults([]));
    }
  }

  function handleRowLeave() {
    hoverTimeout.current = setTimeout(() => {
      setHoveredPlayerId(null);
      setHoverResults(null);
      setHoverPos(null);
    }, 150);
  }

  const currentGame = games.find((g) => g.id === gameId);
  const currentSeason = seasons.find((s) => s.id === seasonId);

  return (
    <div className="mx-auto max-w-7xl px-6 py-12" onMouseLeave={handleRowLeave}>
      <div className="mb-10">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white">
          Classement <span className="text-red-500">général</span>
        </h1>
        <p className="text-slate-400 mt-2">
          {currentGame?.name}
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

      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/50">
        <table className="w-full">
          <thead className="bg-slate-900 border-b border-slate-800">
            <tr className="text-left text-xs uppercase tracking-wider text-slate-400">
              <th className="px-3 sm:px-6 py-4 w-10 sm:w-16">Rang</th>
              <th className="px-3 sm:px-6 py-4">Joueur</th>
              <th className="px-3 sm:px-6 py-4 hidden md:table-cell">Pays</th>
              <th className="px-3 sm:px-6 py-4 hidden lg:table-cell text-center">Tournois</th>
              <th className="px-3 sm:px-6 py-4 hidden lg:table-cell text-center">Victoires</th>
              <th className="px-3 sm:px-6 py-4 text-right">Points</th>
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
                  className="border-b border-slate-800 last:border-0 hover:bg-slate-800/40 transition-colors cursor-pointer"
                  onMouseEnter={(e) => handleRowEnter(r.playerId, e)}
                  onMouseLeave={handleRowLeave}
                >
                  <td className="px-3 sm:px-6 py-4">
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
                  <td className="px-3 sm:px-6 py-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <PlayerAvatar player={r} size="md" />
                      <div>
                        <div className="font-bold text-white">{r.tag}</div>
                        {r.name && <div className="text-xs text-slate-400">{r.name}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 hidden md:table-cell text-sm text-slate-300">
                    {r.country}
                  </td>
                  <td className="px-3 sm:px-6 py-4 hidden lg:table-cell text-center text-slate-300">
                    {r.tournamentsPlayed}
                  </td>
                  <td className="px-3 sm:px-6 py-4 hidden lg:table-cell text-center font-bold text-yellow-400">
                    {r.wins}
                  </td>
                  <td className="px-3 sm:px-6 py-4 text-right">
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

      {/* Hover tooltip */}
      {hoveredPlayerId && hoverPos && (
        <div
          className="fixed z-50 w-72 rounded-xl border border-slate-700 bg-slate-900 shadow-2xl shadow-black/50 p-3"
          style={{ top: hoverPos.top, right: hoverPos.right }}
          onMouseEnter={() => { if (hoverTimeout.current) clearTimeout(hoverTimeout.current); }}
          onMouseLeave={handleRowLeave}
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Résultats en tournoi</p>
          {hoverResults === null ? (
            <p className="text-sm text-slate-500 py-2 text-center">Chargement...</p>
          ) : hoverResults.length === 0 ? (
            <p className="text-sm text-slate-500 py-2 text-center">Aucun résultat</p>
          ) : (
            <ul className="space-y-1.5">
              {hoverResults.map((res) => (
                <li key={res.tournamentId} className="flex items-center gap-2">
                  <span
                    className={cn(
                      'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black',
                      res.placement === 1 && 'bg-yellow-500 text-slate-900',
                      res.placement === 2 && 'bg-slate-300 text-slate-900',
                      res.placement === 3 && 'bg-orange-600 text-white',
                      res.placement > 3 && 'bg-slate-800 text-slate-300',
                    )}
                  >
                    {res.placement}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-white">{res.tournamentName}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(res.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      {' · '}
                      <span className="text-red-400 font-bold">{res.points} pts</span>
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
