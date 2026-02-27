'use client';

import { useCallback, useRef } from 'react';
import { WhiteboardCommand } from '@/lib/types/tutor';
import { estimateSpeechDuration } from '@/lib/utils';
import { WHITEBOARD_COMMAND_DELAY_MS } from '@/lib/constants';

interface UseWhiteboardSyncReturn {
  scheduleCommands: (
    commands: WhiteboardCommand[],
    speechText: string,
    onCommand: (commands: WhiteboardCommand[]) => void
  ) => void;
  cancelSchedule: () => void;
}

export function useWhiteboardSync(): UseWhiteboardSyncReturn {
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const cancelSchedule = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const scheduleCommands = useCallback(
    (
      commands: WhiteboardCommand[],
      speechText: string,
      onCommand: (commands: WhiteboardCommand[]) => void
    ) => {
      cancelSchedule();

      if (commands.length === 0) return;

      // If there's a clear command, dispatch it immediately
      const clearIdx = commands.findIndex((c) => c.type === 'clear');
      if (clearIdx >= 0) {
        onCommand([commands[clearIdx]]);
      }

      const nonClear = commands.filter((c) => c.type !== 'clear');
      if (nonClear.length === 0) return;

      const speechDuration = estimateSpeechDuration(speechText);
      const interval = speechDuration / (nonClear.length + 1);

      nonClear.forEach((cmd, i) => {
        const delay = Math.max(
          interval * (i + 1),
          WHITEBOARD_COMMAND_DELAY_MS * (i + 1)
        );
        const timer = setTimeout(() => {
          onCommand([cmd]);
        }, delay);
        timersRef.current.push(timer);
      });
    },
    [cancelSchedule]
  );

  return { scheduleCommands, cancelSchedule };
}
