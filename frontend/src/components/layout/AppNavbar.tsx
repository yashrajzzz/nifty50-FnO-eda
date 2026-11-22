"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  TrendingUp,
  Layers,
  BarChart3,
  Brain,
  Info,
  Menu,
  X,
  Play,
  ArrowUpRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Overview", href: "/", icon: LayoutDashboard },
  { label: "Futures", href: "/futures", icon: TrendingUp },
  { label: "Options", href: "/options", icon: Layers },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "ML Models", href: "/ml", icon: Brain },
  { label: "About", href: "/about", icon: Info },
] as const;

export function AppNavbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on page change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const triggerIntroReplay = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("fno:replay-intro"));
    }
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md transition-all duration-200 border-b",
        scrolled ? "border-border shadow-[0_2px_12px_rgba(0,0,0,0.03)]" : "border-border/60"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brandmark */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="relative w-9 h-9 rounded-xl bg-[#0F172A] flex items-center justify-center p-1.5 shadow-sm group-hover:scale-105 transition-transform">
              <svg viewBox="0 0 40 40" className="w-full h-full fill-none">
                <rect x="8" y="22" width="4" height="8" rx="1" fill="#475569" />
                <rect x="15" y="16" width="4" height="14" rx="1" fill="#00E676" />
                <rect x="22" y="10" width="4" height="20" rx="1" fill="#475569" />
                <path
                  d="M8 26 C16 23, 21 16, 32 7"
                  stroke="#00E676"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                />
                <path
                  d="M25 7 L32 7 L32 14"
                  stroke="#00E676"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="32" cy="7" r="2.2" fill="#FFFFFF" />
              </svg>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base sm:text-lg tracking-tight text-[#0F172A]">
                  NIFTY 50 <span className="text-[#00C853]">F&O</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#F5F6F5] text-[#475569] border border-border">
                  RESEARCH
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#94A3B8] -mt-0.5 tracking-wider hidden sm:block">
                DERIVATIVES INTELLIGENCE
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-1.5">
            {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
              const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all",
                    active
                      ? "bg-[#0F172A] text-white shadow-sm"
                      : "text-[#475569] hover:text-[#0F172A] hover:bg-[#F5F6F5]"
                  )}
                >
                  <Icon
                    size={15}
                    className={cn(
                      "shrink-0",
                      active ? "text-[#00E676]" : "text-[#94A3B8]"
                    )}
                  />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Intro Replay Button */}
            <button
              onClick={triggerIntroReplay}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border border-border text-xs font-mono text-[#475569] hover:text-[#0F172A] hover:bg-[#F5F6F5] hover:border-[#CBD5E1] transition-all"
              title="Replay opening cinematic terminal animation"
            >
              <Play size={12} className="text-[#00C853] fill-[#00C853]" />
              <span className="hidden sm:inline">Intro</span>
            </button>

            {/* Quick Status Pill */}
            <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#E8F5E9] text-[#00C853] border border-[#00E676]/30 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00C853] animate-pulse" />
              <span>2.56M Cleaned Records</span>
            </div>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="md:hidden p-2 rounded-lg text-[#475569] hover:text-[#0F172A] hover:bg-[#F5F6F5] transition-colors"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-white px-4 pt-3 pb-5 space-y-1 shadow-lg animate-in slide-in-from-top-2 duration-150">
          <div className="grid grid-cols-2 gap-2 pb-3 mb-2 border-b border-border text-[11px] font-mono text-[#94A3B8]">
            <div>STUDY: 2021 — 2026</div>
            <div className="text-right text-[#00C853] font-semibold">1,421 TRADING DAYS</div>
          </div>
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  active
                    ? "bg-[#0F172A] text-white"
                    : "text-[#475569] hover:text-[#0F172A] hover:bg-[#F5F6F5]"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    size={18}
                    className={cn(active ? "text-[#00E676]" : "text-[#94A3B8]")}
                  />
                  <span>{label}</span>
                </div>
                <ArrowUpRight
                  size={14}
                  className={active ? "text-[#00E676]" : "text-[#94A3B8]"}
                />
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
