import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import type { Permission } from '@/types/auth';

interface ProtectedRouteProps {
  /** Required permissions. User must have ALL of them. */
  permissions?: Permission[];
  /** Redirect destination if unauthenticated. */
  loginPath?: string;
}

export default function ProtectedRoute({
  permissions = [],
  loginPath = '/login',
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated, hasPermission } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-slate-400">
        Chargement...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={loginPath} replace state={{ from: location }} />;
  }

  const missing = permissions.filter((p) => !hasPermission(p));
  if (missing.length > 0) {
    return (
      <div className="mx-auto max-w-lg px-6 py-20 text-center">
        <h1 className="text-2xl font-black uppercase tracking-widest text-red-500">
          Accès refusé
        </h1>
        <p className="mt-4 text-slate-400">
          Votre compte <span className="font-semibold text-slate-200">{user?.email}</span> ne
          dispose pas des permissions requises :
        </p>
        <ul className="mt-3 inline-block text-left text-sm text-slate-300">
          {missing.map((p) => (
            <li key={p} className="font-mono">
              - {p}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return <Outlet />;
}
