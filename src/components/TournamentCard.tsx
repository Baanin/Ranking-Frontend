import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Trophy } from 'lucide-react';
import type { Tournament, TournamentStatus } from '@/types/domain';
import { cn } from '@/lib/utils';

const statusStyles: Record<TournamentStatus, string> = {
  upcoming: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  ongoing: 'bg-green-500/20 text-green-300 border-green-500/40 animate-pulse',
  completed: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
};

const statusLabels: Record<TournamentStatus, string> = {
  upcoming: 'À venir',
  ongoing: 'En cours',
  completed: 'Terminé',
};

export default function TournamentCard({ tournament }: { tournament: Tournament }) {
  const gameName = tournament.game?.name ?? '—';
  const count = tournament.numEntrants;

  return (
    <Link
      to={`/tournaments/${tournament.id}`}
      className="group block rounded-xl border border-slate-800 bg-slate-900/50 p-5 hover:border-red-500/50 hover:bg-slate-900 transition-all"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <span className="text-xs uppercase tracking-widest text-red-400 font-bold">{gameName}</span>
        <span
          className={cn(
            'text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded border',
            statusStyles[tournament.status],
          )}
        >
          {statusLabels[tournament.status]}
        </span>
      </div>

      <h3 className="text-lg font-bold text-white group-hover:text-red-400 transition-colors mb-3">
        {tournament.name}
      </h3>

      <div className="space-y-2 text-sm text-slate-400">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-slate-500" />
          {new Date(tournament.date).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-slate-500" />
          {tournament.location}
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-slate-500" />
          {count} participants
        </div>
        {tournament.prizePool && (
          <div className="flex items-center gap-2 text-yellow-400 font-semibold">
            <Trophy className="h-4 w-4" />
            {tournament.prizePool}
          </div>
        )}
      </div>
    </Link>
  );
}
