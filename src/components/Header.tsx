import { NavLink } from 'react-router-dom';
import { Swords } from 'lucide-react';
import { cn } from '@/lib/utils';

const links = [
  { to: '/', label: 'Accueil', end: true },
  { to: '/tournaments', label: 'Tournois' },
  { to: '/rankings', label: 'Classement' },
  { to: '/players', label: 'Joueurs' },
];

export default function Header() {
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
        </nav>
      </div>
    </header>
  );
}
