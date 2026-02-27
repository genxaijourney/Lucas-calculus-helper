'use client';

import { Volume2 } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface VolumeControlProps {
  rate: number;
  onRateChange: (rate: number) => void;
}

export function VolumeControl({ rate, onRateChange }: VolumeControlProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2">
            <Volume2 className="h-3.5 w-3.5 text-muted-foreground" />
            <Slider
              value={[rate]}
              onValueChange={([v]) => onRateChange(v)}
              min={0.5}
              max={2}
              step={0.1}
              className="w-20"
            />
            <span className="text-xs text-muted-foreground w-8">{rate.toFixed(1)}x</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">Speech rate</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
