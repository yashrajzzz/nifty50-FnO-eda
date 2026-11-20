import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(value: number | null | undefined, opts?: { decimals?: number; compact?: boolean }): string {
  if (value == null || isNaN(value)) return "—";
  const { decimals = 2, compact = false } = opts ?? {};
  if (compact) {
    if (Math.abs(value) >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
    if (Math.abs(value) >= 1e7) return `${(value / 1e7).toFixed(1)}Cr`;
    if (Math.abs(value) >= 1e5) return `${(value / 1e5).toFixed(1)}L`;
    if (Math.abs(value) >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
  }
  return value.toLocaleString("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function formatPercentage(value: number | null | undefined, decimals = 2): string {
  if (value == null || isNaN(value)) return "—";
  return `${value.toFixed(decimals)}%`;
}
