import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import api from './api';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import Dashboard from './components/Dashboard';
import EntryEditor from './components/EntryEditor';
import MeditationPlayer from './components/MeditationPlayer';
import Layout from './components/Layout'; // Re-added import
import FluidBackground from './components/FluidBackground';
import RippleEffect from './components/RippleEffect';
import Snowfall from './components/Snowfall';
import FallingLeaves from './components/FallingLeaves';

import SocialHub from './components/SocialHub';
import GroupChat from './components/GroupChat';
import SupportPage from './components/SupportPage';
import Settings from './components/Settings';
import CustomCursor from './components/CustomCursor';
import CursorToggle from './components/CursorToggle';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import AppLockOverlay from './components/AppLockOverlay';
import History from './components/History';

function AppContent() {
  const { season, setTheme } = useTheme();
  const [isUnlocked, setIsUnlocked] = React.useState(false);
  const isAuthenticated = !!localStorage.getItem('token');

  useEffect(() => {
    if (!isAuthenticated) setIsUnlocked(false);
  }, [isAuthenticated]);

  useEffect(() => {
    const syncTheme = async () => {
      if (isAuthenticated) {
        try {
          const res = await api.get('/user/settings');
          if (res.data.themePreference) {
            setTheme(res.data.themePreference);
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
