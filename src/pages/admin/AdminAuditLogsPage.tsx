import { useEffect, useMemo, useState } from 'react';
import { Filter, RefreshCw, AlertTriangle, ChevronDown, ChevronRight } from 'lucide-react';
import {
  listAuditActions,
  listAuditLogs,
  type AuditLogEntry,
} from '@/services/auditLogsService';
import { ApiError } from '@/lib/apiClient';

const ACTION_STYLES: Record<string, string> = {
  AUTH_LOGIN_SUCCESS: 'bg-emerald-950/60 text-emerald-300 border-emerald-900/50',
  AUTH_LOGIN_FAILED: 'bg-red-950/60 text-red-300 border-red-900/50',
  AUTH_LOGOUT: 'bg-slate-800 text-slate-300 border-slate-700',
  ADMIN_USER_CREATE: 'bg-sky-950/60 text-sky-300 border-sky-900/50',
  ADMIN_USER_UPDATE: 'bg-amber-950/60 text-amber-300 border-amber-900/50',
  ADMIN_USER_DELETE: 'bg-red-950/60 text-red-300 border-red-900/50',
  TOURNAMENT_CREATE: 'bg-sky-950/60 text-sky-300 border-sky-900/50',
  TOURNAMENT_DELETE: 'bg-red-950/60 text-red-300 border-red-900/50',
  PLAYER_CREATE: 'bg-sky-950/60 text-sky-300 border-sky-900/50',
  PLAYER_DELETE: 'bg-red-950/60 text-red-300 border-red-900/50',
};

