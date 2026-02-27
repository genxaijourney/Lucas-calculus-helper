// ==========================================
// MathVoice Core Types — THE contract for the app
// ==========================================

// --- Voice ---
export type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking';

// --- Session Modes ---
export type SessionMode = 'teach' | 'practice' | 'diagnose' | 'drill';
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

// --- Conversation ---
export interface ConversationMessage {
  id: string;
  role: 'student' | 'tutor';
  content: string;
  timestamp: number;
  whiteboardCommands?: WhiteboardCommand[];
}

// --- Whiteboard Commands (discriminated union) ---
export type WhiteboardCommand =
  | EquationCommand
  | GraphCommand
  | StepCommand
  | ClearCommand
  | AnnotationCommand;

export interface EquationCommand {
  type: 'equation';
  latex: string;
  label?: string;
  highlight?: boolean;
}

export interface GraphCommand {
  type: 'graph';
  spec: GraphSpec;
}

export interface StepCommand {
  type: 'step';
  steps: StepItem[];
  title?: string;
}

export interface ClearCommand {
  type: 'clear';
}

export interface AnnotationCommand {
  type: 'annotation';
  text: string;
  color?: 'blue' | 'green' | 'amber' | 'red';
}

// --- Graph Specification ---
export interface GraphSpec {
  functions: GraphFunction[];
  domain?: [number, number];
  range?: [number, number];
  points?: GraphPoint[];
  animations?: GraphAnimation[];
}

export interface GraphFunction {
  expression: string; // mathjs expression string, e.g., "x^2 - 3*x + 2"
  color?: string;
  label?: string;
  style?: 'solid' | 'dashed';
}

export interface GraphPoint {
  x: number;
  y: number;
  label?: string;
  color?: string;
}

export interface GraphAnimation {
  type: 'tangent_line' | 'approaching_point' | 'area_accumulation';
  at?: number;
  from?: number;
  to?: number;
  steps?: number;
}

// --- Step Display ---
export interface StepItem {
  label: string;
  latex?: string;
  explanation?: string;
}

// --- AI Response (what Claude returns via tool_choice) ---
export interface TutorResponse {
  message: string; // spoken text (no LaTeX symbols — natural English)
  whiteboard: WhiteboardCommand[];
  errorAnalysis?: ErrorAnalysis;
  topicUpdate?: TopicUpdate;
  expectsResponse: boolean;
}

export interface ErrorAnalysis {
  category: ErrorCategory;
  description: string;
  misconception?: string;
  severity: 'minor' | 'moderate' | 'major';
}

export type ErrorCategory =
  | 'arithmetic'
  | 'algebraic_manipulation'
  | 'conceptual_misunderstanding'
  | 'sign_error'
  | 'order_of_operations'
  | 'incomplete_solution'
  | 'notation_confusion'
  | 'application_error';

export interface TopicUpdate {
  topicId: string;
  delta: number; // positive for understanding, negative for gaps
  reason: string;
}

// --- Knowledge / Student Profile ---
export type TopicCategory =
  | 'pre_algebra'
  | 'algebra'
  | 'precalculus'
  | 'calculus'
  | 'linear_algebra'
  | 'differential_equations';

export interface TopicNode {
  id: string;
  name: string;
  category: TopicCategory;
  prerequisites: string[];
  mastery: number; // 0 to 1
  attempts: number;
  errorHistory: ErrorRecord[];
}

export interface ErrorRecord {
  category: ErrorCategory;
  description: string;
  timestamp: number;
}

export interface StudentProfile {
  id: string;
  topics: Record<string, TopicNode>;
  sessionsCompleted: number;
  totalMinutes: number;
  currentStreak: number;
  lastSessionDate: string; // ISO date string
  createdAt: string;
}

// --- Store State ---
export interface TutorState {
  // Voice
  voiceState: VoiceState;
  interimTranscript: string;

  // Session
  mode: SessionMode;
  difficulty: Difficulty;
  currentTopicId: string | null;
  sessionStartTime: number | null;

  // Conversation
  messages: ConversationMessage[];

  // Whiteboard
  activeWhiteboardCommands: WhiteboardCommand[];

  // Student
  profile: StudentProfile;

  // UI
  showDashboard: boolean;
  showTopicSelector: boolean;
  showWelcome: boolean;
  speechRate: number;
}

// --- API Request ---
export interface TutorApiRequest {
  messages: ConversationMessage[];
  mode: SessionMode;
  difficulty: Difficulty;
  currentTopicId: string | null;
  studentWeaknesses: string[];
}
