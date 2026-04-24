import { TrendingUp, TrendingDown, Minus, Trophy } from 'lucide-react';
import { rankings, players } from '@/data/mockData';
import PlayerAvatar from '@/components/PlayerAvatar';
import { cn } from '@/lib/utils';

export default function RankingsPage() {
  const rows = rankings.map((r) => ({
    ...r,
    player: players.find((p) => p.id === r.playerId)!,
  }));

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-10">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white">
          Classement <span className="text-red-500">général</span>
        </h1>
        <p className="text-slate-400 mt-2">Saison 2026 — mis à jour après chaque tournoi.</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50">
        <table className="w-full">
          <thead className="bg-slate-900 border-b border-slate-800">
            <tr className="text-left text-xs uppercase tracking-wider text-slate-400">
              <th className="px-6 py-4 w-16">Rang</th>
              <th className="px-6 py-4">Joueur</th>
              <th className="px-6 py-4 hidden md:table-cell">Jeu principal</th>
              <th className="px-6 py-4 hidden lg:table-cell text-center">Tournois</th>
              <th className="px-6 py-4 hidden lg:table-cell text-center">Victoires</th>
              <th className="px-6 py-4 text-right">Points</th>
              <th className="px-6 py-4 w-20 text-center">Évol.</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
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
                    <PlayerAvatar player={r.player} size="md" />
                    <div>
                      <div className="font-bold text-white">{r.player.tag}</div>
                      <div className="text-xs text-slate-400">
                        {r.player.name} · {r.player.country}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 hidden md:table-cell text-sm text-slate-300">
                  {r.player.mainGame}
                  <div className="text-xs text-slate-500">{r.player.character}</div>
                </td>
                <td className="px-6 py-4 hidden lg:table-cell text-center text-slate-300">
                  {r.player.tournamentsPlayed}
                </td>
                <td className="px-6 py-4 hidden lg:table-cell text-center font-bold text-yellow-400">
                  {r.player.wins}
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-xl font-black text-red-400">
                    {r.points.toLocaleString('fr-FR')}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  {r.evolution > 0 && (
                    <span className="inline-flex items-center gap-1 text-green-400 text-sm font-semibold">
                      <TrendingUp className="h-4 w-4" />+{r.evolution}
                    </span>
                  )}
                  {r.evolution < 0 && (
                    <span className="inline-flex items-center gap-1 text-red-400 text-sm font-semibold">
                      <TrendingDown className="h-4 w-4" />
                      {r.evolution}
                    </span>
                  )}
                  {r.evolution === 0 && (
                    <span className="inline-flex items-center text-slate-500">
                      <Minus className="h-4 w-4" />
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
