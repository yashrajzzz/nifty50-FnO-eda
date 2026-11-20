import { cn } from "@/lib/utils";

interface Props {
  label: string;
  value: string;
  sub?: string;
  change?: "up" | "down" | "neutral";
  className?: string;
  mono?: boolean;
}

export function MetricDisplay({ label, value, sub, change, className, mono = true }: Props) {
  return (
    <div className={cn("space-y-1", className)}>
      <p className="text-[11px] uppercase tracking-wider text-foreground-muted">{label}</p>
      <p
        className={cn(
          "text-xl font-semibold text-foreground",
          mono && "font-mono",
          change === "up" && "text-market-up",
          change === "down" && "text-market-down",
          change === "neutral" && "text-market-neutral"
        )}
      >
        {value}
      </p>
      {sub && <p className="text-[11px] text-foreground-muted">{sub}</p>}
    </div>
  );
}
