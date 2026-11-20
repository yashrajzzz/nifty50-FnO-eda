"use client";

import { ThemeToggle } from "./ThemeToggle";

interface Props {
  title?: string;
}

export function AppHeader({ title }: Props) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between h-12 px-6 border-b border-border bg-background-surface/80 backdrop-blur-sm">
      <span className="text-sm font-medium text-foreground-secondary">{title ?? ""}</span>
      <ThemeToggle />
    </header>
  );
}
