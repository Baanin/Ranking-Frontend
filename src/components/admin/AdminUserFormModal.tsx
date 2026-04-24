import { useEffect, useState, type FormEvent } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { ApiError } from '@/lib/apiClient';
import { ALL_PERMISSIONS, type Permission } from '@/types/auth';
import type { AdminUser, CreateAdminInput, UpdateAdminInput } from '@/services/adminUsersService';
import { createAdmin, updateAdmin } from '@/services/adminUsersService';

interface Props {
  mode: 'create' | 'edit';
  user?: AdminUser;
  onClose: () => void;
  onSaved: (user: AdminUser) => void;
}

const ROLES = ['ADMIN', 'MODERATOR'];

export default function AdminUserFormModal({ mode, user, onClose, onSaved }: Props) {
  const [email, setEmail] = useState(user?.email ?? '');
  const [name, setName] = useState(user?.name ?? '');
  const [role, setRole] = useState(user?.role ?? 'ADMIN');
  const [permissions, setPermissions] = useState<Permission[]>(user?.permissions ?? []);
  const [isActive, setIsActive] = useState(user?.isActive ?? true);
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setEmail(user.email);
      setName(user.name);
      setRole(user.role);
      setPermissions(user.permissions);
      setIsActive(user.isActive);
    }
  }, [user]);

  function togglePermission(p: Permission) {
    setPermissions((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      let saved: AdminUser;
      if (mode === 'create') {
        const payload: CreateAdminInput = { email, name, password, role, permissions };
        saved = await createAdmin(payload);
      } else if (user) {
        const payload: UpdateAdminInput = { name, role, permissions, isActive };
        if (password) payload.password = password;
        saved = await updateAdmin(user.id, payload);
      } else {
        throw new Error('Missing user for edit mode');
      }
      onSaved(saved);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erreur inattendue');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-xl border border-slate-800 bg-slate-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <h2 className="text-lg font-bold uppercase tracking-wider text-white">
            {mode === 'create' ? 'Nouvel administrateur' : `Éditer ${user?.name}`}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 transition hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          {error && (
            <div className="flex items-start gap-3 rounded-lg border border-red-900/60 bg-red-950/40 p-3 text-sm text-red-300">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Email
              </label>
              <input
                type="email"
                required
                disabled={mode === 'edit'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500/40 disabled:opacity-60"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Nom
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500/40"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Rôle
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500/40"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                {mode === 'create' ? 'Mot de passe' : 'Nouveau mot de passe (optionnel)'}
              </label>
              <input
                type="password"
                required={mode === 'create'}
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'edit' ? 'Laisser vide pour conserver' : ''}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500/40"
              />
            </div>
          </div>

          <div>
            <div className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Permissions
            </div>
            <div className="grid gap-2 rounded-md border border-slate-800 bg-slate-950/60 p-3 sm:grid-cols-2">
              {ALL_PERMISSIONS.map((p) => (
                <label
                  key={p}
                  className="flex cursor-pointer items-center gap-2 text-sm text-slate-300 hover:text-white"
                >
                  <input
                    type="checkbox"
                    checked={permissions.includes(p)}
                    onChange={() => togglePermission(p)}
                    className="h-4 w-4 rounded border-slate-600 bg-slate-900 accent-red-500"
                  />
                  <span className="font-mono text-xs">{p}</span>
                </label>
              ))}
            </div>
          </div>

          {mode === 'edit' && (
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-slate-600 bg-slate-900 accent-red-500"
              />
              Compte actif
            </label>
          )}

          <div className="flex justify-end gap-3 border-t border-slate-800 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-slate-800"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-gradient-to-r from-red-600 to-orange-500 px-4 py-2 text-sm font-bold uppercase tracking-wider text-white shadow shadow-red-900/40 transition hover:from-red-500 hover:to-orange-400 disabled:opacity-60"
            >
              {submitting ? 'Enregistrement...' : mode === 'create' ? 'Créer' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
