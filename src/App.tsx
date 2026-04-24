import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import TournamentsPage from './pages/TournamentsPage';
import TournamentDetailPage from './pages/TournamentDetailPage';
import RankingsPage from './pages/RankingsPage';
import PlayersPage from './pages/PlayersPage';
import LoginPage from './pages/LoginPage';
import { useAuth } from './context/AuthContext';
import { PERMISSIONS } from './types/auth';

function AdminPlaceholder() {
  const { user } = useAuth();
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 text-center">
      <h1 className="text-3xl font-black uppercase tracking-widest text-white">
        Bienvenue <span className="text-red-500">{user?.name}</span>
      </h1>
      <p className="mt-3 text-slate-400">
        Rôle: <span className="font-mono text-slate-200">{user?.role}</span>
      </p>
      <p className="mt-1 text-slate-400">
        Permissions: <span className="font-mono text-slate-200">{user?.permissions.join(', ') || '(aucune)'}</span>
      </p>
      <p className="mt-6 text-sm text-slate-500">
        Le panel d'administration complet sera ajouté à l'étape 4.
      </p>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/tournaments" element={<TournamentsPage />} />
        <Route path="/tournaments/:id" element={<TournamentDetailPage />} />
        <Route path="/rankings" element={<RankingsPage />} />
        <Route path="/players" element={<PlayersPage />} />

        <Route element={<ProtectedRoute permissions={[PERMISSIONS.VIEW_ADMIN_PANEL]} />}>
          <Route path="/admin" element={<AdminPlaceholder />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
