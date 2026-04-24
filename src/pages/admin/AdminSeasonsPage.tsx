import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, AlertTriangle, X, Check, Calendar } from 'lucide-react';
import {
  listSeasons,
  createSeason,
  updateSeason,
  deleteSeason,
} from '@/services/seasonsService';
import { listGames } from '@/services/gamesService';
import type { Game, Season } from '@/types/domain';
import { ApiError } from '@/lib/apiClient';

function toDateInput(iso: string): string {
  return iso.slice(0, 10);
}

export default function AdminSeasonsPage() {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Season | 'new' | null>(null);
  const [filterGameId, setFilterGameId] = useState('');

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [s, g] = await Promise.all([listSeasons(filterGameId || undefined), listGames()]);
      setSeasons(s);
      setGames(g);
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

  async function handleDelete(s: Season) {
    if (!confirm(`Supprimer la saison "${s.name}" ?`)) return;
    try {
      await deleteSeason(s.id);
      setSeasons((prev) => prev.filter((x) => x.id !== s.id));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Erreur de suppression');
    }
  }

  function handleSaved(saved: Season) {
    setSeasons((prev) => {
      const idx = prev.findIndex((x) => x.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [saved, ...prev];
    });
    setEditing(null);
  }

  return (
    <div>
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-widest text-white">Saisons</h1>
          <p className="mt-1 text-sm text-slate-400">
            {seasons.length} saison{seasons.length > 1 ? 's' : ''}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEditing('new')}
          disabled={games.length === 0}
          className="flex items-center gap-2 rounded-md bg-gradient-to-r from-red-600 to-orange-500 px-4 py-2 text-sm font-bold uppercase tracking-wider text-white shadow shadow-red-900/40 transition hover:from-red-500 hover:to-orange-400 disabled:opacity-40"
        >
          <Plus className="h-4 w-4" />
          Nouvelle
        </button>
      </header>

      <div className="mb-4 flex items-center gap-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Filtrer par jeu :
        </label>
        <select
          value={filterGameId}
          onChange={(e) => setFilterGameId(e.target.value)}
          className="rounded-md border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-white"
        >
          <option value="">Tous les jeux</option>
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
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Jeu</th>
              <th className="px-4 py-3">Période</th>
              <th className="px-4 py-3">Tournois</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-slate-500">
                  Chargement...
                </td>
              </tr>
            ) : seasons.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-slate-500">
                  Aucune saison
                </td>
              </tr>
            ) : (
              seasons.map((s) => (
                <tr key={s.id} className="hover:bg-slate-900/80">
                  <td className="px-4 py-3 font-semibold text-white">{s.name}</td>
                  <td className="px-4 py-3 text-slate-300">{s.game?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-xs text-slate-400">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {toDateInput(s.startDate)} → {toDateInput(s.endDate)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{s._count?.tournaments ?? 0}</td>
                  <td className="px-4 py-3">
                    {s.isActive ? (
                      <span className="text-xs text-emerald-400">Active</span>
                    ) : (
                      <span className="text-xs text-slate-500">Inactive</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditing(s)}
                        className="rounded-md border border-slate-700 p-1.5 text-slate-300 transition hover:border-red-600/60 hover:text-red-400"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(s)}
                        className="rounded-md border border-slate-700 p-1.5 text-slate-300 transition hover:border-red-600/60 hover:text-red-400"
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

      {editing && (
        <SeasonFormModal
          season={editing === 'new' ? undefined : editing}
          games={games}
          onClose={() => setEditing(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}

function SeasonFormModal({
  season,
  games,
  onClose,
  onSaved,
}: {
  season?: Season;
  games: Game[];
  onClose: () => void;
  onSaved: (s: Season) => void;
}) {
  const [form, setForm] = useState({
    name: season?.name ?? '',
    gameId: season?.gameId ?? games[0]?.id ?? '',
    startDate: season ? toDateInput(season.startDate) : `${new Date().getFullYear()}-01-01`,
    endDate: season ? toDateInput(season.endDate) : `${new Date().getFullYear()}-12-31`,
    isActive: season?.isActive ?? true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setSubmitting(true);
    try {
      const payload = {
        name: form.name,
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate + 'T23:59:59').toISOString(),
        isActive: form.isActive,
      };
      const saved = season
        ? await updateSeason(season.id, payload)
        : await createSeason({ ...payload, gameId: form.gameId });
      onSaved(saved);
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Erreur');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg rounded-xl border border-slate-800 bg-slate-900 p-6"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-black uppercase tracking-widest text-white">
            {season ? 'Modifier la saison' : 'Nouvelle saison'}
          </h2>
          <button type="button" onClick={onClose} className="rounded p-1 text-slate-400">
            <X className="h-4 w-4" />
          </button>
        </div>

        {err && (
          <div className="mb-3 rounded-md border border-red-900/60 bg-red-950/40 p-2 text-xs text-red-300">
            {err}
          </div>
        )}

        <div className="space-y-3 text-sm">
          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Nom
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              placeholder="Ex: SF6 Season 2025"
            />
          </div>
          {!season && (
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Jeu
              </label>
              <select
                value={form.gameId}
                onChange={(e) => setForm({ ...form, gameId: e.target.value })}
                required
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              >
                {games.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Début
              </label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                required
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Fin
              </label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                required
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-slate-300">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            />
            Saison active
          </label>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-700 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-300"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 rounded-md bg-gradient-to-r from-red-600 to-orange-500 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white disabled:opacity-60"
          >
            <Check className="h-3.5 w-3.5" />
            {submitting ? '...' : season ? 'Enregistrer' : 'Créer'}
          </button>
        </div>
      </form>
    </div>
  );
}
