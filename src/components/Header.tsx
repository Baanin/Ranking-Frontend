import { NavLink, useNavigate } from 'react-router-dom';
import { Swords, LogIn, LogOut, Shield, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { PERMISSIONS } from '@/types/auth';

const links = [
  { to: '/', label: 'Accueil', end: true },
  { to: '/tournaments', label: 'Tournois' },
  { to: '/rankings', label: 'Classement' },
  { to: '/players', label: 'Joueurs' },
];

export default function Header() {
  const { user, isAuthenticated, logout, hasPermission } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  return (
    <header className="sticky top-0 z-50 border-b border-red-900/40 bg-slate-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <NavLink to="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-red-600 to-orange-500 shadow-lg shadow-red-900/50 group-hover:shadow-red-500/50 transition-shadow">
            <Swords className="h-6 w-6 text-white" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-lg font-black uppercase tracking-widest text-white">
              VS<span className="text-red-500">Ranking</span>
            </span>
            <span className="text-[10px] uppercase tracking-[0.25em] text-slate-400">
              Fighting Game Association
            </span>
          </div>
        </NavLink>

        <nav className="flex items-center gap-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                cn(
                  'px-4 py-2 text-sm font-semibold uppercase tracking-wider rounded-md transition-colors',
                  isActive
                    ? 'text-red-400 bg-red-950/40'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}

          {isAuthenticated && hasPermission(PERMISSIONS.VIEW_ADMIN_PANEL) && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                cn(
                  'ml-2 flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-semibold uppercase tracking-wider transition-colors',
                  isActive
                    ? 'bg-red-950/40 text-red-400'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white',
                )
              }
            >
              <Shield className="h-4 w-4" />
              Admin
            </NavLink>
          )}

          <div className="ml-4 border-l border-slate-800 pl-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="hidden items-center gap-2 text-sm text-slate-300 sm:flex">
                  <User className="h-4 w-4 text-slate-500" />
                  <span className="font-semibold">{user?.name}</span>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-300 transition hover:border-red-600/60 hover:text-red-400"
                >
                  <LogOut className="h-4 w-4" />
                  Déconnexion
                </button>
              </div>
            ) : (
              <NavLink
                to="/login"
                className="flex items-center gap-1.5 rounded-md bg-gradient-to-r from-red-600 to-orange-500 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow shadow-red-900/40 transition hover:from-red-500 hover:to-orange-400"
              >
                <LogIn className="h-4 w-4" />
                Connexion
              </NavLink>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
