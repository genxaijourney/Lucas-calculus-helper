'use client';

import { TopicNode as TopicNodeType } from '@/lib/types/tutor';
import { Progress } from '@/components/ui/progress';
import { formatMastery, getMasteryColor } from '@/lib/utils';

interface TopicNodeProps {
  topic: TopicNodeType;
}

export function TopicNodeCard({ topic }: TopicNodeProps) {
  const masteryPercent = Math.round(topic.mastery * 100);

  return (
    <div className="rounded-lg border border-border bg-card p-3 hover:bg-accent/50 transition-colors">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-medium truncate">{topic.name}</span>
        <span className={`text-xs font-mono ${getMasteryColor(topic.mastery)}`}>
          {formatMastery(topic.mastery)}
        </span>
      </div>
      <Progress value={masteryPercent} className="h-1.5" />
      {topic.attempts > 0 && (
        <div className="text-xs text-muted-foreground mt-1.5">
          {topic.attempts} attempt{topic.attempts !== 1 ? 's' : ''}
          {topic.errorHistory.length > 0 && (
            <span className="text-red-400 ml-2">
              {topic.errorHistory.length} error{topic.errorHistory.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
