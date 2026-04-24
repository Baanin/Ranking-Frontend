import { Users, Trophy, Swords, ScrollText, Gamepad2, CalendarDays } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { PERMISSIONS } from '@/types/auth';

export default function AdminDashboard() {
  const { user, hasPermission } = useAuth();

  const cards = [
    {
      label: 'Administrateurs',
      icon: Users,
      description: 'Gérer les comptes admin et leurs permissions',
      href: '/admin/users',
      visible: hasPermission(PERMISSIONS.MANAGE_USERS),
    },
    {
      label: "Journal d'audit",
      icon: ScrollText,
      description: 'Historique des actions administratives',
      href: '/admin/audit',
      visible: hasPermission(PERMISSIONS.VIEW_AUDIT_LOGS),
    },
    {
      label: 'Tournois',
      icon: Trophy,
      description: 'Importer depuis start.gg et re-synchroniser',
      href: '/admin/tournaments',
      visible: hasPermission(PERMISSIONS.MANAGE_TOURNAMENTS),
    },
    {
      label: 'Jeux',
      icon: Gamepad2,
      description: 'Catalogue des jeux (mapping start.gg)',
      href: '/admin/games',
      visible: hasPermission(PERMISSIONS.MANAGE_TOURNAMENTS),
    },
    {
      label: 'Saisons',
      icon: CalendarDays,
      description: 'Périodes de ranking par jeu',
      href: '/admin/seasons',
      visible: hasPermission(PERMISSIONS.MANAGE_TOURNAMENTS),
    },
    {
      label: 'Joueurs',
      icon: Swords,
      description: 'À venir — roster des joueurs',
      href: '#',
      visible: hasPermission(PERMISSIONS.MANAGE_PLAYERS),
      disabled: true,
    },
  ];

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-black uppercase tracking-widest text-white">
          Bienvenue <span className="text-red-500">{user?.name}</span>
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Rôle <span className="font-mono text-slate-200">{user?.role}</span> —{' '}
          {user?.permissions.length ?? 0} permission(s)
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards
          .filter((c) => c.visible)
          .map((card) => {
            const Icon = card.icon;
            const content = (
              <>
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-red-600 to-orange-500">
                  <Icon className="h-5 w-5 text-white" strokeWidth={2.5} />
                </div>
                <h3 className="text-lg font-bold uppercase tracking-wider text-white">
                  {card.label}
                </h3>
                <p className="mt-1 text-sm text-slate-400">{card.description}</p>
              </>
            );
            return card.disabled ? (
              <div
                key={card.label}
                className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 opacity-60"
              >
                {content}
              </div>
            ) : (
              <a
                key={card.label}
                href={card.href}
                className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 transition hover:-translate-y-0.5 hover:border-red-900/60 hover:bg-slate-900"
              >
                {content}
              </a>
            );
          })}
      </div>
    </div>
  );
}
