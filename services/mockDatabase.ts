
import { ExamCategory, Test, Question, User, Role, TestAttempt, Option, Mistake, AdminStats, AuditLog } from '../types';

/**
 * MASTERG DBMS SIMULATION LAYER
 * TRAINED DATA SET FOR VIVA DEMONSTRATION
 */

const CATEGORIES: ExamCategory[] = [
  { id: '1', name: 'SSC (CGL/CHSL)', description: 'Staff Selection Commission Exams' },
  { id: '2', name: 'Banking (IBPS/SBI)', description: 'PO and Clerk Exams for major banks' },
  { id: '3', name: 'Railway (RRB)', description: 'NTPC and Group D Recruitment' },
  { id: '4', name: 'UPSC (Prelims)', description: 'Civil Services Preliminary Examination' },
];

const TESTS: Test[] = [
  { id: 'mock_10', categoryId: '1', title: '⚡ Quick Mock (10 Qs)', durationMinutes: 15, totalMarks: 20, questionCount: 10, type: 'MOCK', isActive: true },
  { id: 'mock_25', categoryId: '1', title: '🏆 Standard Mock (25 Qs)', durationMinutes: 30, totalMarks: 50, questionCount: 25, type: 'MOCK', isActive: true },
  { id: 'unlimited_1', categoryId: '1', title: '∞ Infinite Practice Arena', durationMinutes: 0, totalMarks: 0, questionCount: -1, type: 'UNLIMITED', isActive: true },
  { id: 't1', categoryId: '1', title: 'SSC CGL Tier-1 Full Mock', durationMinutes: 60, totalMarks: 200, questionCount: 25, type: 'MOCK', isActive: true },
  { id: 't2', categoryId: '2', title: 'SBI PO Prelims Speed Test', durationMinutes: 60, totalMarks: 100, questionCount: 25, type: 'MOCK', isActive: true },
];

