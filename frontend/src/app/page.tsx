"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatNumber, formatDate, formatPercentage } from "@/lib/utils";
import type {
  OverviewSummary,
  FuturesSummary,
  OptionsSummary,
  ComparativeAnalyticsResponse,
} from "@/lib/types";
import { PageHeader } from "@/components/ui/PageHeader";
import { MetricDisplay } from "@/components/ui/MetricDisplay";
import { ChartContainer } from "@/components/ui/ChartContainer";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  Layers,
  Brain,
  AlertTriangle,
  ArrowRight,
  Database,
  Calendar,
} from "lucide-react";
import Link from "next/link";

const PIE_COLORS = ["#3b82f6", "#10b981", "#f59e0b"];

interface OverviewData {
  overview: OverviewSummary;
  futures: FuturesSummary;
  options: OptionsSummary;
  comparison: ComparativeAnalyticsResponse;
}

export default function OverviewPage() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = () => {
    setLoading(true);
    setError(null);
    Promise.all([api.overview(), api.futuresSummary(), api.optionsSummary(), api.comparison()])
      .then(([overview, futures, options, comparison]) =>
        setData({ overview, futures, options, comparison })
      )
      .catch((e) => setError(e?.message || "Failed to load overview data"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  if (error) return <ErrorState message={error} onRetry={loadData} />;
  if (loading || !data) return <LoadingState text="Loading overview metrics and market breakdown…" />;

  const { overview, futures, options, comparison } = data;

  const volumeData = [
    { name: "Futures", value: comparison.volume_shares.futures_pct },
    { name: "Call Options", value: comparison.volume_shares.ce_pct },
    { name: "Put Options", value: comparison.volume_shares.pe_pct },
  ];
  const oiData = [
    { name: "Futures", value: comparison.open_interest_shares.futures_pct },
    { name: "Call Options", value: comparison.open_interest_shares.ce_pct },
    { name: "Put Options", value: comparison.open_interest_shares.pe_pct },
  ];

  const instrumentBars = overview.instruments.map((i) => ({
    name: i.instrument.replace(" Options", ""),
    records: i.records,
    pct: i.percentage,
  }));

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <PageHeader
        title={overview.project_name}
        description={`${overview.study_period.note} · ${formatNumber(overview.total_raw_records, { compact: true })} raw records across three derivatives instruments.`}
        badge="EDA"
      />

      {/* Study period strip */}
      <div className="flex items-center gap-6 text-[13px] text-foreground-secondary border border-border rounded-md px-5 py-3 bg-background-surface">
        <Calendar size={14} className="text-foreground-muted shrink-0" />
        <span>
          {formatDate(overview.study_period.start_date)} — {formatDate(overview.study_period.end_date)}
        </span>
        <span className="text-foreground-muted">|</span>
        <span>{comparison.common_trading_days.toLocaleString("en-IN")} trading days</span>
        {overview.study_period.is_partial && (
          <>
            <span className="text-foreground-muted">|</span>
            <span className="text-market-neutral text-[12px]">Sep 2026 partial</span>
          </>
        )}
      </div>

      {/* Instrument breakdown */}
      <section>
        <h2 className="text-[13px] font-medium text-foreground-muted uppercase tracking-wider mb-3">
          Dataset Scale
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {overview.instruments.map((inst) => (
            <div
              key={inst.instrument}
              className="border border-border rounded-md bg-background-surface px-5 py-4 space-y-1"
            >
              <p className="text-[11px] uppercase tracking-wider text-foreground-muted">
                {inst.instrument}
              </p>
              <p className="text-xl font-semibold font-mono text-foreground">
                {formatNumber(inst.records, { compact: true })}
              </p>
              <p className="text-[11px] text-foreground-muted">
                {formatPercentage(inst.percentage)} of total
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Futures + Options quick stats */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Futures panel */}
        <div className="border border-border rounded-md bg-background-surface p-5 space-y-4">
          <div className="flex items-center gap-2 text-[13px] font-medium text-foreground">
            <TrendingUp size={14} className="text-brand" />
            Futures Summary
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            <MetricDisplay
              label="Trading Days"
              value={futures.unique_trading_dates.toLocaleString("en-IN")}
            />
            <MetricDisplay
              label="Latest Close"
              value={futures.latest_close != null ? `₹${formatNumber(futures.latest_close)}` : "—"}
            />
            <MetricDisplay
              label="Avg Daily Contracts"
              value={formatNumber(futures.avg_daily_contracts, { compact: true })}
            />
            <MetricDisplay
              label="Avg Daily Turnover"
              value={`₹${formatNumber(futures.avg_daily_turnover_lakhs, { compact: true })}L`}
            />
          </div>
        </div>

        {/* Options panel */}
        <div className="border border-border rounded-md bg-background-surface p-5 space-y-4">
          <div className="flex items-center gap-2 text-[13px] font-medium text-foreground">
            <Layers size={14} className="text-brand" />
            Options Summary
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            <MetricDisplay
              label="CE Records"
              value={formatNumber(options.total_ce_records, { compact: true })}
            />
            <MetricDisplay
              label="PE Records"
              value={formatNumber(options.total_pe_records, { compact: true })}
            />
            <MetricDisplay
              label="Avg PCR (OI)"
              value={formatNumber(comparison.average_pcr, { decimals: 4 })}
            />
            <MetricDisplay
              label="Median PCR (OI)"
              value={formatNumber(comparison.median_pcr, { decimals: 4 })}
            />
          </div>
        </div>
      </section>

      {/* Market share charts */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartContainer title="Volume Share" subtitle="Percentage of total contracts traded">
          <div className="h-52 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={volumeData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  stroke="none"
                >
                  {volumeData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: number) => `${v.toFixed(2)}%`}
                  contentStyle={{
                    backgroundColor: "var(--chart-tooltip-bg)",
                    border: "1px solid var(--chart-tooltip-border)",
                    borderRadius: 6,
                    fontSize: 12,
                    color: "var(--text-primary)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <Legend items={volumeData} />
        </ChartContainer>

        <ChartContainer title="Open Interest Share" subtitle="Percentage of total open interest">
          <div className="h-52 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={oiData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  stroke="none"
                >
                  {oiData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: number) => `${v.toFixed(2)}%`}
                  contentStyle={{
                    backgroundColor: "var(--chart-tooltip-bg)",
                    border: "1px solid var(--chart-tooltip-border)",
                    borderRadius: 6,
                    fontSize: 12,
                    color: "var(--text-primary)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <Legend items={oiData} />
        </ChartContainer>
      </section>

      {/* Instrument record distribution bar chart */}
      <ChartContainer
        title="Record Distribution by Instrument"
        subtitle="Total observations after deduplication"
      >
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={instrumentBars} layout="vertical" margin={{ left: 10 }}>
              <XAxis type="number" hide />
              <YAxis
                dataKey="name"
                type="category"
                width={90}
                tick={{ fontSize: 12, fill: "var(--text-secondary)" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(v: number) => formatNumber(v, { decimals: 0 })}
                contentStyle={{
                  backgroundColor: "var(--chart-tooltip-bg)",
                  border: "1px solid var(--chart-tooltip-border)",
                  borderRadius: 6,
                  fontSize: 12,
                  color: "var(--text-primary)",
                }}
              />
              <Bar dataKey="records" radius={[0, 4, 4, 0]} maxBarSize={28}>
                {instrumentBars.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartContainer>

      {/* ML experiment card */}
      <section className="border border-border rounded-md bg-background-surface p-5 space-y-4">
        <div className="flex items-center gap-2 text-[13px] font-medium text-foreground">
          <Brain size={14} className="text-brand" />
          ML Experiment Summary
          <span className="ml-auto text-[10px] uppercase tracking-widest text-market-neutral font-medium">
            Experimental
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4">
          <MetricDisplay label="Observations" value={overview.ml_dataset.total_observations.toLocaleString("en-IN")} />
          <MetricDisplay label="Features" value={String(overview.ml_dataset.feature_count)} />
          <MetricDisplay label="Test Accuracy" value="38.46%" />
          <MetricDisplay label="Macro F1" value="0.3224" />
        </div>
        <div className="grid grid-cols-3 gap-4 text-[12px] text-foreground-secondary">
          <div>
            <span className="text-foreground-muted">Train</span>{" "}
            <span className="font-mono">{overview.ml_dataset.train_rows}</span>
          </div>
          <div>
            <span className="text-foreground-muted">Validation</span>{" "}
            <span className="font-mono">{overview.ml_dataset.validation_rows}</span>
          </div>
          <div>
            <span className="text-foreground-muted">Test</span>{" "}
            <span className="font-mono">{overview.ml_dataset.test_rows}</span>
          </div>
        </div>
        <p className="text-[11px] text-foreground-muted">
          {overview.ml_dataset.split_discrepancy_note}
        </p>
      </section>

      {/* Data limitation notice */}
      <section className="flex gap-3 border border-market-neutral/30 rounded-md bg-market-neutral-bg px-5 py-4">
        <AlertTriangle size={16} className="text-market-neutral shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-[13px] font-medium text-foreground">Data Limitation</p>
          <p className="text-[12px] text-foreground-secondary leading-relaxed">
            {overview.data_limitation.limitation_text}
          </p>
          <p className="text-[11px] text-foreground-muted">
            Coverage: {formatPercentage(overview.data_limitation.coverage_percentage)} of trading dates without interpolation.
          </p>
        </div>
      </section>

      {/* Quick nav */}
      <section>
        <h2 className="text-[13px] font-medium text-foreground-muted uppercase tracking-wider mb-3">
          Explore
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Futures", href: "/futures", icon: TrendingUp, desc: "Prices, volume, OI" },
            { label: "Options", href: "/options", icon: Layers, desc: "CE/PE, PCR, strikes" },
            { label: "Analytics", href: "/analytics", icon: Database, desc: "Statistics, correlations" },
            { label: "ML Models", href: "/ml", icon: Brain, desc: "Predictions, features" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center gap-3 border border-border rounded-md bg-background-surface px-4 py-3 hover:border-brand/40 transition-colors"
            >
              <item.icon size={16} className="text-foreground-muted group-hover:text-brand transition-colors" />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-foreground">{item.label}</p>
                <p className="text-[11px] text-foreground-muted">{item.desc}</p>
              </div>
              <ArrowRight size={14} className="text-foreground-muted group-hover:text-brand transition-colors" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

/* Inline chart legend */
function Legend({ items }: { items: { name: string; value: number }[] }) {
  return (
    <div className="flex items-center justify-center gap-4 mt-2">
      {items.map((item, i) => (
        <div key={item.name} className="flex items-center gap-1.5 text-[11px] text-foreground-secondary">
          <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: PIE_COLORS[i] }} />
          {item.name} ({item.value.toFixed(1)}%)
        </div>
      ))}
    </div>
  );
}
