import { ExamCategory, Test, Question, User, Role, TestAttempt, Option, Mistake, AdminStats, AuditLog } from '../types';
import { aiTutorService } from './aiTutor';

/**
 * MASTERG DBMS - PRODUCTION GRADE MOCK DATABASE
 * ARCHITECT: SENIOR EXAM PLATFORM LEAD
 */

// --- 1. EXAM CATEGORIES (STRICT) ---
const CATEGORIES: ExamCategory[] = [
  { id: 'SSC', name: 'SSC Exams', description: 'CGL, CHSL, MTS, CPO' },
  { id: 'BANK', name: 'Banking & Insurance', description: 'IBPS PO/Clerk, SBI, RBI' },
  { id: 'RLY', name: 'Railways (RRB)', description: 'NTPC, Group D, ALP' },
  { id: 'UPSC', name: 'UPSC & State PSC', description: 'Civil Services Prelims' },
];

// --- 2. MOCK TEST DEFINITIONS (TOPIC & EXAM WISE) ---
const TESTS: Test[] = [
  // SSC
  { id: 'ssc_quant_mix', categoryId: 'SSC', title: 'SSC CGL - Quant Full Mock (PYQ Pattern)', durationMinutes: 20, totalMarks: 50, questionCount: 25, type: 'MOCK', isActive: true },
  { id: 'ssc_reasoning_10', categoryId: 'SSC', title: 'SSC CHSL - Reasoning Speed Test', durationMinutes: 10, totalMarks: 20, questionCount: 10, type: 'MOCK', isActive: true },
  
  // Banking
  { id: 'bank_english_pre', categoryId: 'BANK', title: 'SBI PO Prelims - English Language', durationMinutes: 20, totalMarks: 30, questionCount: 30, type: 'MOCK', isActive: true },
  { id: 'bank_puzzle_inf', categoryId: 'BANK', title: '∞ Infinite Puzzles & Seating Arrangement', durationMinutes: 0, totalMarks: 0, questionCount: -1, type: 'UNLIMITED', isActive: true },

  // Railways
  { id: 'rrb_ntpc_ga', categoryId: 'RLY', title: 'RRB NTPC - General Awareness (High Yield)', durationMinutes: 15, totalMarks: 40, questionCount: 40, type: 'MOCK', isActive: true },

  // UPSC
  { id: 'upsc_gs_hist', categoryId: 'UPSC', title: 'UPSC Prelims - Modern History (1857-1947)', durationMinutes: 30, totalMarks: 50, questionCount: 25, type: 'SECTIONAL', isActive: true },
];

