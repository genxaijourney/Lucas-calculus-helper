'use client';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useTutorStore } from '@/lib/stores/tutor-store';
import { Brain, Mic, PenTool, BarChart3, Sparkles } from 'lucide-react';

export function WelcomeScreen() {
  const showWelcome = useTutorStore((s) => s.showWelcome);
  const setShowWelcome = useTutorStore((s) => s.setShowWelcome);

  const studentName = 'Lucas';

  return (
    <Dialog open={showWelcome} onOpenChange={setShowWelcome}>
      <DialogContent className="max-w-lg">
        <div className="text-center space-y-6 py-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center">
              <Brain className="h-8 w-8 text-primary" />
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-2">
              Welcome, {studentName} 👋
            </h2>
            <p className="text-muted-foreground text-sm">
              This is <span className="font-medium">Lucas&apos;s Calculus Tutor</span>.
              Talk naturally — I&apos;ll listen, guide you step-by-step, and show the
              math on the whiteboard.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-left">
            <Feature
              icon={Mic}
              title="Voice-First"
              description="Press Space or the mic button to talk"
            />
            <Feature
              icon={PenTool}
              title="Live Whiteboard"
              description="Equations and graphs appear as I explain"
            />
            <Feature
              icon={Sparkles}
              title="Socratic Method"
              description="I guide you to discover answers yourself"
            />
            <Feature
              icon={BarChart3}
              title="Track Progress"
              description="See progress as you practice"
            />
          </div>

          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">Try saying:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {[
                '"Help me find the derivative of 3x^2 + 5x - 7"',
                '"Explain limits like I’m 15"',
                '"Walk me through chain rule step by step"',
              ].map((phrase) => (
                <span
                  key={phrase}
                  className="text-xs bg-muted px-3 py-1.5 rounded-full text-muted-foreground"
                >
                  {phrase}
                </span>
              ))}
            </div>
          </div>

          <Button size="lg" className="w-full" onClick={() => setShowWelcome(false)}>
            Get Started
          </Button>

          <p className="text-[11px] text-muted-foreground">
            Works best in Chrome or Edge. Use a desktop for the full experience.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Feature({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-border p-3">
      <Icon className="h-4 w-4 text-primary mb-1.5" />
      <div className="text-sm font-medium">{title}</div>
      <div className="text-xs text-muted-foreground">{description}</div>
    </div>
  );
}