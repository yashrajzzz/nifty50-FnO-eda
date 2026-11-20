import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({ message, className }: { message?: string; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 text-foreground-muted gap-2", className)}>
      <Inbox size={20} />
      <span className="text-sm">{message || "No data available"}</span>
    </div>
  );
}
