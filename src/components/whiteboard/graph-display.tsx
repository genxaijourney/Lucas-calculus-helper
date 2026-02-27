'use client';

import { useMemo, useState, useEffect, Component, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Mafs, Plot, Coordinates, Point, Line, Polygon, Theme } from 'mafs';
import { compile, derivative, parse } from 'mathjs';
import { GraphSpec } from '@/lib/types/tutor';

interface GraphDisplayProps {
  spec: GraphSpec;
  index: number;
}

// Error boundary for graph rendering
class GraphErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
          Unable to render graph
        </div>
      );
    }
    return this.props.children;
  }
}

function SafeFunction({ expression, color }: { expression: string; color?: string }) {
  const evaluator = useMemo(() => {
    try {
      const compiled = compile(expression);
      return (x: number) => {
        try {
          const result = compiled.evaluate({ x });
          if (typeof result !== 'number' || !isFinite(result)) return NaN;
          return result;
        } catch {
          return NaN;
        }
      };
    } catch {
      return null;
    }
  }, [expression]);

  if (!evaluator) return null;

  return (
    <Plot.OfX
      y={evaluator}
      color={color || Theme.blue}
    />
  );
}

function TangentLineAnimation({ expression, at }: { expression: string; at: number }) {
  const tangentData = useMemo(() => {
    try {
      const compiled = compile(expression);
      const y = compiled.evaluate({ x: at });
      const node = parse(expression);
      const derivNode = derivative(node, 'x');
      const slope = derivNode.evaluate({ x: at });
      return { point: [at, y] as [number, number], slope: slope as number };
    } catch {
      return null;
    }
  }, [expression, at]);

  if (!tangentData) return null;

  return (
    <>
      <Point x={tangentData.point[0]} y={tangentData.point[1]} color={Theme.red} />
      <Line.PointSlope
        point={tangentData.point}
        slope={tangentData.slope}
        color={Theme.red}
        style="dashed"
      />
    </>
  );
}

function AreaAccumulation({
  expression,
  from,
  to,
  steps = 10,
}: {
  expression: string;
  from: number;
  to: number;
  steps: number;
}) {
  const [visibleSteps, setVisibleSteps] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleSteps((prev) => {
        if (prev >= steps) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 200);
    return () => clearInterval(interval);
  }, [steps]);

  const rectangles = useMemo(() => {
    try {
      const compiled = compile(expression);
      const dx = (to - from) / steps;
      const rects: [number, number][][] = [];

      for (let i = 0; i < visibleSteps; i++) {
        const x = from + i * dx;
        const y = compiled.evaluate({ x: x + dx / 2 });
        if (typeof y === 'number' && isFinite(y)) {
          rects.push([
            [x, 0],
            [x + dx, 0],
            [x + dx, y],
            [x, y],
          ]);
        }
      }
      return rects;
    } catch {
      return [];
    }
  }, [expression, from, to, steps, visibleSteps]);

  return (
    <>
      {rectangles.map((rect, i) => (
        <Polygon key={i} points={rect} color={Theme.blue} fillOpacity={0.2} />
      ))}
    </>
  );
}

export function GraphDisplay({ spec, index }: GraphDisplayProps) {
  const domain = spec.domain || [-10, 10];
  const range = spec.range || [-10, 10];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="rounded-lg border border-border overflow-hidden bg-card"
    >
      <GraphErrorBoundary>
        <Mafs
          viewBox={{ x: domain as [number, number], y: range as [number, number] }}
          preserveAspectRatio={false}
          height={300}
        >
          <Coordinates.Cartesian />

          {spec.functions.map((fn, i) => (
            <SafeFunction
              key={`${fn.expression}-${i}`}
              expression={fn.expression}
              color={fn.color}
            />
          ))}

          {spec.points?.map((pt, i) => (
            <Point key={`pt-${i}`} x={pt.x} y={pt.y} color={pt.color || Theme.orange} />
          ))}

          {spec.animations?.map((anim, i) => {
            if (anim.type === 'tangent_line' && anim.at !== undefined && spec.functions[0]) {
              return (
                <TangentLineAnimation
                  key={`anim-${i}`}
                  expression={spec.functions[0].expression}
                  at={anim.at}
                />
              );
            }
            if (anim.type === 'area_accumulation' && anim.from !== undefined && anim.to !== undefined && spec.functions[0]) {
              return (
                <AreaAccumulation
                  key={`anim-${i}`}
                  expression={spec.functions[0].expression}
                  from={anim.from}
                  to={anim.to}
                  steps={anim.steps || 10}
                />
              );
            }
            return null;
          })}
        </Mafs>
      </GraphErrorBoundary>

      {/* Function labels */}
      {spec.functions.some((f) => f.label) && (
        <div className="px-3 py-2 border-t border-border flex gap-3 flex-wrap">
          {spec.functions.map((fn, i) =>
            fn.label ? (
              <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div
                  className="w-3 h-0.5 rounded"
                  style={{ backgroundColor: fn.color || '#3b82f6' }}
                />
                {fn.label}
              </div>
            ) : null
          )}
        </div>
      )}
    </motion.div>
  );
}
