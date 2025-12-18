import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import Dashboard from './components/Dashboard';
import EntryEditor from './components/EntryEditor';
import MeditationPlayer from './components/MeditationPlayer';
import Layout from './components/Layout'; // Re-added import
import FluidBackground from './components/FluidBackground';
import RippleEffect from './components/RippleEffect';

import SocialHub from './components/SocialHub';
import GroupChat from './components/GroupChat';
import SupportPage from './components/SupportPage';
import Settings from './components/Settings';
import CustomCursor from './components/CustomCursor';
import { ThemeProvider } from './contexts/ThemeContext';


function App() {
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <ThemeProvider>
      <Router>
        <CustomCursor />
        <FluidBackground />
        <RippleEffect />
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
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );

}

export default App;