function actionStyle(action: string): string {
  return ACTION_STYLES[action] ?? 'bg-slate-800 text-slate-300 border-slate-700';
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [actions, setActions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // Filters
  const [filterAction, setFilterAction] = useState('');
  const [filterEntity, setFilterEntity] = useState('');
  const [filterSearch, setFilterSearch] = useState('');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');

  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const appliedParams = useMemo(
    () => ({
      action: filterAction || undefined,
      entity: filterEntity || undefined,
      search: filterSearch || undefined,
      from: filterFrom ? new Date(filterFrom).toISOString() : undefined,
      to: filterTo ? new Date(filterTo).toISOString() : undefined,
      limit: 50,
    }),
    [filterAction, filterEntity, filterSearch, filterFrom, filterTo],
  );

  async function loadFirstPage() {
    setLoading(true);
    setError(null);
    try {
      const page = await listAuditLogs(appliedParams);
      setLogs(page.data);
      setNextCursor(page.pagination.nextCursor);
      setHasMore(page.pagination.hasMore);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }

  async function loadMore() {
    if (!nextCursor) return;
    setLoadingMore(true);
    try {
      const page = await listAuditLogs({ ...appliedParams, cursor: nextCursor });
      setLogs((prev) => [...prev, ...page.data]);
      setNextCursor(page.pagination.nextCursor);
      setHasMore(page.pagination.hasMore);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erreur de chargement');
    } finally {
      setLoadingMore(false);
    }
  }

  useEffect(() => {
    loadFirstPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    listAuditActions()
      .then(setActions)
      .catch(() => {
        /* silent */
      });
  }, []);

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function resetFilters() {
    setFilterAction('');
    setFilterEntity('');
    setFilterSearch('');
    setFilterFrom('');
    setFilterTo('');
  }

  return (
    <div>
      <header className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-widest text-white">
            Journal d'audit
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Historique des actions administratives ({logs.length} résultat
            {logs.length > 1 ? 's' : ''}
            {hasMore ? '+' : ''})
          </p>
        </div>
        <button
          type="button"
          onClick={loadFirstPage}
          disabled={loading}
          className="flex items-center gap-2 rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-300 transition hover:border-red-600/60 hover:text-red-400 disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Rafraîchir
        </button>
      </header>

      {/* Filters */}
      <div className="mb-4 rounded-xl border border-slate-800 bg-slate-900/50 p-4">
        <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <Filter className="h-4 w-4" />
          Filtres
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500/40"
          >
            <option value="">Toutes les actions</option>
            {actions.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
          <select
            value={filterEntity}
            onChange={(e) => setFilterEntity(e.target.value)}
            className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500/40"
          >
            <option value="">Toutes les entités</option>
            <option value="AdminUser">AdminUser</option>
            <option value="Tournament">Tournament</option>
            <option value="Player">Player</option>
          </select>
          <input
            type="text"
            placeholder="Email, ID ou texte..."
            value={filterSearch}
            onChange={(e) => setFilterSearch(e.target.value)}
            className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500/40"
          />
          <input
            type="datetime-local"
            value={filterFrom}
            onChange={(e) => setFilterFrom(e.target.value)}
            className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500/40"
          />
          <input
            type="datetime-local"
            value={filterTo}
            onChange={(e) => setFilterTo(e.target.value)}
            className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500/40"
          />
        </div>
        <div className="mt-3 flex justify-end gap-2">
          <button
            type="button"
            onClick={resetFilters}
            className="rounded-md border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-400 transition hover:text-white"
          >
            Réinitialiser
          </button>
          <button
            type="button"
            onClick={loadFirstPage}
            className="rounded-md bg-gradient-to-r from-red-600 to-orange-500 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow shadow-red-900/40 transition hover:from-red-500 hover:to-orange-400"
          >
            Appliquer
          </button>
        </div>
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
              <th className="w-8 px-2 py-3" />
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Entité</th>
              <th className="px-4 py-3">Acteur</th>
              <th className="px-4 py-3">IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                  Chargement...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                  Aucune entrée
                </td>
              </tr>
            ) : (
              logs.map((log) => {
                const isOpen = expanded.has(log.id);
                return (
                  <>
                    <tr
                      key={log.id}
                      className="cursor-pointer hover:bg-slate-900/80"
                      onClick={() => toggleExpand(log.id)}
                    >
                      <td className="px-2 py-3 text-slate-500">
                        {isOpen ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-400">
                        {new Date(log.createdAt).toLocaleString('fr-FR')}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded border px-2 py-0.5 font-mono text-[10px] font-bold ${actionStyle(log.action)}`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400">
                        {log.entity ? (
                          <span>
                            <span className="font-semibold text-slate-300">{log.entity}</span>
                            {log.entityId && (
                              <span className="ml-1 text-slate-500">
                                #{log.entityId.slice(0, 8)}
                              </span>
                            )}
                          </span>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-300">
                        {log.actorEmail ?? <span className="text-slate-600">anonymous</span>}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-500">
                        {log.ipAddress ?? '—'}
                      </td>
                    </tr>
                    {isOpen && (
                      <tr key={`${log.id}-details`} className="bg-slate-950/60">
                        <td colSpan={6} className="px-6 py-4">
                          <dl className="grid gap-3 text-xs sm:grid-cols-2">
                            <div>
                              <dt className="mb-1 font-semibold uppercase tracking-wider text-slate-500">
                                Log ID
                              </dt>
                              <dd className="font-mono text-slate-300">{log.id}</dd>
                            </div>
                            <div>
                              <dt className="mb-1 font-semibold uppercase tracking-wider text-slate-500">
                                Entity ID
                              </dt>
                              <dd className="font-mono text-slate-300">
                                {log.entityId ?? '—'}
                              </dd>
                            </div>
                            <div className="sm:col-span-2">
                              <dt className="mb-1 font-semibold uppercase tracking-wider text-slate-500">
                                User Agent
                              </dt>
                              <dd className="break-all text-slate-400">
                                {log.userAgent ?? '—'}
                              </dd>
                            </div>
                            <div className="sm:col-span-2">
                              <dt className="mb-1 font-semibold uppercase tracking-wider text-slate-500">
                                Metadata
                              </dt>
                              <dd>
                                <pre className="overflow-auto rounded-md border border-slate-800 bg-slate-950 p-3 font-mono text-[11px] text-slate-300">
                                  {log.metadata
                                    ? JSON.stringify(log.metadata, null, 2)
                                    : '(vide)'}
                                </pre>
                              </dd>
                            </div>
                          </dl>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })
            )}
          </tbody>
        </table>

        {hasMore && (
          <div className="border-t border-slate-800 p-3 text-center">
            <button
              type="button"
              onClick={loadMore}
              disabled={loadingMore}
              className="rounded-md border border-slate-700 px-4 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-red-600/60 hover:text-red-400 disabled:opacity-60"
            >
              {loadingMore ? 'Chargement...' : 'Charger plus'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
