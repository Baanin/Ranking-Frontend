import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/admin/AdminLayout';
import HomePage from './pages/HomePage';
import TournamentsPage from './pages/TournamentsPage';
import TournamentDetailPage from './pages/TournamentDetailPage';
import RankingsPage from './pages/RankingsPage';
import PlayersPage from './pages/PlayersPage';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminAuditLogsPage from './pages/admin/AdminAuditLogsPage';
import AdminTournamentsPage from './pages/admin/AdminTournamentsPage';
import AdminGamesPage from './pages/admin/AdminGamesPage';
import AdminSeasonsPage from './pages/admin/AdminSeasonsPage';
import { PERMISSIONS } from './types/auth';

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
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route
              element={<ProtectedRoute permissions={[PERMISSIONS.MANAGE_USERS]} />}
            >
              <Route path="users" element={<AdminUsersPage />} />
            </Route>
            <Route
              element={<ProtectedRoute permissions={[PERMISSIONS.VIEW_AUDIT_LOGS]} />}
            >
              <Route path="audit" element={<AdminAuditLogsPage />} />
            </Route>
            <Route
              element={<ProtectedRoute permissions={[PERMISSIONS.MANAGE_TOURNAMENTS]} />}
            >
              <Route path="tournaments" element={<AdminTournamentsPage />} />
              <Route path="games" element={<AdminGamesPage />} />
              <Route path="seasons" element={<AdminSeasonsPage />} />
            </Route>
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
