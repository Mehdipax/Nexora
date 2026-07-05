import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { WalletProvider } from './context/WalletContext';
import { ToastProvider } from './context/ToastContext';
import { GameProvider } from './context/GameContext';
import { AvatarProvider } from './context/AvatarContext';
import GameNotifications from './components/ui/GameNotifications';
import MotionDesignSystem from './components/ui/MotionDesignSystem';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Challenge from './pages/Challenge';
import Leaderboard from './pages/Leaderboard';
import Shop from './pages/Shop';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import { APP_SHELL_PATHS } from './lib/navigation';

function AppRoutes() {
  const location = useLocation();
  const showAppNavigation = APP_SHELL_PATHS.includes(location.pathname);

  return (
    <>
      <Navbar />
      {showAppNavigation && <Sidebar />}
      <div key={location.pathname} className="page-transition-frame">
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/challenge"
            element={
              <ProtectedRoute>
                <Challenge />
              </ProtectedRoute>
            }
          />
          <Route
            path="/shop"
            element={
              <ProtectedRoute>
                <Shop />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </>
  );
}

function App() {
  return (
    <ToastProvider>
      <GameProvider>
        <AvatarProvider>
          <WalletProvider>
            <MotionDesignSystem />
            <GameNotifications />
            <div className="app-content-layer">
              <BrowserRouter>
                <AppRoutes />
              </BrowserRouter>
            </div>
          </WalletProvider>
        </AvatarProvider>
      </GameProvider>
    </ToastProvider>
  );
}

export default App;
