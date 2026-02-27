import { StudentProfile, TopicUpdate, ErrorAnalysis } from '../types/tutor';
import { createDefaultTopics } from './topic-graph';
import { STORAGE_KEY_PROFILE } from '../constants';
import { generateId, getTodayDateString } from '../utils';

export function createDefaultProfile(): StudentProfile {
  return {
    id: generateId(),
    topics: createDefaultTopics(),
    sessionsCompleted: 0,
    totalMinutes: 0,
    currentStreak: 0,
    lastSessionDate: '',
    createdAt: new Date().toISOString(),
  };
}

export function loadProfile(): StudentProfile {
  if (typeof window === 'undefined') return createDefaultProfile();
  try {
    const stored = localStorage.getItem(STORAGE_KEY_PROFILE);
    if (stored) {
      const profile = JSON.parse(stored) as StudentProfile;
      // Merge with defaults to handle new topics added after profile was created
      const defaultTopics = createDefaultTopics();
      for (const id of Object.keys(defaultTopics)) {
        if (!profile.topics[id]) {
          profile.topics[id] = defaultTopics[id];
        }
      }
      return profile;
    }
  } catch {
    // Corrupted data, start fresh
  }
  return createDefaultProfile();
}

export function saveProfile(profile: StudentProfile): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
  } catch {
    // Storage full or unavailable
  }
}

export function applyTopicUpdate(
  profile: StudentProfile,
  update: TopicUpdate
): StudentProfile {
  const topic = profile.topics[update.topicId];
  if (!topic) return profile;

  const newMastery = Math.max(0, Math.min(1, topic.mastery + update.delta));
  return {
    ...profile,
    topics: {
      ...profile.topics,
      [update.topicId]: {
        ...topic,
        mastery: newMastery,
        attempts: topic.attempts + 1,
      },
    },
  };
}

export function recordError(
  profile: StudentProfile,
  topicId: string,
  error: ErrorAnalysis
): StudentProfile {
  const topic = profile.topics[topicId];
  if (!topic) return profile;

  return {
    ...profile,
    topics: {
      ...profile.topics,
      [topicId]: {
        ...topic,
        errorHistory: [
          ...topic.errorHistory,
          {
            category: error.category,
            description: error.description,
            timestamp: Date.now(),
          },
        ],
      },
    },
  };
}

export function updateStreak(profile: StudentProfile): StudentProfile {
  const today = getTodayDateString();
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  if (profile.lastSessionDate === today) {
    return profile; // Already counted today
  }

  const newStreak =
    profile.lastSessionDate === yesterday
      ? profile.currentStreak + 1
      : 1;

  return {
    ...profile,
    currentStreak: newStreak,
    lastSessionDate: today,
    sessionsCompleted: profile.sessionsCompleted + 1,
  };
}
