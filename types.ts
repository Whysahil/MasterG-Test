
// Domain entities mirroring the Database Schema

export enum Role {
  STUDENT = 'STUDENT',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;        // Internal DB ID (e.g., 1, 2, 3)
  userCode: string;  // Public ID (e.g., STU202301, ADM001)
  name: string;
  email: string;
  role: Role;
  streakDays: number;
  isBlocked?: boolean; // New security feature
  joinedAt?: string;
}

export interface ExamCategory {
  id: string; // e.g., 'SSC', 'BANKING'
  name: string;
  description: string;
}

export interface Test {
  id: string;
  categoryId: string;
  title: string;
  durationMinutes: number; // 0 for unlimited
  totalMarks: number;
  questionCount: number; // 0 or -1 for unlimited
  type: 'MOCK' | 'PYQ' | 'SECTIONAL' | 'UNLIMITED';
  isActive: boolean; // Admin control
}

export interface Question {
  id: string;
  testId: string | null; // Nullable for Global Pool
  text: string;
  options: Option[];
  positiveMarks: number;
  negativeMarks: number;
  subject: string; 
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  status: 'DRAFT' | 'PUBLISHED'; // Content Workflow
}

export interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface TestAttempt {
  id: string;
  userId: string;
  testId: string;
  score: number;
  accuracy: number;
  startTime: string;
  endTime: string;
  status: 'COMPLETED' | 'ABANDONED';
}

export interface AttemptDetail {
  questionId: string;
  selectedOptionId: string | null;
  isCorrect: boolean;
  timeSpentSeconds: number;
}

export interface Mistake {
  question: Question;
  userAnswerId: string | null;
  attemptDate: string;
}

// --- NEW ADMIN TYPES ---

export interface AdminStats {
  totalUsers: number;
  activeUsersToday: number;
  totalTests: number;
  totalQuestions: number;
  avgPlatformScore: number;
  recentLogs: AuditLog[];
}

export interface AuditLog {
  id: string;
  adminId: string;
  action: string; // e.g., 'USER_BLOCK', 'BULK_UPLOAD'
  details: string;
  timestamp: string;
}
