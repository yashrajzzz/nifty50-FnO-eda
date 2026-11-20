import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export function LoadingState({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center py-16 text-foreground-muted", className)}>
      <Loader2 size={20} className="animate-spin" />
      <span className="ml-2 text-sm">Loading…</span>
    </div>
  );
}