// --- 3. CURATED OFFLINE FALLBACK BANK (REAL PYQs ONLY) ---
// Used when AI Key is missing to ensure Quality is never compromised.
const OFFLINE_QUESTION_BANK: Question[] = [
    {
        id: 'pyq_ssc_01', testId: null, subject: 'Quantitative Aptitude', difficulty: 'MEDIUM', status: 'PUBLISHED', positiveMarks: 2, negativeMarks: 0.5,
        text: 'A shopkeeper sells an article at a loss of 12.5%. Had he sold it for Rs. 51.80 more, he would have earned a profit of 6%. Find the Cost Price of the article.',
        options: [{ id: 'o1', text: 'Rs. 280', isCorrect: true }, { id: 'o2', text: 'Rs. 300', isCorrect: false }, { id: 'o3', text: 'Rs. 380', isCorrect: false }, { id: 'o4', text: 'Rs. 250', isCorrect: false }]
    },
    {
        id: 'pyq_ssc_02', testId: null, subject: 'General Awareness', difficulty: 'EASY', status: 'PUBLISHED', positiveMarks: 2, negativeMarks: 0.5,
        text: 'Which Article of the Indian Constitution deals with the "Abolition of Untouchability"?',
        options: [{ id: 'o1', text: 'Article 16', isCorrect: false }, { id: 'o2', text: 'Article 17', isCorrect: true }, { id: 'o3', text: 'Article 18', isCorrect: false }, { id: 'o4', text: 'Article 23', isCorrect: false }]
    },
    {
        id: 'pyq_bank_01', testId: null, subject: 'English Language', difficulty: 'MEDIUM', status: 'PUBLISHED', positiveMarks: 1, negativeMarks: 0.25,
        text: 'Identify the segment containing the error: "Neither of the two candidates have submitted their resume."',
        options: [{ id: 'o1', text: 'Neither of', isCorrect: false }, { id: 'o2', text: 'have submitted', isCorrect: true }, { id: 'o3', text: 'their resume', isCorrect: false }, { id: 'o4', text: 'the two candidates', isCorrect: false }]
    },
    {
        id: 'pyq_upsc_01', testId: null, subject: 'History', difficulty: 'HARD', status: 'PUBLISHED', positiveMarks: 2, negativeMarks: 0.66,
        text: 'Who among the following was associated with the formation of the "Swaraj Party"?',
        options: [{ id: 'o1', text: 'C.R. Das and Motilal Nehru', isCorrect: true }, { id: 'o2', text: 'Vallabhbhai Patel and Rajendra Prasad', isCorrect: false }, { id: 'o3', text: 'Mahatma Gandhi and Jawaharlal Nehru', isCorrect: false }, { id: 'o4', text: 'Subhash Chandra Bose and INA', isCorrect: false }]
    },
    {
        id: 'pyq_rrb_01', testId: null, subject: 'General Science', difficulty: 'EASY', status: 'PUBLISHED', positiveMarks: 1, negativeMarks: 0.33,
        text: 'What is the unit of measurement for Luminous Intensity?',
        options: [{ id: 'o1', text: 'Mole', isCorrect: false }, { id: 'o2', text: 'Candela', isCorrect: true }, { id: 'o3', text: 'Kelvin', isCorrect: false }, { id: 'o4', text: 'Ampere', isCorrect: false }]
    },
    {
        id: 'pyq_ssc_03', testId: null, subject: 'Reasoning', difficulty: 'MEDIUM', status: 'PUBLISHED', positiveMarks: 2, negativeMarks: 0.5,
        text: 'Select the related word/letters/number from the given alternatives.\nACE : GIK :: MOQ : ?',
        options: [{ id: 'o1', text: 'STU', isCorrect: false }, { id: 'o2', text: 'SUW', isCorrect: true }, { id: 'o3', text: 'RTU', isCorrect: false }, { id: 'o4', text: 'VXZ', isCorrect: false }]
    }
];

// --- 4. USER DATA (STRICT ID SEPARATION) ---
const SEED_USERS: any[] = [
    { id: '1', userCode: 'ADM001', name: 'MasterG Admin', email: 'admin@masterg.com', role: Role.ADMIN, password: 'password', isBlocked: false, joinedAt: '2023-01-01', streakDays: 99 },
    { id: '2', userCode: 'STU1001', name: 'Rahul Student', email: 'student@example.com', role: Role.STUDENT, password: 'password', isBlocked: false, joinedAt: '2023-06-15', streakDays: 5 },
];

// --- 5. SYSTEM INTERNALS ---

// Dynamic Cache for AI Questions
const generatedQuestionBank: Record<string, Question[]> = {};

// Helper: Fisher-Yates Shuffle
const shuffle = <T>(array: T[]): T[] => {
    let currentIndex = array.length,  randomIndex;
    const newArr = [...array];
    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [newArr[currentIndex], newArr[randomIndex]] = [newArr[randomIndex], newArr[currentIndex]];
    }
    return newArr;
};

// --- 6. DATABASE METHODS ---

