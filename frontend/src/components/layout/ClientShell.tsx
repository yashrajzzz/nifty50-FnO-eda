"use client";

import { usePathname } from "next/navigation";
import { ThemeProvider } from "./ThemeProvider";
import { AppNavbar } from "./AppNavbar";
import IntroScreen from "../intro/IntroScreen";
import type { ReactNode } from "react";

export function ClientShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <ThemeProvider>
      <IntroScreen />
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <AppNavbar />
        <main className={isHome ? "flex-1" : "flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8"}>
          {children}
        </main>
      </div>
    </ThemeProvider>
  );
}
