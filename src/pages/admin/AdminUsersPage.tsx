import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, UserCheck, UserX, AlertTriangle } from 'lucide-react';
import {
  listAdmins,
  deleteAdmin,
  type AdminUser,
} from '@/services/adminUsersService';
import { ApiError } from '@/lib/apiClient';
import { useAuth } from '@/context/AuthContext';
import AdminUserFormModal from '@/components/admin/AdminUserFormModal';

export default function AdminUsersPage() {
  const { user: currentUser, refreshUser } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [editTarget, setEditTarget] = useState<AdminUser | undefined>();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await listAdmins();
      setUsers(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditTarget(undefined);
    setModalMode('create');
  }

  function openEdit(u: AdminUser) {
    setEditTarget(u);
    setModalMode('edit');
  }

  async function handleDelete(u: AdminUser) {
    if (!confirm(`Supprimer l'administrateur ${u.email} ?`)) return;
    setDeletingId(u.id);
    try {
      await deleteAdmin(u.id);
      setUsers((prev) => prev.filter((x) => x.id !== u.id));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Erreur de suppression');
    } finally {
      setDeletingId(null);
    }
  }

  function handleSaved(saved: AdminUser) {
    setUsers((prev) => {
      const idx = prev.findIndex((x) => x.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [saved, ...prev];
    });
    setModalMode(null);
    // If current user edited themselves, refresh context
    if (saved.id === currentUser?.id) refreshUser();
  }

  return (
    <div>
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-widest text-white">
            Administrateurs
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {users.length} compte{users.length > 1 ? 's' : ''}
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
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

      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50">
        <table className="w-full text-sm">
          <thead className="bg-slate-900 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-4 py-3">Utilisateur</th>
              <th className="px-4 py-3">Rôle</th>
              <th className="px-4 py-3">Permissions</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Dernière connexion</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                  Chargement...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                  Aucun administrateur
                </td>
              </tr>
            ) : (
              users.map((u) => {
                const isSelf = u.id === currentUser?.id;
                return (
                  <tr key={u.id} className="hover:bg-slate-900/80">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-white">
                        {u.name}
                        {isSelf && (
                          <span className="ml-2 rounded bg-red-950/60 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-400">
                            Vous
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400">{u.email}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-300">{u.role}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {u.permissions.length === 0 ? (
                          <span className="text-xs text-slate-600">—</span>
                        ) : (
                          u.permissions.map((p) => (
                            <span
                              key={p}
                              className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] text-slate-300"
                            >
                              {p}
                            </span>
                          ))
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {u.isActive ? (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
                          <UserCheck className="h-3.5 w-3.5" />
                          Actif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                          <UserX className="h-3.5 w-3.5" />
                          Inactif
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">
                      {u.lastLoginAt
                        ? new Date(u.lastLoginAt).toLocaleString('fr-FR')
                        : 'Jamais'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(u)}
                          className="rounded-md border border-slate-700 p-1.5 text-slate-300 transition hover:border-red-600/60 hover:text-red-400"
                          title="Éditer"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(u)}
                          disabled={isSelf || deletingId === u.id}
                          className="rounded-md border border-slate-700 p-1.5 text-slate-300 transition hover:border-red-600/60 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-40"
                          title={isSelf ? 'Vous ne pouvez pas vous supprimer' : 'Supprimer'}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {modalMode && (
        <AdminUserFormModal
          mode={modalMode}
          user={editTarget}
          onClose={() => setModalMode(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