export const auth = {
    signup: async (name: string, email: string, password: string, secretKey?: string): Promise<User> => {
        return new Promise((resolve, reject) => {
            const users = JSON.parse(localStorage.getItem('masterg_users') || JSON.stringify(SEED_USERS));
            if (users.find((u: any) => u.email === email)) {
                reject(new Error('Email already registered'));
                return;
            }
            let role = Role.STUDENT;
            let userCodePrefix = 'STU';
            if (secretKey) {
                if (secretKey !== 'masterg_admin') {
                    reject(new Error('Invalid Admin Secret Key. Access Denied.'));
                    return;
                }
                role = Role.ADMIN;
                userCodePrefix = 'ADM';
            }
            const timestamp = Date.now().toString().slice(-6);
            const userCode = `${userCodePrefix}${timestamp}`;
            const internalId = `u${Date.now()}`;
            const newUser = {
                id: internalId, userCode: userCode, name, email, password, role: role, isBlocked: false, streakDays: 0, joinedAt: new Date().toISOString().split('T')[0]
            };
            users.push(newUser);
            localStorage.setItem('masterg_users', JSON.stringify(users));
            resolve({ id: newUser.id, userCode: newUser.userCode, name: newUser.name, email: newUser.email, role: newUser.role, streakDays: 0 });
        });
    },
    login: async (email: string, password: string): Promise<User> => {
        return new Promise((resolve, reject) => {
            const users = JSON.parse(localStorage.getItem('masterg_users') || JSON.stringify(SEED_USERS));
            const user = users.find((u: any) => u.email === email && u.password === password);
            if (!user) { reject(new Error('Invalid credentials')); return; }
            if (user.isBlocked) { reject(new Error('Account is blocked by Admin')); return; }
            resolve({ id: user.id, userCode: user.userCode, name: user.name, email: user.email, role: user.role, streakDays: user.streakDays, isBlocked: user.isBlocked });
        });
    }
};

