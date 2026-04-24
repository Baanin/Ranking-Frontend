import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, TrendingUp, Flame, Swords, ArrowRight } from 'lucide-react';
import TournamentCard from '@/components/TournamentCard';
import PlayerAvatar from '@/components/PlayerAvatar';
import { listTournaments } from '@/services/tournamentsService';
import { listRankings } from '@/services/rankingsService';
import { listGames } from '@/services/gamesService';
import type { Tournament, RankingEntry } from '@/types/domain';

export default function HomePage() {
  const [featuredTournaments, setFeaturedTournaments] = useState<Tournament[]>([]);
  const [recentTournaments, setRecentTournaments] = useState<Tournament[]>([]);
  const [top3, setTop3] = useState<RankingEntry[]>([]);
  const [stats, setStats] = useState({ tournaments: 0, active: 0, games: 0 });

  useEffect(() => {
    Promise.all([
      listTournaments(),
      listRankings(),
      listGames(),
    ])
      .then(([all, ranks, games]) => {
        const upcoming = all.filter((t) => t.status !== 'completed').slice(0, 3);
        const recent = all.filter((t) => t.status === 'completed').slice(0, 3);
        setFeaturedTournaments(upcoming.length > 0 ? upcoming : recent);
        setRecentTournaments(recent);
        setTop3(ranks.data.slice(0, 3));
        setStats({
          tournaments: all.length,
          active: all.filter((t) => t.status !== 'completed').length,
          games: games.filter((g) => g.isActive).length,
        });
      })
      .catch(() => undefined);
  }, []);
  void recentTournaments; // silence unused warning if design changes

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-red-900/40">
        <div className="absolute inset-0 bg-gradient-to-br from-red-950/40 via-slate-950 to-slate-950" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 50%, rgba(239,68,68,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(249,115,22,0.2) 0%, transparent 50%)',
          }}
        />
        <div className="relative mx-auto max-w-7xl px-6 py-24 md:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-red-500/40 bg-red-950/40 px-4 py-1.5 mb-6">
              <Flame className="h-3.5 w-3.5 text-red-400" />
              <span className="text-xs uppercase tracking-[0.25em] font-bold text-red-300">
                Saison 2026 en cours
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tight text-white leading-none mb-6">
              Le classement officiel du
              <br />
              <span className="bg-gradient-to-r from-red-500 to-orange-400 bg-clip-text text-transparent">
                Versus Fighting
              </span>
            </h1>
            <p className="text-lg text-slate-300 mb-8 max-w-2xl">
              Suivez les tournois, consultez le classement des meilleurs joueurs et rejoignez la
              communauté des passionnés de jeux de combat.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/rankings"
                className="inline-flex items-center gap-2 rounded-md bg-red-600 hover:bg-red-500 px-6 py-3 font-bold uppercase tracking-wider text-sm text-white transition-colors"
              >
                Voir le classement
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/tournaments"
                className="inline-flex items-center gap-2 rounded-md border border-slate-600 hover:border-slate-400 px-6 py-3 font-bold uppercase tracking-wider text-sm text-slate-200 transition-colors"
              >
                Tournois à venir
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-b border-slate-800 bg-slate-900/30">
        <div className="mx-auto max-w-7xl px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: Swords, label: 'Joueurs classés', value: top3.length ? '+' : 0 },
            { icon: Trophy, label: 'Tournois', value: stats.tournaments },
            { icon: Flame, label: 'Tournois actifs', value: stats.active },
            { icon: TrendingUp, label: 'Jeux', value: stats.games },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-950/40 border border-red-900/40">
                <s.icon className="h-6 w-6 text-red-400" />
              </div>
              <div>
                <div className="text-3xl font-black text-white">{s.value}</div>
                <div className="text-xs uppercase tracking-wider text-slate-400">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TOP 3 */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tight text-white">
              Top <span className="text-red-500">3</span> de la saison
            </h2>
            <p className="text-slate-400 mt-1">Les joueurs les plus performants du moment</p>
          </div>
          <Link
            to="/rankings"
            className="hidden md:inline-flex items-center gap-1 text-sm font-semibold text-red-400 hover:text-red-300"
          >
            Classement complet <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {top3.length === 0 ? (
            <p className="md:col-span-3 text-slate-500">Aucun classement pour l'instant — importez un tournoi.</p>
          ) : (
            top3.map((entry, idx) => (
              <div
                key={entry.playerId}
                className={`relative overflow-hidden rounded-xl border bg-slate-900/50 p-6 ${
                  idx === 0
                    ? 'border-yellow-500/50 shadow-lg shadow-yellow-500/10'
                    : idx === 1
                      ? 'border-slate-400/40'
                      : 'border-orange-700/40'
                }`}
              >
                <div
                  className={`absolute -top-4 -right-4 text-8xl font-black opacity-10 ${
                    idx === 0 ? 'text-yellow-500' : idx === 1 ? 'text-slate-300' : 'text-orange-600'
                  }`}
                >
                  #{entry.rank}
                </div>
                <div className="relative flex items-center gap-4 mb-4">
                  <PlayerAvatar player={entry} size="lg" />
                  <div>
                    <div className="text-xs uppercase tracking-wider text-slate-400">
                      {entry.country}
                    </div>
                    <div className="text-xl font-bold text-white">{entry.tag}</div>
                    {entry.name && <div className="text-sm text-slate-400">{entry.name}</div>}
                  </div>
                </div>
                <div className="relative flex items-baseline gap-2">
                  <span className="text-3xl font-black text-red-400">
                    {entry.points.toLocaleString('fr-FR')}
                  </span>
                  <span className="text-xs uppercase tracking-wider text-slate-500">points</span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* UPCOMING TOURNAMENTS */}
      <section className="mx-auto max-w-7xl px-6 py-16 border-t border-slate-800">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tight text-white">
              Prochains <span className="text-red-500">tournois</span>
            </h2>
            <p className="text-slate-400 mt-1">Inscrivez-vous aux prochaines compétitions</p>
          </div>
          <Link
            to="/tournaments"
            className="hidden md:inline-flex items-center gap-1 text-sm font-semibold text-red-400 hover:text-red-300"
          >
            Tous les tournois <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {featuredTournaments.map((t) => (
            <TournamentCard key={t.id} tournament={t} />
          ))}
        </div>
      </section>
    </div>
  );
}
