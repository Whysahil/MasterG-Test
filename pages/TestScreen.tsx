import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../services/mockDatabase';
import { Question, User, Test } from '../types';
import { Timer, ChevronLeft, ChevronRight, Bookmark, Menu, X, EyeOff, Layers, Infinity, Loader } from 'lucide-react';

interface TestScreenProps {
  user: User;
}

const TestScreen: React.FC<TestScreenProps> = ({ user }) => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();

  const [testInfo, setTestInfo] = useState<Test | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({}); 
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  
  // Timer State
  const [timeElapsed, setTimeElapsed] = useState(0); 
  const [timeLeft, setTimeLeft] = useState(0);
  
  const [submitting, setSubmitting] = useState(false);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [focusWarnings, setFocusWarnings] = useState(0);

  const timerRef = useRef<number | null>(null);

  // VALIDATION: Prevent Accidental Refresh
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        if (!submitting && questions.length > 0) {
            e.preventDefault();
            e.returnValue = ''; // Legacy support
        }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [submitting, questions.length]);

  useEffect(() => {
    // Focus tracking (Anti-cheat)
    const handleVisibilityChange = () => {
        if (document.hidden) {
            setFocusWarnings(prev => prev + 1);
        }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  useEffect(() => {
    if (testId) {
      db.getTestsByExam(null).then(allTests => {
          const t = allTests.find(x => x.id === testId);
          setTestInfo(t || null);
          
          db.getQuestionsForTest(testId).then(qs => {
            setQuestions(qs);
            if (t && t.type === 'UNLIMITED') {
                setTimeElapsed(0);
            } else {
                setTimeLeft(t ? t.durationMinutes * 60 : 60 * 60); 
            }
            setLoading(false);
          });
      });
    }
  }, [testId]);

  useEffect(() => {
    if (loading) return;
    
    // Stop if normal test is over
    if (testInfo?.type !== 'UNLIMITED' && timeLeft <= 0 && timeElapsed > 0) return;

    timerRef.current = window.setInterval(() => {
      if (testInfo?.type === 'UNLIMITED') {
          // Count UP
          setTimeElapsed(prev => prev + 1);
      } else {
          // Count DOWN
          setTimeLeft(prev => {
            if (prev <= 1) {
              handleSubmit();
              return 0;
            }
            return prev - 1;
          });
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loading, timeLeft, testInfo]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleOptionSelect = (qId: string, optId: string) => {
    setAnswers(prev => ({ ...prev, [qId]: optId }));
  };

  const toggleReview = (qId: string) => {
    setMarkedForReview(prev => {
      const newSet = new Set(prev);
      if (newSet.has(qId)) newSet.delete(qId);
      else newSet.add(qId);
      return newSet;
    });
  };

  const clearResponse = (qId: string) => {
    setAnswers(prev => {
      const newState = { ...prev };
      delete newState[qId];
      return newState;
    });
  };

  const loadMoreQuestions = async () => {
      if (!testId || loadingMore) return;
      setLoadingMore(true);
      const newBatch = await db.fetchMoreQuestions(testId, questions.length);
      setQuestions(prev => [...prev, ...newBatch]);
      setLoadingMore(false);
  };

  const handleNext = () => {
      if (currentQIndex === questions.length - 1) {
          if (testInfo?.type === 'UNLIMITED') {
              loadMoreQuestions().then(() => {
                  setCurrentQIndex(prev => prev + 1);
              });
          }
      } else {
          setCurrentQIndex(prev => prev + 1);
      }
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);

    // Calculate actual time spent
    const spent = testInfo?.type === 'UNLIMITED' 
        ? timeElapsed 
        : (testInfo ? testInfo.durationMinutes * 60 : 3600) - timeLeft;

    try {
      const result = await db.submitTestAttempt(user.id, testId!, answers, spent);
      navigate('/result', { state: { result } });
    } catch (error) {
      alert("Submission failed. Database Transaction Rollback triggered.");
      setSubmitting(false);
    }
  };

  if (loading || !testInfo) return <div className="h-screen flex items-center justify-center text-xl animate-pulse">Loading Test Environment...</div>;

  const currentQ = questions[currentQIndex];
  const isUnlimited = testInfo.type === 'UNLIMITED';

  return (
    <div className="h-screen flex flex-col md:flex-row overflow-hidden bg-gray-100">
      
      {/* Mobile Drawer Overlay */}
      {isDrawerOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setDrawerOpen(false)} />
      )}

      {/* Main Question Area */}
      <div className="flex-grow flex flex-col h-full relative z-0">
        {/* Header inside test */}
        <div className="bg-white px-4 py-3 border-b border-gray-200 flex justify-between items-center shadow-sm z-20">
          <div className="flex items-center gap-3">
             <button onClick={() => setDrawerOpen(!isDrawerOpen)} className="md:hidden text-gray-600">
                <Menu />
             </button>
             <div className="flex flex-col">
                 <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm md:text-base">
                    {isUnlimited ? <Infinity size={16} className="text-indigo-600" /> : <Layers size={16} className="text-indigo-600" />}
                    Section: <span className="text-indigo-700">{currentQ?.subject || 'General'}</span>
                 </div>
                 <div className="text-xs text-gray-500">
                    {isUnlimited 
                        ? `Question #${currentQIndex + 1} (Attempted: ${Object.keys(answers).length})` 
                        : `Question ${currentQIndex + 1} of ${questions.length}`
                    }
                 </div>
             </div>
          </div>
          
          <div className="flex items-center gap-4">
            {focusWarnings > 0 && (
                <div className="hidden sm:flex items-center text-xs text-red-600 bg-red-50 px-2 py-1 rounded border border-red-200 animate-pulse">
                    <EyeOff size={14} className="mr-1"/> Focus Lost: {focusWarnings}
                </div>
            )}
            <div className={`flex items-center gap-2 font-mono text-xl font-bold ${!isUnlimited && timeLeft < 300 ? 'text-red-600 animate-pulse' : 'text-indigo-700'}`}>
                <Timer size={24} />
                {isUnlimited ? formatTime(timeElapsed) : formatTime(timeLeft)}
            </div>
          </div>
        </div>

        {/* Question Content */}
        <div className="flex-grow overflow-y-auto p-4 md:p-8 pb-24">
          <div className="max-w-4xl mx-auto bg-white p-6 md:p-10 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex justify-between items-start mb-6">
              <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                Question {currentQIndex + 1}
              </span>
              <div className="flex gap-3 text-xs md:text-sm font-bold">
                <span className="text-green-600 bg-green-50 px-2 py-1 rounded">+ {currentQ?.positiveMarks || 2}</span>
                <span className="text-red-500 bg-red-50 px-2 py-1 rounded">- {currentQ?.negativeMarks || 0.5}</span>
              </div>
            </div>

            <h3 className="text-lg md:text-2xl font-medium text-gray-900 mb-8 leading-relaxed">
              {currentQ?.text || <span className="flex items-center gap-2"><Loader className="animate-spin" /> Loading next question...</span>}
            </h3>

            {currentQ && (
                <div className="space-y-3">
                {currentQ.options.map(opt => {
                    const isSelected = answers[currentQ.id] === opt.id;
                    return (
                    <button
                        key={opt.id}
                        onClick={() => handleOptionSelect(currentQ.id, opt.id)}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                        isSelected 
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-semibold shadow-inner' 
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
                        }`}
                    >
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        isSelected ? 'border-indigo-600 bg-indigo-600' : 'border-gray-400'
                        }`}>
                        {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                        </div>
                        {opt.text}
                    </button>
                    );
                })}
                </div>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="bg-white border-t border-gray-200 p-3 md:p-4 flex justify-between items-center z-10 absolute bottom-0 w-full shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
          <div className="flex gap-2">
             <button 
               onClick={() => toggleReview(currentQ?.id)}
               className={`px-3 py-2 rounded-lg text-sm font-medium border flex items-center gap-2 ${
                 markedForReview.has(currentQ?.id) 
                  ? 'bg-purple-100 text-purple-700 border-purple-300' 
                  : 'text-gray-600 border-gray-300 hover:bg-gray-50'
               }`}
             >
               <Bookmark size={18} fill={markedForReview.has(currentQ?.id) ? "currentColor" : "none"} />
               <span className="hidden sm:inline">{markedForReview.has(currentQ?.id) ? 'Unmark' : 'Review'}</span>
             </button>
             <button 
                onClick={() => clearResponse(currentQ?.id)}
                className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 border border-gray-300 hover:bg-gray-50"
             >
               Clear
             </button>
          </div>

          <div className="flex gap-3">
            <button
              disabled={currentQIndex === 0}
              onClick={() => setCurrentQIndex(prev => prev - 1)}
              className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={handleNext}
              disabled={loadingMore}
              className="px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium flex items-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed shadow-md shadow-indigo-200"
            >
              {isUnlimited && currentQIndex === questions.length - 1 
                  ? (loadingMore ? 'Loading...' : 'Next (Load More)') 
                  : 'Next'
              } 
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Responsive Question Palette */}
      <div className={`
        fixed inset-y-0 right-0 z-50 w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out border-l border-gray-200
        md:static md:transform-none md:w-80 md:shadow-none flex flex-col
        ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="https://ui-avatars.com/api/?name=User&background=6366f1&color=fff" alt="User" className="rounded-full w-10 h-10" />
            <div>
              <div className="text-sm font-bold text-gray-900">{user.name}</div>
              <div className="text-xs text-gray-500">Candidate</div>
            </div>
          </div>
          <button onClick={() => setDrawerOpen(false)} className="md:hidden text-gray-500">
            <X size={24} />
          </button>
        </div>

        <div className="p-4 grid grid-cols-2 gap-2 text-xs text-gray-600 mb-2 border-b border-gray-200 pb-4">
          <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-500 rounded-sm"></div> Answered</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded-sm"></div> Not Answered</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 bg-gray-200 rounded-sm border border-gray-300"></div> Current</div>
        </div>

        <div className="flex-grow p-4 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-5 gap-3">
            {questions.map((q, idx) => {
              const isAnswered = !!answers[q.id];
              const isMarked = markedForReview.has(q.id);
              const isCurrent = currentQIndex === idx;

              let bgClass = 'bg-gray-100 text-gray-700 border-gray-300';
              if (isAnswered) bgClass = 'bg-green-500 text-white border-green-600 shadow-sm';
              else if (isMarked) bgClass = 'bg-purple-500 text-white border-purple-600 shadow-sm';
              else if (idx < currentQIndex) bgClass = 'bg-red-100 text-red-600 border-red-200';

              if (isCurrent) bgClass += ' ring-2 ring-offset-2 ring-indigo-500 z-10';

              return (
                <button
                  key={q.id}
                  onClick={() => {
                      setCurrentQIndex(idx);
                      setDrawerOpen(false); // Close drawer on mobile selection
                  }}
                  className={`h-10 w-10 rounded-lg flex items-center justify-center text-sm font-semibold border ${bgClass} relative transition-all active:scale-95`}
                >
                  {idx + 1}
                  {isMarked && <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-600 rounded-full border border-white"></div>}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <button 
            onClick={handleSubmit}
            className={`w-full py-3 rounded-lg font-bold shadow-lg transition-colors flex justify-center items-center gap-2 ${
                isUnlimited 
                ? 'bg-gray-900 hover:bg-black text-white shadow-gray-400'
                : 'bg-green-600 hover:bg-green-700 text-white shadow-green-200'
            }`}
          >
            {submitting ? 'Submitting...' : isUnlimited ? 'END PRACTICE' : 'SUBMIT TEST'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestScreen;
