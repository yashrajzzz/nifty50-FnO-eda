"use client";

import { Calendar, RotateCcw } from "lucide-react";

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
  return (
    <div className="flex flex-wrap items-center gap-2.5 text-xs">
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
