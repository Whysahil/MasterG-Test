import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/mockDatabase';
import { ExamCategory, Test, User } from '../types';
import { Clock, FileText, CheckCircle, Flame, Brain, History, Target, TrendingUp, BookOpen, AlertCircle, Infinity, Zap, Award } from 'lucide-react';

interface DashboardProps {
  user?: User; 
}

interface StudentStats {
    readinessScore: number;
    weakSubject: string;
    completedTests: number;
    dailyTasks: { id: number; task: string; completed: boolean }[];
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<ExamCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'MOCK' | 'PYQ' | 'UNLIMITED'>('ALL');
  
  // Student Stats State
  const [stats, setStats] = useState<StudentStats | null>(null);

  useEffect(() => {
    // Parallel Data Fetching for faster UX
    const fetchData = async () => {
        const [examsData, statsData] = await Promise.all([
            db.getExams(),
            user ? db.getStudentAnalytics(user.id) : null
        ]);
        
        setCategories(examsData);
        if (examsData.length > 0) setSelectedCategory(examsData[0].id);
        
        if (statsData) {
            // Force type casting for the mock return
            setStats(statsData as any);
        }
        setLoading(false);
    };
    fetchData();
  }, [user]);

  useEffect(() => {
    if (selectedCategory) {
      setLoading(true);
      db.getTestsByExam(selectedCategory).then(data => {
        setTests(data);
        setLoading(false);
      });
    }
  }, [selectedCategory]);

  const filteredTests = tests.filter(test => {
      // Don't show the specialized mocks in the general list to avoid clutter
      if (test.id === 'mock_10' || test.id === 'mock_25') return false;

      return activeTab === 'ALL' || test.type === activeTab || (activeTab === 'ALL' && test.type === 'UNLIMITED');
  });

  const getReadinessColor = (score: number) => {
      if (score >= 80) return 'text-green-500';
      if (score >= 50) return 'text-yellow-500';
      return 'text-red-500';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      
      {/* 1. PERSONAL TUTOR HEADER SECTION */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Hello, {user?.name}! 👋</h1>
                <p className="text-gray-500">Let's crush your goals for today.</p>
            </div>
            <div className="flex gap-3">
                 <div className="flex items-center gap-2 bg-orange-50 text-orange-700 px-4 py-2 rounded-full border border-orange-100 font-bold">
                    <Flame size={18} className="fill-orange-500 text-orange-500" /> {user?.streakDays || 0} Day Streak
                 </div>
            </div>
        </div>

        {/* Smart Insights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Exam Readiness Card */}
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-5 border border-indigo-100 relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2 text-indigo-800 font-bold uppercase text-xs tracking-wider">
                        <Target size={14} /> Exam Readiness
                    </div>
                    <div className="flex items-end gap-2">
                        <span className={`text-4xl font-black ${getReadinessColor(stats?.readinessScore || 0)}`}>
                            {stats?.readinessScore || 0}%
                        </span>
                        <span className="text-sm text-gray-500 mb-1">Confidence Score</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                        {stats && stats.readinessScore > 70 
                         ? "You are on fire! Keep practicing to maintain this." 
                         : "Consistency is key. Focus on your weak areas to improve."}
                    </p>
                </div>
                <div className="absolute right-0 bottom-0 opacity-10">
                    <TrendingUp size={80} className="text-indigo-600" />
                </div>
            </div>

            {/* AI Focus Area Card */}
            <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-5 border border-red-100">
                <div className="flex items-center gap-2 mb-2 text-red-800 font-bold uppercase text-xs tracking-wider">
                    <AlertCircle size={14} /> Focus Area Detected
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{stats?.weakSubject || "Analyzing..."}</h3>
                <p className="text-xs text-gray-600 mb-4">You have missed multiple questions here recently.</p>
                <button 
                   onClick={() => navigate('/mistakes')}
                   className="w-full bg-white text-red-600 border border-red-200 hover:bg-red-50 font-bold py-2 rounded-lg text-sm transition-colors flex justify-center items-center gap-2"
                >
                    <BookOpen size={16} /> Revise Now
                </button>
            </div>

            {/* Daily Study Plan Card */}
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-inner">
                <div className="flex items-center gap-2 mb-3 text-gray-800 font-bold uppercase text-xs tracking-wider">
                    <Brain size={14} className="text-purple-500" /> AI Daily Plan
                </div>
                <ul className="space-y-2">
                    {stats?.dailyTasks.map((task) => (
                        <li key={task.id} className="flex items-center gap-3 text-sm text-gray-700">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                                task.completed ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 text-transparent'
                            }`}>
                                <CheckCircle size={12} fill="currentColor" />
                            </div>
                            <span className={task.completed ? 'line-through text-gray-400' : ''}>{task.task}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
      </div>
      
      {/* 2. MOCK TEST ZONE - SPECIAL CARDS */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Zap className="text-yellow-500" fill="currentColor" /> Mock Test Zone
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* 10 Question Mock */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-indigo-400 hover:shadow-lg transition-all group cursor-pointer relative overflow-hidden"
                 onClick={() => navigate('/test/mock_10')}>
                <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-bl-xl">POPULAR</div>
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-yellow-100 text-yellow-700 rounded-lg group-hover:bg-yellow-500 group-hover:text-white transition-colors">
                        <Zap size={28} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">10-Question Quick Mock</h3>
                        <p className="text-sm text-gray-500">15 Minutes • 20 Marks</p>
                    </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                    Short on time? Take this rapid fire test to keep your streak alive. Best for daily revision.
                </p>
                <button className="w-full py-2 bg-gray-100 text-gray-900 font-bold rounded-lg group-hover:bg-yellow-500 group-hover:text-white transition-all">
                    Start Quick Mock
                </button>
            </div>

            {/* 25 Question Mock */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-indigo-400 hover:shadow-lg transition-all group cursor-pointer relative overflow-hidden"
                 onClick={() => navigate('/test/mock_25')}>
                <div className="absolute top-0 right-0 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">STANDARD</div>
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-indigo-100 text-indigo-700 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <Award size={28} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">25-Question Standard Mock</h3>
                        <p className="text-sm text-gray-500">30 Minutes • 50 Marks</p>
                    </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                    The perfect balance. Simulates a real section-wise exam experience. Recommended for weekends.
                </p>
                <button className="w-full py-2 bg-gray-100 text-gray-900 font-bold rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    Start Standard Mock
                </button>
            </div>

        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Sidebar Categories */}
        <div className="md:col-span-3 space-y-2">
          <h3 className="text-lg font-semibold text-gray-800 tracking-tight mb-4 px-2">Select Category</h3>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                selectedCategory === cat.id 
                  ? 'bg-indigo-600 text-white shadow-md transform scale-105 font-medium' 
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-transparent hover:border-gray-200'
              }`}
            >
              <div className="font-medium">{cat.name}</div>
              <div className={`text-xs ${selectedCategory === cat.id ? 'text-indigo-200' : 'text-gray-400'}`}>
                {cat.description}
              </div>
            </button>
          ))}
        </div>

