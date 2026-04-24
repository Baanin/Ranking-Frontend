import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import TournamentsPage from './pages/TournamentsPage';
import TournamentDetailPage from './pages/TournamentDetailPage';
import RankingsPage from './pages/RankingsPage';
import PlayersPage from './pages/PlayersPage';

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/tournaments" element={<TournamentsPage />} />
        <Route path="/tournaments/:id" element={<TournamentDetailPage />} />
        <Route path="/rankings" element={<RankingsPage />} />
        <Route path="/players" element={<PlayersPage />} />
      </Route>
    </Routes>
  );
}

export default App;
