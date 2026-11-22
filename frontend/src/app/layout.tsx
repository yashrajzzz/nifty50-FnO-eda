import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ClientShell } from "@/components/layout/ClientShell";

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "NIFTY 50 F&O | Financial Market Analytics",
  description:
    "Explore NIFTY 50 Futures and Options through historical market data, statistical analysis, interactive visualizations and machine learning.",
  keywords: [
    "NIFTY 50",
    "Futures and Options",
    "Derivatives Analytics",
    "Options Trading",
    "Open Interest",
    "Put Call Ratio",
    "Financial Data Science",
    "Quantitative Finance",
  ],
  authors: [{ name: "NIFTY 50 Research Lab" }],
  openGraph: {
    title: "NIFTY 50 F&O | Financial Market Analytics",
    description:
      "Explore NIFTY 50 Futures and Options through historical market data, statistical analysis, interactive visualizations and machine learning.",
    type: "website",
    locale: "en_IN",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <body className="bg-background text-foreground antialiased selection:bg-[#00E676]/30">
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}
