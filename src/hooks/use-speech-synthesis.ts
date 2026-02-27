'use client';

import { useCallback, useRef, useEffect, useState } from 'react';

interface UseSpeechSynthesisReturn {
  isSupported: boolean;
  isSpeaking: boolean;
  speak: (text: string, rate?: number) => Promise<void>;
  cancel: () => void;
}

export function useSpeechSynthesis(): UseSpeechSynthesisReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);

  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  // Select best voice on mount
  useEffect(() => {
    if (!isSupported) return;

    const selectVoice = () => {
      const voices = speechSynthesis.getVoices();
      // Priority: Samantha (macOS), Google US English, any en-US
      const preferred = [
        voices.find((v) => v.name === 'Samantha'),
        voices.find((v) => v.name.includes('Google US English')),
        voices.find((v) => v.name === 'Alex'),
        voices.find((v) => v.lang === 'en-US'),
        voices.find((v) => v.lang.startsWith('en')),
      ];
      voiceRef.current = preferred.find(Boolean) || voices[0] || null;
    };

    selectVoice();
    speechSynthesis.addEventListener('voiceschanged', selectVoice);
    return () => speechSynthesis.removeEventListener('voiceschanged', selectVoice);
  }, [isSupported]);

  const speak = useCallback((text: string, rate: number = 1): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!isSupported) {
        resolve();
        return;
      }

      // Cancel any current speech
      speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      if (voiceRef.current) {
        utterance.voice = voiceRef.current;
      }
      utterance.rate = rate;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        resolve();
      };
      utterance.onerror = (event) => {
        setIsSpeaking(false);
        if (event.error === 'canceled' || event.error === 'interrupted') {
          resolve(); // Not a real error
        } else {
          reject(new Error(`Speech synthesis error: ${event.error}`));
        }
      };

      utteranceRef.current = utterance;
      speechSynthesis.speak(utterance);
    });
  }, [isSupported]);

  const cancel = useCallback(() => {
    if (!isSupported) return;
    speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [isSupported]);

  return {
    isSupported,
    isSpeaking,
    speak,
    cancel,
  };
}
