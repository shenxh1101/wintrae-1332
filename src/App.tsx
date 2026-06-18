import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from '@/pages/HomePage';
import MapPage from '@/pages/MapPage';
import PracticePage from '@/pages/PracticePage';
import ChallengePage from '@/pages/ChallengePage';
import ShopPage from '@/pages/ShopPage';
import GamePage from '@/pages/GamePage';
import ParentLoginPage from '@/pages/ParentLoginPage';
import ParentPage from '@/pages/ParentPage';
import { usePlayerStore } from '@/store/usePlayerStore';

function App() {
  const { loadAllData } = usePlayerStore();

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/practice" element={<PracticePage />} />
        <Route path="/challenge" element={<ChallengePage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/game" element={<GamePage />} />
        <Route path="/parent-login" element={<ParentLoginPage />} />
        <Route path="/parent" element={<ParentPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
