'use client';

import { useEffect, useRef } from 'react';
import { useTutorStore } from '@/lib/stores/tutor-store';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageBubble } from './message-bubble';
import { LiveTranscript } from './live-transcript';
import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';

export function ConversationPanel() {
  const messages = useTutorStore((s) => s.messages);
  const voiceState = useTutorStore((s) => s.voiceState);
  const interimTranscript = useTutorStore((s) => s.interimTranscript);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, interimTranscript, voiceState]);

  return (
    <ScrollArea className="flex-1">
      <div className="p-4 space-y-3 min-h-full">
        {messages.length === 0 && voiceState === 'idle' && (
          <EmptyConversation />
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {/* Live transcript while listening */}
        {voiceState === 'listening' && (
          <LiveTranscript transcript={interimTranscript} />
        )}

        {/* Thinking indicator */}
        {voiceState === 'processing' && <ThinkingDots />}

        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}

function ThinkingDots() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex gap-2 flex-row"
    >
      <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
        <div className="flex gap-0.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1 h-1 rounded-full bg-muted-foreground"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      </div>
      <div className="rounded-2xl rounded-bl-sm px-4 py-2.5 bg-muted text-sm text-muted-foreground">
        <div className="flex gap-1 items-center">
          <span>Thinking</span>
          <motion.span
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            ...
          </motion.span>
        </div>
      </div>
    </motion.div>
  );
}

function EmptyConversation() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-muted-foreground">
      <MessageSquare className="h-10 w-10 mb-3 opacity-20" />
      <p className="text-sm opacity-50">Your conversation will appear here</p>
      <p className="text-xs opacity-30 mt-1">
        Press the mic button or spacebar to start talking
      </p>
    </div>
  );
}
