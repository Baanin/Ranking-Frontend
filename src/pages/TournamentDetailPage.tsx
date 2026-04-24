import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Trophy, ArrowLeft, ExternalLink } from 'lucide-react';
import PlayerAvatar from '@/components/PlayerAvatar';
import { getTournament } from '@/services/tournamentsService';
import type { Tournament } from '@/types/domain';

export default function TournamentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getTournament(id)
      .then(setTournament)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-20 text-center text-slate-500">Chargement...</div>
    );
  }

  if (notFound || !tournament) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-20 text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Tournoi introuvable</h1>
        <Link to="/tournaments" className="text-red-400 hover:text-red-300">
          Retour aux tournois
        </Link>
      </div>
    );
  }

  const winner = tournament.winner;

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <Link
        to="/tournaments"
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-red-400 mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> Retour aux tournois
      </Link>

      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-8 mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs uppercase tracking-widest text-red-400 font-bold">
            {tournament.game?.name ?? '—'}
          </span>
          {tournament.season?.name && (
            <span className="text-[11px] uppercase tracking-wider text-slate-500">
              · {tournament.season.name}
            </span>
          )}
        </div>
        <h1 className="text-3xl md:text-4xl font-black uppercase text-white mb-6">
          {tournament.name}
        </h1>

        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-3 text-slate-300">
            <Calendar className="h-5 w-5 text-red-400" />
            {new Date(tournament.date).toLocaleDateString('fr-FR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </div>
          <div className="flex items-center gap-3 text-slate-300">
            <MapPin className="h-5 w-5 text-red-400" />
            {tournament.location}
          </div>
          <div className="flex items-center gap-3 text-slate-300">
            <Users className="h-5 w-5 text-red-400" />
            {tournament.numEntrants} participants
          </div>
          {tournament.prizePool && (
            <div className="flex items-center gap-3 text-yellow-400 font-semibold">
              <Trophy className="h-5 w-5" />
              Cash prize : {tournament.prizePool}
            </div>
          )}
          {tournament.startggSlug && (
            <a
              href={`https://start.gg/${tournament.startggSlug}`}
              target="_blank"
              rel="noopener"
              className="flex items-center gap-3 text-slate-400 hover:text-red-400"
            >
              <ExternalLink className="h-4 w-4" />
              Voir sur start.gg
            </a>
          )}
        </div>
      </div>

      {winner && (
        <div className="rounded-xl border border-yellow-500/40 bg-gradient-to-br from-yellow-950/40 to-slate-900 p-8 mb-8">
          <div className="text-xs uppercase tracking-widest text-yellow-400 font-bold mb-4">
            🏆 Vainqueur
          </div>
          <div className="flex items-center gap-4">
            <PlayerAvatar player={winner} size="lg" />
            <div>
              <div className="text-2xl font-black text-white">{winner.tag}</div>
              {winner.name && <div className="text-sm text-slate-400">{winner.name}</div>}
            </div>
          </div>
        </div>
      )}

      {tournament.entries && tournament.entries.length > 0 && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
          <div className="border-b border-slate-800 bg-slate-900 px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-400">
            Classement du tournoi
          </div>
          <table className="w-full text-sm">
            <thead className="bg-slate-900/50 text-left text-xs text-slate-500">
              <tr>
                <th className="px-6 py-3 w-16">#</th>
                <th className="px-6 py-3">Joueur</th>
                <th className="px-6 py-3 text-right">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {tournament.entries.map((e) => (
                <tr key={e.id} className="hover:bg-slate-800/40">
                  <td className="px-6 py-3 font-mono font-bold text-slate-400">{e.placement}</td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <PlayerAvatar player={e.player} size="sm" />
                      <span className="font-semibold text-white">{e.player.tag}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-right font-bold text-red-400">
                    {e.pointsEarned.toLocaleString('fr-FR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
