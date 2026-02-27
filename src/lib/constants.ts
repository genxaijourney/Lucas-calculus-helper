import { TopicCategory, SessionMode, ErrorCategory } from './types/tutor';

export const CATEGORY_LABELS: Record<TopicCategory, string> = {
  pre_algebra: 'Pre-Algebra',
  algebra: 'Algebra',
  precalculus: 'Precalculus',
  calculus: 'Calculus',
  linear_algebra: 'Linear Algebra',
  differential_equations: 'Differential Equations',
};

export const CATEGORY_COLORS: Record<TopicCategory, string> = {
  pre_algebra: '#8b5cf6',
  algebra: '#3b82f6',
  precalculus: '#06b6d4',
  calculus: '#10b981',
  linear_algebra: '#f59e0b',
  differential_equations: '#ef4444',
};

export const MODE_LABELS: Record<SessionMode, string> = {
  teach: 'Teach Me',
  practice: 'Practice',
  diagnose: 'Diagnose',
  drill: 'Quick Drill',
};

export const MODE_DESCRIPTIONS: Record<SessionMode, string> = {
  teach: 'Learn new concepts with guided explanations',
  practice: 'Solve problems with hints when you need them',
  diagnose: 'Find and fix gaps in your understanding',
  drill: 'Quick-fire problems to build speed',
};

export const ERROR_CATEGORY_LABELS: Record<ErrorCategory, string> = {
  arithmetic: 'Arithmetic Error',
  algebraic_manipulation: 'Algebra Mistake',
  conceptual_misunderstanding: 'Conceptual Gap',
  sign_error: 'Sign Error',
  order_of_operations: 'Order of Operations',
  incomplete_solution: 'Incomplete Solution',
  notation_confusion: 'Notation Confusion',
  application_error: 'Application Error',
};

// Timing
export const WORDS_PER_MINUTE = 150;
export const MIN_SPEECH_DURATION_MS = 2000;
export const WHITEBOARD_COMMAND_DELAY_MS = 300;

// Mastery thresholds
export const MASTERY_THRESHOLD_READY = 0.5;
export const MASTERY_THRESHOLD_PROFICIENT = 0.8;

// LocalStorage keys
export const STORAGE_KEY_PROFILE = 'mathvoice_student_profile';
export const STORAGE_KEY_WELCOME = 'mathvoice_welcome_seen';
