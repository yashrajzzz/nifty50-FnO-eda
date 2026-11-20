"use client";

import { Calendar, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  startDate: string;
  endDate: string;
  onStartDateChange: (d: string) => void;
  onEndDateChange: (d: string) => void;
  onReset?: () => void;
  minDate?: string;
  maxDate?: string;
}

export function DateRangeFilter({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onReset,
  minDate,
  maxDate,
}: Props) {
  // Common financial presets tailored to our Jan 2021 - Sep 2026 dataset
  const applyPreset = (preset: "all" | "2021-2022" | "2023-2024" | "2025-2026" | "1y") => {
    if (preset === "all") {
      onStartDateChange(minDate || "2021-01-01");
      onEndDateChange(maxDate || "2026-09-25");
    } else if (preset === "2021-2022") {
      onStartDateChange("2021-01-01");
      onEndDateChange("2022-12-31");
    } else if (preset === "2023-2024") {
      onStartDateChange("2023-01-01");
      onEndDateChange("2024-12-31");
    } else if (preset === "2025-2026") {
      onStartDateChange("2025-01-01");
      onEndDateChange(maxDate || "2026-09-25");
    } else if (preset === "1y") {
      onStartDateChange("2025-09-01");
      onEndDateChange(maxDate || "2026-09-25");
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      {/* Preset pills */}
      <div className="flex items-center gap-1 p-0.5 rounded-md border border-border bg-background-subtle">
        <button
          onClick={() => applyPreset("all")}
          className="px-2 py-1 rounded text-[11px] font-medium text-foreground-secondary hover:text-foreground hover:bg-background-surface transition-colors"
        >
          All (5Y)
        </button>
        <button
          onClick={() => applyPreset("2021-2022")}
          className="px-2 py-1 rounded text-[11px] font-medium text-foreground-secondary hover:text-foreground hover:bg-background-surface transition-colors"
        >
          2021-22
        </button>
        <button
          onClick={() => applyPreset("2023-2024")}
          className="px-2 py-1 rounded text-[11px] font-medium text-foreground-secondary hover:text-foreground hover:bg-background-surface transition-colors"
        >
          2023-24
        </button>
        <button
          onClick={() => applyPreset("2025-2026")}
          className="px-2 py-1 rounded text-[11px] font-medium text-foreground-secondary hover:text-foreground hover:bg-background-surface transition-colors"
        >
          2025-26
        </button>
      </div>

      {/* Date Pickers */}
      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border bg-background-surface">
        <Calendar size={13} className="text-foreground-muted" />
        <span className="text-foreground-secondary font-medium">From:</span>
        <input
          type="date"
          value={startDate}
          min={minDate}
          max={endDate || maxDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className="bg-transparent text-foreground focus:outline-none text-xs font-mono"
        />
      </div>

      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border bg-background-surface">
        <Calendar size={13} className="text-foreground-muted" />
        <span className="text-foreground-secondary font-medium">To:</span>
        <input
          type="date"
          value={endDate}
          min={startDate || minDate}
          max={maxDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          className="bg-transparent text-foreground focus:outline-none text-xs font-mono"
        />
      </div>

      {onReset && (
        <button
          onClick={onReset}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-border bg-background-surface hover:bg-background-subtle text-foreground-secondary transition-colors"
          title="Reset date range"
        >
          <RotateCcw size={12} />
          <span>Reset</span>
        </button>
      )}
    </div>
  );
}
