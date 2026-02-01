import React, { useEffect, useState } from 'react';
import { db } from '../services/mockDatabase';
import { aiTutorService } from '../services/aiTutor';
import { User, Mistake } from '../types';
import { BookX, Calendar, AlertCircle, Bot, Sparkles, ChevronDown, ChevronUp, Volume2, StopCircle } from 'lucide-react';

const MistakeBook: React.FC<{ user: User }> = ({ user }) => {
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [loading, setLoading] = useState(true);
  
  // AI and Voice State
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [aiExplanations, setAiExplanations] = useState<Record<string, string>>({});
  const [loadingAi, setLoadingAi] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<string | null>(null);

  useEffect(() => {
    db.getMistakeBook(user.id).then(data => {
      setMistakes(data);
      setLoading(false);
    });
  }, [user.id]);

  // Handle Text-to-Speech
  const handleSpeak = (text: string, id: string) => {
    if (isSpeaking === id) {
        window.speechSynthesis.cancel();
        setIsSpeaking(null);
        return;
    }

    // Cancel any previous speech
    window.speechSynthesis.cancel();

    // Sanitize text for speech (remove markdown asterisks)
    const speechText = text.replace(/\*\*/g, '').replace(/[\#\-]/g, '');
    
    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.lang = 'en-IN'; // Indian English Accent for relatability
    utterance.rate = 1.0;
    
    utterance.onend = () => setIsSpeaking(null);
    
    setIsSpeaking(id);
    window.speechSynthesis.speak(utterance);
  };

  const handleExplainWithAI = async (mistake: Mistake, idx: number) => {
    const key = `${mistake.question.id}_${idx}`;
    
    // If closing
    if (expandedId === key) {
      setExpandedId(null);
      window.speechSynthesis.cancel();
      setIsSpeaking(null);
      return;
    }

    setExpandedId(key);

    // If explanation exists
    if (aiExplanations[key]) return;

    setLoadingAi(key);
    const explanation = await aiTutorService.getExplanation(
      mistake.question.text,
      mistake.question.options,
      mistake.userAnswerId,
      mistake.question.subject
    );
    setAiExplanations(prev => ({ ...prev, [key]: explanation }));
    setLoadingAi(null);
  };

  const renderMarkdown = (text: string) => {
    return text.split('\n').map((line, i) => {
      const parts = line.split('**');
      return (
        <p key={i} className="mb-2 text-gray-700 leading-relaxed">
          {parts.map((part, j) => 
            j % 2 === 1 ? <strong key={j} className="text-indigo-900 font-bold">{part}</strong> : part
          )}
        </p>
      );
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 p-6 rounded-r-xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white rounded-full text-red-600 shadow-sm">
            <BookX size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mistake Book</h1>
            <p className="text-red-700 font-medium">"Your best teacher is your last mistake."</p>
          </div>
        </div>
      </div>

      {loading ? (
         <div className="text-center py-20 text-gray-500 animate-pulse">Loading your learning opportunities...</div>
      ) : mistakes.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-dashed border-gray-300">
          <AlertCircle size={48} className="mx-auto text-green-500 mb-4" />
          <h3 className="text-xl font-bold text-gray-900">No Mistakes Found!</h3>
          <p className="text-gray-500">You haven't made any mistakes yet, or haven't attempted a test.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {mistakes.map((mistake, idx) => {
             const correctOpt = mistake.question.options.find(o => o.isCorrect);
             const userOpt = mistake.question.options.find(o => o.id === mistake.userAnswerId);
             const uniqueKey = `${mistake.question.id}_${idx}`;
             const isExpanded = expandedId === uniqueKey;
             
             return (
               <div key={idx} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden transition-all hover:shadow-lg">
                 {/* Card Header */}
                 <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex flex-wrap justify-between items-center gap-2">
                    <div className="flex items-center gap-3">
                        <span className="bg-gray-200 text-gray-700 text-xs font-bold px-2 py-1 rounded uppercase">
                            {mistake.question.subject}
                        </span>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Calendar size={12} /> {new Date(mistake.attemptDate).toLocaleDateString()}
                        </span>
                    </div>
                    <span className="text-xs font-mono text-gray-400">ID: {mistake.question.id}</span>
                 </div>
                 
                 {/* Question Body */}
                 <div className="p-6">
                   <h3 className="text-lg font-medium text-gray-900 mb-6 leading-snug">{mistake.question.text}</h3>
                   
                   <div className="grid md:grid-cols-2 gap-4 mb-6">
                     <div className="p-4 rounded-lg bg-red-50 border border-red-100 flex flex-col">
                        <span className="text-xs font-bold text-red-600 uppercase mb-1">Your Answer</span>
                        <span className="font-medium text-gray-800">{userOpt?.text || "Not Attempted"}</span>
                     </div>
                     <div className="p-4 rounded-lg bg-green-50 border border-green-100 flex flex-col">
                        <span className="text-xs font-bold text-green-600 uppercase mb-1">Correct Answer</span>
                        <span className="font-medium text-gray-800">{correctOpt?.text}</span>
                     </div>
                   </div>

                   {/* AI Tutor Button */}
                   <button 
                     onClick={() => handleExplainWithAI(mistake, idx)}
                     className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-bold transition-all ${
                        isExpanded 
                        ? 'bg-indigo-900 text-white shadow-inner' 
                        : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-md'
                     }`}
                   >
                     {isExpanded ? (
                        <>Close Explanation <ChevronUp size={20} /></>
                     ) : (
                        <><Sparkles size={18} className="text-yellow-300" /> Explain with AI Tutor <ChevronDown size={20} /></>
                     )}
                   </button>
                   
                   {/* AI Explanation Area */}
                   {isExpanded && (
                     <div className="mt-4 p-6 bg-indigo-50 rounded-xl border border-indigo-100 animate-fadeIn relative">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Bot className="text-indigo-600" size={24} />
                                <h4 className="font-bold text-indigo-900 text-lg">MasterG AI Analysis</h4>
                            </div>
                            
                            {/* Voice Button */}
                            {aiExplanations[uniqueKey] && (
                                <button 
                                    onClick={() => handleSpeak(aiExplanations[uniqueKey], uniqueKey)}
                                    className={`p-2 rounded-full transition-colors ${isSpeaking === uniqueKey ? 'bg-red-100 text-red-600' : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'}`}
                                    title="Listen to Explanation"
                                >
                                    {isSpeaking === uniqueKey ? <StopCircle size={24} /> : <Volume2 size={24} />}
                                </button>
                            )}
                        </div>
                        
                        {loadingAi === uniqueKey ? (
                            <div className="space-y-3">
                                <div className="h-4 bg-indigo-200 rounded w-3/4 animate-pulse"></div>
                                <div className="h-4 bg-indigo-200 rounded w-full animate-pulse"></div>
                                <div className="h-4 bg-indigo-200 rounded w-5/6 animate-pulse"></div>
                                <div className="text-center text-sm text-indigo-500 mt-2 font-medium">Generating step-by-step solution...</div>
                            </div>
                        ) : (
                            <div className="prose prose-indigo max-w-none text-sm md:text-base">
                                {renderMarkdown(aiExplanations[uniqueKey])}
                            </div>
                        )}
                     </div>
                   )}

                 </div>
               </div>
             )
          })}
        </div>
      )}
    </div>
  );
};

export default MistakeBook;