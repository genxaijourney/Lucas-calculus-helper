'use client';

import { useCallback, useEffect, useRef } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Whiteboard } from '@/components/whiteboard/whiteboard';
import { ConversationPanel } from '@/components/conversation/conversation-panel';
import { MicButton } from '@/components/voice/mic-button';
import { VolumeControl } from '@/components/voice/volume-control';
import { VoiceIndicator } from '@/components/voice/voice-indicator';
import { TextInput } from '@/components/voice/text-input';
import { KnowledgeDashboard } from '@/components/dashboard/knowledge-map';
import { TopicSelector } from '@/components/session/topic-selector';
import { WelcomeScreen } from '@/components/session/welcome-screen';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { useSpeechSynthesis } from '@/hooks/use-speech-synthesis';
import { useTutorApi } from '@/hooks/use-tutor-api';
import { useWhiteboardSync } from '@/hooks/use-whiteboard-sync';
import { useTutorStore } from '@/lib/stores/tutor-store';
import { identifyWeaknesses } from '@/lib/knowledge/adaptive-difficulty';
import { determineDifficulty } from '@/lib/knowledge/adaptive-difficulty';
import { generateId } from '@/lib/utils';

export default function Home() {
  const {
    voiceState,
    setVoiceState,
    setInterimTranscript,
    mode,
    currentTopicId,
    messages,
    addMessage,
    setWhiteboardCommands,
    profile,
    setShowDashboard,
    speechRate,
    setSpeechRate,
    applyTopicUpdate,
    recordError,
    startSession,
  } = useTutorStore();

  const { isSupported: sttSupported, interimTranscript, startListening, stopListening } =
    useSpeechRecognition();
  const { speak, cancel: cancelSpeech } = useSpeechSynthesis();
  const { isLoading, sendMessage } = useTutorApi();
  const { scheduleCommands, cancelSchedule } = useWhiteboardSync();

  const hasStartedSession = useRef(false);

  // Sync interim transcript to store
  useEffect(() => {
    setInterimTranscript(interimTranscript);
  }, [interimTranscript, setInterimTranscript]);

  // Start session on first interaction
  useEffect(() => {
    if (!hasStartedSession.current) {
      hasStartedSession.current = true;
      startSession();
    }
  }, [startSession]);

  // Process student message through the tutor API
  const processStudentMessage = useCallback(
    async (text: string) => {
      if (!text.trim()) {
        setVoiceState('idle');
        return;
      }

      // Add student message
      const studentMsg = {
        id: generateId(),
        role: 'student' as const,
        content: text,
        timestamp: Date.now(),
      };
      addMessage(studentMsg);
      setVoiceState('processing');

      // Determine adaptive difficulty
      const difficulty = determineDifficulty(profile, currentTopicId);
      const weaknesses = identifyWeaknesses(profile);

      // Send to API
      const allMessages = [...messages, studentMsg];
      const response = await sendMessage({
        messages: allMessages,
        mode,
        difficulty,
        currentTopicId,
        studentWeaknesses: weaknesses,
      });

      if (!response) {
        setVoiceState('idle');
        // Add error message
        addMessage({
          id: generateId(),
          role: 'tutor',
          content: "Sorry, I had trouble thinking about that. Could you say it again?",
          timestamp: Date.now(),
        });
        return;
      }

      // Add tutor message
      addMessage({
        id: generateId(),
        role: 'tutor',
        content: response.message,
        timestamp: Date.now(),
        whiteboardCommands: response.whiteboard,
      });

      // Apply topic update if present
      if (response.topicUpdate) {
        applyTopicUpdate(response.topicUpdate);
      }

      // Record error if present
      if (response.errorAnalysis && currentTopicId) {
        recordError(currentTopicId, response.errorAnalysis);
      }

      // Speak response and sync whiteboard
      setVoiceState('speaking');

      // Schedule whiteboard commands to appear during speech
      scheduleCommands(response.whiteboard, response.message, setWhiteboardCommands);

      try {
        await speak(response.message, speechRate);
      } catch {
        // Speech canceled or errored
      }

      // After speaking, auto-listen if expects response
      if (response.expectsResponse && sttSupported) {
        setVoiceState('listening');
        startListening();
      } else {
        setVoiceState('idle');
      }
    },
    [
      messages, mode, currentTopicId, profile, speechRate, sttSupported,
      addMessage, setVoiceState, sendMessage, applyTopicUpdate, recordError,
      scheduleCommands, setWhiteboardCommands, speak, startListening,
    ]
  );

  // Handle mic button press
  const handleMicPress = useCallback(async () => {
    if (voiceState === 'listening') {
      // Stop listening, process message
      const transcript = await stopListening();
      processStudentMessage(transcript);
    } else if (voiceState === 'speaking') {
      // Interrupt speech
      cancelSpeech();
      cancelSchedule();
      setVoiceState('listening');
      startListening();
    } else if (voiceState === 'idle') {
      // Start listening
      setVoiceState('listening');
      startListening();
    }
  }, [voiceState, stopListening, processStudentMessage, cancelSpeech, cancelSchedule, setVoiceState, startListening]);

  // Handle text input (fallback)
  const handleTextSubmit = useCallback(
    (text: string) => {
      processStudentMessage(text);
    },
    [processStudentMessage]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture if typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          handleMicPress();
          break;
        case 'Escape':
          if (voiceState === 'speaking') {
            cancelSpeech();
            cancelSchedule();
            setVoiceState('idle');
          } else if (voiceState === 'listening') {
            stopListening();
            setVoiceState('idle');
          }
          break;
        case 'KeyD':
          if (!e.metaKey && !e.ctrlKey) {
            setShowDashboard(true);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleMicPress, voiceState, cancelSpeech, cancelSchedule, setVoiceState, stopListening, setShowDashboard]);

  return (
    <>
      <MainLayout
        whiteboard={<Whiteboard />}
        conversation={<ConversationPanel />}
        controls={
          <div className="flex items-center gap-6 w-full justify-center">
            <VoiceIndicator voiceState={voiceState} />

            {sttSupported ? (
              <MicButton
                voiceState={voiceState}
                onPress={handleMicPress}
                disabled={isLoading}
              />
            ) : (
              <TextInput
                onSubmit={handleTextSubmit}
                disabled={isLoading || voiceState === 'processing'}
                placeholder="Type your math question..."
              />
            )}

            <VolumeControl rate={speechRate} onRateChange={setSpeechRate} />

            {/* Text fallback alongside mic for convenience */}
            {sttSupported && (
              <TextInput
                onSubmit={handleTextSubmit}
                disabled={isLoading || voiceState === 'processing' || voiceState === 'speaking'}
                placeholder="Or type here..."
              />
            )}
          </div>
        }
      />

      {/* Modals */}
      <KnowledgeDashboard />
      <TopicSelector />
      <WelcomeScreen />
    </>
  );
}
