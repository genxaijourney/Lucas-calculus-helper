'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StepCommand } from '@/lib/types/tutor';
import { BlockMath } from 'react-katex';
import { CheckCircle2 } from 'lucide-react';

interface StepDisplayProps {
  command: StepCommand;
  index: number;
}

export function StepDisplay({ command, index }: StepDisplayProps) {
  const [visibleSteps, setVisibleSteps] = useState(0);

  useEffect(() => {
    setVisibleSteps(0);
    const interval = setInterval(() => {
      setVisibleSteps((prev) => {
        if (prev >= command.steps.length) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 800);
    return () => clearInterval(interval);
  }, [command.steps.length]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="rounded-lg border border-border bg-card p-4"
    >
      {command.title && (
        <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
          {command.title}
        </h3>
      )}
      <div className="space-y-3">
        <AnimatePresence>
          {command.steps.slice(0, visibleSteps).map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex gap-3"
            >
              <div className="flex-shrink-0 mt-1">
                <CheckCircle2 className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground">
                  {step.label}
                </div>
                {step.latex && (
                  <div className="mt-1">
                    <SafeBlockMath latex={step.latex} />
                  </div>
                )}
                {step.explanation && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {step.explanation}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function SafeBlockMath({ latex }: { latex: string }) {
  try {
    return <BlockMath math={latex} />;
  } catch {
    return <span className="text-muted-foreground text-sm italic">{latex}</span>;
  }
}
