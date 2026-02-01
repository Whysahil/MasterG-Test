import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, Role } from '../types';
import { LogOut, LayoutDashboard, Trophy, History, ShieldAlert } from 'lucide-react';

interface NavbarProps {
  user: User;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path ? "bg-indigo-700 text-white" : "text-indigo-100 hover:bg-indigo-600";

  return (
    <nav className="bg-indigo-800 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-white tracking-wider">Master<span className="text-yellow-400">G</span></span>
            </Link>
            <div className="hidden md:block ml-10 flex items-baseline space-x-4">
              <Link to="/dashboard" className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 ${isActive('/dashboard')}`}>
                <LayoutDashboard size={18} /> Dashboard
              </Link>
              <Link to="/leaderboard" className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 ${isActive('/leaderboard')}`}>
                <Trophy size={18} /> Leaderboard
              </Link>
              <Link to="/history" className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 ${isActive('/history')}`}>
                <History size={18} /> My Attempts
              </Link>
              {user.role === Role.ADMIN && (
                <Link to="/admin" className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 ${isActive('/admin')}`}>
                  <ShieldAlert size={18} /> Admin Panel
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:block text-indigo-200 text-sm">
              Welcome, <span className="font-semibold text-white">{user.name}</span>
            </div>
            <button 
              onClick={onLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-colors"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;