'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTutorStore } from '@/lib/stores/tutor-store';
import { getTopicsByCategory, getReadyTopics } from '@/lib/knowledge/topic-graph';
import { CATEGORY_LABELS, CATEGORY_COLORS } from '@/lib/constants';
import { TopicCategory, TopicNode } from '@/lib/types/tutor';
import { formatMastery, getMasteryColor } from '@/lib/utils';
import { Check, Lock, Sparkles } from 'lucide-react';

export function TopicSelector() {
  const showTopicSelector = useTutorStore((s) => s.showTopicSelector);
  const setShowTopicSelector = useTutorStore((s) => s.setShowTopicSelector);
  const setCurrentTopic = useTutorStore((s) => s.setCurrentTopic);
  const clearMessages = useTutorStore((s) => s.clearMessages);
  const currentTopicId = useTutorStore((s) => s.currentTopicId);
  const profile = useTutorStore((s) => s.profile);

  const topicsByCategory = getTopicsByCategory(profile.topics);
  const readyTopics = getReadyTopics(profile.topics);
  const readyIds = new Set(readyTopics.map((t) => t.id));
  const categories = Object.keys(CATEGORY_LABELS) as TopicCategory[];

  const handleSelect = (topicId: string) => {
    setCurrentTopic(topicId);
    clearMessages();
    setShowTopicSelector(false);
  };

  const isReady = (topic: TopicNode) => {
    return (
      readyIds.has(topic.id) ||
      topic.mastery >= 0.5 ||
      topic.prerequisites.every(
        (p) => (profile.topics[p]?.mastery ?? 0) >= 0.5
      )
    );
  };

  return (
    <Dialog open={showTopicSelector} onOpenChange={setShowTopicSelector}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Choose a Topic</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[65vh] pr-4">
          <div className="space-y-6">
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
                    {topics.map((topic) => {
                      const ready = isReady(topic);
                      const selected = topic.id === currentTopicId;
                      const mastered = topic.mastery >= 0.8;

                      return (
                        <Button
                          key={topic.id}
                          variant={selected ? 'default' : 'outline'}
                          className={`h-auto py-3 px-4 justify-start text-left ${
                            !ready ? 'opacity-50' : ''
                          }`}
                          onClick={() => handleSelect(topic.id)}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm truncate">
                                {topic.name}
                              </span>
                              {mastered && (
                                <Check className="h-3 w-3 text-green-400 flex-shrink-0" />
                              )}
                              {!ready && (
                                <Lock className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                              )}
                              {ready && !mastered && topic.mastery < 0.5 && readyIds.has(topic.id) && (
                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 gap-0.5">
                                  <Sparkles className="h-2.5 w-2.5" />
                                  Ready
                                </Badge>
                              )}
                            </div>
                            {topic.attempts > 0 && (
                              <span
                                className={`text-xs ${getMasteryColor(
                                  topic.mastery
                                )}`}
                              >
                                {formatMastery(topic.mastery)}
                              </span>
                            )}
                          </div>
                        </Button>
                      );
                    })}
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