export const db = {
  auth,
  
  getExams: async (): Promise<ExamCategory[]> => Promise.resolve(CATEGORIES),

  getTestsByExam: async (examId: string | null): Promise<Test[]> => {
    return new Promise((resolve) => {
      let relevantTests = examId ? TESTS.filter(t => t.categoryId === examId) : TESTS;
      setTimeout(() => resolve(relevantTests), 300);
    });
  },

  getQuestionsForTest: async (testId: string): Promise<Question[]> => {
    // A. Check Session Cache
    if (generatedQuestionBank[testId] && generatedQuestionBank[testId].length > 0) {
       return generatedQuestionBank[testId];
    }

    const testInfo = TESTS.find(t => t.id === testId);
    const count = testInfo?.questionCount && testInfo.questionCount > 0 ? testInfo.questionCount : 10;
    
    // B. AI Generation (PRIMARY SOURCE)
    if (aiTutorService.hasApiKey()) {
       // Derive Context from Test Title
       const subjectContext = testInfo?.title || 'General Competitive Exam';
       
       try {
           const aiData = await aiTutorService.generateMockQuestions(subjectContext, count, testInfo?.categoryId || 'SSC');
           
           if (aiData.length > 0) {
               const aiQuestions: Question[] = aiData.map((q, idx) => ({
                   id: `ai_${testId}_${Date.now()}_${idx}`,
                   testId: testId,
                   text: q.questionText,
                   subject: q.subject || 'General',
                   difficulty: (q.difficulty === 'MODERATE' ? 'MEDIUM' : q.difficulty) as 'EASY' | 'MEDIUM' | 'HARD',
                   positiveMarks: 2,
                   negativeMarks: 0.5,
                   status: 'PUBLISHED',
                   options: q.options.map((optText: string, oIdx: number) => ({
                       id: `opt_${idx}_${oIdx}`,
                       text: optText,
                       isCorrect: oIdx === q.correctOptionIndex
                   }))
               }));
               
               generatedQuestionBank[testId] = aiQuestions;
               return aiQuestions;
           }
       } catch (err) {
           console.warn("AI Generation Failed. Falling back to offline PYQs.", err);
       }
    }

    // C. Offline Fallback (REAL PYQs ONLY)
    // No more dummy "Option A, Option B" questions.
    return new Promise((resolve) => {
        const fallback = shuffle(OFFLINE_QUESTION_BANK).slice(0, count).map(q => ({
            ...q,
            testId: testId // Bind to current test
        }));
        
        // If we requested more than we have, cycle them to fill the count
        while (fallback.length < count) {
            const clone = { ...fallback[fallback.length % OFFLINE_QUESTION_BANK.length] };
            clone.id = `copy_${fallback.length}_${clone.id}`;
            fallback.push(clone);
        }

        generatedQuestionBank[testId] = fallback;
        setTimeout(() => resolve(fallback), 400);
    });
  },

  fetchMoreQuestions: async (testId: string, currentCount: number): Promise<Question[]> => {
      // Infinite Mode Handler
      if (aiTutorService.hasApiKey()) {
          const aiData = await aiTutorService.generateMockQuestions('Mixed Practice (Reasoning, Quant, GK)', 5, 'SSC');
          const aiQuestions: Question[] = aiData.map((q, idx) => ({
               id: `ai_inf_${currentCount + idx}`,
               testId: testId,
               text: q.questionText,
               subject: q.subject,
               difficulty: (q.difficulty === 'MODERATE' ? 'MEDIUM' : q.difficulty) as 'EASY' | 'MEDIUM' | 'HARD',
               positiveMarks: 2,
               negativeMarks: 0.5,
               status: 'PUBLISHED',
               options: q.options.map((optText: string, oIdx: number) => ({
                   id: `opt_inf_${currentCount + idx}_${oIdx}`,
                   text: optText,
                   isCorrect: oIdx === q.correctOptionIndex
               }))
          }));
          
          if (!generatedQuestionBank[testId]) generatedQuestionBank[testId] = [];
          generatedQuestionBank[testId] = [...generatedQuestionBank[testId], ...aiQuestions];
          
          return aiQuestions;
      }
      
      // Offline fallback for infinite mode - Recycle PYQs
      const recycled = shuffle(OFFLINE_QUESTION_BANK).slice(0, 5).map((q, i) => ({
          ...q,
          id: `inf_offline_${currentCount + i}`
      }));
      if (!generatedQuestionBank[testId]) generatedQuestionBank[testId] = [];
      generatedQuestionBank[testId] = [...generatedQuestionBank[testId], ...recycled];
      
      return Promise.resolve(recycled);
  },

  submitTestAttempt: async (userId: string, testId: string, answers: Record<string, string>, timeSpent: number): Promise<TestAttempt> => {
    let totalScore = 0;
    let correctCount = 0;
    const mistakes: any[] = [];
    
    // Grade against the Session Bank (Accuracy Guarantee)
    const sessionQuestions = generatedQuestionBank[testId] || [];
    // If fallback was used without caching, grab from Offline Bank (Edge case)
    const universe = [...sessionQuestions, ...OFFLINE_QUESTION_BANK]; 
    const qMap = new Map(universe.map(q => [q.id, q]));

    Object.keys(answers).forEach(qId => {
        const q = qMap.get(qId);
        if (q) {
            const selectedOptId = answers[qId];
            const correctOpt = q.options.find(o => o.isCorrect);
            if (correctOpt?.id === selectedOptId) {
                totalScore += q.positiveMarks;
                correctCount++;
            } else {
                totalScore -= q.negativeMarks;
                mistakes.push({ userId, questionId: q.id, testId, selectedOptionId: selectedOptId, attemptDate: new Date().toISOString() });
            }
        }
    });

    const attempt: TestAttempt = {
      id: Math.random().toString(36).substr(2, 9),
      userId, testId, score: totalScore, accuracy: (correctCount / Object.keys(answers).length || 1) * 100,
      startTime: new Date(Date.now() - timeSpent * 1000).toISOString(),
      endTime: new Date().toISOString(), status: 'COMPLETED'
    };

    const history = JSON.parse(localStorage.getItem('attempt_history') || '[]');
    history.push(attempt);
    localStorage.setItem('attempt_history', JSON.stringify(history));
    
    const allMistakes = JSON.parse(localStorage.getItem('mistakes') || '[]');
    localStorage.setItem('mistakes', JSON.stringify([...allMistakes, ...mistakes]));

    return new Promise(resolve => setTimeout(() => resolve(attempt), 800));
  },

  getUserHistory: async (userId: string): Promise<TestAttempt[]> => {
    const history = JSON.parse(localStorage.getItem('attempt_history') || '[]');
    return Promise.resolve(history.filter((h: TestAttempt) => h.userId === userId).reverse());
  },

  getMistakeBook: async (userId: string): Promise<Mistake[]> => {
    const allMistakes = JSON.parse(localStorage.getItem('mistakes') || '[]');
    const userMistakes = allMistakes.filter((m: any) => m.userId === userId);
    const allGeneratedQs = Object.values(generatedQuestionBank).flat();
    const universe = [...OFFLINE_QUESTION_BANK, ...allGeneratedQs];
    
    const enrichedMistakes: Mistake[] = userMistakes.map((m: any) => {
        const question = universe.find(q => q.id === m.questionId);
        return question ? { question, userAnswerId: m.selectedOptionId, attemptDate: m.attemptDate } : null;
    }).filter((m: any) => m !== null);
    
    return Promise.resolve(enrichedMistakes.reverse());
  },

  getLeaderboard: async (): Promise<any[]> => {
    return [
      { rank: 1, name: 'Amit Sharma', exam: 'SSC CGL', score: 185 },
      { rank: 2, name: 'Priya Verma', exam: 'SBI PO', score: 172 },
      { rank: 3, name: 'Rahul Singh', exam: 'RRB NTPC', score: 168 },
    ];
  },

  getStudentAnalytics: async (userId: string) => {
    const history: TestAttempt[] = JSON.parse(localStorage.getItem('attempt_history') || '[]');
    const userHistory = history.filter(h => h.userId === userId);
    const totalTests = userHistory.length;
    const avgAccuracy = totalTests > 0 ? userHistory.reduce((acc, curr) => acc + curr.accuracy, 0) / totalTests : 0;
    
    return Promise.resolve({
        readinessScore: Math.min(100, Math.round(avgAccuracy * 0.8 + (totalTests * 5))),
        weakSubject: 'General Awareness',
        completedTests: totalTests,
        dailyTasks: [{ id: 1, task: `Attempt Daily PYQ Mock`, completed: false }]
    });
  },

  getAdminStats: async (): Promise<AdminStats> => {
      const users = JSON.parse(localStorage.getItem('masterg_users') || JSON.stringify(SEED_USERS));
      return Promise.resolve({
          totalUsers: users.length,
          activeUsersToday: Math.floor(users.length * 0.4),
          totalTests: TESTS.length,
          totalQuestions: Object.values(generatedQuestionBank).flat().length + OFFLINE_QUESTION_BANK.length,
          avgPlatformScore: 78.5,
          recentLogs: []
      });
  },

  getUsers: async (): Promise<User[]> => {
      const users = JSON.parse(localStorage.getItem('masterg_users') || JSON.stringify(SEED_USERS));
      return Promise.resolve(users.map((u: any) => ({ ...u, password: '***' })));
  },

  toggleUserBlock: async (userId: string, isBlocked: boolean): Promise<void> => {
      const users = JSON.parse(localStorage.getItem('masterg_users') || JSON.stringify(SEED_USERS));
      const index = users.findIndex((u: any) => u.id === userId);
      if (index !== -1) {
          users[index].isBlocked = isBlocked;
          localStorage.setItem('masterg_users', JSON.stringify(users));
      }
      return Promise.resolve();
  },

  bulkUploadQuestions: async (questions: any[]): Promise<void> => Promise.resolve()
};