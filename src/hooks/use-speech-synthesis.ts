'use client';

import { useCallback, useRef, useEffect, useState } from 'react';

interface UseSpeechSynthesisReturn {
  isSupported: boolean;
  isSpeaking: boolean;
  speak: (text: string, rate?: number, voiceId?: string) => Promise<void>;
  cancel: () => void;
}

export function useSpeechSynthesis(): UseSpeechSynthesisReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const resolverRef = useRef<(() => void) | null>(null);

  const isSupported = typeof window !== 'undefined' && typeof HTMLAudioElement !== 'undefined';

  const cleanupAndResolve = useCallback(() => {
    if (resolverRef.current) {
      resolverRef.current();
      resolverRef.current = null;
    }
    setIsSpeaking(false);
  }, []);

  const cancel = useCallback(() => {
    // Abort fetch request
    if (controllerRef.current) {
      controllerRef.current.abort();
      controllerRef.current = null;
    }

    // Stop and cleanup current audio playback
    if (audioRef.current) {
      audioRef.current.pause();
      // Remove src to prevent further loading/events
      audioRef.current.removeAttribute('src');
      try {
        audioRef.current.load();
      } catch {}
      audioRef.current = null;
    }

    cleanupAndResolve();
  }, [cleanupAndResolve]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  const speak = useCallback((text: string, rate: number = 1, voiceId: string = 'en-US-Neural2-J'): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      if (!isSupported) {
        resolve();
        return;
      }

      // First, cancel any potential ongoing speech
      cancel();

      // Store the new resolve function
      resolverRef.current = resolve;
      
      controllerRef.current = new AbortController();
      setIsSpeaking(true);

      try {
        const response = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, rate, voiceId }),
          signal: controllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`TTS API failed: ${response.status}`);
        }

        const audioBlob = await response.blob();
        
        // If canceled during fetch, don't play
        if (controllerRef.current?.signal.aborted) {
          cleanupAndResolve();
          return;
        }

        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        const onEndOrError = () => {
          URL.revokeObjectURL(audioUrl);
          audio.onended = null;
          audio.onerror = null;
        };

        audio.onended = () => {
          onEndOrError();
          cleanupAndResolve();
        };

        audio.onerror = () => {
          onEndOrError();
          setIsSpeaking(false);
          resolverRef.current = null;
          reject(new Error('Audio playback failed'));
        };

        await audio.play();
      } catch (error: unknown) {
        setIsSpeaking(false);
        if (error instanceof Error && error.name === 'AbortError') {
          // fetch was aborted, consider it resolved
          cleanupAndResolve();
        } else {
          console.error('Speech synthesis error:', error);
          resolverRef.current = null;
          reject(error);
        }
      }
    });
  }, [isSupported, cancel, cleanupAndResolve]);

  return {
    isSupported,
    isSpeaking,
    speak,
    cancel,
  };
}
