import { SelectHTMLAttributes } from 'react';

export const VOICES = [
  { id: 'en-US-Neural2-J', label: 'Teen Male' },
  { id: 'en-US-Neural2-F', label: 'Clear Female' },
  { id: 'en-US-Journey-D', label: 'Conversational Male' },
  { id: 'en-US-Journey-F', label: 'Conversational Female' },
  { id: 'en-GB-Neural2-B', label: 'British Male' },
  { id: 'en-US-Neural2-H', label: 'Bright Female' },
];

interface VoiceSelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function VoiceSelector({ value, onChange, disabled }: VoiceSelectorProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="h-9 px-3 py-1 text-sm bg-transparent border rounded-md shadow-sm border-input hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
      title="Select voice model"
    >
      {VOICES.map((voice) => (
        <option key={voice.id} value={voice.id} className="bg-background text-foreground">
          {voice.label}
        </option>
      ))}
    </select>
  );
}
