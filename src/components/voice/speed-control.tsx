'use client';

import { Gauge } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SpeedControlProps {
  rate: number;
  onRateChange: (rate: number) => void;
}

export function SpeedControl({ rate, onRateChange }: SpeedControlProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2">
            <Gauge className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Speed</span>
            <Slider
              value={[rate]}
              onValueChange={([v]) => onRateChange(v)}
              min={0.5}
              max={2}
              step={0.1}
              className="w-20 ml-1"
            />
            <span className="text-xs text-muted-foreground w-8">{rate.toFixed(1)}x</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">Voice speed</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
