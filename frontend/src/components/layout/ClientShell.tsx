"use client";

import { ThemeProvider } from "./ThemeProvider";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import type { ReactNode } from "react";

export function ClientShell({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AppSidebar />
      <div className="pl-52 min-h-screen flex flex-col transition-[padding] duration-200">
        <AppHeader />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </ThemeProvider>
  );
}
