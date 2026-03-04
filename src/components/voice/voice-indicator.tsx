'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { VoiceState } from '@/lib/types/tutor';

interface VoiceIndicatorProps {
  voiceState: VoiceState;
}

export function VoiceIndicator({ voiceState }: VoiceIndicatorProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isActive = voiceState === 'listening' || voiceState === 'speaking';

  // IMPORTANT: hooks must run on every render, before any early returns.
  const bars = useMemo(() => {
    return [0, 1, 2, 3, 4].map((i) => {
      const extraHeight = 12 + Math.floor(Math.random() * 8);
      const duration = 0.5 + Math.random() * 0.3;
      return { i, extraHeight, duration };
    });
  }, []);

  // Avoid SSR/client mismatches: don't render until mounted.
  if (!mounted || !isActive) return null;

  const color = voiceState === 'listening' ? 'bg-red-400' : 'bg-primary';
  const label = voiceState === 'listening' ? 'Listening...' : 'Speaking...';

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-end gap-0.5 h-4">
        {bars.map(({ i, extraHeight, duration }) => (
          <motion.div
            key={i}
            className={`w-0.5 rounded-full ${color}`}
            animate={{ height: [4, extraHeight, 4] }}
            transition={{
              duration,
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