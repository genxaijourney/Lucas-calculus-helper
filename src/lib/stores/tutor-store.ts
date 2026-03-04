import { create } from 'zustand';
import {
  TutorState,
  VoiceState,
  SessionMode,
  Difficulty,
  ConversationMessage,
  WhiteboardCommand,
  TopicUpdate,
  ErrorAnalysis,
} from '../types/tutor';
import {
  loadProfile,
  saveProfile,
  applyTopicUpdate,
  recordError,
  updateStreak,
} from '../knowledge/student-model';
import { STORAGE_KEY_WELCOME } from '../constants';

interface TutorActions {
  // Voice
  setVoiceState: (state: VoiceState) => void;
  setInterimTranscript: (transcript: string) => void;

  // Session
  setMode: (mode: SessionMode) => void;
  setDifficulty: (difficulty: Difficulty) => void;
  setCurrentTopic: (topicId: string | null) => void;
  startSession: () => void;

  // Messages
  addMessage: (message: ConversationMessage) => void;
  clearMessages: () => void;

  // Whiteboard
  setWhiteboardCommands: (commands: WhiteboardCommand[]) => void;
  clearWhiteboard: () => void;

  // Student
  applyTopicUpdate: (update: TopicUpdate) => void;
  recordError: (topicId: string, error: ErrorAnalysis) => void;
  addSessionMinutes: (minutes: number) => void;

  // UI
  setShowDashboard: (show: boolean) => void;
  setShowTopicSelector: (show: boolean) => void;
  setShowWelcome: (show: boolean) => void;
  setSpeechRate: (rate: number) => void;

  // ✅ New: global requests (header buttons can trigger; page.tsx performs)
  requestStop: () => void;
  requestReset: () => void;
  clearStopRequest: () => void;
  clearResetRequest: () => void;

  // Init
  initializeFromStorage: () => void;
}

const getInitialWelcome = (): boolean => {
  if (typeof window === 'undefined') return true;
  return !localStorage.getItem(STORAGE_KEY_WELCOME);
};

export const useTutorStore = create<TutorState & TutorActions>((set, get) => ({
  // Initial state
  voiceState: 'idle',
  interimTranscript: '',
  mode: 'teach',
  difficulty: 'beginner',
  currentTopicId: null,
  sessionStartTime: null,
  messages: [],
  activeWhiteboardCommands: [],
  profile: loadProfile(),
  showDashboard: false,
  showTopicSelector: false,
  showWelcome: true,
  speechRate: 1,

  // ✅ New: request flags
  stopRequested: false,
  resetRequested: false,

  // Voice actions
  setVoiceState: (voiceState) => set({ voiceState }),
  setInterimTranscript: (interimTranscript) => set({ interimTranscript }),

  // Session actions
  setMode: (mode) => set({ mode }),
  setDifficulty: (difficulty) => set({ difficulty }),
  setCurrentTopic: (topicId) => set({ currentTopicId: topicId }),
  startSession: () => {
    const profile = updateStreak(get().profile);
    saveProfile(profile);
    set({ profile, sessionStartTime: Date.now() });
  },

  // Message actions
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  clearMessages: () => set({ messages: [], activeWhiteboardCommands: [] }),

  // Whiteboard actions
  setWhiteboardCommands: (commands) => {
    // If there's a 'clear' command, start fresh
    const hasClear = commands.some((c) => c.type === 'clear');
    if (hasClear) {
      const nonClear = commands.filter((c) => c.type !== 'clear');
      set({ activeWhiteboardCommands: nonClear });
    } else {
      set((state) => ({
        activeWhiteboardCommands: [...state.activeWhiteboardCommands, ...commands],
      }));
    }
  },
  clearWhiteboard: () => set({ activeWhiteboardCommands: [] }),

  // Student actions
  applyTopicUpdate: (update) => {
    const profile = applyTopicUpdate(get().profile, update);
    saveProfile(profile);
    set({ profile });
  },
  recordError: (topicId, error) => {
    const profile = recordError(get().profile, topicId, error);
    saveProfile(profile);
    set({ profile });
  },
  addSessionMinutes: (minutes) => {
    const profile = { ...get().profile, totalMinutes: get().profile.totalMinutes + minutes };
    saveProfile(profile);
    set({ profile });
  },

  // UI actions
  setShowDashboard: (showDashboard) => set({ showDashboard }),
  setShowTopicSelector: (showTopicSelector) => set({ showTopicSelector }),
  setShowWelcome: (showWelcome) => {
    if (!showWelcome && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_WELCOME, 'true');
    }
    set({ showWelcome });
  },
  setSpeechRate: (speechRate) => set({ speechRate }),

  // ✅ New: request actions
  requestStop: () => set({ stopRequested: true }),
  requestReset: () => set({ resetRequested: true }),
  clearStopRequest: () => set({ stopRequested: false }),
  clearResetRequest: () => set({ resetRequested: false }),

  // Init
  initializeFromStorage: () => {
    set({
      profile: loadProfile(),
      showWelcome: getInitialWelcome(),
    });
  },
}));