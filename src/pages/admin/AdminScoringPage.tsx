import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Check,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  Trash2,
} from 'lucide-react';
import {
  getScoringRules,
  updateScoringRules,
  resetScoringRules,
  recalculateAll,
  type PointsRule,
} from '@/services/scoringService';
import { ApiError } from '@/lib/apiClient';

const SIZE_EXAMPLES = [
  { label: '≤ 8', entrants: 8 },
  { label: '16', entrants: 16 },
  { label: '32', entrants: 32 },
  { label: '64', entrants: 64 },
  { label: '128', entrants: 128 },
  { label: '256', entrants: 256 },
];

function sizeMultiplier(n: number): number {
  if (n <= 8) return 1;
  return 1 + Math.log2(n / 8);
}

function computePts(base: number, entrants: number): number {
  if (base === 0) return 0;
  return Math.round(base * sizeMultiplier(entrants));
}

type DraftRule = Omit<PointsRule, 'id'> & { _key: string };

let keySeq = 0;
function nextKey() {
  return String(++keySeq);
}

function ruleToDraft(r: PointsRule): DraftRule {
  return { _key: nextKey(), ...r };
}

export default function AdminScoringPage() {
  const [rules, setRules] = useState<DraftRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [recalculating, setRecalculating] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await getScoringRules();
      setRules(data.map(ruleToDraft));
      setDirty(false);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function updateRule(key: string, field: keyof DraftRule, value: string | number) {
    setRules((prev) =>
      prev.map((r) => (r._key === key ? { ...r, [field]: value } : r)),
    );
    setDirty(true);
    setSuccess(null);
  }

  function addRule() {
    const lastOrder = rules.length > 0 ? Math.max(...rules.map((r) => r.sortOrder)) : -1;
    setRules((prev) => [
      ...prev,
      {
        _key: nextKey(),
        label: '',
        placementMin: 1,
        placementMax: 1,
        points: 0,
        sortOrder: lastOrder + 1,
      },
    ]);
    setDirty(true);
    setSuccess(null);
  }

  function removeRule(key: string) {
    setRules((prev) => prev.filter((r) => r._key !== key));
    setDirty(true);
    setSuccess(null);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const saved = await updateScoringRules(
        rules.map((r, i) => ({
          label: r.label,
          placementMin: Number(r.placementMin),
          placementMax: Number(r.placementMax),
          points: Number(r.points),
          sortOrder: i,
        })),
      );
      setRules(saved.map(ruleToDraft));
      setDirty(false);
      setSuccess('Barème enregistré avec succès.');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Erreur de sauvegarde');
    } finally {
      setSaving(false);
    }
  }

  async function handleReset() {
    if (!confirm('Réinitialiser le barème aux valeurs par défaut ?')) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const defaults = await resetScoringRules();
      setRules(defaults.map(ruleToDraft));
      setDirty(false);
      setSuccess('Barème réinitialisé aux valeurs par défaut.');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Erreur');
    } finally {
      setSaving(false);
    }
  }

  async function handleRecalculate() {
    if (
      !confirm(
        'Recalculer les points de toutes les participations existantes avec le barème actuel ?\n\nCette action est irréversible.',
      )
    )
      return;
    setRecalculating(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await recalculateAll();
      setSuccess(
        `Recalcul terminé : ${result.updated} participations mises à jour sur ${result.tournaments} tournois.`,
      );
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Erreur lors du recalcul');
    } finally {
      setRecalculating(false);
    }
  }

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-widest text-white">
            Barème de points
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Définissez les points attribués par placement. Les points finaux sont multipliés selon
            la taille du tournoi.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleReset}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-300 transition hover:border-red-600/60 hover:text-red-400 disabled:opacity-50"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Défauts
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !dirty}
            className="flex items-center gap-1.5 rounded-md bg-gradient-to-r from-red-600 to-orange-500 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow shadow-red-900/40 transition hover:from-red-500 hover:to-orange-400 disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5" />
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </header>

      {error && (
        <div className="mb-4 flex items-start gap-3 rounded-lg border border-red-900/60 bg-red-950/40 p-3 text-sm text-red-300">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="mb-4 flex items-start gap-3 rounded-lg border border-emerald-900/60 bg-emerald-950/40 p-3 text-sm text-emerald-300">
          <Check className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* ---- Barème éditeur ---- */}
      <div className="mb-8 rounded-xl border border-slate-800 bg-slate-900/50 overflow-x-auto">
        <div className="border-b border-slate-800 bg-slate-900 px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-400">
          Règles de base
        </div>
        {loading ? (
          <div className="py-10 text-center text-slate-500">Chargement...</div>
        ) : (
          <table className="w-full min-w-[480px] text-sm">
            <thead className="text-left text-xs text-slate-500 border-b border-slate-800">
              <tr>
                <th className="px-5 py-3">Label</th>
                <th className="px-5 py-3 text-center">Place min</th>
                <th className="px-5 py-3 text-center">Place max</th>
                <th className="px-5 py-3 text-center">Points de base</th>
                <th className="px-5 py-3 w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {rules.map((r) => (
                <tr key={r._key} className="group">
                  <td className="px-5 py-2">
                    <input
                      value={r.label}
                      onChange={(e) => updateRule(r._key, 'label', e.target.value)}
                      placeholder="Ex: 1er"
                      className="w-full rounded border border-slate-700 bg-slate-950 px-2 py-1 text-white focus:border-red-500 focus:outline-none"
                    />
                  </td>
                  <td className="px-5 py-2">
                    <input
                      type="number"
                      min={1}
                      value={r.placementMin}
                      onChange={(e) => updateRule(r._key, 'placementMin', e.target.valueAsNumber)}
                      className="w-20 rounded border border-slate-700 bg-slate-950 px-2 py-1 text-center text-white focus:border-red-500 focus:outline-none"
                    />
                  </td>
                  <td className="px-5 py-2">
                    <input
                      type="number"
                      min={1}
                      value={r.placementMax}
                      onChange={(e) => updateRule(r._key, 'placementMax', e.target.valueAsNumber)}
                      className="w-20 rounded border border-slate-700 bg-slate-950 px-2 py-1 text-center text-white focus:border-red-500 focus:outline-none"
                    />
                  </td>
                  <td className="px-5 py-2">
                    <div className="flex items-center justify-center gap-1">
                      <input
                        type="number"
                        min={0}
                        value={r.points}
                        onChange={(e) => updateRule(r._key, 'points', e.target.valueAsNumber)}
                        className="w-20 rounded border border-slate-700 bg-slate-950 px-2 py-1 text-center font-bold text-red-400 focus:border-red-500 focus:outline-none"
                      />
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() => removeRule(r._key)}
                      className="rounded p-1 text-slate-600 opacity-0 group-hover:opacity-100 transition hover:text-red-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={5} className="px-5 py-3">
                  <button
                    type="button"
                    onClick={addRule}
                    className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Ajouter une règle
                  </button>
                </td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>

      {/* ---- Simulateur ---- */}
      {!loading && rules.length > 0 && (
        <div className="mb-8 rounded-xl border border-slate-800 bg-slate-900/50 overflow-x-auto">
          <div className="border-b border-slate-800 bg-slate-900 px-5 py-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Points finaux par taille de tournoi
            </div>
            <div className="mt-0.5 text-[11px] text-slate-500">
              Formule : points_base × max(1, 1 + log₂(participants ÷ 8))
            </div>
          </div>
          <table className="w-full min-w-[520px] text-xs">
            <thead className="border-b border-slate-800 text-left text-slate-500">
              <tr>
                <th className="px-5 py-3">Placement</th>
                <th className="px-5 py-3 text-center text-slate-400">Base</th>
                {SIZE_EXAMPLES.map((s) => (
                  <th key={s.label} className="px-4 py-3 text-center text-slate-400">
                    {s.label}
                    <br />
                    <span className="text-[10px] text-slate-600">
                      ×{sizeMultiplier(s.entrants).toFixed(1)}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {rules.map((r) => (
                <tr key={r._key} className="hover:bg-slate-800/30">
                  <td className="px-5 py-2 font-semibold text-white">{r.label || '—'}</td>
                  <td className="px-5 py-2 text-center font-bold text-red-400">{r.points}</td>
                  {SIZE_EXAMPLES.map((s) => (
                    <td key={s.label} className="px-4 py-2 text-center text-slate-300">
                      {computePts(Number(r.points), s.entrants)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ---- Recalcul ---- */}
      <div className="rounded-xl border border-slate-700 bg-slate-900/30 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-sm font-bold text-white">Recalculer tous les tournois</div>
            <div className="mt-1 text-xs text-slate-400 max-w-md">
              Applique le barème actuel à l'ensemble des participations existantes. À utiliser
              après avoir modifié et sauvegardé le barème. Cette action est irréversible.
            </div>
          </div>
          <button
            type="button"
            onClick={handleRecalculate}
            disabled={recalculating || dirty}
            className="flex items-center gap-2 rounded-md border border-orange-700/50 bg-orange-950/30 px-4 py-2 text-xs font-bold uppercase tracking-wider text-orange-300 transition hover:border-orange-500/60 hover:text-orange-200 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${recalculating ? 'animate-spin' : ''}`} />
            {recalculating ? 'Recalcul en cours...' : 'Recalculer'}
          </button>
        </div>
        {dirty && (
          <p className="mt-3 text-xs text-amber-400">
            ⚠ Sauvegardez d'abord le barème avant de recalculer.
          </p>
        )}
      </div>
    </div>
  );
}
