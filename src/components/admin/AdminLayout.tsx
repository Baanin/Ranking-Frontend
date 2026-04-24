import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, Shield, ScrollText, Trophy, Gamepad2, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { PERMISSIONS, type Permission } from '@/types/auth';

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  end?: boolean;
  requires?: Permission;
}

const items: NavItem[] = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/tournaments', label: 'Tournois', icon: Trophy, requires: PERMISSIONS.MANAGE_TOURNAMENTS },
  { to: '/admin/games', label: 'Jeux', icon: Gamepad2, requires: PERMISSIONS.MANAGE_TOURNAMENTS },
  { to: '/admin/seasons', label: 'Saisons', icon: CalendarDays, requires: PERMISSIONS.MANAGE_TOURNAMENTS },
  { to: '/admin/users', label: 'Administrateurs', icon: Users, requires: PERMISSIONS.MANAGE_USERS },
  { to: '/admin/audit', label: "Journal d'audit", icon: ScrollText, requires: PERMISSIONS.VIEW_AUDIT_LOGS },
];

export default function AdminLayout() {
  const { hasPermission } = useAuth();

  return (
    <div className="mx-auto flex w-full max-w-7xl gap-8 px-6 py-10">
      <aside className="w-60 shrink-0">
        <div className="mb-6 flex items-center gap-2 px-3 text-xs font-bold uppercase tracking-widest text-slate-500">
          <Shield className="h-4 w-4" />
          Panel Admin
        </div>
        <nav className="flex flex-col gap-1">
          {items
            .filter((it) => !it.requires || hasPermission(it.requires))
            .map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold transition',
                      isActive
                        ? 'bg-red-950/40 text-red-400'
                        : 'text-slate-400 hover:bg-slate-800/60 hover:text-white',
                    )
                  }
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              );
            })}
        </nav>
      </aside>

      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