// --- TRAINED QUESTION BANK (REAL QUESTIONS) ---
const QUESTION_POOL: Question[] = [
    // Quant
    {
        id: 'pool_q1', testId: null, subject: 'Quantitative Aptitude', difficulty: 'EASY', status: 'PUBLISHED', positiveMarks: 2, negativeMarks: 0.5,
        text: 'If A:B = 2:3 and B:C = 4:5, then find A:B:C.',
        options: [{ id: 'o1', text: '8:12:15', isCorrect: true }, { id: 'o2', text: '2:3:5', isCorrect: false }, { id: 'o3', text: '8:15:12', isCorrect: false }, { id: 'o4', text: '6:9:15', isCorrect: false }]
    },
    {
        id: 'pool_q2', testId: null, subject: 'Quantitative Aptitude', difficulty: 'MEDIUM', status: 'PUBLISHED', positiveMarks: 2, negativeMarks: 0.5,
        text: 'A train running at 60 km/hr crosses a pole in 9 seconds. What is the length of the train?',
        options: [{ id: 'o1', text: '120 m', isCorrect: false }, { id: 'o2', text: '180 m', isCorrect: false }, { id: 'o3', text: '150 m', isCorrect: true }, { id: 'o4', text: '324 m', isCorrect: false }]
    },
    {
        id: 'pool_q3', testId: null, subject: 'Quantitative Aptitude', difficulty: 'HARD', status: 'PUBLISHED', positiveMarks: 2, negativeMarks: 0.5,
        text: 'A does 20% less work than B. If A can complete a piece of work in 7.5 hours, then B can do it in:',
        options: [{ id: 'o1', text: '6 hours', isCorrect: true }, { id: 'o2', text: '8 hours', isCorrect: false }, { id: 'o3', text: '5.5 hours', isCorrect: false }, { id: 'o4', text: '6.5 hours', isCorrect: false }]
    },
    // GK
    {
        id: 'pool_q4', testId: null, subject: 'General Awareness', difficulty: 'MEDIUM', status: 'PUBLISHED', positiveMarks: 2, negativeMarks: 0.5,
        text: 'Which Article deals with "Right to Constitutional Remedies"?',
        options: [{ id: 'o1', text: 'Article 19', isCorrect: false }, { id: 'o2', text: 'Article 32', isCorrect: true }, { id: 'o3', text: 'Article 21', isCorrect: false }, { id: 'o4', text: 'Article 14', isCorrect: false }]
    },
    {
        id: 'pool_q5', testId: null, subject: 'General Awareness', difficulty: 'EASY', status: 'PUBLISHED', positiveMarks: 2, negativeMarks: 0.5,
        text: 'Who was the first Governor-General of Bengal?',
        options: [{ id: 'o1', text: 'Robert Clive', isCorrect: false }, { id: 'o2', text: 'Warren Hastings', isCorrect: true }, { id: 'o3', text: 'Lord Mayo', isCorrect: false }, { id: 'o4', text: 'Dalhousie', isCorrect: false }]
    },
    // Reasoning
    {
        id: 'pool_q6', testId: null, subject: 'General Intelligence', difficulty: 'HARD', status: 'PUBLISHED', positiveMarks: 2, negativeMarks: 0.5,
        text: 'Calendar : Dates :: Dictionary : ?',
        options: [{ id: 'o1', text: 'Vocabulary', isCorrect: false }, { id: 'o2', text: 'Words', isCorrect: true }, { id: 'o3', text: 'Books', isCorrect: false }, { id: 'o4', text: 'Language', isCorrect: false }]
    },
    {
        id: 'pool_q7', testId: null, subject: 'General Intelligence', difficulty: 'MEDIUM', status: 'PUBLISHED', positiveMarks: 2, negativeMarks: 0.5,
        text: 'Find the odd one out: 3, 5, 11, 14, 17, 21',
        options: [{ id: 'o1', text: '21', isCorrect: false }, { id: 'o2', text: '14', isCorrect: true }, { id: 'o3', text: '17', isCorrect: false }, { id: 'o4', text: '3', isCorrect: false }]
    },
    // English
    {
        id: 'pool_q8', testId: null, subject: 'English', difficulty: 'EASY', status: 'PUBLISHED', positiveMarks: 2, negativeMarks: 0.5,
        text: 'Select the synonym of "ABANDON".',
        options: [{ id: 'o1', text: 'Keep', isCorrect: false }, { id: 'o2', text: 'Forsake', isCorrect: true }, { id: 'o3', text: 'Cherish', isCorrect: false }, { id: 'o4', text: 'Enlarge', isCorrect: false }]
    },
    // Computer
    {
        id: 'pool_q9', testId: null, subject: 'Computer Knowledge', difficulty: 'MEDIUM', status: 'PUBLISHED', positiveMarks: 2, negativeMarks: 0.5,
        text: 'In DBMS, which Normal Form removes transitive dependencies?',
        options: [{ id: 'o1', text: '1NF', isCorrect: false }, { id: 'o2', text: '2NF', isCorrect: false }, { id: 'o3', text: '3NF', isCorrect: true }, { id: 'o4', text: 'BCNF', isCorrect: false }]
    }
];

// Initial Seed Users (Strict ID Separation)
const SEED_USERS: any[] = [
    { id: '1', userCode: 'ADM001', name: 'MasterG Admin', email: 'admin@masterg.com', role: Role.ADMIN, password: 'password', isBlocked: false, joinedAt: '2023-01-01', streakDays: 99 },
    { id: '2', userCode: 'STU1001', name: 'Rahul Student', email: 'student@example.com', role: Role.STUDENT, password: 'password', isBlocked: false, joinedAt: '2023-06-15', streakDays: 5 },
];

// Helper to shuffle array
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

const generateQuestions = (testId: string, count: number, offset: number = 0): Question[] => {
  const subjects = ['General Intelligence', 'General Awareness', 'Quantitative Aptitude', 'English'];
  const questions: Question[] = [];
  for (let i = 0; i < count; i++) {
    const globalIndex = offset + i;
    const subjectIndex = Math.floor((globalIndex % 100) / 25) % 4; 
    questions.push({
      id: `gen_q${globalIndex + 1}_${testId}`, 
      testId: null, 
      text: `Generated Question #${globalIndex + 1} [${subjects[subjectIndex]}]: Select Option B for correct answer.`,
      positiveMarks: 2, 
      negativeMarks: 0.5, 
      subject: subjects[subjectIndex],
      difficulty: 'MEDIUM',
      status: 'PUBLISHED',
      options: [
        { id: `o${globalIndex}_1`, text: 'Option A', isCorrect: false },
        { id: `o${globalIndex}_2`, text: 'Option B (Correct)', isCorrect: true },
        { id: `o${globalIndex}_3`, text: 'Option C', isCorrect: false },
        { id: `o${globalIndex}_4`, text: 'Option D', isCorrect: false },
      ]
    });
  }
  return questions;
};

