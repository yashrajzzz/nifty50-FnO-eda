"use client";

import { useEffect, useState, useMemo } from "react";
import { api } from "@/lib/api";
import { formatNumber, formatDate, formatPercentage } from "@/lib/utils";
import type {
  OptionsSummary,
  DailyOptionsComparisonPoint,
  StrikeAnalysisPoint,
  ExpiryAnalysisPoint,
} from "@/lib/types";
import { PageHeader } from "@/components/ui/PageHeader";
import { MetricDisplay } from "@/components/ui/MetricDisplay";
import { ChartContainer } from "@/components/ui/ChartContainer";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { DateRangeFilter } from "@/components/ui/DateRangeFilter";
import { DataTable, type Column } from "@/components/ui/DataTable";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { Layers, ArrowDownUp, ShieldAlert, Sliders } from "lucide-react";

export default function OptionsPage() {
  const [summary, setSummary] = useState<OptionsSummary | null>(null);
  const [comparisonSeries, setComparisonSeries] = useState<DailyOptionsComparisonPoint[]>([]);
  const [strikeAnalysis, setStrikeAnalysis] = useState<StrikeAnalysisPoint[]>([]);
  const [expiryAnalysis, setExpiryAnalysis] = useState<ExpiryAnalysisPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [strikeLimit, setStrikeLimit] = useState(25);
  const [expiryLimit, setExpiryLimit] = useState(25);

  const fetchData = async (start?: string, end?: string, strikes = strikeLimit, expiries = expiryLimit) => {
    try {
      setLoading(true);
      setError(null);
      const params = { start_date: start || undefined, end_date: end || undefined };

      const [sumRes, compRes, strikeRes, expRes] = await Promise.all([
        api.optionsSummary(),
        api.optionsComparison(params),
        api.optionsStrikeAnalysis({ top_n: strikes }),
        api.optionsExpiryAnalysis({ limit: expiries }),
      ]);

      setSummary(sumRes);
      setComparisonSeries(compRes.series);
      setStrikeAnalysis(strikeRes.strikes);
      setExpiryAnalysis(expRes.expiries);
    } catch (err: any) {
      setError(err?.message || "Failed to load options analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApplyFilter = (newStart: string, newEnd: string) => {
    setStartDate(newStart);
    setEndDate(newEnd);
    fetchData(newStart, newEnd, strikeLimit, expiryLimit);
  };

  const handleResetFilter = () => {
    setStartDate("");
    setEndDate("");
    fetchData("", "", strikeLimit, expiryLimit);
  };

  const handleStrikeLimitChange = (n: number) => {
    setStrikeLimit(n);
    fetchData(startDate, endDate, n, expiryLimit);
  };

  const handleExpiryLimitChange = (n: number) => {
    setExpiryLimit(n);
    fetchData(startDate, endDate, strikeLimit, n);
  };

  // Downsample comparison series for charts
  const chartComparison = useMemo(() => {
    if (comparisonSeries.length <= 150) return comparisonSeries;
    const step = Math.ceil(comparisonSeries.length / 150);
    return comparisonSeries.filter((_, idx) => idx % step === 0);
  }, [comparisonSeries]);

  const strikeColumns: Column<StrikeAnalysisPoint>[] = [
    { header: "Strike Price", accessorKey: "strike_price", cell: (r) => `₹${r.strike_price.toLocaleString("en-IN")}`, mono: true },
    { header: "CE OI", accessorKey: "ce_open_interest", cell: (r) => formatNumber(r.ce_open_interest, { compact: true }), align: "right", mono: true },
    { header: "PE OI", accessorKey: "pe_open_interest", cell: (r) => formatNumber(r.pe_open_interest, { compact: true }), align: "right", mono: true },
    { header: "CE Contracts", accessorKey: "ce_contracts", cell: (r) => formatNumber(r.ce_contracts, { compact: true }), align: "right", mono: true },
    { header: "PE Contracts", accessorKey: "pe_contracts", cell: (r) => formatNumber(r.pe_contracts, { compact: true }), align: "right", mono: true },
    {
      header: "PCR (OI)",
      accessorKey: "pcr_oi",
      cell: (r) => (r.pcr_oi != null ? r.pcr_oi.toFixed(2) : "—"),
      align: "right",
      mono: true,
    },
  ];

  const expiryColumns: Column<ExpiryAnalysisPoint>[] = [
    { header: "Expiry Date", accessorKey: "expiry", cell: (r) => formatDate(r.expiry), mono: true },
    { header: "Total Contracts", accessorKey: "total_contracts", cell: (r) => formatNumber(r.total_contracts, { compact: true }), align: "right", mono: true },
    { header: "CE Traded", accessorKey: "ce_contracts", cell: (r) => formatNumber(r.ce_contracts, { compact: true }), align: "right", mono: true },
    { header: "PE Traded", accessorKey: "pe_contracts", cell: (r) => formatNumber(r.pe_contracts, { compact: true }), align: "right", mono: true },
    { header: "Unique Strikes", accessorKey: "unique_strikes", cell: (r) => r.unique_strikes, align: "right", mono: true },
  ];

  if (error) return <ErrorState message={error} onRetry={() => fetchData(startDate, endDate, strikeLimit, expiryLimit)} />;
  if (loading && !summary) return <LoadingState text="Loading Options market and strike analytics…" />;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="NIFTY 50 Options Analytics"
          description="Call (CE) vs. Put (PE) dynamics, Put-Call Ratio (PCR) trajectory, strike distributions, and expiry cycles."
          badge="Options"
        />
        <DateRangeFilter
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={(d) => handleApplyFilter(d, endDate)}
          onEndDateChange={(d) => handleApplyFilter(startDate, d)}
          onReset={handleResetFilter}
          minDate={summary?.date_range_start}
          maxDate={summary?.date_range_end}
        />
      </div>

      {/* Options Summary Ribbon */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="border border-border rounded-md bg-background-surface p-3.5 space-y-1">
            <p className="text-[10px] uppercase tracking-wider text-foreground-muted flex items-center gap-1">
              <Layers size={11} className="text-brand" /> CE Records
            </p>
            <p className="text-lg font-bold font-mono text-foreground">
              {formatNumber(summary.total_ce_records, { compact: true })}
            </p>
            <p className="text-[10px] text-foreground-muted">Call Observations</p>
          </div>

          <div className="border border-border rounded-md bg-background-surface p-3.5 space-y-1">
            <p className="text-[10px] uppercase tracking-wider text-foreground-muted flex items-center gap-1">
              <Layers size={11} className="text-brand" /> PE Records
            </p>
            <p className="text-lg font-bold font-mono text-foreground">
              {formatNumber(summary.total_pe_records, { compact: true })}
            </p>
            <p className="text-[10px] text-foreground-muted">Put Observations</p>
          </div>

          <div className="border border-border rounded-md bg-background-surface p-3.5 space-y-1">
            <p className="text-[10px] uppercase tracking-wider text-foreground-muted flex items-center gap-1">
              <ArrowDownUp size={11} className="text-brand" /> Mean PCR (OI)
            </p>
            <p className="text-lg font-bold font-mono text-foreground">
              {summary.avg_pcr_oi.toFixed(3)}
            </p>
            <p className="text-[10px] text-foreground-muted">PE OI / CE OI</p>
          </div>

          <div className="border border-border rounded-md bg-background-surface p-3.5 space-y-1">
            <p className="text-[10px] uppercase tracking-wider text-foreground-muted">Median PCR (OI)</p>
            <p className="text-lg font-bold font-mono text-foreground">
              {summary.median_pcr_oi.toFixed(3)}
            </p>
            <p className="text-[10px] text-foreground-muted">Robust Central Tendency</p>
          </div>

          <div className="border border-border rounded-md bg-background-surface p-3.5 space-y-1">
            <p className="text-[10px] uppercase tracking-wider text-foreground-muted">CE Notional Turnover</p>
            <p className="text-lg font-bold font-mono text-foreground">
              ₹{formatNumber(summary.total_ce_turnover_lakhs, { compact: true })}L
            </p>
            <p className="text-[10px] text-foreground-muted">Calls Volume</p>
          </div>

          <div className="border border-border rounded-md bg-background-surface p-3.5 space-y-1">
            <p className="text-[10px] uppercase tracking-wider text-foreground-muted">PE Notional Turnover</p>
            <p className="text-lg font-bold font-mono text-foreground">
              ₹{formatNumber(summary.total_pe_turnover_lakhs, { compact: true })}L
            </p>
            <p className="text-[10px] text-foreground-muted">Puts Volume</p>
          </div>
        </div>
      )}

      {/* PCR Time Series */}
      <ChartContainer
        title="Put-Call Ratio (PCR) Trajectory"
        subtitle="Open Interest (PE_OI / CE_OI) and Contract Volume ratios over time"
      >
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartComparison} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: "var(--text-muted)" }}
                tickFormatter={(d) => d.slice(2, 7)}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, "auto"]}
                tick={{ fontSize: 10, fill: "var(--text-muted)" }}
                axisLine={false}
                tickLine={false}
                orientation="right"
              />
              <Tooltip
                labelFormatter={(d) => formatDate(String(d))}
                formatter={(val: number, name: string) => [
                  val.toFixed(3),
                  name === "pcr_oi" ? "PCR (Open Interest)" : "PCR (Volume)",
                ]}
                contentStyle={{
                  backgroundColor: "var(--chart-tooltip-bg)",
                  border: "1px solid var(--chart-tooltip-border)",
                  borderRadius: 6,
                  fontSize: 12,
                }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ fontSize: 11, paddingBottom: 6 }}
              />
              <Line type="monotone" dataKey="pcr_oi" name="PCR (Open Interest)" stroke="#3b82f6" strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="pcr_volume" name="PCR (Volume)" stroke="#f59e0b" strokeWidth={1.2} strokeDasharray="4 4" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartContainer>

      {/* Call vs Put Contracts Traded */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartContainer title="Call vs. Put Contract Volume" subtitle="Daily contracts traded side-by-side">
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartComparison} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: "var(--text-muted)" }}
                  tickFormatter={(d) => d.slice(2, 7)}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "var(--text-muted)" }}
                  tickFormatter={(v) => formatNumber(v, { compact: true })}
                  axisLine={false}
                  tickLine={false}
                  orientation="right"
                />
                <Tooltip
                  labelFormatter={(d) => formatDate(String(d))}
                  formatter={(val: number, name: string) => [
                    formatNumber(val, { compact: true }),
                    name === "ce_contracts" ? "Call Contracts" : "Put Contracts",
                  ]}
                  contentStyle={{
                    backgroundColor: "var(--chart-tooltip-bg)",
                    border: "1px solid var(--chart-tooltip-border)",
                    borderRadius: 6,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="ce_contracts" name="Call Contracts" fill="#3b82f6" />
                <Bar dataKey="pe_contracts" name="Put Contracts" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartContainer>

        <ChartContainer title="Call vs. Put Open Interest" subtitle="Aggregate open contract positioning">
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartComparison} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: "var(--text-muted)" }}
                  tickFormatter={(d) => d.slice(2, 7)}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "var(--text-muted)" }}
                  tickFormatter={(v) => formatNumber(v, { compact: true })}
                  axisLine={false}
                  tickLine={false}
                  orientation="right"
                />
                <Tooltip
                  labelFormatter={(d) => formatDate(String(d))}
                  formatter={(val: number, name: string) => [
                    formatNumber(val, { compact: true }),
                    name === "ce_oi" ? "Call OI" : "Put OI",
                  ]}
                  contentStyle={{
                    backgroundColor: "var(--chart-tooltip-bg)",
                    border: "1px solid var(--chart-tooltip-border)",
                    borderRadius: 6,
                    fontSize: 12,
                  }}
                />
                <Line type="monotone" dataKey="ce_oi" name="Call OI" stroke="#3b82f6" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="pe_oi" name="Put OI" stroke="#10b981" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartContainer>
      </div>

      {/* Strike Analysis Section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">
              Strike Price Distribution (Top Active Strikes)
            </h3>
            <p className="text-[11px] text-foreground-muted">
              Call vs. Put Open Interest accumulation across key strike levels
            </p>
          </div>
        </div>
        <DataTable columns={strikeColumns} data={strikeAnalysis} maxHeight="300px" />
      </section>

      {/* Expiry Cycles Section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">
              Expiration Date Cycles & Clustering
            </h3>
            <p className="text-[11px] text-foreground-muted">
              Volume and concentration breakdown by derivative settlement cycles
            </p>
          </div>
        </div>
        <DataTable columns={expiryColumns} data={expiryAnalysis} maxHeight="280px" />
      </section>
    </div>
  );
}
