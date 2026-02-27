import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { WORDS_PER_MINUTE, MIN_SPEECH_DURATION_MS } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function estimateSpeechDuration(text: string): number {
  const words = text.trim().split(/\s+/).length;
  const durationMs = (words / WORDS_PER_MINUTE) * 60 * 1000;
  return Math.max(durationMs, MIN_SPEECH_DURATION_MS);
}

export function formatMastery(mastery: number): string {
  return `${Math.round(mastery * 100)}%`;
}

export function getMasteryColor(mastery: number): string {
  if (mastery >= 0.8) return 'text-green-400';
  if (mastery >= 0.5) return 'text-amber-400';
  if (mastery > 0) return 'text-orange-400';
  return 'text-muted-foreground';
}

export function getMasteryBgColor(mastery: number): string {
  if (mastery >= 0.8) return 'bg-green-500';
  if (mastery >= 0.5) return 'bg-amber-500';
  if (mastery > 0) return 'bg-orange-500';
  return 'bg-muted';
}

export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}
