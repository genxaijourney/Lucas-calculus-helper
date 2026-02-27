'use client';

import { useState, useCallback } from 'react';
import { TutorApiRequest, TutorResponse } from '@/lib/types/tutor';

interface UseTutorApiReturn {
  isLoading: boolean;
  error: string | null;
  sendMessage: (request: TutorApiRequest) => Promise<TutorResponse | null>;
}

export function useTutorApi(): UseTutorApiReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (request: TutorApiRequest): Promise<TutorResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      const data = (await res.json()) as TutorResponse;
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to reach tutor';
      setError(message);
      console.error('Tutor API error:', message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { isLoading, error, sendMessage };
}
