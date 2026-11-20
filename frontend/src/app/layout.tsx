import type { Metadata } from "next";
import "./globals.css";
import { ClientShell } from "@/components/layout/ClientShell";

export const metadata: Metadata = {
  title: "NIFTY 50 F&O Analytics",
  description: "Exploratory Data Analysis of NIFTY 50 Futures and Options — January 2021 to September 2026",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        {/* Prevent dark → light flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='light')document.documentElement.classList.remove('dark');else document.documentElement.classList.add('dark');}catch(e){}})();`,
          }}
        />
      </head>
      <body className="bg-background text-foreground antialiased">
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}
