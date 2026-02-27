'use client';

import { motion } from 'framer-motion';
import { EquationCommand } from '@/lib/types/tutor';
import 'katex/dist/katex.min.css';
import { BlockMath } from 'react-katex';

interface EquationDisplayProps {
  command: EquationCommand;
  index: number;
}

export function EquationDisplay({ command, index }: EquationDisplayProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className={`rounded-lg p-4 ${
        command.highlight
          ? 'bg-primary/10 border border-primary/30'
          : 'bg-card border border-border'
      }`}
    >
      {command.label && (
        <div className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">
          {command.label}
        </div>
      )}
      <div className="text-lg">
        <ErrorBoundaryKaTeX latex={command.latex} />
      </div>
    </motion.div>
  );
}

function ErrorBoundaryKaTeX({ latex }: { latex: string }) {
  try {
    return <BlockMath math={latex} />;
  } catch {
    return (
      <div className="text-muted-foreground text-sm italic">
        Unable to render: {latex}
      </div>
    );
  }
}