// --- AUTHENTICATION LOGIC ---

export const auth = {
    // 1. Unified Signup (Handles both STU and ADM creation via Secret Key)
    signup: async (name: string, email: string, password: string, secretKey?: string): Promise<User> => {
        return new Promise((resolve, reject) => {
            const users = JSON.parse(localStorage.getItem('masterg_users') || JSON.stringify(SEED_USERS));
            
            // Check Uniqueness
            if (users.find((u: any) => u.email === email)) {
                reject(new Error('Email already registered'));
                return;
            }

            let role = Role.STUDENT;
            let userCodePrefix = 'STU';

            // SECURE ADMIN CREATION CHECK
            if (secretKey) {
                if (secretKey !== 'masterg_admin') {
                    reject(new Error('Invalid Admin Secret Key. Access Denied.'));
                    return;
                }
                role = Role.ADMIN;
                userCodePrefix = 'ADM';
            }

            // AUTO-GENERATE ID
            const timestamp = Date.now().toString().slice(-6);
            const userCode = `${userCodePrefix}${timestamp}`;
            const internalId = `u${Date.now()}`;

            const newUser = {
                id: internalId,
                userCode: userCode,
                name,
                email,
                password, // In real DB, this would be hashed
                role: role, 
                isBlocked: false,
                streakDays: 0,
                joinedAt: new Date().toISOString().split('T')[0]
            };

            users.push(newUser);
            localStorage.setItem('masterg_users', JSON.stringify(users));
            resolve({ 
                id: newUser.id, 
                userCode: newUser.userCode,
                name: newUser.name, 
                email: newUser.email, 
                role: newUser.role, 
                streakDays: 0 
            });
        });
    },

    // 2. Secure Login
    login: async (email: string, password: string): Promise<User> => {
        return new Promise((resolve, reject) => {
            const users = JSON.parse(localStorage.getItem('masterg_users') || JSON.stringify(SEED_USERS));
            const user = users.find((u: any) => u.email === email && u.password === password);

            if (!user) {
                reject(new Error('Invalid credentials'));
                return;
            }

            if (user.isBlocked) {
                reject(new Error('Account is blocked by Admin'));
                return;
            }

            // Return sanitized user object (no password)
            resolve({ 
                id: user.id,
                userCode: user.userCode,
                name: user.name, 
                email: user.email, 
                role: user.role, 
                streakDays: user.streakDays,
                isBlocked: user.isBlocked 
            });
        });
    }
};