        {/* Tests List */}
        <div className="md:col-span-9">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 min-h-[500px] p-6">
            
            <div className="flex justify-between items-center mb-6">
                 <h3 className="font-bold text-gray-800 text-lg">Detailed Tests & Papers</h3>
                 {/* Filter Tabs */}
                <div className="flex gap-2">
                    <button onClick={() => setActiveTab('ALL')} className={`px-3 py-1 rounded text-xs font-bold ${activeTab === 'ALL' ? 'bg-gray-900 text-white' : 'text-gray-500 bg-gray-100'}`}>All</button>
                    <button onClick={() => setActiveTab('MOCK')} className={`px-3 py-1 rounded text-xs font-bold ${activeTab === 'MOCK' ? 'bg-blue-600 text-white' : 'text-gray-500 bg-gray-100'}`}>Full Mocks</button>
                    <button onClick={() => setActiveTab('PYQ')} className={`px-3 py-1 rounded text-xs font-bold ${activeTab === 'PYQ' ? 'bg-purple-600 text-white' : 'text-gray-500 bg-gray-100'}`}>PYQs</button>
                </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64 text-gray-400 animate-pulse">Loading tests...</div>
            ) : filteredTests.length === 0 ? (
               <div className="flex justify-center items-center h-64 text-gray-400">No tests available in this category.</div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredTests.map(test => {
                  const isUnlimited = test.type === 'UNLIMITED';
                  return (
                    <div key={test.id} className={`border rounded-xl p-5 hover:shadow-lg transition-all hover:border-indigo-300 group relative overflow-hidden ${
                        isUnlimited ? 'bg-gradient-to-br from-gray-900 to-indigo-900 text-white border-transparent' : 'bg-gray-50 hover:bg-white border-gray-200'
                    }`}>
                        {/* Background Tag for PYQ */}
                        {test.type === 'PYQ' && (
                            <div className="absolute top-0 right-0 bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-1 rounded-bl-lg z-10">
                                LAST 10 YEARS
                            </div>
                        )}
                        
                        <div className="flex justify-between items-start mb-3">
                        <span className={`px-2 py-1 text-xs font-bold rounded uppercase tracking-wider ${
                            isUnlimited ? 'bg-white/20 text-white' : 
                            test.type === 'MOCK' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                        }`}>
                            {isUnlimited ? 'Endless Mode' : test.type === 'PYQ' ? 'Past Paper' : 'Full Mock'}
                        </span>
                        </div>
                        
                        <h3 className={`text-lg font-bold mb-2 line-clamp-2 min-h-[3.5rem] ${
                            isUnlimited ? 'text-white' : 'text-gray-900 group-hover:text-indigo-600'
                        }`}>
                            {test.title}
                        </h3>
                        
                        <div className={`flex items-center gap-4 text-sm mb-6 ${isUnlimited ? 'text-gray-300' : 'text-gray-600'}`}>
                        {isUnlimited ? (
                            <>
                                <div className="flex items-center gap-1">
                                    <Infinity size={16} /> Unlimited Qs
                                </div>
                                <div className="flex items-center gap-1">
                                    <Clock size={16} /> At your pace
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex items-center gap-1">
                                    <Clock size={16} /> {test.durationMinutes}m
                                </div>
                                <div className="flex items-center gap-1">
                                    <FileText size={16} /> {test.questionCount}Q
                                </div>
                                <div className="flex items-center gap-1">
                                    <CheckCircle size={16} /> {test.totalMarks}M
                                </div>
                            </>
                        )}
                        </div>

                        <button 
                        onClick={() => navigate(`/test/${test.id}`)}
                        className={`w-full font-bold py-2.5 rounded-lg transition-all ${
                            isUnlimited 
                            ? 'bg-white text-indigo-900 hover:bg-indigo-50' 
                            : 'bg-white border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white'
                        }`}
                        >
                        {isUnlimited ? 'Start Practice' : test.type === 'PYQ' ? 'Solve Paper' : 'Start Test'}
                        </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
