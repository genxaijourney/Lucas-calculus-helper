'use client';

import { useCallback, useRef, useState } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SpeechRecognitionInstance = any;

interface UseSpeechRecognitionReturn {
  isSupported: boolean;
  isListening: boolean;
  interimTranscript: string;
  startListening: () => void;
  stopListening: () => Promise<string>;
}

export function useSpeechRecognition(): UseSpeechRecognitionReturn {
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const finalTranscriptRef = useRef('');
  const resolveRef = useRef<((value: string) => void) | null>(null);

  const isSupported = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const startListening = useCallback(() => {
    if (!isSupported) return;

    finalTranscriptRef.current = '';
    setInterimTranscript('');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognitionCtor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let interim = '';
      let finalText = '';
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalText += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }
      finalTranscriptRef.current = finalText;
      setInterimTranscript(finalText + interim);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      if (event.error === 'no-speech') {
        return;
      }
      console.warn('Speech recognition error:', event.error);
    };

    recognition.onend = () => {
      setIsListening(false);
      if (resolveRef.current) {
        resolveRef.current(finalTranscriptRef.current.trim());
        resolveRef.current = null;
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [isSupported]);

  const stopListening = useCallback((): Promise<string> => {
    return new Promise((resolve) => {
      if (!recognitionRef.current || !isListening) {
        resolve(finalTranscriptRef.current.trim() || interimTranscript.trim());
        return;
      }
      resolveRef.current = (finalText) => {
        resolve(finalText || interimTranscript.trim());
      };
      recognitionRef.current.stop();
    });
  }, [isListening, interimTranscript]);

  return {
    isSupported,
    isListening,
    interimTranscript,
    startListening,
    stopListening,
  };
}
