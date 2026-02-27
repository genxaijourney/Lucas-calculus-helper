'use client';

import { motion } from 'framer-motion';
import { ConversationMessage } from '@/lib/types/tutor';
import { User, Brain } from 'lucide-react';

interface MessageBubbleProps {
  message: ConversationMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isStudent = message.role === 'student';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-2 ${isStudent ? 'flex-row-reverse' : 'flex-row'}`}
    >
      <div
        className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
          isStudent ? 'bg-primary/20' : 'bg-muted'
        }`}
      >
        {isStudent ? (
          <User className="h-3.5 w-3.5 text-primary" />
        ) : (
          <Brain className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </div>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isStudent
            ? 'bg-primary text-primary-foreground rounded-br-sm'
            : 'bg-muted text-foreground rounded-bl-sm'
        }`}
      >
        {message.content}
      </div>
    </motion.div>
  );
}
