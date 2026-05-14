import { useEffect, useRef, useState } from 'react';
import { Search, GitMerge, X, AlertTriangle, CheckCircle } from 'lucide-react';
import PlayerAvatar from '@/components/PlayerAvatar';
import { listPlayers } from '@/services/playersService';
import { apiFetch } from '@/lib/apiClient';
import type { Player } from '@/types/domain';

function mergePlayer(sourceId: string, targetId: string) {
  return apiFetch<{ sourceId: string; targetId: string; participationsMerged: number }>(
    `/players/${sourceId}/merge`,
    { method: 'POST', body: { targetId } },
  );
}

export default function AdminPlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [source, setSource] = useState<Player | null>(null);
  const [showTargetSearch, setShowTargetSearch] = useState(false);
  const [targetSearch, setTargetSearch] = useState('');
  const [targetResults, setTargetResults] = useState<Player[]>([]);
  const [target, setTarget] = useState<Player | null>(null);

  const [merging, setMerging] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const targetSearchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLoading(true);
    listPlayers(search || undefined)
      .then(setPlayers)
      .catch(() => setPlayers([]))
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => {
    if (!targetSearch.trim()) { setTargetResults([]); return; }
    listPlayers(targetSearch)
      .then((p) => setTargetResults(p.filter((x) => x.id !== source?.id && !x.mergedIntoId).slice(0, 8)))
      .catch(() => setTargetResults([]));
  }, [targetSearch, source]);

  function openMergeModal(player: Player) {
    setSource(player);
    setTarget(null);
    setTargetSearch('');
    setTargetResults([]);
    setShowTargetSearch(true);
    setSuccess(null);
    setError(null);
    setTimeout(() => targetSearchRef.current?.focus(), 50);
  }

  function closeModal() {
    setShowTargetSearch(false);
    setSource(null);
    setTarget(null);
    setTargetSearch('');
    setTargetResults([]);
  }

  async function confirmMerge() {
    if (!source || !target) return;
    setMerging(true);
    setError(null);
    try {
      const res = await mergePlayer(source.id, target.id);
      setSuccess(`✓ ${source.tag} fusionné dans ${target.tag} (${res.participationsMerged} participations transférées)`);
      setPlayers((prev) => prev.filter((p) => p.id !== source.id));
      closeModal();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur lors de la fusion');
    } finally {
      setMerging(false);
    }
  }

  const filteredPlayers = players.filter((p) => !p.mergedIntoId);

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-black uppercase tracking-tight text-white">
          Joueurs
        </h1>
        <p className="text-slate-400 mt-1">Recherchez et fusionnez les doublons.</p>
      </header>

      {success && (
        <div className="mb-4 flex items-start gap-3 rounded-lg border border-green-800/60 bg-green-950/40 p-3 text-sm text-green-300">
          <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher par tag, nom ou slug start.gg..."
          className="w-full rounded-md border border-slate-700 bg-slate-900 py-2 pl-9 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500"
        />
      </div>

      {/* List */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-900 border-b border-slate-800">
            <tr className="text-left text-xs uppercase tracking-wider text-slate-400">
              <th className="px-6 py-3">Joueur</th>
              <th className="px-6 py-3 hidden md:table-cell">Pays</th>
              <th className="px-6 py-3 hidden lg:table-cell">Start.gg</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="py-10 text-center text-slate-500">Chargement...</td></tr>
            ) : filteredPlayers.length === 0 ? (
              <tr><td colSpan={4} className="py-10 text-center text-slate-500">Aucun joueur trouvé</td></tr>
            ) : (
              filteredPlayers.map((p) => (
                <tr key={p.id} className="border-b border-slate-800 last:border-0 hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <PlayerAvatar player={p} size="sm" />
                      <div>
                        <div className="font-semibold text-white text-sm">{p.tag}</div>
                        {p.name && <div className="text-xs text-slate-400">{p.name}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3 hidden md:table-cell text-sm text-slate-300">{p.country}</td>
                  <td className="px-6 py-3 hidden lg:table-cell text-xs text-slate-500 font-mono">{p.startggSlug ?? '—'}</td>
                  <td className="px-6 py-3 text-right">
                    <button
                      onClick={() => openMergeModal(p)}
                      className="inline-flex items-center gap-1.5 rounded-md bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
                    >
                      <GitMerge className="h-3.5 w-3.5" />
                      Fusionner
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Merge modal */}
      {showTargetSearch && source && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-black text-white uppercase tracking-tight">Fusionner un joueur</h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Source */}
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase text-slate-400 mb-2">Doublon à supprimer</p>
              <div className="flex items-center gap-3 rounded-lg border border-red-800/50 bg-red-950/30 px-4 py-3">
                <PlayerAvatar player={source} size="sm" />
                <div>
                  <div className="font-bold text-white">{source.tag}</div>
                  <div className="text-xs text-slate-400">{source.country}{source.startggSlug ? ` · ${source.startggSlug}` : ''}</div>
                </div>
              </div>
            </div>

            {/* Target search */}
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase text-slate-400 mb-2">Fusionner dans (joueur canonique)</p>
              {target ? (
                <div className="flex items-center gap-3 rounded-lg border border-green-800/50 bg-green-950/30 px-4 py-3">
                  <PlayerAvatar player={target} size="sm" />
                  <div className="flex-1">
                    <div className="font-bold text-white">{target.tag}</div>
                    <div className="text-xs text-slate-400">{target.country}{target.startggSlug ? ` · ${target.startggSlug}` : ''}</div>
                  </div>
                  <button onClick={() => { setTarget(null); setTargetSearch(''); }} className="text-slate-400 hover:text-white">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    ref={targetSearchRef}
                    value={targetSearch}
                    onChange={(e) => setTargetSearch(e.target.value)}
                    placeholder="Chercher le joueur cible..."
                    className="w-full rounded-md border border-slate-700 bg-slate-800 py-2 pl-9 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  {targetResults.length > 0 && (
                    <ul className="absolute left-0 right-0 top-full mt-1 z-10 rounded-lg border border-slate-700 bg-slate-800 shadow-lg overflow-hidden">
                      {targetResults.map((p) => (
                        <li key={p.id}>
                          <button
                            onClick={() => { setTarget(p); setTargetSearch(''); setTargetResults([]); }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-700 transition-colors text-left"
                          >
                            <PlayerAvatar player={p} size="sm" />
                            <div>
                              <div className="text-sm font-semibold text-white">{p.tag}</div>
                              <div className="text-xs text-slate-400">{p.country}</div>
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {error && (
              <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-900/60 bg-red-950/40 p-3 text-sm text-red-300">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {target && (
              <div className="mb-4 rounded-lg border border-yellow-800/50 bg-yellow-950/30 p-3 text-xs text-yellow-300">
                ⚠️ Les participations de <strong>{source.tag}</strong> seront transférées à <strong>{target.tag}</strong>. En cas de conflit sur un même tournoi, le meilleur placement est conservé. <strong>{source.tag}</strong> sera désactivé.
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <button onClick={closeModal} className="rounded-md px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors">
                Annuler
              </button>
              <button
                onClick={confirmMerge}
                disabled={!target || merging}
                className="inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <GitMerge className="h-4 w-4" />
                {merging ? 'Fusion...' : 'Confirmer la fusion'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
