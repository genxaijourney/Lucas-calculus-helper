'use client';

import { StudentProfile } from '@/lib/types/tutor';
import { Flame, Clock, BookOpen, Target, TrendingUp } from 'lucide-react';

interface ProgressStatsProps {
  profile: StudentProfile;
}

export function ProgressStats({ profile }: ProgressStatsProps) {
  const topicsAttempted = Object.values(profile.topics).filter(
    (t) => t.attempts > 0
  ).length;
  const totalTopics = Object.keys(profile.topics).length;

  const avgMastery =
    topicsAttempted > 0
      ? Object.values(profile.topics)
          .filter((t) => t.attempts > 0)
          .reduce((sum, t) => sum + t.mastery, 0) / topicsAttempted
      : 0;

  const stats = [
    {
      icon: BookOpen,
      label: 'Sessions',
      value: profile.sessionsCompleted.toString(),
    },
    {
      icon: Clock,
      label: 'Minutes',
      value: profile.totalMinutes.toString(),
    },
    {
      icon: Target,
      label: 'Topics',
      value: `${topicsAttempted}/${totalTopics}`,
    },
    {
      icon: TrendingUp,
      label: 'Avg Mastery',
      value: `${Math.round(avgMastery * 100)}%`,
    },
    {
      icon: Flame,
      label: 'Streak',
      value: `${profile.currentStreak} day${profile.currentStreak !== 1 ? 's' : ''}`,
    },
  ];

  return (
    <div className="grid grid-cols-5 gap-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-lg border border-border bg-card p-3 text-center"
        >
          <stat.icon className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
          <div className="text-lg font-semibold">{stat.value}</div>
          <div className="text-xs text-muted-foreground">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
