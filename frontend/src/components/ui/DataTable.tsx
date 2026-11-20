"use client";

import { cn } from "@/lib/utils";
import { useState, useMemo, type ReactNode } from "react";
import { ChevronDown, ChevronUp, ChevronsUpDown, ChevronLeft, ChevronRight } from "lucide-react";

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => ReactNode;
  align?: "left" | "right" | "center";
  mono?: boolean;
  sortable?: boolean;
}

interface Props<T> {
  columns: Column<T>[];
  data: T[];
  keyField?: keyof T;
  className?: string;
  maxHeight?: string;
  pageSize?: number;
  initialSortKey?: keyof T;
  initialSortDir?: "asc" | "desc";
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  keyField,
  className,
  maxHeight = "400px",
  pageSize = 50,
  initialSortKey,
  initialSortDir = "asc",
}: Props<T>) {
  const [sortKey, setSortKey] = useState<keyof T | undefined>(initialSortKey);
  const [sortDir, setSortDir] = useState<"asc" | "desc">(initialSortDir);
  const [currentPage, setCurrentPage] = useState(1);

  // Sorting
  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDir === "asc" ? aVal - bVal : bVal - aVal;
      }
      return sortDir === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [data, sortKey, sortDir]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (key?: keyof T) => {
    if (!key) return;
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  return (
    <div className={cn("overflow-hidden rounded-md border border-border bg-background-surface flex flex-col", className)}>
      <div className="overflow-x-auto overflow-y-auto flex-1" style={{ maxHeight }}>
        <table className="w-full text-[12px] text-left border-collapse">
          <thead className="sticky top-0 bg-background-subtle border-b border-border text-[11px] font-semibold text-foreground-muted uppercase tracking-wider select-none z-10">
            <tr>
              {columns.map((col, idx) => {
                const isSortable = col.sortable !== false && col.accessorKey != null;
                const isSorted = sortKey === col.accessorKey;
                return (
                  <th
                    key={idx}
                    onClick={() => isSortable && handleSort(col.accessorKey)}
                    className={cn(
                      "px-3.5 py-2.5 transition-colors",
                      isSortable && "cursor-pointer hover:text-foreground",
                      col.align === "right" && "text-right",
                      col.align === "center" && "text-center"
                    )}
                  >
                    <div
                      className={cn(
                        "inline-flex items-center gap-1",
                        col.align === "right" && "justify-end",
                        col.align === "center" && "justify-center"
                      )}
                    >
                      <span>{col.header}</span>
                      {isSortable && (
                        <span className="text-foreground-muted">
                          {isSorted ? (
                            sortDir === "asc" ? (
                              <ChevronUp size={12} className="text-brand" />
                            ) : (
                              <ChevronDown size={12} className="text-brand" />
                            )
                          ) : (
                            <ChevronsUpDown size={11} className="opacity-40" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-8 text-center text-foreground-muted text-xs">
                  No records matching current view.
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIdx) => {
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
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-3.5 py-2 border-t border-border bg-background-subtle/40 text-xs text-foreground-secondary">
          <span className="font-mono text-[11px] text-foreground-muted">
            Showing {(currentPage - 1) * pageSize + 1}–
            {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length.toLocaleString("en-IN")} rows
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded hover:bg-background-subtle text-foreground-muted hover:text-foreground disabled:opacity-30 disabled:pointer-events-none transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="px-2 font-mono text-[11px]">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 rounded hover:bg-background-subtle text-foreground-muted hover:text-foreground disabled:opacity-30 disabled:pointer-events-none transition-colors"
              aria-label="Next page"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
