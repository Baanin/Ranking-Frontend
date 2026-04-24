import { Trophy, Swords } from 'lucide-react';
import { players } from '@/data/mockData';
import PlayerAvatar from '@/components/PlayerAvatar';

export default function PlayersPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-10">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white">
          Le <span className="text-red-500">roster</span>
        </h1>
        <p className="text-slate-400 mt-2">
          Les membres de l&apos;association qui font vibrer la scène Versus Fighting.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {players.map((p) => (
          <div
            key={p.id}
            className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 hover:border-red-500/50 transition-colors"
          >
            <div className="flex items-center gap-4 mb-4">
              <PlayerAvatar player={p} size="lg" />
              <div className="min-w-0">
                <div className="text-lg font-bold text-white truncate">{p.tag}</div>
                <div className="text-xs text-slate-400 truncate">{p.name}</div>
                <div className="text-xs text-slate-500 mt-0.5">{p.country}</div>
              </div>
            </div>

            <div className="mb-4">
              <div className="text-[10px] uppercase tracking-widest text-red-400 font-bold">
                Main
              </div>
              <div className="text-sm text-slate-200">{p.mainGame}</div>
              <div className="text-xs text-slate-400">{p.character}</div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-800 text-center">
              <div>
                <div className="text-lg font-black text-red-400">
                  {p.points.toLocaleString('fr-FR')}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500">Pts</div>
              </div>
              <div>
                <div className="text-lg font-black text-white flex items-center justify-center gap-1">
                  <Swords className="h-3.5 w-3.5 text-slate-400" />
                  {p.tournamentsPlayed}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500">Tournois</div>
              </div>
              <div>
                <div className="text-lg font-black text-yellow-400 flex items-center justify-center gap-1">
                  <Trophy className="h-3.5 w-3.5" />
                  {p.wins}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500">Wins</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
