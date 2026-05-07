# Cascade Context Dump — Ranking Frontend

> **Pour la prochaine session Cascade.**
> Le contexte **maître** est dans le repo backend : `Ranking-Backend/CASCADE_CONTEXT.md`.
> Lis-le **en premier** — il contient les décisions de design, le modèle de
> données, le système de points, etc. Ce fichier-ci ne couvre que les
> spécificités frontend.

---

## 1. Stack

- **React 18** + **TypeScript**
- **Vite** (dev server :5173)
- **Tailwind CSS** + **shadcn/ui**
- **React Router 6** (BrowserRouter)
- **Lucide** pour les icônes
- API consommée via `fetch` wrappé dans `src/services/api.ts`

---

## 2. Arborescence clé

```
src/
├── types/domain.ts           # mirror des modèles Prisma backend
├── services/
│   ├── api.ts                # fetch wrapper (auth headers, JSON, erreurs)
│   ├── gamesService.ts
│   ├── seasonsService.ts
│   ├── tournamentsService.ts # inclut import + resync
│   ├── playersService.ts
│   └── rankingsService.ts
├── components/
│   ├── PlayerAvatar.tsx
│   ├── TournamentCard.tsx
│   └── admin/
│       ├── AdminLayout.tsx
│       └── AdminDashboard.tsx
├── pages/
│   ├── HomePage.tsx
│   ├── RankingsPage.tsx
│   ├── TournamentsPage.tsx
│   ├── TournamentDetailPage.tsx
│   ├── PlayersPage.tsx
│   └── admin/
│       ├── AdminGamesPage.tsx
│       ├── AdminSeasonsPage.tsx
│       ├── AdminTournamentsPage.tsx
│       └── AdminAuditLogPage.tsx
├── data/mockData.ts          # vidé — stub pour éviter dangling imports
└── App.tsx                   # routing
```

---

## 3. Conventions

### Types
`src/types/domain.ts` mime **exactement** les modèles Prisma. Quand le schéma
backend change, **mettre à jour les deux**.

### Services
Chaque service exporte des fonctions async qui retournent les types domain.
Les erreurs HTTP sont propagées (le wrapper `api.ts` throw sur status >= 400).

### Pages
- Pages publiques : fetch dans `useEffect`, état `loading` / `error` / `data`.
- Pages admin : idem + CRUD avec modales (state local, pas de lib de form).

### Styling
Gradient backgrounds via Tailwind classes stockées en DB (`Game.iconColor`,
`Player.avatarColor`). Format attendu : `"from-X-N to-Y-M"`.

---

## 4. Variables d'env

```
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=Ranking
```

`VITE_API_URL` doit pointer sur le backend, **avec `/api`** à la fin.

---

## 5. Routing

```
/                       HomePage
/rankings               RankingsPage
/tournaments            TournamentsPage
/tournaments/:id        TournamentDetailPage
/players                PlayersPage

/login                  LoginPage
/admin                  AdminDashboard            (protégée)
/admin/games            AdminGamesPage
/admin/seasons          AdminSeasonsPage
/admin/tournaments      AdminTournamentsPage
/admin/audit-logs       AdminAuditLogPage
/admin/users            AdminUsersPage            (pré-refonte)
```

Les routes admin passent par un wrapper d'auth qui redirige vers `/login`
si pas authentifié.

---

## 6. Pièges connus côté front

- **`AdminSeasonsPage`** : le bouton "Nouvelle" est désactivé si aucune game
  n'existe (une saison doit être rattachée à un game). Comportement voulu.
- **`AdminTournamentsPage`** : l'utilisateur doit coller une URL start.gg de
  format `/tournament/<slug>/event/<event-slug>`, pas la page tournoi seule.
  Si erreur 400, c'est souvent ça.
- **`PlayerAvatar`** accepte un shape minimal `{ tag, avatarColor }` — ne pas
  re-typer en `Player` complet.
- **`TournamentCard`** : `game` et `numEntrants` sont optionnels (un tournoi
  peut être renvoyé sans relation game include selon la route).
- **Mock data** : `data/mockData.ts` est volontairement vide. Ne pas le
  re-remplir — tout vient du backend.

---

## 7. Pour la prochaine session

Si l'utilisateur demande de :
- **Ajouter une page** → suivre le pattern existant (service + page + route dans `App.tsx` + lien dans `AdminLayout` si admin).
- **Toucher au modèle** → mettre à jour `domain.ts` ET le schema Prisma backend ensemble.
- **Changer l'auth** → `services/api.ts` gère les headers, `AuthContext` (s'il
  existe) gère le state. Vérifier les deux.