export const db = {
  auth, // Export auth module
  
  getExams: async (): Promise<ExamCategory[]> => new Promise((resolve) => setTimeout(() => resolve(CATEGORIES), 300)),

  getTestsByExam: async (examId: string | null): Promise<Test[]> => {
    return new Promise((resolve) => {
      let relevantTests = examId ? TESTS.filter(t => t.categoryId === examId) : TESTS;
      const quickMocks = TESTS.filter(t => t.id === 'mock_10' || t.id === 'mock_25' || t.id === 'unlimited_1');
      const uniqueTests = Array.from(new Set([...quickMocks, ...relevantTests]));
      setTimeout(() => resolve(uniqueTests), 300);
    });
  },

  getQuestionsForTest: async (testId: string): Promise<Question[]> => {
    return new Promise((resolve) => {
      if (testId === 'mock_10' || testId === 'mock_25') {
          const requiredCount = testId === 'mock_10' ? 10 : 25;
          const fullPool = [...QUESTION_POOL, ...generateQuestions(testId, 30)];
          const shuffled = shuffle(fullPool);
          const selected = shuffled.slice(0, requiredCount).map(q => ({
              ...q, 
              testId: testId
          }));
          setTimeout(() => resolve(selected), 400);
          return;
      }
      const test = TESTS.find(t => t.id === testId);
      const count = (test && test.type === 'UNLIMITED') ? 20 : 5;
      if (testId === 't1') {
           setTimeout(() => resolve([...QUESTION_POOL.slice(0, 5)]), 400);
      } else {
           setTimeout(() => resolve(generateQuestions(testId, count)), 400);
      }
    });
  },

  fetchMoreQuestions: async (testId: string, currentCount: number): Promise<Question[]> => {
      return new Promise((resolve) => {
          setTimeout(() => resolve(generateQuestions(testId, 10, currentCount)), 400);
      });
  },

  submitTestAttempt: async (userId: string, testId: string, answers: Record<string, string>, timeSpent: number): Promise<TestAttempt> => {
    let totalScore = 0;
    let correctCount = 0;
    const mistakes: any[] = [];
    const universe = [...QUESTION_POOL, ...generateQuestions(testId, 100)]; 
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
    return new Promise(resolve => resolve(history.filter((h: TestAttempt) => h.userId === userId).reverse()));
  },

  getMistakeBook: async (userId: string): Promise<Mistake[]> => {
    const allMistakes = JSON.parse(localStorage.getItem('mistakes') || '[]');
    const userMistakes = allMistakes.filter((m: any) => m.userId === userId);
    const universe = [...QUESTION_POOL, ...generateQuestions('universal', 100)];
    const enrichedMistakes: Mistake[] = userMistakes.map((m: any) => {
        const question = universe.find(q => q.id === m.questionId) || generateQuestions('fallback', 1, 0)[0];
        return question ? { question, userAnswerId: m.selectedOptionId, attemptDate: m.attemptDate } : null;
    }).filter((m: any) => m !== null);
    return new Promise(resolve => resolve(enrichedMistakes.reverse()));
  },

  getLeaderboard: async (): Promise<any[]> => {
    return [
      { rank: 1, name: 'Amit Sharma', exam: 'SSC CGL', score: 185 },
      { rank: 2, name: 'Priya Verma', exam: 'SBI PO', score: 172 },
      { rank: 3, name: 'Rahul Singh', exam: 'SSC CGL', score: 168 },
    ];
  },

  getStudentAnalytics: async (userId: string) => {
    const history: TestAttempt[] = JSON.parse(localStorage.getItem('attempt_history') || '[]');
    const userHistory = history.filter(h => h.userId === userId);
    const totalTests = userHistory.length;
    const avgAccuracy = totalTests > 0 ? userHistory.reduce((acc, curr) => acc + curr.accuracy, 0) / totalTests : 0;
    
    return new Promise((resolve) => resolve({
        readinessScore: Math.min(100, Math.round(avgAccuracy * 0.8 + (totalTests * 2))),
        weakSubject: 'Quantitative Aptitude',
        completedTests: totalTests,
        dailyTasks: [{ id: 1, task: `Attempt Quick Mock (10 Qs)`, completed: false }]
    }));
  },

  getAdminStats: async (): Promise<AdminStats> => {
      // Real-time user count from LocalStorage
      const users = JSON.parse(localStorage.getItem('masterg_users') || JSON.stringify(SEED_USERS));
      const history = JSON.parse(localStorage.getItem('attempt_history') || '[]');
      const avgScore = history.length > 0 ? history.reduce((acc: number, h: any) => acc + h.score, 0) / history.length : 0;
      return new Promise(resolve => setTimeout(() => resolve({
          totalUsers: users.length,
          activeUsersToday: Math.floor(users.length * 0.4),
          totalTests: TESTS.length,
          totalQuestions: 5000,
          avgPlatformScore: parseFloat(avgScore.toFixed(2)),
          recentLogs: AUDIT_LOGS
      }), 400));
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

const AUDIT_LOGS: AuditLog[] = [
    { id: '1', adminId: '1', action: 'SYSTEM_INIT', details: 'System initialized with Strict ID Separation (ADM/STU)', timestamp: new Date().toISOString() }
];
