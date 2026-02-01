
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, Role } from '../types';
import { 
  LogOut, LayoutDashboard, Trophy, History, ShieldAlert, 
  Menu, X, BookX, Zap 
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const closeSidebar = () => setSidebarOpen(false);

  const isActive = (path: string) => 
    location.pathname === path ? "bg-indigo-700 text-white shadow-md" : "text-indigo-100 hover:bg-indigo-700 hover:text-white";

  const NavItem = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => (
    <Link 
      to={to} 
      onClick={closeSidebar}
      className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${isActive(to)}`}
    >
      <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
      {label}
    </Link>
  );

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 md:hidden transition-opacity"
          onClick={closeSidebar}
        ></div>
      )}

      {/* Sidebar Navigation */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-indigo-900 shadow-xl transform transition-transform duration-300 ease-in-out
        md:static md:translate-x-0 
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 bg-indigo-950">
          <span className="text-2xl font-bold text-white tracking-wider">
            Master<span className="text-yellow-400">G</span>
          </span>
          <button onClick={closeSidebar} className="md:hidden text-indigo-200 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-col h-[calc(100%-4rem)] justify-between">
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
            <NavItem to="/leaderboard" icon={Trophy} label="Leaderboard" />
            <NavItem to="/history" icon={History} label="Attempt History" />
            <NavItem to="/mistakes" icon={BookX} label="Mistake Book" />
            {user.role === Role.ADMIN && (
              <NavItem to="/admin" icon={ShieldAlert} label="Admin Panel" />
            )}
          </nav>

          <div className="p-4 bg-indigo-950">
            <div className="flex items-center gap-3 mb-4">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold border-2 ${
                  user.role === Role.ADMIN ? 'bg-purple-700 border-purple-400' : 'bg-indigo-700 border-indigo-400'
              }`}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                <div className="flex items-center gap-1">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                        user.role === Role.ADMIN ? 'bg-purple-500 text-white' : 'bg-indigo-600 text-indigo-200'
                    }`}>
                        {user.userCode || 'ID_PENDING'}
                    </span>
                </div>
              </div>
            </div>
            <button 
              onClick={onLogout}
              className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors"
            >
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="bg-white shadow-sm md:hidden z-30">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <Menu size={24} />
            </button>
            <span className="text-xl font-bold text-indigo-900">MasterG</span>
            <div className="w-6"></div> {/* Spacer for center alignment */}
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
