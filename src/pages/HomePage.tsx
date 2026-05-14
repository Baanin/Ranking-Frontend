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
  const [stats, setStats] = useState({ tournaments: 0, active: 0, games: 0, players: 0 });

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
          players: ranks.meta.total,
        });
      })
      .catch(() => undefined);
  }, []);
  void recentTournaments; // silence unused warning if design changes

  const maxPoints = top3[0]?.points ?? 1;

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden scanlines border-b border-zinc-800">
        <div className="absolute inset-0 bg-[#0a0a0a]" />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(ellipse 60% 80% at 5% 50%, rgba(239,68,68,0.12) 0%, transparent 70%)',
          }}
        />
        {/* Diagonal accent */}
        <div
          className="absolute right-0 top-0 bottom-0 w-1/3 opacity-5"
          style={{
            backgroundImage: 'repeating-linear-gradient(-55deg, #ef4444 0px, #ef4444 1px, transparent 1px, transparent 18px)',
          }}
        />
        <div className="relative z-10 mx-auto max-w-7xl px-6 py-20 md:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 border border-red-700/60 bg-red-950/30 px-3 py-1 mb-6">
              <Flame className="h-3 w-3 text-red-500" />
              <span className="font-condensed text-[10px] uppercase tracking-[0.3em] font-bold text-red-400">
                Saison 2026 en cours
              </span>
            </div>
            <h1 className="font-fighting text-5xl sm:text-6xl md:text-8xl text-white leading-none mb-2 tracking-wide">
              Le classement officiel
            </h1>
            <h1 className="font-fighting text-5xl sm:text-6xl md:text-8xl leading-none mb-8 tracking-wide neon-text"
              style={{ color: '#ef4444' }}>
              GamersGarden
            </h1>
            <p className="font-condensed text-base text-zinc-400 mb-8 max-w-xl tracking-wide leading-relaxed">
              Suivez les tournois, consultez le classement des meilleurs joueurs et rejoignez la
              communauté des passionnés de jeux de combat.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/rankings"
                className="clip-btn inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 px-6 py-3 font-condensed font-bold uppercase tracking-[0.15em] text-sm text-white transition-colors neon-red"
              >
                Voir le classement
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/tournaments"
                className="clip-btn inline-flex items-center gap-2 border border-zinc-700 hover:border-zinc-500 bg-zinc-900 px-6 py-3 font-condensed font-bold uppercase tracking-[0.15em] text-sm text-zinc-300 hover:text-white transition-colors"
              >
                Tournois à venir
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* STATS — health bar style */}
      <section className="border-b border-zinc-800 bg-zinc-950">
        <div className="mx-auto max-w-7xl px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-zinc-800">
          {[
            { icon: Swords, label: 'Joueurs classés', value: stats.players },
            { icon: Trophy, label: 'Tournois', value: stats.tournaments },
            { icon: Flame, label: 'En cours', value: stats.active },
            { icon: TrendingUp, label: 'Jeux actifs', value: stats.games },
          ].map((s, i) => (
            <div key={s.label} className={`flex flex-col gap-2 px-6 ${i === 0 ? 'pl-0' : ''}`}>
              <div className="flex items-center gap-2">
                <s.icon className="h-3.5 w-3.5 text-red-600" />
                <span className="font-condensed text-[10px] uppercase tracking-[0.2em] text-zinc-600">{s.label}</span>
              </div>
              <div className="font-fighting text-4xl text-white leading-none">{s.value}</div>
              <div className="h-1 bg-zinc-800 w-full">
                <div className="h-full bg-gradient-to-r from-red-600 to-orange-500 w-full" style={{ boxShadow: '0 0 6px rgba(239,68,68,0.5)' }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TOP 3 — VS screen style */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="h-[2px] w-8 bg-red-600" />
              <span className="font-condensed text-xs uppercase tracking-[0.3em] text-red-500">Saison 2026</span>
            </div>
            <h2 className="font-fighting text-4xl md:text-5xl text-white tracking-wider">
              Top <span className="text-red-500">3</span> de la saison
            </h2>
          </div>
          <Link
            to="/rankings"
            className="hidden md:inline-flex items-center gap-1.5 font-condensed text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 hover:text-red-400 transition-colors"
          >
            Classement complet <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid gap-px md:grid-cols-3 border border-zinc-800 bg-zinc-800">
          {top3.length === 0 ? (
            <p className="md:col-span-3 bg-[#0a0a0a] p-8 font-condensed text-zinc-600 uppercase tracking-wider text-sm">
              Aucun classement pour l'instant — importez un tournoi.
            </p>
          ) : (
            top3.map((entry, idx) => {
              const rankColors = [
                { border: 'border-amber-500/60', num: 'text-amber-400', bar: 'from-amber-500 to-yellow-400' },
                { border: 'border-zinc-400/40', num: 'text-zinc-300', bar: 'from-zinc-400 to-zinc-300' },
                { border: 'border-orange-700/50', num: 'text-orange-500', bar: 'from-orange-600 to-red-500' },
              ];
              const rc = rankColors[idx];
              const fillPct = Math.round((entry.points / maxPoints) * 100);
              return (
                <div key={entry.playerId} className={`relative bg-[#0a0a0a] p-6 border-t-2 ${rc.border}`}>
                  <div className={`font-fighting text-7xl absolute top-3 right-4 leading-none opacity-[0.07] ${rc.num}`}>
                    {entry.rank}
                  </div>
                  <div className={`font-fighting text-xs uppercase tracking-[0.3em] mb-4 ${rc.num}`}>
                    #{entry.rank} — {entry.country}
                  </div>
                  <div className="flex items-center gap-3 mb-5">
                    <PlayerAvatar player={entry} size="lg" />
                    <div>
                      <div className="font-fighting text-2xl text-white leading-tight tracking-wide">{entry.tag}</div>
                      {entry.name && <div className="font-condensed text-xs text-zinc-500 uppercase tracking-wider">{entry.name}</div>}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-baseline gap-2">
                      <span className={`font-fighting text-3xl ${rc.num}`}>
                        {entry.points.toLocaleString('fr-FR')}
                      </span>
                      <span className="font-condensed text-[10px] uppercase tracking-widest text-zinc-600">pts</span>
                    </div>
                    <div className="h-1.5 bg-zinc-900 w-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${rc.bar}`}
                        style={{ width: `${fillPct}%`, boxShadow: '0 0 8px rgba(239,68,68,0.4)' }}
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* UPCOMING TOURNAMENTS */}
      <section className="mx-auto max-w-7xl px-6 py-16 border-t border-zinc-800">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="h-[2px] w-8 bg-red-600" />
              <span className="font-condensed text-xs uppercase tracking-[0.3em] text-red-500">Circuit</span>
            </div>
            <h2 className="font-fighting text-4xl md:text-5xl text-white tracking-wider">
              Prochains <span className="text-red-500">tournois</span>
            </h2>
          </div>
          <Link
            to="/tournaments"
            className="hidden md:inline-flex items-center gap-1.5 font-condensed text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 hover:text-red-400 transition-colors"
          >
            Tous les tournois <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid gap-px md:grid-cols-3 border border-zinc-800 bg-zinc-800">
          {featuredTournaments.map((t) => (
            <TournamentCard key={t.id} tournament={t} />
          ))}
        </div>
      </section>
    </div>
  );
}
