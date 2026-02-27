'use client';

import { ReactNode } from 'react';
import { Header } from './header';
import { Monitor } from 'lucide-react';

interface MainLayoutProps {
  whiteboard: ReactNode;
  conversation: ReactNode;
  controls: ReactNode;
}

export function MainLayout({ whiteboard, conversation, controls }: MainLayoutProps) {
  return (
    <>
      {/* Mobile notice */}
      <div className="md:hidden fixed inset-0 z-50 bg-background flex flex-col items-center justify-center p-8 text-center">
        <Monitor className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-lg font-semibold mb-2">Desktop Recommended</h2>
        <p className="text-sm text-muted-foreground max-w-xs">
          MathVoice is designed for desktop browsers. Please open this on a computer with Chrome or Edge for the best experience.
        </p>
      </div>

      {/* Desktop layout */}
      <div className="hidden md:flex h-screen flex-col bg-background overflow-hidden">
        <Header />
        <div className="flex-1 flex min-h-0">
          {/* Whiteboard — 60% */}
          <div className="w-[60%] border-r border-border flex flex-col min-h-0">
            {whiteboard}
          </div>
          {/* Conversation — 40% */}
          <div className="w-[40%] flex flex-col min-h-0">
            {conversation}
          </div>
        </div>
        {/* Controls — fixed bottom */}
        <div className="h-20 border-t border-border flex items-center justify-center px-6 shrink-0">
          {controls}
        </div>
      </div>
    </>
  );
}
