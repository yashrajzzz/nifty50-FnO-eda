import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => ReactNode;
  align?: "left" | "right" | "center";
  mono?: boolean;
}

interface Props<T> {
  columns: Column<T>[];
  data: T[];
  keyField?: keyof T;
  className?: string;
  maxHeight?: string;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  keyField,
  className,
  maxHeight = "400px",
}: Props<T>) {
  return (
    <div className={cn("overflow-hidden rounded-md border border-border bg-background-surface", className)}>
      <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight }}>
        <table className="w-full text-[12px] text-left border-collapse">
          <thead className="sticky top-0 bg-background-subtle border-b border-border text-[11px] font-semibold text-foreground-muted uppercase tracking-wider">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={cn(
                    "px-3.5 py-2.5",
                    col.align === "right" && "text-right",
                    col.align === "center" && "text-center"
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {data.map((row, rowIdx) => {
              const rowKey = keyField ? String(row[keyField]) : rowIdx;
              return (
                <tr key={rowKey} className="hover:bg-background-subtle/50 transition-colors">
                  {columns.map((col, colIdx) => {
                    const value = col.accessorKey ? row[col.accessorKey] : undefined;
                    return (
                      <td
                        key={colIdx}
                        className={cn(
                          "px-3.5 py-2 whitespace-nowrap text-foreground-secondary",
                          col.mono && "font-mono",
                          col.align === "right" && "text-right",
                          col.align === "center" && "text-center"
                        )}
                      >
                        {col.cell ? col.cell(row) : value != null ? String(value) : "—"}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
