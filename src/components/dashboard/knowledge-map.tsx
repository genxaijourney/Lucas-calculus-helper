'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTutorStore } from '@/lib/stores/tutor-store';
import { getTopicsByCategory } from '@/lib/knowledge/topic-graph';
import { getTopWeaknesses } from '@/lib/knowledge/adaptive-difficulty';
import { CATEGORY_LABELS, CATEGORY_COLORS } from '@/lib/constants';
import { TopicCategory } from '@/lib/types/tutor';
import { TopicNodeCard } from './topic-node';
import { ProgressStats } from './progress-stats';
import { AlertTriangle } from 'lucide-react';

export function KnowledgeDashboard() {
  const showDashboard = useTutorStore((s) => s.showDashboard);
  const setShowDashboard = useTutorStore((s) => s.setShowDashboard);
  const profile = useTutorStore((s) => s.profile);

  const topicsByCategory = getTopicsByCategory(profile.topics);
  const weaknesses = getTopWeaknesses(profile);
  const categories = Object.keys(CATEGORY_LABELS) as TopicCategory[];

  return (
    <Dialog open={showDashboard} onOpenChange={setShowDashboard}>
      <DialogContent className="max-w-3xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>Knowledge Dashboard</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Stats */}
            <ProgressStats profile={profile} />

            {/* Weaknesses callout */}
            {weaknesses.length > 0 && (
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                  <span className="text-sm font-medium text-amber-300">
                    Areas to Focus
                  </span>
                </div>
                <div className="space-y-1">
                  {weaknesses.map((w) => (
                    <div
                      key={w.topic}
                      className="text-sm text-amber-200/80 flex justify-between"
                    >
                      <span>{w.topic}</span>
                      <span className="font-mono">
                        {Math.round(w.mastery * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Topic map by category */}
            {categories.map((category) => {
              const topics = topicsByCategory[category];
              if (!topics || topics.length === 0) return null;

              return (
                <div key={category}>
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: CATEGORY_COLORS[category] }}
                    />
                    <h3 className="text-sm font-medium">
                      {CATEGORY_LABELS[category]}
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {topics.map((topic) => (
                      <TopicNodeCard key={topic.id} topic={topic} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
