'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useTutorStore } from '@/lib/stores/tutor-store';
import { EquationDisplay } from './equation-display';
import { GraphDisplay } from './graph-display';
import { StepDisplay } from './step-display';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Lightbulb } from 'lucide-react';

export function Whiteboard() {
  const commands = useTutorStore((s) => s.activeWhiteboardCommands);

  const equations = commands.filter((c) => c.type === 'equation');
  const graphs = commands.filter((c) => c.type === 'graph');
  const steps = commands.filter((c) => c.type === 'step');
  const annotations = commands.filter((c) => c.type === 'annotation');

  const isEmpty = commands.length === 0;

  return (
    <ScrollArea className="flex-1">
      <div className="p-6 space-y-4">
        {isEmpty ? (
          <EmptyWhiteboard />
        ) : (
          <AnimatePresence mode="popLayout">
            {/* Annotations at top */}
            {annotations.map((cmd, i) => {
              if (cmd.type !== 'annotation') return null;
              const colorMap = {
                blue: 'bg-blue-500/10 border-blue-500/30 text-blue-300',
                green: 'bg-green-500/10 border-green-500/30 text-green-300',
                amber: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
                red: 'bg-red-500/10 border-red-500/30 text-red-300',
              };
              const color = cmd.color || 'blue';
              return (
                <motion.div
                  key={`annotation-${i}`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`rounded-lg border px-4 py-2 text-sm ${colorMap[color]}`}
                >
                  {cmd.text}
                </motion.div>
              );
            })}

            {/* Equations */}
            {equations.map((cmd, i) => {
              if (cmd.type !== 'equation') return null;
              return (
                <EquationDisplay
                  key={`eq-${i}-${cmd.latex}`}
                  command={cmd}
                  index={i}
                />
              );
            })}

            {/* Graphs */}
            {graphs.map((cmd, i) => {
              if (cmd.type !== 'graph') return null;
              return (
                <GraphDisplay
                  key={`graph-${i}`}
                  spec={cmd.spec}
                  index={i}
                />
              );
            })}

            {/* Steps */}
            {steps.map((cmd, i) => {
              if (cmd.type !== 'step') return null;
              return (
                <StepDisplay
                  key={`step-${i}`}
                  command={cmd}
                  index={i}
                />
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </ScrollArea>
  );
}

function EmptyWhiteboard() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-muted-foreground">
      <Lightbulb className="h-12 w-12 mb-4 opacity-20" />
      <p className="text-sm opacity-50">
        Equations, graphs, and steps will appear here
      </p>
      <p className="text-xs opacity-30 mt-1">
        Start talking to your tutor to see the whiteboard in action
      </p>
    </div>
  );
}
