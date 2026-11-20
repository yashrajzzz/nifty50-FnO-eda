import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface Props {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}

export function ChartContainer({ title, subtitle, children, className }: Props) {
  return (
    <div className={cn("rounded-md border border-border bg-background-surface p-4", className)}>
      <div className="mb-3 space-y-0.5">
        <h3 className="text-[13px] font-medium text-foreground">{title}</h3>
        {subtitle && <p className="text-[11px] text-foreground-muted">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
