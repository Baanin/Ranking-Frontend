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
      className="group block border border-zinc-800 bg-zinc-900 p-5 hover:border-red-600/60 hover:bg-zinc-900/80 transition-all clip-corner border-accent"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <span className="font-condensed text-xs uppercase tracking-[0.2em] text-red-400 font-bold">{gameName}</span>
        <span
          className={cn(
            'font-condensed text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 border',
            statusStyles[tournament.status],
          )}
        >
          {statusLabels[tournament.status]}
        </span>
      </div>

      <h3 className="font-condensed text-lg font-bold uppercase tracking-wide text-white group-hover:text-red-400 transition-colors mb-4 leading-tight">
        {tournament.name}
      </h3>

      <div className="space-y-1.5 font-condensed text-sm text-zinc-500">
        <div className="flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5 text-zinc-600 shrink-0" />
          {new Date(tournament.date).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5 text-zinc-600 shrink-0" />
          {tournament.location}
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-3.5 w-3.5 text-zinc-600 shrink-0" />
          {count} participants
        </div>
        {tournament.prizePool && (
          <div className="flex items-center gap-2 text-amber-400 font-bold">
            <Trophy className="h-3.5 w-3.5 shrink-0" />
            {tournament.prizePool}
          </div>
        )}
      </div>
    </Link>
  );
}
