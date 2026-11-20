"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  TrendingUp,
  Layers,
  BarChart3,
  Brain,
  Info,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const NAV = [
  { label: "Overview", href: "/", icon: LayoutDashboard },
  { label: "Futures", href: "/futures", icon: TrendingUp },
  { label: "Options", href: "/options", icon: Layers },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "ML Models", href: "/ml", icon: Brain },
  { label: "About", href: "/about", icon: Info },
] as const;

export function AppSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-30 flex flex-col border-r border-border bg-background-surface transition-[width] duration-200",
        collapsed ? "w-14" : "w-52"
      )}
    >
      {/* Brand */}
      <div className="flex items-center gap-2 h-12 px-3 border-b border-border shrink-0">
        {!collapsed && (
          <span className="text-sm font-semibold text-foreground truncate tracking-tight">
            NIFTY 50 F&O
          </span>
        )}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className={cn(
            "p-1.5 rounded-md text-foreground-muted hover:text-foreground hover:bg-background-subtle transition-colors",
            collapsed && "mx-auto"
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelLeft size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-2 px-2 space-y-0.5 overflow-y-auto">
        {NAV.map(({ label, href, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] font-medium transition-colors",
                active
                  ? "bg-brand-subtle text-brand"
                  : "text-foreground-secondary hover:text-foreground hover:bg-background-subtle"
              )}
              title={collapsed ? label : undefined}
            >
              <Icon size={16} className="shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-border">
        {!collapsed && (
          <p className="text-[10px] text-foreground-muted leading-tight">
            Research Tool · Not Financial Advice
          </p>
        )}
      </div>
    </aside>
  );
}
