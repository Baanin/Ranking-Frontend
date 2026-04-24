import { useEffect, useState } from 'react';
import {
  Download,
  RefreshCw,
  Trash2,
  AlertTriangle,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import {
  listTournaments,
  deleteTournament,
  importTournament,
  resyncTournament,
  type ImportResult,
} from '@/services/tournamentsService';
import { listGames } from '@/services/gamesService';
import { listSeasons } from '@/services/seasonsService';
import type { Tournament, Game, Season } from '@/types/domain';
import { ApiError } from '@/lib/apiClient';

export default function AdminTournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterGameId, setFilterGameId] = useState('');
  const [busy, setBusy] = useState<string | null>(null); // tournament id currently doing an action

  // Import form
  const [importUrl, setImportUrl] = useState('');
  const [importGameId, setImportGameId] = useState('');
  const [importSeasonId, setImportSeasonId] = useState('');
  const [importing, setImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState<ImportResult | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [t, g, s] = await Promise.all([
        listTournaments(filterGameId ? { gameId: filterGameId } : {}),
        listGames(),
        listSeasons(),
      ]);
      setTournaments(t);
      setGames(g);
      setSeasons(s);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterGameId]);

  async function handleImport(e: React.FormEvent) {
    e.preventDefault();
    if (!importUrl.trim()) return;
    setImporting(true);
    setImportError(null);
    setImportSuccess(null);
    try {
      const result = await importTournament({
        url: importUrl.trim(),
        gameId: importGameId || undefined,
        seasonId: importSeasonId || undefined,
      });
      setImportSuccess(result);
      setImportUrl('');
      setImportGameId('');
      setImportSeasonId('');
      await load();
    } catch (err) {
      setImportError(err instanceof ApiError ? err.message : "Erreur d'import");
    } finally {
      setImporting(false);
    }
  }

  async function handleResync(t: Tournament) {
    setBusy(t.id);
    try {
      await resyncTournament(t.id);
      await load();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Erreur de sync');
    } finally {
      setBusy(null);
    }
  }

  async function handleDelete(t: Tournament) {
    if (!confirm(`Supprimer "${t.name}" ? Les participations associées seront perdues.`)) return;
    setBusy(t.id);
    try {
      await deleteTournament(t.id);
      setTournaments((prev) => prev.filter((x) => x.id !== t.id));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Erreur de suppression');
    } finally {
      setBusy(null);
    }
  }

  const filteredSeasons = importGameId ? seasons.filter((s) => s.gameId === importGameId) : seasons;

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-black uppercase tracking-widest text-white">Tournois</h1>
        <p className="mt-1 text-sm text-slate-400">
          {tournaments.length} tournoi{tournaments.length > 1 ? 's' : ''} importé
          {tournaments.length > 1 ? 's' : ''} depuis start.gg
        </p>
      </header>

      {/* Import form */}
      <form
        onSubmit={handleImport}
        className="mb-6 rounded-xl border border-slate-800 bg-slate-900/50 p-5"
      >
        <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white">
          <Download className="h-4 w-4 text-red-400" />
          Importer depuis start.gg
        </h2>
        <div className="grid gap-3 md:grid-cols-[1fr_200px_200px_auto]">
          <input
            type="url"
            placeholder="https://start.gg/tournament/.../event/..."
            value={importUrl}
            onChange={(e) => setImportUrl(e.target.value)}
            required
            className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-500"
          />
          <select
            value={importGameId}
            onChange={(e) => {
              setImportGameId(e.target.value);
              setImportSeasonId('');
            }}
            className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
          >
            <option value="">Jeu : auto</option>
            {games.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
          <select
            value={importSeasonId}
            onChange={(e) => setImportSeasonId(e.target.value)}
            className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
          >
            <option value="">Saison : auto</option>
            {filteredSeasons.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={importing}
            className="flex items-center gap-2 rounded-md bg-gradient-to-r from-red-600 to-orange-500 px-5 py-2 text-xs font-bold uppercase tracking-wider text-white shadow shadow-red-900/40 disabled:opacity-60"
          >
            <Download className="h-4 w-4" />
            {importing ? 'Import...' : 'Importer'}
          </button>
        </div>
        {importError && (
          <div className="mt-3 flex items-start gap-2 rounded-md border border-red-900/60 bg-red-950/40 p-2 text-xs text-red-300">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {importError}
          </div>
        )}
        {importSuccess && (
          <div className="mt-3 flex items-start gap-2 rounded-md border border-emerald-900/60 bg-emerald-950/40 p-3 text-xs text-emerald-200">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
            <div>
              <div className="font-semibold">
                Importé : {importSuccess.tournamentName} ({importSuccess.game.name})
              </div>
              <div className="text-emerald-300/80">
                {importSuccess.totalEntrants} participants · {importSuccess.participationsCreated} participations ·{' '}
                {importSuccess.playersCreated} nouveaux joueurs
                {importSuccess.playersSkipped > 0 && ` · ${importSuccess.playersSkipped} skippés`}
              </div>
            </div>
          </div>
        )}
      </form>

      {/* Filter */}
      <div className="mb-4 flex items-center gap-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Jeu :
        </label>
        <select
          value={filterGameId}
          onChange={(e) => setFilterGameId(e.target.value)}
          className="rounded-md border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-white"
        >
          <option value="">Tous</option>
          {games.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-3 rounded-lg border border-red-900/60 bg-red-950/40 p-3 text-sm text-red-300">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50">
        <table className="w-full text-sm">
          <thead className="bg-slate-900 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-4 py-3">Tournoi</th>
              <th className="px-4 py-3">Jeu / Saison</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3 text-center">Participants</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Sync</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-slate-500">
                  Chargement...
                </td>
              </tr>
            ) : tournaments.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-slate-500">
                  Aucun tournoi importé
                </td>
              </tr>
            ) : (
              tournaments.map((t) => (
                <tr key={t.id} className="hover:bg-slate-900/80">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-white">{t.name}</div>
                    {t.startggSlug && (
                      <a
                        href={`https://start.gg/${t.startggSlug}`}
                        target="_blank"
                        rel="noopener"
                        className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-red-400"
                      >
                        <ExternalLink className="h-2.5 w-2.5" />
                        start.gg
                      </a>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-300">
                    <div>{t.game?.name ?? t.gameId}</div>
                    <div className="text-slate-500">{t.season?.name ?? t.seasonId}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400">
                    {new Date(t.date).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-4 py-3 text-center text-slate-300">{t.numEntrants}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={t.status} />
                  </td>
                  <td className="px-4 py-3 text-[11px] text-slate-500">
                    {t.lastSyncedAt
                      ? new Date(t.lastSyncedAt).toLocaleString('fr-FR')
                      : 'Jamais'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleResync(t)}
                        disabled={busy === t.id || !t.startggSlug}
                        className="rounded-md border border-slate-700 p-1.5 text-slate-300 transition hover:border-red-600/60 hover:text-red-400 disabled:opacity-40"
                        title="Re-sync depuis start.gg"
                      >
                        <RefreshCw
                          className={`h-3.5 w-3.5 ${busy === t.id ? 'animate-spin' : ''}`}
                        />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(t)}
                        disabled={busy === t.id}
                        className="rounded-md border border-slate-700 p-1.5 text-slate-300 transition hover:border-red-600/60 hover:text-red-400 disabled:opacity-40"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    completed: 'bg-emerald-950/60 text-emerald-300 border-emerald-900/50',
    ongoing: 'bg-amber-950/60 text-amber-300 border-amber-900/50',
    upcoming: 'bg-slate-800 text-slate-300 border-slate-700',
  };
  const labels: Record<string, string> = {
    completed: 'Terminé',
    ongoing: 'En cours',
    upcoming: 'À venir',
  };
  return (
    <span
      className={`rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${styles[status] ?? styles.upcoming}`}
    >
      {labels[status] ?? status}
    </span>
  );
}
