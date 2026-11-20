"use client";

import { ThemeToggle } from "./ThemeToggle";
import { Play } from "lucide-react";

interface Props {
  title?: string;
}

export function AppHeader({ title }: Props) {
  const triggerIntroReplay = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("fno:replay-intro"));
    }
  };

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between h-12 px-6 border-b border-border bg-background-surface/80 backdrop-blur-sm">
      <span className="text-sm font-medium text-foreground-secondary">{title ?? ""}</span>
      <div className="flex items-center gap-2">
        <button
          onClick={triggerIntroReplay}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono rounded border border-border hover:bg-background-elevated text-foreground-secondary hover:text-foreground transition-colors"
          title="Replay opening cinematic animation"
        >
          <Play className="w-3 h-3 text-[#61dca3] fill-[#61dca3]" />
          <span className="hidden sm:inline">Intro</span>
        </button>
        <ThemeToggle />
      </div>
    </header>
  );
}
