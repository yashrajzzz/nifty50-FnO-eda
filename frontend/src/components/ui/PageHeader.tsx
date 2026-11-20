import { cn } from "@/lib/utils";

interface Props {
  title: string;
  description?: string;
  badge?: string;
  className?: string;
}

export function PageHeader({ title, description, badge, className }: Props) {
  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-center gap-2.5">
        <h1 className="text-lg font-semibold text-foreground tracking-tight">{title}</h1>
        {badge && (
          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-brand-subtle text-brand">
            {badge}
          </span>
        )}
      </div>
      {description && <p className="text-[13px] text-foreground-secondary leading-relaxed max-w-2xl">{description}</p>}
    </div>
  );
}
