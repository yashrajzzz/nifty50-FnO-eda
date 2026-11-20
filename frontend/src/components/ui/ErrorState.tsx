import { AlertTriangle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  message?: string;
  className?: string;
  onRetry?: () => void;
  title?: string;
}

export function ErrorState({
  message,
  className,
  onRetry,
  title = "Failed to load data",
}: Props) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4 rounded-md border border-border bg-background-surface text-center space-y-3",
        className
      )}
    >
      <div className="p-2.5 rounded-full bg-market-down-bg text-market-down">
        <AlertTriangle size={20} />
      </div>
      <div className="space-y-1 max-w-md">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-xs text-foreground-secondary leading-relaxed">
          {message || "An unexpected error occurred while communicating with the backend."}
        </p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-brand text-white hover:bg-brand/90 transition-colors shadow-sm"
        >
          <RefreshCw size={12} />
          <span>Retry Request</span>
        </button>
      )}
    </div>
  );
}
