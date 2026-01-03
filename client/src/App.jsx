import React, { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import api from './api';
import Layout from './components/Layout';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import CursorToggle from './components/CursorToggle';

// Lazy load components
const Login = lazy(() => import('./components/Login'));
const Register = lazy(() => import('./components/Register'));
const ForgotPassword = lazy(() => import('./components/ForgotPassword'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const EntryEditor = lazy(() => import('./components/EntryEditor'));
const MeditationPlayer = lazy(() => import('./components/MeditationPlayer'));
const FluidBackground = lazy(() => import('./components/FluidBackground'));
const RippleEffect = lazy(() => import('./components/RippleEffect'));
const Snowfall = lazy(() => import('./components/Snowfall'));
const FallingLeaves = lazy(() => import('./components/FallingLeaves'));
const SocialHub = lazy(() => import('./components/SocialHub'));
const GroupChat = lazy(() => import('./components/GroupChat'));
const SupportPage = lazy(() => import('./components/SupportPage'));
const Settings = lazy(() => import('./components/Settings'));
const CustomCursor = lazy(() => import('./components/CustomCursor'));
const AppLockOverlay = lazy(() => import('./components/AppLockOverlay'));
const History = lazy(() => import('./components/History'));

const SimpleLoader = () => (
  <div style={{ 
    height: '100vh', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    background: 'var(--bg-color)',
    color: 'var(--accent-color)',
    fontSize: '1.2em'
  }}>
    <div className="loader-orbit"></div>
    <style>{`
      .loader-orbit {
        width: 50px;
        height: 50px;
        border: 3px solid transparent;
        border-top-color: var(--accent-color);
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
      @keyframes spin { to { transform: rotate(360deg); } }
    `}</style>
  </div>
);

function AppContent() {
  const { season, setTheme } = useTheme();
  const [isUnlocked, setIsUnlocked] = React.useState(false);
  const isAuthenticated = !!localStorage.getItem('token');

  useEffect(() => {
    if (!isAuthenticated) setIsUnlocked(false);
  }, [isAuthenticated]);

  useEffect(() => {
    const syncTheme = async () => {
      // Only sync if authenticated and haven't synced this session
      if (isAuthenticated && !sessionStorage.getItem('themeSynced')) {
        try {
          const res = await api.get('/user/settings');
          if (res.data.themePreference) {
            setTheme(res.data.themePreference);
            sessionStorage.setItem('themeSynced', 'true');
          }
        } catch (err) {
          console.error("Failed to sync theme", err);
        }
      }
    };
    syncTheme();
  }, [isAuthenticated, setTheme]);

  return (
    <Router>
      <Suspense fallback={<SimpleLoader />}>
        <FluidBackground />
        {isAuthenticated && !isUnlocked && <AppLockOverlay onUnlock={() => setIsUnlocked(true)} />}
        {season === 'winter' && <Snowfall />}
        {(season === 'spring' || season === 'autumn') && <FallingLeaves type={season} />}
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route element={<Layout />}>
            <Route path="/" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
            <Route path="/add" element={isAuthenticated ? <EntryEditor /> : <Navigate to="/login" />} />
            <Route path="/meditate" element={isAuthenticated ? <MeditationPlayer /> : <Navigate to="/login" />} />
            <Route path="/social" element={isAuthenticated ? <SocialHub /> : <Navigate to="/login" />} />
            <Route path="/groups/:id" element={isAuthenticated ? <GroupChat /> : <Navigate to="/login" />} />
            <Route path="/support" element={isAuthenticated ? <SupportPage /> : <Navigate to="/login" />} />
            <Route path="/settings" element={isAuthenticated ? <Settings /> : <Navigate to="/login" />} />
            <Route path="/history" element={isAuthenticated ? <History /> : <Navigate to="/login" />} />
          </Route>
        </Routes>
        <CustomCursor />
        <RippleEffect />
        <CursorToggle />
      </Suspense>
    </Router>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
