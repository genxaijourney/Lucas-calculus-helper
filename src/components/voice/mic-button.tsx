'use client';

import { Mic, Square, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VoiceState } from '@/lib/types/tutor';
import { motion } from 'framer-motion';

interface MicButtonProps {
  voiceState: VoiceState;
  onPress: () => void;
  disabled?: boolean;
}

export function MicButton({ voiceState, onPress, disabled }: MicButtonProps) {
  const isListening = voiceState === 'listening';
  const isProcessing = voiceState === 'processing';
  const isSpeaking = voiceState === 'speaking';

  return (
    <div className="relative">
      {/* Pulse rings when listening */}
      {isListening && (
        <>
          <motion.div
            className="absolute inset-0 rounded-full bg-red-500/20"
            animate={{ scale: [1, 1.5, 1.5], opacity: [0.4, 0, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <motion.div
            className="absolute inset-0 rounded-full bg-red-500/20"
            animate={{ scale: [1, 1.5, 1.5], opacity: [0.4, 0, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
          />
        </>
      )}

      <Button
        size="lg"
        onClick={onPress}
        disabled={disabled || isProcessing}
        className={`relative z-10 w-14 h-14 rounded-full transition-all duration-200 ${
          isListening
            ? 'bg-red-500 hover:bg-red-600 text-white'
            : isSpeaking
              ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
              : 'bg-secondary hover:bg-secondary/80 text-foreground'
        }`}
      >
        {isProcessing ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : isListening ? (
          <Square className="h-4 w-4 fill-current" />
        ) : (
          <Mic className="h-5 w-5" />
        )}
      </Button>
    </div>
  );
}
