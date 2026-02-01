import React, { useState, useEffect } from 'react';
import { db } from '../services/mockDatabase';
import { AdminStats, User, Role } from '../types';
import { 
  Upload, FileText, Check, Users, Activity, BarChart2, Shield, 
  Search, Lock, Unlock, AlertTriangle, Download, Database, Layout 
} from 'lucide-react';

// --- SUB-COMPONENTS ---

const StatCard = ({ title, value, icon: Icon, color }: any) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
    <div>
      <p className="text-gray-500 text-sm font-medium">{title}</p>
      <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
    </div>
    <div className={`p-3 rounded-full ${color}`}>
      <Icon size={24} className="text-white" />
    </div>
  </div>
);

const UserManagementTable = ({ users, onToggleBlock }: { users: User[], onToggleBlock: (id: string, current: boolean) => void }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
    <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
      <h3 className="font-bold text-gray-700">Registered Users</h3>
      <div className="relative">
        <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
        <input 
          type="text" 
          placeholder="Search email..." 
          className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
        />
      </div>
    </div>
    <table className="w-full text-left">
      <thead className="bg-gray-100 text-gray-600 text-xs uppercase">
        <tr>
          <th className="px-6 py-3">User</th>
          <th className="px-6 py-3">Role</th>
          <th className="px-6 py-3">Joined</th>
          <th className="px-6 py-3">Status</th>
          <th className="px-6 py-3 text-right">Action</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {users.map(u => (
          <tr key={u.id} className="hover:bg-gray-50">
            <td className="px-6 py-4">
              <div className="font-medium text-gray-900">{u.name}</div>
              <div className="text-xs text-gray-500">{u.email}</div>
            </td>
            <td className="px-6 py-4">
              <span className={`px-2 py-1 rounded text-xs font-bold ${u.role === Role.ADMIN ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                {u.role}
              </span>
            </td>
            <td className="px-6 py-4 text-sm text-gray-500">{u.joinedAt || '2023-01-01'}</td>
            <td className="px-6 py-4">
              {u.isBlocked ? (
                <span className="flex items-center gap-1 text-red-600 text-xs font-bold"><Lock size={12} /> Blocked</span>
              ) : (
                <span className="flex items-center gap-1 text-green-600 text-xs font-bold"><Check size={12} /> Active</span>
              )}
            </td>
            <td className="px-6 py-4 text-right">
              {u.role !== Role.ADMIN && (
                <button 
                  onClick={() => onToggleBlock(u.id, !!u.isBlocked)}
                  className={`text-xs px-3 py-1.5 rounded border ${u.isBlocked ? 'border-green-300 text-green-700 hover:bg-green-50' : 'border-red-300 text-red-700 hover:bg-red-50'}`}
                >
                  {u.isBlocked ? 'Unblock' : 'Block'}
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const BulkUpload = ({ onUpload }: { onUpload: () => void }) => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'processing' | 'success'>('idle');

  const handleUpload = () => {
    if (!file) return;
    setStatus('processing');
    // Simulate DB Transaction delay
    setTimeout(() => {
        onUpload();
        setStatus('success');
    }, 2000);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Database size={20} className="text-indigo-600" /> Question Bank Import
        </h3>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-10 flex flex-col items-center justify-center bg-gray-50 mb-6">
          <Upload className="text-gray-400 mb-4" size={48} />
          <p className="text-sm text-gray-600 mb-2">Drag and drop CSV (Format: Question, OptA, OptB, OptC, OptD, Correct, Marks)</p>
          <input 
            type="file" 
            accept=".csv"
            onChange={(e) => { setFile(e.target.files?.[0] || null); setStatus('idle'); }}
            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
          />
        </div>

        {status === 'processing' && (
            <div className="flex items-center gap-3 text-indigo-600 bg-indigo-50 p-4 rounded-lg animate-pulse mb-4">
                <Activity size={20} className="animate-spin" /> 
                <span className="font-medium">Parsing CSV & Executing Database Transaction...</span>
            </div>
        )}

        {status === 'success' && (
            <div className="flex items-center gap-3 text-green-700 bg-green-50 p-4 rounded-lg mb-4 border border-green-200">
                <Check size={20} /> 
                <div>
                    <span className="font-bold">Import Successful!</span>
                    <p className="text-xs">Inserted 50 questions into `questions` table. Transaction committed.</p>
                </div>
            </div>
        )}

        <div className="flex gap-4">
            <button
                onClick={handleUpload}
                disabled={!file || status === 'processing'}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
                Start Bulk Upload
            </button>
            <button className="px-4 py-3 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 flex items-center gap-2">
                <Download size={18} /> Template
            </button>
        </div>
    </div>
  );
};

const AuditLogTable = ({ logs }: { logs: any[] }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-bold text-gray-800 mb-4">Recent Admin Activity</h3>
        <div className="space-y-4">
            {logs.map(log => (
                <div key={log.id} className="flex items-start gap-3 text-sm pb-4 border-b border-gray-100 last:border-0">
                    <div className="mt-1 p-1 bg-gray-100 rounded text-gray-500"><Activity size={14} /></div>
                    <div>
                        <div className="font-medium text-gray-900">{log.action}</div>
                        <div className="text-gray-500">{log.details}</div>
                        <div className="text-xs text-gray-400 mt-1">{new Date(log.timestamp).toLocaleString()}</div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

// --- MAIN PAGE COMPONENT ---

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'upload'>('dashboard');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    // Initial Data Fetch
    db.getAdminStats().then(setStats);
    db.getUsers().then(setUsers);
  }, []);

  const handleUserBlock = async (id: string, current: boolean) => {
      await db.toggleUserBlock(id, !current);
      const updatedUsers = await db.getUsers(); // Refresh
      setUsers(updatedUsers);
  };

  const handleUploadComplete = async () => {
      const updatedStats = await db.getAdminStats();
      setStats(updatedStats);
  };

  if (!stats) return <div className="p-10 text-center animate-pulse">Loading Admin Console...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Shield className="text-indigo-600" size={32} /> Admin Command Center
          </h1>
          <p className="text-gray-500 mt-1">System Status: <span className="text-green-600 font-bold">Operational</span></p>
        </div>
        <div className="flex gap-2 bg-white p-1 rounded-lg border border-gray-200">
            {['dashboard', 'users', 'upload'].map((tab) => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-all ${
                        activeTab === tab ? 'bg-indigo-600 text-white shadow' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                    {tab}
                </button>
            ))}
        </div>
      </div>

      {/* Content Area */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard title="Total Users" value={stats.totalUsers} icon={Users} color="bg-blue-500" />
                <StatCard title="Active Today" value={stats.activeUsersToday} icon={Activity} color="bg-green-500" />
                <StatCard title="Question Bank" value={stats.totalQuestions} icon={Database} color="bg-purple-500" />
                <StatCard title="Avg Platform Score" value={stats.avgPlatformScore} icon={BarChart2} color="bg-orange-500" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AuditLogTable logs={stats.recentLogs} />
                <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-xl p-6 text-white">
                    <h3 className="font-bold text-lg mb-2 flex items-center gap-2"><Layout size={20} /> Quick Actions</h3>
                    <p className="text-indigo-200 text-sm mb-6">Manage platform configuration and maintenance.</p>
                    <div className="grid grid-cols-2 gap-4">
                        <button className="bg-white/10 hover:bg-white/20 p-3 rounded-lg text-sm font-medium text-left">Generate Reports</button>
                        <button className="bg-white/10 hover:bg-white/20 p-3 rounded-lg text-sm font-medium text-left">System Settings</button>
                        <button className="bg-white/10 hover:bg-white/20 p-3 rounded-lg text-sm font-medium text-left">Manage Exams</button>
                        <button className="bg-red-500/80 hover:bg-red-500 p-3 rounded-lg text-sm font-medium text-left flex items-center gap-2"><AlertTriangle size={16} /> Maintenance Mode</button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {activeTab === 'users' && (
        <UserManagementTable users={users} onToggleBlock={handleUserBlock} />
      )}

      {activeTab === 'upload' && (
        <div className="max-w-3xl mx-auto">
            <BulkUpload onUpload={handleUploadComplete} />
        </div>
      )}

    </div>
  );
};

export default AdminPanel;
