import { useEffect, useState } from 'react';
import { ExternalLink, Search } from 'lucide-react';
import PlayerAvatar from '@/components/PlayerAvatar';
import { listPlayers } from '@/services/playersService';
import type { Player } from '@/types/domain';

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');

  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(true);
      listPlayers(q || undefined)
        .then(setPlayers)
        .catch(() => setPlayers([]))
        .finally(() => setLoading(false));
    }, 200);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-10">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white">
          Le <span className="text-red-500">roster</span>
        </h1>
        <p className="text-slate-400 mt-2">
          Joueurs référencés à partir des tournois importés.
        </p>
      </div>

      <div className="mb-6 relative max-w-md">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Rechercher un tag, un nom..."
          className="w-full rounded-md border border-slate-700 bg-slate-900 pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:border-red-500 focus:outline-none"
        />
      </div>

      {loading ? (
        <p className="text-center text-slate-500 py-12">Chargement...</p>
      ) : players.length === 0 ? (
        <p className="text-center text-slate-500 py-12">Aucun joueur trouvé</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {players.map((p) => (
            <div
              key={p.id}
              className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 hover:border-red-500/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <PlayerAvatar player={p} size="lg" />
                <div className="min-w-0">
                  <div className="text-lg font-bold text-white truncate">{p.tag}</div>
                  {p.name && (
                    <div className="text-xs text-slate-400 truncate">{p.name}</div>
                  )}
                  <div className="text-xs text-slate-500 mt-0.5">{p.country}</div>
                </div>
              </div>
              {p.startggSlug && (
                <a
                  href={`https://start.gg/${p.startggSlug}`}
                  target="_blank"
                  rel="noopener"
                  className="mt-3 inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-red-400"
                >
                  <ExternalLink className="h-3 w-3" />
                  start.gg
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
