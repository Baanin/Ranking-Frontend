import { useParams, Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Trophy, ArrowLeft } from 'lucide-react';
import { getTournament, getPlayer } from '@/data/mockData';
import PlayerAvatar from '@/components/PlayerAvatar';

export default function TournamentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const tournament = id ? getTournament(id) : undefined;

  if (!tournament) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-20 text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Tournoi introuvable</h1>
        <Link to="/tournaments" className="text-red-400 hover:text-red-300">
          Retour aux tournois
        </Link>
      </div>
    );
  }

  const winner = tournament.winnerId ? getPlayer(tournament.winnerId) : undefined;

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <Link
        to="/tournaments"
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-red-400 mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> Retour aux tournois
      </Link>

      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-8 mb-8">
        <span className="text-xs uppercase tracking-widest text-red-400 font-bold">
          {tournament.game}
        </span>
        <h1 className="text-3xl md:text-4xl font-black uppercase text-white mt-2 mb-6">
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
            {tournament.participants} participants
          </div>
          {tournament.prizePool && (
            <div className="flex items-center gap-3 text-yellow-400 font-semibold">
              <Trophy className="h-5 w-5" />
              Cash prize : {tournament.prizePool}
            </div>
          )}
        </div>
      </div>

      {winner && (
        <div className="rounded-xl border border-yellow-500/40 bg-gradient-to-br from-yellow-950/40 to-slate-900 p-8">
          <div className="text-xs uppercase tracking-widest text-yellow-400 font-bold mb-4">
            🏆 Vainqueur
          </div>
          <div className="flex items-center gap-4">
            <PlayerAvatar player={winner} size="lg" />
            <div>
              <div className="text-2xl font-black text-white">{winner.tag}</div>
              <div className="text-sm text-slate-400">
                {winner.name} · {winner.character} ({winner.mainGame})
              </div>
            </div>
          </div>
        </div>
      )}

      {tournament.status === 'upcoming' && (
        <div className="rounded-xl border border-blue-500/40 bg-blue-950/20 p-8 text-center">
          <p className="text-slate-300 mb-4">Les inscriptions sont ouvertes !</p>
          <button className="rounded-md bg-red-600 hover:bg-red-500 px-6 py-3 font-bold uppercase tracking-wider text-sm text-white transition-colors">
            S&apos;inscrire au tournoi
          </button>
        </div>
      )}
    </div>
  );
}
