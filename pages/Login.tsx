import React, { useState } from 'react';
import { db } from '../services/mockDatabase';
import { Role, User } from '../types';
import { BookOpen, ShieldCheck, UserPlus, LogIn, AlertCircle, Lock, Key } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secretKey, setSecretKey] = useState(''); // New State for Admin Secret
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
        let user;
        if (isSignup) {
            // Updated Signup Logic: Pass secretKey if Admin Mode
            const adminKey = isAdminMode ? secretKey : undefined;
            user = await db.auth.signup(name, email, password, adminKey);
        } else {
            user = await db.auth.login(email, password);
            
            // Strictly enforce Admin Mode check
            if (isAdminMode && user.role !== Role.ADMIN) {
                throw new Error("Access Denied: Not an Admin Account");
            }
            if (!isAdminMode && user.role === Role.ADMIN) {
                 // Force Admin to use Admin Tab for security clarity
                 throw new Error("Please use the Admin Login tab for Administrator access.");
            }
        }
        onLogin(user);
    } catch (err: any) {
        setError(err.message || "Authentication failed");
    } finally {
        setLoading(false);
    }
  };

  const toggleMode = () => {
      setIsSignup(!isSignup);
      setError(null);
      setPassword('');
      setSecretKey('');
  };

  const switchTab = (admin: boolean) => {
      setIsAdminMode(admin);
      setIsSignup(false); 
      setError(null);
      setEmail('');
      setPassword('');
      setSecretKey('');
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 bg-gradient-to-br ${isAdminMode ? 'from-purple-900 via-indigo-900 to-slate-900' : 'from-indigo-900 via-blue-900 to-indigo-950'}`}>
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
        
        {/* Header */}
        <div className={`${isAdminMode ? 'bg-purple-800' : 'bg-indigo-600'} p-8 text-center relative overflow-hidden transition-colors duration-300`}>
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          <div className="relative z-10">
            <h1 className="text-3xl font-bold text-white flex justify-center items-center gap-2 mb-2">
                {isAdminMode ? <Lock className="text-purple-300" size={32} /> : <BookOpen className="text-yellow-400" size={32} />} 
                MasterG
            </h1>
            <p className={`${isAdminMode ? 'text-purple-100' : 'text-indigo-100'} font-medium`}>
                {isAdminMode ? 'Restricted Admin Console' : 'Government Exam Prep Platform'}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
            <button
                onClick={() => switchTab(false)}
                className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors ${!isAdminMode ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50' : 'text-gray-500 hover:bg-gray-50'}`}
            >
                Student Login
            </button>
            <button
                onClick={() => switchTab(true)}
                className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors ${isAdminMode ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50' : 'text-gray-500 hover:bg-gray-50'}`}
            >
                Admin Login
            </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div className="flex justify-center mb-4">
             <div className={`${isAdminMode ? 'bg-purple-50 text-purple-800' : 'bg-indigo-50 text-indigo-800'} text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-2`}>
                <ShieldCheck size={14} /> {isAdminMode ? 'Authorized Personnel Only' : 'Secure Student Access'}
             </div>
          </div>

          {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2 border border-red-200 animate-pulse">
                  <AlertCircle size={16} /> {error}
              </div>
          )}

          {isSignup && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    placeholder={isAdminMode ? "Admin Name" : "e.g. Rahul Sharma"}
                    required
                />
              </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
                {isAdminMode ? 'Admin Email' : 'Email Address'}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all ${isAdminMode ? 'focus:ring-purple-500' : 'focus:ring-indigo-500'}`}
              placeholder={isAdminMode ? "admin@masterg.com" : "student@example.com"}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all ${isAdminMode ? 'focus:ring-purple-500' : 'focus:ring-indigo-500'}`}
              placeholder="••••••••"
              required
            />
          </div>

          {/* ADMIN SECRET KEY FIELD */}
          {isSignup && isAdminMode && (
              <div className="animate-fade-in-up">
                <label className="block text-sm font-bold text-purple-700 mb-1 flex items-center gap-2">
                    <Key size={14} /> Master Secret Key
                </label>
                <input
                    type="password"
                    value={secretKey}
                    onChange={(e) => setSecretKey(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-purple-200 bg-purple-50 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                    placeholder="Enter Master Key"
                    required
                />
                <p className="text-[10px] text-purple-400 mt-1">Required to generate Admin ID (Try: masterg_admin)</p>
              </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white font-bold py-3.5 rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed ${isAdminMode ? 'bg-purple-700 hover:bg-purple-800 shadow-purple-500/30' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/30'}`}
          >
            {loading ? 'Processing...' : isSignup ? <><UserPlus size={20} /> {isAdminMode ? 'Create Admin ID' : 'Create Account'}</> : <><LogIn size={20} /> {isAdminMode ? 'Admin Login' : 'Sign In'}</>}
          </button>
          
          <div className="text-center pt-2">
                <button 
                    type="button" 
                    onClick={toggleMode}
                    className={`text-sm font-semibold transition-colors ${isAdminMode ? 'text-purple-600 hover:text-purple-800' : 'text-indigo-600 hover:text-indigo-800'}`}
                >
                    {isSignup 
                        ? "Already have an account? Sign In" 
                        : isAdminMode 
                            ? "New admin? Create an account" 
                            : "New student? Create an account"
                    }
                </button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center text-xs text-gray-400">
             <p>Protected by 256-bit Encryption</p>
             {isAdminMode && <p className="mt-1 text-purple-400">Restricted Area: Unauthorized access is logged.</p>}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
