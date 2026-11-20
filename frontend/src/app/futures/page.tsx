"use client";

import { useEffect, useState, useMemo } from "react";
import { api } from "@/lib/api";
import { formatNumber, formatDate } from "@/lib/utils";
import type {
  FuturesSummary,
  FuturesPricePoint,
  FuturesVolumePoint,
  FuturesOIPoint,
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
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { TrendingUp, Activity, BarChart2, DollarSign } from "lucide-react";

export default function FuturesPage() {
  const [summary, setSummary] = useState<FuturesSummary | null>(null);
  const [prices, setPrices] = useState<FuturesPricePoint[]>([]);
  const [volumeSeries, setVolumeSeries] = useState<FuturesVolumePoint[]>([]);
  const [oiSeries, setOiSeries] = useState<FuturesOIPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Date filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchData = async (start?: string, end?: string) => {
    try {
      setLoading(true);
      setError(null);
      const params = { start_date: start || undefined, end_date: end || undefined };

      const [sumRes, priceRes, volRes, oiRes] = await Promise.all([
        api.futuresSummary(),
        api.futuresPrices({ ...params, limit: 1000 }),
        api.futuresVolume(params),
        api.futuresOI(params),
      ]);

      setSummary(sumRes);
      setPrices(priceRes.prices);
      setVolumeSeries(volRes.series);
      setOiSeries(oiRes.series);
    } catch (err: any) {
      setError(err?.message || "Failed to load futures analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApplyFilter = (newStart: string, newEnd: string) => {
    setStartDate(newStart);
    setEndDate(newEnd);
    fetchData(newStart, newEnd);
  };

  const handleResetFilter = () => {
    setStartDate("");
    setEndDate("");
    fetchData();
  };

  // Downsample time-series for smooth charting performance
  const chartPrices = useMemo(() => {
    if (prices.length <= 150) return prices;
    const step = Math.ceil(prices.length / 150);
    return prices.filter((_, idx) => idx % step === 0);
  }, [prices]);

  const chartVolumes = useMemo(() => {
    if (volumeSeries.length <= 150) return volumeSeries;
    const step = Math.ceil(volumeSeries.length / 150);
    return volumeSeries.filter((_, idx) => idx % step === 0);
  }, [volumeSeries]);

  const chartOI = useMemo(() => {
    if (oiSeries.length <= 150) return oiSeries;
    const step = Math.ceil(oiSeries.length / 150);
    return oiSeries.filter((_, idx) => idx % step === 0);
  }, [oiSeries]);

  const priceColumns: Column<FuturesPricePoint>[] = [
    { header: "Date", accessorKey: "date", cell: (r) => formatDate(r.date), mono: true },
    { header: "Expiry", accessorKey: "expiry", cell: (r) => formatDate(r.expiry), mono: true },
    { header: "Open (₹)", accessorKey: "open", cell: (r) => formatNumber(r.open), align: "right", mono: true },
    { header: "High (₹)", accessorKey: "high", cell: (r) => formatNumber(r.high), align: "right", mono: true },
    { header: "Low (₹)", accessorKey: "low", cell: (r) => formatNumber(r.low), align: "right", mono: true },
    { header: "Close (₹)", accessorKey: "close", cell: (r) => formatNumber(r.close), align: "right", mono: true },
    { header: "Settle (₹)", accessorKey: "settle_price", cell: (r) => formatNumber(r.settle_price), align: "right", mono: true },
  ];

  if (error) return <ErrorState message={error} />;
  if (loading && !summary) return <LoadingState />;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="NIFTY 50 Futures Analytics"
          description="Price discovery, contract trading volumes, notional turnover, and Open Interest trends."
          badge="Futures"
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

      {/* KPI Ribbon */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="border border-border rounded-md bg-background-surface p-3.5 space-y-1">
            <p className="text-[10px] uppercase tracking-wider text-foreground-muted flex items-center gap-1">
              <TrendingUp size={11} className="text-brand" /> Latest Close
            </p>
            <p className="text-lg font-bold font-mono text-foreground">
              {summary.latest_close ? `₹${formatNumber(summary.latest_close)}` : "—"}
            </p>
            <p className="text-[10px] text-foreground-muted">Index Proxy Close</p>
          </div>

          <div className="border border-border rounded-md bg-background-surface p-3.5 space-y-1">
            <p className="text-[10px] uppercase tracking-wider text-foreground-muted flex items-center gap-1">
              <Activity size={11} className="text-brand" /> Trading Days
            </p>
            <p className="text-lg font-bold font-mono text-foreground">
              {summary.unique_trading_dates.toLocaleString("en-IN")}
            </p>
            <p className="text-[10px] text-foreground-muted">Sessions Analyzed</p>
          </div>

          <div className="border border-border rounded-md bg-background-surface p-3.5 space-y-1">
            <p className="text-[10px] uppercase tracking-wider text-foreground-muted flex items-center gap-1">
              <BarChart2 size={11} className="text-brand" /> Total Contracts
            </p>
            <p className="text-lg font-bold font-mono text-foreground">
              {formatNumber(summary.total_contracts_traded, { compact: true })}
            </p>
            <p className="text-[10px] text-foreground-muted">Cumulative Traded</p>
          </div>

          <div className="border border-border rounded-md bg-background-surface p-3.5 space-y-1">
            <p className="text-[10px] uppercase tracking-wider text-foreground-muted flex items-center gap-1">
              <DollarSign size={11} className="text-brand" /> Total Turnover
            </p>
            <p className="text-lg font-bold font-mono text-foreground">
              ₹{formatNumber(summary.total_turnover_lakhs, { compact: true })}L
            </p>
            <p className="text-[10px] text-foreground-muted">Notional Volume</p>
          </div>

          <div className="border border-border rounded-md bg-background-surface p-3.5 space-y-1">
            <p className="text-[10px] uppercase tracking-wider text-foreground-muted">Avg Daily Vol</p>
            <p className="text-lg font-bold font-mono text-foreground">
              {formatNumber(summary.avg_daily_contracts, { compact: true })}
            </p>
            <p className="text-[10px] text-foreground-muted">Contracts / Day</p>
          </div>

          <div className="border border-border rounded-md bg-background-surface p-3.5 space-y-1">
            <p className="text-[10px] uppercase tracking-wider text-foreground-muted">Peak Open Interest</p>
            <p className="text-lg font-bold font-mono text-foreground">
              {formatNumber(summary.max_open_interest, { compact: true })}
            </p>
            <p className="text-[10px] text-foreground-muted">Max Outstanding</p>
          </div>
        </div>
      )}

      {/* Historical Price Chart */}
      <ChartContainer
        title="Futures Historical Price Trend"
        subtitle="Closing and settlement prices over trading sessions (₹)"
      >
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartPrices} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                tickFormatter={(d) => d.slice(2, 7)}
                axisLine={{ stroke: "var(--border-subtle)" }}
                tickLine={false}
              />
              <YAxis
                domain={["auto", "auto"]}
                tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                tickFormatter={(v) => `₹${formatNumber(v, { compact: true })}`}
                axisLine={false}
                tickLine={false}
                orientation="right"
              />
              <Tooltip
                labelFormatter={(d) => formatDate(String(d))}
                formatter={(val: number) => [`₹${formatNumber(val)}`, "Close Price"]}
                contentStyle={{
                  backgroundColor: "var(--chart-tooltip-bg)",
                  border: "1px solid var(--chart-tooltip-border)",
                  borderRadius: 6,
                  fontSize: 12,
                }}
              />
              <Area type="monotone" dataKey="close" stroke="#3b82f6" strokeWidth={1.5} fill="url(#priceGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartContainer>

      {/* Trading Volume & Turnover Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartContainer title="Daily Trading Volume" subtitle="Contract count traded per session">
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartVolumes} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                  formatter={(val: number) => [formatNumber(val, { compact: true }), "Contracts"]}
                  contentStyle={{
                    backgroundColor: "var(--chart-tooltip-bg)",
                    border: "1px solid var(--chart-tooltip-border)",
                    borderRadius: 6,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="contracts" fill="#3b82f6" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartContainer>

        <ChartContainer title="Open Interest Trajectory" subtitle="Total outstanding futures contracts">
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartOI} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                  formatter={(val: number) => [formatNumber(val, { compact: true }), "Open Interest"]}
                  contentStyle={{
                    backgroundColor: "var(--chart-tooltip-bg)",
                    border: "1px solid var(--chart-tooltip-border)",
                    borderRadius: 6,
                    fontSize: 12,
                  }}
                />
                <Line type="monotone" dataKey="open_interest" stroke="#10b981" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartContainer>
      </div>

      {/* Historical Contracts Table */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">
            Contract Records Preview ({prices.length} Observations)
          </h3>
          <span className="text-[11px] text-foreground-muted">Showing latest sorted entries</span>
        </div>
        <DataTable columns={priceColumns} data={prices.slice(0, 50)} maxHeight="340px" />
      </section>
    </div>
  );
}
