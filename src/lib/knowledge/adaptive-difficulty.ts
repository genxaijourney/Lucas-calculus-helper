import { StudentProfile, Difficulty, ErrorCategory } from '../types/tutor';

export function determineDifficulty(profile: StudentProfile, topicId: string | null): Difficulty {
  if (!topicId) return 'beginner';

  const topic = profile.topics[topicId];
  if (!topic) return 'beginner';

  if (topic.mastery >= 0.7) return 'advanced';
  if (topic.mastery >= 0.3) return 'intermediate';
  return 'beginner';
}

export function getRecentErrorRate(profile: StudentProfile, topicId: string): number {
  const topic = profile.topics[topicId];
  if (!topic || topic.attempts === 0) return 0;

  const recentErrors = topic.errorHistory.filter(
    (e) => Date.now() - e.timestamp < 30 * 60 * 1000 // last 30 min
  );
  return Math.min(recentErrors.length / Math.max(topic.attempts, 1), 1);
}

export function identifyWeaknesses(profile: StudentProfile): string[] {
  const weaknesses: string[] = [];

  // Find topics with high error rates or low mastery despite attempts
  for (const topic of Object.values(profile.topics)) {
    if (topic.attempts > 0 && topic.mastery < 0.4) {
      weaknesses.push(topic.name);
    }
  }

  return weaknesses.slice(0, 5); // Top 5
}

export function getCommonErrorPatterns(profile: StudentProfile): Record<ErrorCategory, number> {
  const counts: Record<ErrorCategory, number> = {
    arithmetic: 0,
    algebraic_manipulation: 0,
    conceptual_misunderstanding: 0,
    sign_error: 0,
    order_of_operations: 0,
    incomplete_solution: 0,
    notation_confusion: 0,
    application_error: 0,
  };

  for (const topic of Object.values(profile.topics)) {
    for (const error of topic.errorHistory) {
      counts[error.category]++;
    }
  }

  return counts;
}

export function getTopWeaknesses(profile: StudentProfile): { topic: string; mastery: number }[] {
  return Object.values(profile.topics)
    .filter((t) => t.attempts > 0 && t.mastery < 0.5)
    .sort((a, b) => a.mastery - b.mastery)
    .slice(0, 3)
    .map((t) => ({ topic: t.name, mastery: t.mastery }));
}
