'use client';

import { motion } from 'framer-motion';

interface LiveTranscriptProps {
  transcript: string;
}

export function LiveTranscript({ transcript }: LiveTranscriptProps) {
  if (!transcript) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-2 flex-row-reverse"
    >
      <div className="w-7" /> {/* Spacer to match bubble layout */}
      <div className="max-w-[80%] rounded-2xl rounded-br-sm px-4 py-2.5 text-sm leading-relaxed bg-primary/50 text-primary-foreground">
        {transcript}
        <span className="inline-block w-0.5 h-4 bg-primary-foreground ml-0.5 animate-pulse" />
      </div>
    </motion.div>
  );
}
