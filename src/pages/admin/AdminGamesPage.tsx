import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, AlertTriangle, X, Check } from 'lucide-react';
import {
  listGames,
  createGame,
  updateGame,
  deleteGame,
  type GameInput,
} from '@/services/gamesService';
import type { Game } from '@/types/domain';
import { ApiError } from '@/lib/apiClient';

const ICON_PRESETS = [
  'from-red-500 to-orange-500',
  'from-purple-500 to-pink-500',
  'from-yellow-500 to-red-500',
  'from-blue-500 to-purple-500',
  'from-emerald-500 to-teal-500',
  'from-sky-500 to-indigo-500',
  'from-rose-500 to-red-700',
  'from-amber-500 to-orange-600',
];

export default function AdminGamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Game | 'new' | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setGames(await listGames());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(g: Game) {
    if (!confirm(`Supprimer le jeu "${g.name}" ?`)) return;
    try {
      await deleteGame(g.id);
      setGames((prev) => prev.filter((x) => x.id !== g.id));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Erreur de suppression');
    }
  }

  function handleSaved(saved: Game) {
    setGames((prev) => {
      const idx = prev.findIndex((x) => x.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [...prev, saved].sort((a, b) => a.name.localeCompare(b.name));
    });
    setEditing(null);
  }

  return (
    <div>
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-widest text-white">Jeux</h1>
          <p className="mt-1 text-sm text-slate-400">
            {games.length} jeu{games.length > 1 ? 'x' : ''} configuré{games.length > 1 ? 's' : ''}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEditing('new')}
          className="flex items-center gap-2 rounded-md bg-gradient-to-r from-red-600 to-orange-500 px-4 py-2 text-sm font-bold uppercase tracking-wider text-white shadow shadow-red-900/40 transition hover:from-red-500 hover:to-orange-400"
        >
          <Plus className="h-4 w-4" />
          Nouveau
        </button>
      </header>

      {error && (
        <div className="mb-4 flex items-start gap-3 rounded-lg border border-red-900/60 bg-red-950/40 p-3 text-sm text-red-300">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full py-10 text-center text-slate-500">Chargement...</div>
        ) : games.length === 0 ? (
          <div className="col-span-full py-10 text-center text-slate-500">Aucun jeu</div>
        ) : (
          games.map((g) => (
            <div
              key={g.id}
              className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/50 p-4"
            >
              <div
                className={`h-10 w-10 rounded-lg bg-gradient-to-br ${g.iconColor} shrink-0`}
              />
              <div className="min-w-0 flex-1">
                <div className="truncate font-bold text-white">{g.name}</div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="font-mono">{g.slug}</span>
                  {g.startggId && (
                    <span className="rounded bg-slate-800 px-1 py-0.5 font-mono text-[10px]">
                      sgg:{g.startggId}
                    </span>
                  )}
                  {!g.isActive && (
                    <span className="rounded bg-slate-800 px-1 py-0.5 text-[10px] text-slate-500">
                      inactif
                    </span>
                  )}
                </div>
                <div className="mt-1 text-[11px] text-slate-500">
                  {g._count?.tournaments ?? 0} tournoi{(g._count?.tournaments ?? 0) > 1 ? 's' : ''} ·{' '}
                  {g._count?.seasons ?? 0} saison{(g._count?.seasons ?? 0) > 1 ? 's' : ''}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => setEditing(g)}
                  className="rounded-md border border-slate-700 p-1.5 text-slate-300 transition hover:border-red-600/60 hover:text-red-400"
                  title="Éditer"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(g)}
                  className="rounded-md border border-slate-700 p-1.5 text-slate-300 transition hover:border-red-600/60 hover:text-red-400"
                  title="Supprimer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {editing && (
        <GameFormModal
          game={editing === 'new' ? undefined : editing}
          onClose={() => setEditing(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Modal
// ---------------------------------------------------------------------------

function GameFormModal({
  game,
  onClose,
  onSaved,
}: {
  game?: Game;
  onClose: () => void;
  onSaved: (g: Game) => void;
}) {
  const [form, setForm] = useState<GameInput>({
    name: game?.name ?? '',
    slug: game?.slug ?? '',
    startggId: game?.startggId ?? null,
    iconColor: game?.iconColor ?? ICON_PRESETS[0],
    isActive: game?.isActive ?? true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setSubmitting(true);
    try {
      const saved = game
        ? await updateGame(game.id, form)
        : await createGame(form);
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
            {game ? 'Modifier le jeu' : 'Nouveau jeu'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {err && (
          <div className="mb-3 rounded-md border border-red-900/60 bg-red-950/40 p-2 text-xs text-red-300">
            {err}
          </div>
        )}

        <div className="space-y-3 text-sm">
          <Field label="Nom">
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="input"
            />
          </Field>
          <Field label="Slug">
            <input
              value={form.slug}
              onChange={(e) =>
                setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })
              }
              required
              pattern="[a-z0-9-]+"
              className="input font-mono"
            />
          </Field>
          <Field label="start.gg videogame ID (optionnel)">
            <input
              type="number"
              value={form.startggId ?? ''}
              onChange={(e) =>
                setForm({
                  ...form,
                  startggId: e.target.value === '' ? null : Number(e.target.value),
                })
              }
              className="input"
            />
          </Field>
          <Field label="Couleur">
            <div className="grid grid-cols-4 gap-2">
              {ICON_PRESETS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm({ ...form, iconColor: c })}
                  className={`h-10 rounded-lg bg-gradient-to-br ${c} transition ${
                    form.iconColor === c
                      ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900'
                      : ''
                  }`}
                />
              ))}
            </div>
          </Field>
          <label className="flex items-center gap-2 text-slate-300">
            <input
              type="checkbox"
              checked={form.isActive ?? true}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            />
            Actif
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
            className="flex items-center gap-2 rounded-md bg-gradient-to-r from-red-600 to-orange-500 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow shadow-red-900/40 disabled:opacity-60"
          >
            <Check className="h-3.5 w-3.5" />
            {submitting ? '...' : game ? 'Enregistrer' : 'Créer'}
          </button>
        </div>
      </form>

      <style>{`
        .input {
          width: 100%;
          border-radius: 0.375rem;
          border: 1px solid #334155;
          background: #020617;
          padding: 0.5rem 0.75rem;
          color: #fff;
        }
        .input:focus { outline: none; border-color: #ef4444; box-shadow: 0 0 0 1px rgba(239,68,68,.4); }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </label>
      {children}
    </div>
  );
}
