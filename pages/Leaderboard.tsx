import React, { useEffect, useState } from 'react';
import { db } from '../services/mockDatabase';
import { Trophy, Medal, Crown } from 'lucide-react';

const Leaderboard: React.FC = () => {
  const [leaders, setLeaders] = useState<any[]>([]);

  useEffect(() => {
    db.getLeaderboard().then(data => setLeaders(data));
  }, []);

  const getIcon = (rank: number) => {
    switch(rank) {
      case 1: return <Crown className="text-yellow-500" />;
      case 2: return <Medal className="text-gray-400" />;
      case 3: return <Medal className="text-amber-700" />;
      default: return <span className="font-mono font-bold text-gray-400">#{rank}</span>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-indigo-900 flex items-center justify-center gap-3">
          <Trophy className="text-yellow-500" size={40} /> Global Leaderboard
        </h1>
        <p className="text-gray-500 mt-2">Top performers across all Government Exams</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-indigo-900 text-white">
              <th className="p-4 font-semibold text-center w-24">Rank</th>
              <th className="p-4 font-semibold">Student Name</th>
              <th className="p-4 font-semibold">Exam Category</th>
              <th className="p-4 font-semibold text-right">Total Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {leaders.map((leader) => (
              <tr key={leader.rank} className="hover:bg-indigo-50 transition-colors">
                <td className="p-4 flex justify-center items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${leader.rank <= 3 ? 'bg-white shadow-sm' : ''}`}>
                    {getIcon(leader.rank)}
                  </div>
                </td>
                <td className="p-4 font-medium text-gray-900">{leader.name}</td>
                <td className="p-4 text-gray-600">
                  <span className="bg-gray-100 px-2 py-1 rounded text-xs border border-gray-200">
                    {leader.exam}
                  </span>
                </td>
                <td className="p-4 text-right font-bold text-indigo-700">{leader.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-6 text-center text-xs text-gray-400">
        Query executed: SELECT user_name, exam, MAX(score) FROM results GROUP BY user_id ORDER BY score DESC
      </div>
    </div>
  );
};

export default Leaderboard;