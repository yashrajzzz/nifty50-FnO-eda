import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface Props {
  className?: string;
  text?: string;
  skeleton?: "kpi" | "chart" | "table" | "generic";
}

export function LoadingState({ className, text = "Loading market data…", skeleton = "generic" }: Props) {
  if (skeleton === "kpi") {
    return (
      <div className={cn("grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 animate-pulse", className)}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-20 rounded-md bg-background-subtle border border-border/40" />
        ))}
      </div>
    );
  }

  if (skeleton === "chart") {
    return (
      <div className={cn("h-64 rounded-md bg-background-subtle border border-border/40 animate-pulse flex items-center justify-center", className)}>
        <Loader2 size={20} className="animate-spin text-foreground-muted" />
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center justify-center py-16 text-foreground-muted space-y-2", className)}>
      <Loader2 size={22} className="animate-spin text-brand" />
      <span className="text-xs font-mono">{text}</span>
    </div>
  );
}
