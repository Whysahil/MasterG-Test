import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { User, Role } from './types';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TestScreen from './pages/TestScreen';
import ResultScreen from './pages/ResultScreen';
import Leaderboard from './pages/Leaderboard';
import AttemptHistory from './pages/AttemptHistory';
import MistakeBook from './pages/MistakeBook';
import AdminPanel from './pages/AdminPanel';
import Layout from './components/Layout';

export default function App() {
  const [user, setUser] = useState<User | null>(null);

  // Restore session from memory on load (Simulate Token persistence)
  useEffect(() => {
      // In a real app, verify JWT here
      const savedUser = localStorage.getItem('masterg_session_user');
      if (savedUser) {
          setUser(JSON.parse(savedUser));
      }
  }, []);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    localStorage.setItem('masterg_session_user', JSON.stringify(loggedInUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('masterg_session_user');
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/dashboard" />} />
        
        {/* PUBLIC / PROTECTED USER ROUTES */}
        <Route path="/dashboard" element={user ? <Layout user={user} onLogout={handleLogout}><Dashboard user={user} /></Layout> : <Navigate to="/" />} />
        <Route path="/result" element={user ? <Layout user={user} onLogout={handleLogout}><ResultScreen /></Layout> : <Navigate to="/" />} />
        <Route path="/leaderboard" element={user ? <Layout user={user} onLogout={handleLogout}><Leaderboard /></Layout> : <Navigate to="/" />} />
        <Route path="/history" element={user ? <Layout user={user} onLogout={handleLogout}><AttemptHistory user={user} /></Layout> : <Navigate to="/" />} />
        <Route path="/mistakes" element={user ? <Layout user={user} onLogout={handleLogout}><MistakeBook user={user} /></Layout> : <Navigate to="/" />} />

        {/* 
            STRICT ADMIN ROUTE PROTECTION 
            If user is logged in BUT is NOT Admin -> Redirect to Dashboard 
        */}
        <Route path="/admin" element={
            user?.role === Role.ADMIN 
            ? <Layout user={user} onLogout={handleLogout}><AdminPanel /></Layout> 
            : user 
                ? <Navigate to="/dashboard" /> 
                : <Navigate to="/" />
        } />

        {/* Standalone Test Screen */}
        <Route path="/test/:testId" element={user ? <TestScreen user={user} /> : <Navigate to="/" />} />
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
