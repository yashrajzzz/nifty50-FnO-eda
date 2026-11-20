"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatNumber, formatPercentage } from "@/lib/utils";
import type {
  DescriptiveAnalyticsResponse,
  CorrelationMatrixResponse,
  ComparativeAnalyticsResponse,
  DescriptiveStats,
} from "@/lib/types";
import { PageHeader } from "@/components/ui/PageHeader";
import { MetricDisplay } from "@/components/ui/MetricDisplay";
import { ChartContainer } from "@/components/ui/ChartContainer";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { BarChart3, Activity, GitCommit, Layers, AlertCircle } from "lucide-react";

interface DescriptiveRow {
  variable: string;
  count: number;
  mean: number;
  std: number;
  min: number;
  median: number;
  max: number;
  skewness?: number;
  kurtosis?: number;
}

export default function AnalyticsPage() {
  const [descriptive, setDescriptive] = useState<DescriptiveAnalyticsResponse | null>(null);
  const [correlation, setCorrelation] = useState<CorrelationMatrixResponse | null>(null);
  const [comparison, setComparison] = useState<ComparativeAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Correlation matrix view mode
  const [corrMode, setCorrMode] = useState<"spearman" | "pearson">("spearman");

  useEffect(() => {
    Promise.all([
      api.analyticsDescriptive(),
      api.analyticsCorrelation(),
      api.comparison(),
    ])
      .then(([descRes, corrRes, compRes]) => {
        setDescriptive(descRes);
        setCorrelation(corrRes);
        setComparison(compRes);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (error) return <ErrorState message={error} />;
  if (loading || !descriptive || !correlation || !comparison) return <LoadingState />;

  const descriptiveRows: DescriptiveRow[] = [
    { variable: "Futures Daily Returns (%)", ...descriptive.futures_returns },
    { variable: "Put-Call Ratio (OI)", ...descriptive.pcr_oi },
    { variable: "Futures Contracts", ...descriptive.futures_contracts },
    { variable: "Call (CE) Contracts", ...descriptive.ce_contracts },
    { variable: "Put (PE) Contracts", ...descriptive.pe_contracts },
    { variable: "Futures Open Interest", ...descriptive.futures_oi },
    { variable: "Call (CE) Open Interest", ...descriptive.ce_oi },
    { variable: "Put (PE) Open Interest", ...descriptive.pe_oi },
  ];

  const descColumns: Column<DescriptiveRow>[] = [
    { header: "Market Metric", accessorKey: "variable" },
    { header: "Count", accessorKey: "count", align: "right", mono: true, cell: (r) => r.count.toLocaleString("en-IN") },
    { header: "Mean", accessorKey: "mean", align: "right", mono: true, cell: (r) => formatNumber(r.mean, { decimals: 2 }) },
    { header: "Std Dev", accessorKey: "std", align: "right", mono: true, cell: (r) => formatNumber(r.std, { decimals: 2 }) },
    { header: "Min", accessorKey: "min", align: "right", mono: true, cell: (r) => formatNumber(r.min, { decimals: 2 }) },
    { header: "Median (Q2)", accessorKey: "median", align: "right", mono: true, cell: (r) => formatNumber(r.median, { decimals: 2 }) },
    { header: "Max", accessorKey: "max", align: "right", mono: true, cell: (r) => formatNumber(r.max, { decimals: 2 }) },
    { header: "Skewness", accessorKey: "skewness", align: "right", mono: true, cell: (r) => (r.skewness != null ? r.skewness.toFixed(2) : "—") },
    { header: "Kurtosis", accessorKey: "kurtosis", align: "right", mono: true, cell: (r) => (r.kurtosis != null ? r.kurtosis.toFixed(2) : "—") },
  ];

  const corrMatrix = corrMode === "spearman" ? correlation.spearman : correlation.pearson;

  // Format short variable name for matrix headers
  const shortNames = correlation.features.map((f) =>
    f.replace("_contracts", "_vol").replace("_open_interest", "_oi").replace("underlying_value", "underlying")
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader
        title="Comparative Statistical Analytics"
        description="Cross-instrument statistical distributions, volume and Open Interest shares, and non-parametric correlation matrices."
        badge="Notebook 04 Methodology"
      />

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="border border-border rounded-md bg-background-surface p-3.5 space-y-1">
          <p className="text-[10px] uppercase tracking-wider text-foreground-muted flex items-center gap-1">
            <Activity size={11} className="text-brand" /> Aligned Trading Days
          </p>
          <p className="text-lg font-bold font-mono text-foreground">
            {comparison.common_trading_days.toLocaleString("en-IN")}
          </p>
          <p className="text-[10px] text-foreground-muted">Simultaneous F&O Data</p>
        </div>

        <div className="border border-border rounded-md bg-background-surface p-3.5 space-y-1">
          <p className="text-[10px] uppercase tracking-wider text-foreground-muted flex items-center gap-1">
            <GitCommit size={11} className="text-brand" /> CE/PE Vol Correlation
          </p>
          <p className="text-lg font-bold font-mono text-foreground">
            {comparison.ce_pe_volume_correlation.toFixed(3)}
          </p>
          <p className="text-[10px] text-foreground-muted">Spearman Rank Coeff</p>
        </div>

        <div className="border border-border rounded-md bg-background-surface p-3.5 space-y-1">
          <p className="text-[10px] uppercase tracking-wider text-foreground-muted flex items-center gap-1">
            <Layers size={11} className="text-brand" /> CE/PE OI Correlation
          </p>
          <p className="text-lg font-bold font-mono text-foreground">
            {comparison.ce_pe_oi_correlation.toFixed(3)}
          </p>
          <p className="text-[10px] text-foreground-muted">Structural Open Interest</p>
        </div>

        <div className="border border-border rounded-md bg-background-surface p-3.5 space-y-1">
          <p className="text-[10px] uppercase tracking-wider text-foreground-muted flex items-center gap-1">
            <BarChart3 size={11} className="text-brand" /> Return Volatility
          </p>
          <p className="text-lg font-bold font-mono text-foreground">
            {comparison.futures_return_volatility_pct.toFixed(2)}%
          </p>
          <p className="text-[10px] text-foreground-muted">Annualized Return Vol</p>
        </div>
      </div>

      {/* Descriptive Statistics Table */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">
              Descriptive Statistics Summary
            </h3>
            <p className="text-[11px] text-foreground-muted">
              Central tendency, dispersion, and higher moments (Notebook 04)
            </p>
          </div>
        </div>
        <DataTable columns={descColumns} data={descriptiveRows} maxHeight="360px" />
      </section>

      {/* Correlation Matrix Heatmap */}
      <section className="border border-border rounded-md bg-background-surface p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-semibold text-foreground tracking-tight">
              Cross-Variable Correlation Matrix
            </h3>
            <p className="text-[11px] text-foreground-muted">
              Relationship between derivatives volume, Open Interest, and underlying return metrics
            </p>
          </div>
          <div className="flex items-center gap-1 p-0.5 border border-border rounded-md bg-background-subtle text-xs">
            <button
              onClick={() => setCorrMode("spearman")}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                corrMode === "spearman" ? "bg-background-surface text-foreground shadow-sm" : "text-foreground-muted hover:text-foreground"
              }`}
            >
              Spearman (Rank)
            </button>
            <button
              onClick={() => setCorrMode("pearson")}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                corrMode === "pearson" ? "bg-background-surface text-foreground shadow-sm" : "text-foreground-muted hover:text-foreground"
              }`}
            >
              Pearson (Linear)
            </button>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="overflow-x-auto">
          <table className="w-full text-[11px] border-collapse font-mono">
            <thead>
              <tr>
                <th className="p-1.5 text-left text-foreground-muted font-normal">Feature</th>
                {shortNames.map((name, i) => (
                  <th key={i} className="p-1.5 text-center text-foreground-muted font-normal truncate max-w-[80px]" title={correlation.features[i]}>
                    {name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {corrMatrix.map((row, rIdx) => (
                <tr key={rIdx} className="border-t border-border/40">
                  <td className="p-1.5 text-left text-foreground-secondary font-medium truncate max-w-[140px]" title={correlation.features[rIdx]}>
                    {shortNames[rIdx]}
                  </td>
                  {row.map((val, cIdx) => {
                    const abs = Math.abs(val);
                    const isPositive = val >= 0;
                    // Compute tint background based on correlation
                    const bgStyle =
                      rIdx === cIdx
                        ? "bg-brand/20 text-brand font-bold"
                        : abs > 0.6
                        ? isPositive
                          ? "bg-market-up/20 text-market-up font-semibold"
                          : "bg-market-down/20 text-market-down font-semibold"
                        : abs > 0.3
                        ? isPositive
                          ? "bg-market-up/10 text-foreground"
                          : "bg-market-down/10 text-foreground"
                        : "text-foreground-muted";

                    return (
                      <td key={cIdx} className={`p-1.5 text-center text-[10px] rounded ${bgStyle}`}>
                        {val.toFixed(2)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center gap-2 pt-2 text-[11px] text-foreground-muted">
          <AlertCircle size={13} className="text-foreground-muted shrink-0" />
          <span>Correlation measures statistical co-movement across observations, not causal interaction.</span>
        </div>
      </section>

      {/* Market Share Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border border-border rounded-md bg-background-surface p-4 space-y-3">
          <h4 className="text-xs font-semibold text-foreground">Volume Market Share</h4>
          <p className="text-[11px] text-foreground-muted">Total contracts traded across product classes</p>
          <div className="space-y-2 pt-1 text-xs">
            <div className="flex justify-between">
              <span className="text-foreground-secondary">Futures</span>
              <span className="font-mono text-foreground font-medium">{formatPercentage(comparison.volume_shares.futures_pct)}</span>
            </div>
            <div className="w-full bg-background-subtle h-2 rounded-full overflow-hidden">
              <div className="bg-brand h-full" style={{ width: `${comparison.volume_shares.futures_pct}%` }} />
            </div>

            <div className="flex justify-between pt-1">
              <span className="text-foreground-secondary">Call Options (CE)</span>
              <span className="font-mono text-foreground font-medium">{formatPercentage(comparison.volume_shares.ce_pct)}</span>
            </div>
            <div className="w-full bg-background-subtle h-2 rounded-full overflow-hidden">
              <div className="bg-market-up h-full" style={{ width: `${comparison.volume_shares.ce_pct}%` }} />
            </div>

            <div className="flex justify-between pt-1">
              <span className="text-foreground-secondary">Put Options (PE)</span>
              <span className="font-mono text-foreground font-medium">{formatPercentage(comparison.volume_shares.pe_pct)}</span>
            </div>
            <div className="w-full bg-background-subtle h-2 rounded-full overflow-hidden">
              <div className="bg-market-neutral h-full" style={{ width: `${comparison.volume_shares.pe_pct}%` }} />
            </div>
          </div>
        </div>

        <div className="border border-border rounded-md bg-background-surface p-4 space-y-3">
          <h4 className="text-xs font-semibold text-foreground">Open Interest Market Share</h4>
          <p className="text-[11px] text-foreground-muted">Outstanding positioning commitment across product classes</p>
          <div className="space-y-2 pt-1 text-xs">
            <div className="flex justify-between">
              <span className="text-foreground-secondary">Futures</span>
              <span className="font-mono text-foreground font-medium">{formatPercentage(comparison.open_interest_shares.futures_pct)}</span>
            </div>
            <div className="w-full bg-background-subtle h-2 rounded-full overflow-hidden">
              <div className="bg-brand h-full" style={{ width: `${comparison.open_interest_shares.futures_pct}%` }} />
            </div>

            <div className="flex justify-between pt-1">
              <span className="text-foreground-secondary">Call Options (CE)</span>
              <span className="font-mono text-foreground font-medium">{formatPercentage(comparison.open_interest_shares.ce_pct)}</span>
            </div>
            <div className="w-full bg-background-subtle h-2 rounded-full overflow-hidden">
              <div className="bg-market-up h-full" style={{ width: `${comparison.open_interest_shares.ce_pct}%` }} />
            </div>

            <div className="flex justify-between pt-1">
              <span className="text-foreground-secondary">Put Options (PE)</span>
              <span className="font-mono text-foreground font-medium">{formatPercentage(comparison.open_interest_shares.pe_pct)}</span>
            </div>
            <div className="w-full bg-background-subtle h-2 rounded-full overflow-hidden">
              <div className="bg-market-neutral h-full" style={{ width: `${comparison.open_interest_shares.pe_pct}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
