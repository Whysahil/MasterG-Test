import React, { useEffect, useState } from 'react';
import { db } from '../services/mockDatabase';
import { TestAttempt, User } from '../types';
import { Calendar, CheckCircle, TrendingUp } from 'lucide-react';

const AttemptHistory: React.FC<{ user: User }> = ({ user }) => {
  const [history, setHistory] = useState<TestAttempt[]>([]);

  useEffect(() => {
    db.getUserHistory(user.id).then(setHistory);
  }, [user.id]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <HistoryIcon className="text-indigo-600" /> My Attempts
      </h1>

      {history.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-dashed border-gray-300">
          <p className="text-gray-500">No tests attempted yet. Go to Dashboard to start.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map(attempt => (
            <div key={attempt.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4 hover:border-indigo-300 transition-colors">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded uppercase">{attempt.status}</span>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Calendar size={12} /> {new Date(attempt.endTime).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 text-lg">Test ID: {attempt.testId}</h3>
              </div>

              <div className="flex gap-8 text-center">
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">Score</div>
                  <div className="text-xl font-bold text-indigo-700">{attempt.score}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">Accuracy</div>
                  <div className="text-xl font-bold text-green-600">{attempt.accuracy.toFixed(1)}%</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const HistoryIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M3 3v5h5"/>
    <path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"/>
    <path d="M12 7v5l4 2"/>
  </svg>
);

export default AttemptHistory;