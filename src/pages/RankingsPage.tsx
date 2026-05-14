import { useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
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

  const rankStyle = (rank: number) => {
    if (rank === 1) return { row: 'border-l-4 border-l-amber-400 bg-amber-950/10', num: 'text-amber-400', badge: 'bg-amber-400 text-black' };
    if (rank === 2) return { row: 'border-l-4 border-l-zinc-300 bg-zinc-800/10', num: 'text-zinc-300', badge: 'bg-zinc-300 text-black' };
    if (rank === 3) return { row: 'border-l-4 border-l-orange-500 bg-orange-950/10', num: 'text-orange-400', badge: 'bg-orange-500 text-white' };
    return { row: 'border-l-4 border-l-transparent hover:border-l-red-600 hover:bg-zinc-900/60', num: 'text-zinc-600', badge: 'bg-zinc-800 text-zinc-400' };
  };

  return (
    <div onMouseLeave={handleRowLeave}>
      {/* Page header */}
      <div className="border-b border-zinc-800 bg-zinc-950">
        <div className="mx-auto max-w-7xl px-6 pt-10 pb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-[2px] w-8 bg-red-600" />
            <span className="font-condensed text-xs uppercase tracking-[0.3em] text-red-500">
              {currentGame?.name ?? 'Tous les jeux'}
            </span>
          </div>
          <h1 className="font-fighting text-5xl md:text-7xl text-white tracking-wider leading-none">
            Classement <span className="text-red-500">général</span>
          </h1>
          {currentSeason && (
            <p className="font-condensed text-xs uppercase tracking-[0.25em] text-zinc-600 mt-2">
              {currentSeason.name}
            </p>
          )}
        </div>

        {/* Filter tabs */}
        <div className="mx-auto max-w-7xl px-6 pb-0 flex flex-wrap items-end gap-2">
          {games.map((g) => (
            <button
              key={g.id}
              onClick={() => setGameId(g.id)}
              className={cn(
                'font-condensed text-xs font-bold uppercase tracking-[0.15em] px-5 py-2.5 border-t border-x transition-colors',
                gameId === g.id
                  ? 'bg-[#0a0a0a] border-zinc-700 text-white border-b-[#0a0a0a]'
                  : 'bg-zinc-900 border-transparent text-zinc-500 hover:text-zinc-200',
              )}
            >
              {g.name}
            </button>
          ))}
          <div className="ml-auto pb-px">
            <select
              value={seasonId}
              onChange={(e) => setSeasonId(e.target.value)}
              className="font-condensed text-xs uppercase tracking-[0.1em] border border-zinc-700 bg-zinc-900 text-zinc-300 px-3 py-2 focus:outline-none focus:border-red-600"
            >
              <option value="">Toutes les saisons</option>
              {filteredSeasons.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {error && (
          <div className="mb-6 flex items-start gap-3 border-l-4 border-red-600 bg-red-950/30 px-4 py-3 text-sm font-condensed text-red-300">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="overflow-x-auto border border-zinc-800">
          <table className="w-full">
            <thead className="bg-zinc-950 border-b-2 border-zinc-800">
              <tr className="text-left">
                <th className="px-4 py-3 w-14">
                  <span className="font-condensed text-[10px] uppercase tracking-[0.2em] text-zinc-600">Rang</span>
                </th>
                <th className="px-4 py-3">
                  <span className="font-condensed text-[10px] uppercase tracking-[0.2em] text-zinc-600">Joueur</span>
                </th>
                <th className="px-4 py-3 hidden md:table-cell">
                  <span className="font-condensed text-[10px] uppercase tracking-[0.2em] text-zinc-600">Pays</span>
                </th>
                <th className="px-4 py-3 hidden lg:table-cell text-center">
                  <span className="font-condensed text-[10px] uppercase tracking-[0.2em] text-zinc-600">Tournois</span>
                </th>
                <th className="px-4 py-3 hidden lg:table-cell text-center">
                  <span className="font-condensed text-[10px] uppercase tracking-[0.2em] text-zinc-600">Victoires</span>
                </th>
                <th className="px-4 py-3 text-right">
                  <span className="font-condensed text-[10px] uppercase tracking-[0.2em] text-zinc-600">Points</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center font-condensed uppercase tracking-widest text-zinc-700 text-sm">
                    Chargement...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center font-condensed uppercase tracking-widest text-zinc-700 text-sm">
                    Aucun joueur classé
                  </td>
                </tr>
              ) : (
                rows.map((r) => {
                  const rs = rankStyle(r.rank);
                  return (
                    <tr
                      key={r.playerId}
                      className={cn('border-b border-zinc-900 last:border-0 transition-all cursor-pointer', rs.row)}
                      onMouseEnter={(e) => handleRowEnter(r.playerId, e)}
                      onMouseLeave={handleRowLeave}
                    >
                      <td className="px-4 py-4">
                        <span className={cn('font-fighting text-2xl leading-none', rs.num)}>
                          {r.rank}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <PlayerAvatar player={r} size="md" />
                          <div>
                            <div className="font-condensed font-bold text-base uppercase tracking-wide text-white">{r.tag}</div>
                            {r.name && <div className="font-condensed text-xs text-zinc-500 uppercase tracking-wider">{r.name}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell font-condensed text-sm uppercase tracking-wider text-zinc-500">
                        {r.country}
                      </td>
                      <td className="px-4 py-4 hidden lg:table-cell text-center font-condensed text-sm text-zinc-500">
                        {r.tournamentsPlayed}
                      </td>
                      <td className="px-4 py-4 hidden lg:table-cell text-center">
                        <span className="font-fighting text-xl text-amber-400">{r.wins}</span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className="font-fighting text-2xl text-red-500 neon-text">
                          {r.points.toLocaleString('fr-FR')}
                        </span>
                        <span className="font-condensed text-[9px] uppercase tracking-widest text-zinc-700 ml-1">pts</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hover tooltip */}
      {hoveredPlayerId && hoverPos && (
        <div
          className="fixed z-50 w-72 border border-zinc-700 border-l-2 border-l-red-600 bg-zinc-950 shadow-2xl shadow-black p-3"
          style={{ top: hoverPos.top, right: hoverPos.right }}
          onMouseEnter={() => { if (hoverTimeout.current) clearTimeout(hoverTimeout.current); }}
          onMouseLeave={handleRowLeave}
        >
          <p className="font-condensed text-[10px] font-bold uppercase tracking-[0.25em] text-red-500 mb-3">
            Résultats en tournoi
          </p>
          {hoverResults === null ? (
            <p className="font-condensed text-sm text-zinc-600 py-2 text-center uppercase tracking-wider">Chargement...</p>
          ) : hoverResults.length === 0 ? (
            <p className="font-condensed text-sm text-zinc-600 py-2 text-center uppercase tracking-wider">Aucun résultat</p>
          ) : (
            <ul className="space-y-2">
              {hoverResults.map((res) => (
                <li key={res.tournamentId} className="flex items-center gap-2.5 border-b border-zinc-900 pb-2 last:border-0 last:pb-0">
                  <span
                    className={cn(
                      'font-fighting text-lg leading-none w-7 text-center shrink-0',
                      res.placement === 1 && 'text-amber-400',
                      res.placement === 2 && 'text-zinc-300',
                      res.placement === 3 && 'text-orange-500',
                      res.placement > 3 && 'text-zinc-600',
                    )}
                  >
                    {res.placement}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-condensed truncate text-xs font-bold uppercase tracking-wide text-white">{res.tournamentName}</p>
                    <p className="font-condensed text-[10px] text-zinc-600 uppercase tracking-wider">
                      {new Date(res.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      {' · '}
                      <span className="text-red-500 font-bold">{res.points} pts</span>
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
