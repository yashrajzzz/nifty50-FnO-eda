import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  message?: string;
  className?: string;
}

export function ErrorState({ message, className }: Props) {
  return (
    <div className={cn("flex items-center gap-2 py-12 justify-center text-market-down", className)}>
      <AlertTriangle size={16} />
      <span className="text-sm">{message || "Failed to load data"}</span>
    </div>
  );
}
