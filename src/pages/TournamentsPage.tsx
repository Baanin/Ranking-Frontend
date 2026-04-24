import { useState } from 'react';
import { tournaments } from '@/data/mockData';
import TournamentCard from '@/components/TournamentCard';
import type { TournamentStatus } from '@/types';
import { cn } from '@/lib/utils';

const filters: { value: TournamentStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Tous' },
  { value: 'upcoming', label: 'À venir' },
  { value: 'ongoing', label: 'En cours' },
  { value: 'completed', label: 'Terminés' },
];

export default function TournamentsPage() {
  const [filter, setFilter] = useState<TournamentStatus | 'all'>('all');

  const filtered = tournaments.filter((t) => filter === 'all' || t.status === filter);

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-10">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white">
          Les <span className="text-red-500">tournois</span>
        </h1>
        <p className="text-slate-400 mt-2">
          Tous les tournois organisés par l&apos;association et ses partenaires.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              'px-4 py-2 rounded-md text-sm font-semibold uppercase tracking-wider transition-colors',
              filter === f.value
                ? 'bg-red-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((t) => (
          <TournamentCard key={t.id} tournament={t} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-slate-500 py-12">Aucun tournoi dans cette catégorie.</p>
      )}
    </div>
  );
}
