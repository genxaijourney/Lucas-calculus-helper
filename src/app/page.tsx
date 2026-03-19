'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Whiteboard } from '@/components/whiteboard/whiteboard';
import { ConversationPanel } from '@/components/conversation/conversation-panel';
import { MicButton } from '@/components/voice/mic-button';
import { SpeedControl } from '@/components/voice/speed-control';
import { VoiceIndicator } from '@/components/voice/voice-indicator';
import { VoiceSelector } from '@/components/voice/voice-selector';
import { TextInput } from '@/components/voice/text-input';
import { KnowledgeDashboard } from '@/components/dashboard/knowledge-map';
import { TopicSelector } from '@/components/session/topic-selector';
import { WelcomeScreen } from '@/components/session/welcome-screen';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { useSpeechSynthesis } from '@/hooks/use-speech-synthesis';
import { useTutorApi } from '@/hooks/use-tutor-api';
import { useWhiteboardSync } from '@/hooks/use-whiteboard-sync';
import { useTutorStore } from '@/lib/stores/tutor-store';
import { identifyWeaknesses, determineDifficulty } from '@/lib/knowledge/adaptive-difficulty';
import { generateId } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { PauseCircle, Volume2, VolumeX } from 'lucide-react';

export default function Home() {
  // Hydration guard: keep initial render deterministic so SSR matches first client render
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Local UI preferences
  // Keep it local so we don’t introduce new SSR/localStorage hydration issues.
  const [speakEnabled, setSpeakEnabled] = useState(true);
  const [selectedVoice, setSelectedVoice] = useState('en-US-Neural2-J');

  // Safely read from localStorage after mount to avoid hydration mismatch
  useEffect(() => {
    const savedVoice = localStorage.getItem('mathvoice_voice');
    if (savedVoice) {
      setSelectedVoice(savedVoice);
    }
  }, []);

  const handleVoiceChange = useCallback((voiceId: string) => {
    setSelectedVoice(voiceId);
    localStorage.setItem('mathvoice_voice', voiceId);
  }, []);

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

    // From store (you added these)
    stopRequested,
    resetRequested,
    clearStopRequest,
    clearResetRequest,

    clearMessages,
    clearWhiteboard,
  } = useTutorStore();

  const {
    isSupported: sttSupportedRaw,
    interimTranscript,
    startListening,
    stopListening,
  } = useSpeechRecognition();

  // IMPORTANT: decide STT support only after mount to prevent SSR/client mismatch
  const sttSupported = mounted ? sttSupportedRaw : false;

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

  // ✅ Pause/Stop everything immediately (speech + whiteboard schedule + listening)
  const stopAllAudioAndListening = useCallback(async () => {
    // Stop speech + scheduled whiteboard playback
    cancelSpeech();
    cancelSchedule();

    // If listening, stop STT
    if (voiceState === 'listening') {
      try {
        await stopListening();
      } catch {
        // ignore
      }
    }

    setVoiceState('idle');
  }, [cancelSpeech, cancelSchedule, setVoiceState, stopListening, voiceState]);

  // ✅ Reset for next problem (stop everything + clear chat + clear whiteboard)
  const resetSession = useCallback(async () => {
    await stopAllAudioAndListening();
    clearMessages();
    clearWhiteboard();
    setInterimTranscript('');
    setVoiceState('idle');
  }, [stopAllAudioAndListening, clearMessages, clearWhiteboard, setInterimTranscript, setVoiceState]);

  // ✅ React to header buttons (requestStop / requestReset)
  useEffect(() => {
    if (stopRequested) {
      // fire-and-forget; we clear the flag right away
      stopAllAudioAndListening();
      clearStopRequest();
    }
  }, [stopRequested, stopAllAudioAndListening, clearStopRequest]);

  useEffect(() => {
    if (resetRequested) {
      resetSession();
      clearResetRequest();
    }
  }, [resetRequested, resetSession, clearResetRequest]);

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

      // Always show whiteboard content (either scheduled during speech, or applied immediately)
      if (!speakEnabled) {
        // ✅ Voice OFF: show whiteboard immediately, don’t speak
        setWhiteboardCommands(response.whiteboard);
        setVoiceState('idle');
        return;
      }

      // ✅ Voice ON: speak + schedule whiteboard during speech
      setVoiceState('speaking');
      scheduleCommands(response.whiteboard, response.message, setWhiteboardCommands);

      try {
        await speak(response.message, speechRate, selectedVoice);
      } catch {
        // Speech canceled or errored
      }

      // Manual push-to-talk only: ALWAYS return to idle
      setVoiceState('idle');
    },
    [
      messages,
      mode,
      currentTopicId,
      profile,
      speechRate,
      speakEnabled,
      selectedVoice,
      addMessage,
      setVoiceState,
      sendMessage,
      applyTopicUpdate,
      recordError,
      scheduleCommands,
      setWhiteboardCommands,
      speak,
    ]
  );

  // Handle mic button press
  const handleMicPress = useCallback(async () => {
    if (!sttSupported) return;

    if (voiceState === 'listening') {
      const transcript = await stopListening();
      processStudentMessage(transcript);
    } else if (voiceState === 'speaking') {
      // Interrupt speech, then go to idle (manual push-to-talk)
      cancelSpeech();
      cancelSchedule();
      setVoiceState('idle');
    } else if (voiceState === 'idle') {
      setVoiceState('listening');
      startListening();
    }
  }, [
    sttSupported,
    voiceState,
    stopListening,
    processStudentMessage,
    cancelSpeech,
    cancelSchedule,
    setVoiceState,
    startListening,
  ]);

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
          // ESC = Pause/Stop immediately
          stopAllAudioAndListening();
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
  }, [handleMicPress, stopAllAudioAndListening, setShowDashboard]);

  return (
    <>
      <MainLayout
        whiteboard={<Whiteboard />}
        conversation={<ConversationPanel />}
        controls={
          <div className="flex items-center gap-6 w-full justify-center">
            <VoiceIndicator voiceState={voiceState} />

            {sttSupported ? (
              <MicButton voiceState={voiceState} onPress={handleMicPress} disabled={isLoading} />
            ) : (
              <TextInput
                onSubmit={handleTextSubmit}
                disabled={isLoading || voiceState === 'processing'}
                placeholder="Type your math question..."
              />
            )}

            {/* ✅ NEW: Pause (left of the speaker control) */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="gap-1.5"
              onClick={() => stopAllAudioAndListening()}
              title="Pause / stop speaking"
            >
              <PauseCircle className="h-4 w-4" />
              Pause
            </Button>

            {/* ✅ NEW: Speak toggle */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="gap-1.5"
              onClick={() => setSpeakEnabled((v) => !v)}
              title={speakEnabled ? 'Turn voice OFF (text-only)' : 'Turn voice ON'}
            >
              {speakEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              {speakEnabled ? 'Voice: On' : 'Voice: Off'}
            </Button>

            <SpeedControl rate={speechRate} onRateChange={setSpeechRate} />

            <VoiceSelector 
              value={selectedVoice} 
              onChange={handleVoiceChange} 
              disabled={isLoading || voiceState === 'processing' || voiceState === 'speaking'} 
            />

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