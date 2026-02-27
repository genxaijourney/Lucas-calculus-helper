'use client';

import { motion } from 'framer-motion';
import { VoiceState } from '@/lib/types/tutor';

interface VoiceIndicatorProps {
  voiceState: VoiceState;
}

export function VoiceIndicator({ voiceState }: VoiceIndicatorProps) {
  const isActive = voiceState === 'listening' || voiceState === 'speaking';

  if (!isActive) return null;

  const color = voiceState === 'listening' ? 'bg-red-400' : 'bg-primary';
  const label = voiceState === 'listening' ? 'Listening...' : 'Speaking...';

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-end gap-0.5 h-4">
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className={`w-0.5 rounded-full ${color}`}
            animate={{
              height: isActive ? [4, 12 + Math.random() * 8, 4] : 4,
            }}
            transition={{
              duration: 0.5 + Math.random() * 0.3,
              repeat: Infinity,
              delay: i * 0.1,
            }}
          />
        ))}
      </div>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}
