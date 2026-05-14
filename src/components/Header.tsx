import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Swords, LogIn, LogOut, Shield, User, Menu, X } from 'lucide-react';
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
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  return (
    <header className="sticky top-0 z-50 bg-[#0a0a0a]/95 backdrop-blur border-b border-zinc-800">
      {/* Red top stripe */}
      <div className="h-[3px] bg-gradient-to-r from-red-600 via-orange-500 to-red-600" />

      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <NavLink to="/" className="flex items-center gap-3 group" onClick={() => setMenuOpen(false)}>
          <div className="clip-corner flex h-10 w-10 shrink-0 items-center justify-center bg-red-600 group-hover:bg-red-500 transition-colors neon-red">
            <Swords className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-fighting text-xl sm:text-2xl text-white tracking-widest">
              GamersGarden<span className="text-red-500"> Rankings</span>
            </span>
            <span className="hidden sm:block text-[9px] uppercase tracking-[0.3em] text-zinc-500 font-condensed">
              Fighting Game Circuit
            </span>
          </div>
        </NavLink>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-0.5">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                cn(
                  'relative px-4 py-2 text-xs font-condensed font-bold uppercase tracking-[0.15em] transition-colors',
                  isActive
                    ? 'text-red-400 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-red-500'
                    : 'text-zinc-400 hover:text-white',
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
                  'relative ml-2 flex items-center gap-1.5 px-4 py-2 text-xs font-condensed font-bold uppercase tracking-[0.15em] transition-colors',
                  isActive
                    ? 'text-red-400 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-red-500'
                    : 'text-zinc-400 hover:text-white',
                )
              }
            >
              <Shield className="h-3.5 w-3.5" />
              Admin
            </NavLink>
          )}

          <div className="ml-4 pl-4 border-l border-zinc-800">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="hidden items-center gap-2 text-xs text-zinc-400 lg:flex font-condensed uppercase tracking-wider">
                  <User className="h-3.5 w-3.5" />
                  <span>{user?.name}</span>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="clip-btn flex items-center gap-1.5 bg-zinc-900 border border-zinc-700 px-3 py-2 text-xs font-condensed font-bold uppercase tracking-wider text-zinc-300 transition hover:border-red-600 hover:text-red-400"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Déco
                </button>
              </div>
            ) : (
              <NavLink
                to="/login"
                className="clip-btn flex items-center gap-1.5 bg-red-600 hover:bg-red-500 px-4 py-2 text-xs font-condensed font-bold uppercase tracking-[0.15em] text-white transition neon-red"
              >
                <LogIn className="h-3.5 w-3.5" />
                Connexion
              </NavLink>
            )}
          </div>
        </nav>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="md:hidden flex items-center justify-center p-2 text-zinc-400 hover:text-white transition-colors"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Menu"
        >
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-zinc-800 bg-[#0a0a0a] px-4 pb-4 pt-2 space-y-0.5">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                cn(
                  'block px-4 py-3 text-xs font-condensed font-bold uppercase tracking-[0.15em] border-l-2 transition-colors',
                  isActive
                    ? 'text-red-400 border-red-500 bg-red-950/20'
                    : 'text-zinc-400 border-transparent hover:text-white hover:border-zinc-700',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}

          {isAuthenticated && hasPermission(PERMISSIONS.VIEW_ADMIN_PANEL) && (
            <NavLink
              to="/admin"
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2 px-4 py-3 text-xs font-condensed font-bold uppercase tracking-[0.15em] border-l-2 transition-colors',
                  isActive
                    ? 'text-red-400 border-red-500 bg-red-950/20'
                    : 'text-zinc-400 border-transparent hover:text-white hover:border-zinc-700',
                )
              }
            >
              <Shield className="h-3.5 w-3.5" />
              Admin
            </NavLink>
          )}

          <div className="pt-3 mt-2 border-t border-zinc-800">
            {isAuthenticated ? (
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2 text-xs text-zinc-400 font-condensed uppercase tracking-wider">
                  <User className="h-3.5 w-3.5" />
                  <span>{user?.name}</span>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="clip-btn flex items-center gap-1.5 border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs font-condensed font-bold uppercase tracking-wider text-zinc-300 transition hover:border-red-600 hover:text-red-400"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Déco
                </button>
              </div>
            ) : (
              <NavLink
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="clip-btn flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 px-4 py-3 text-sm font-condensed font-bold uppercase tracking-[0.15em] text-white transition"
              >
                <LogIn className="h-4 w-4" />
                Connexion
              </NavLink>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
