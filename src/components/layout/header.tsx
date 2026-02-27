'use client';

import { Brain, BarChart3, BookOpen, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTutorStore } from '@/lib/stores/tutor-store';
import { MODE_LABELS } from '@/lib/constants';
import { SessionMode } from '@/lib/types/tutor';

export function Header() {
  const mode = useTutorStore((s) => s.mode);
  const setMode = useTutorStore((s) => s.setMode);
  const streak = useTutorStore((s) => s.profile.currentStreak);
  const currentTopicId = useTutorStore((s) => s.currentTopicId);
  const topics = useTutorStore((s) => s.profile.topics);
  const setShowDashboard = useTutorStore((s) => s.setShowDashboard);
  const setShowTopicSelector = useTutorStore((s) => s.setShowTopicSelector);

  const topicName = currentTopicId ? topics[currentTopicId]?.name : null;

  return (
    <header className="h-14 border-b border-border flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <span className="font-semibold text-sm">MathVoice</span>
        </div>

        <Tabs
          value={mode}
          onValueChange={(v) => setMode(v as SessionMode)}
          className="ml-4"
        >
          <TabsList className="h-8">
            {(Object.keys(MODE_LABELS) as SessionMode[]).map((m) => (
              <TabsTrigger key={m} value={m} className="text-xs px-3 h-7">
                {MODE_LABELS[m]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          className="text-xs gap-1.5"
          onClick={() => setShowTopicSelector(true)}
        >
          <BookOpen className="h-3.5 w-3.5" />
          {topicName || 'Choose Topic'}
        </Button>

        {streak > 0 && (
          <Badge variant="secondary" className="gap-1 text-xs">
            <Flame className="h-3 w-3 text-orange-400" />
            {streak} day{streak !== 1 ? 's' : ''}
          </Badge>
        )}

        <Button
          variant="ghost"
          size="sm"
          className="text-xs gap-1.5"
          onClick={() => setShowDashboard(true)}
        >
          <BarChart3 className="h-3.5 w-3.5" />
          Dashboard
        </Button>
      </div>
    </header>
  );
}
