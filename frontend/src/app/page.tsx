"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { formatNumber, formatDate, formatPercentage } from "@/lib/utils";
import type {
  OverviewSummary,
  FuturesSummary,
  OptionsSummary,
  ComparativeAnalyticsResponse,
} from "@/lib/types";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import {
  HeroRocketChartIllustration,
  FuturesContractIllustration,
  OptionsDualIllustration,
  MarketAnalyticsIllustration,
  MachineLearningIllustration,
} from "@/components/illustrations/FinancialIllustrations";
import { EducationalStorytelling } from "@/components/home/EducationalStorytelling";
import {
  TrendingUp,
  Layers,
  BarChart3,
  Brain,
  ArrowRight,
  ArrowUpRight,
  Calendar,
  Database,
  ShieldAlert,
  Sparkles,
  BookOpen,
  PieChart as PieIcon,
  Activity,
  CheckCircle,
} from "lucide-react";
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

// Modern Fintech palette: Vivid Green, Near-Black, and Slate Gray
const CHART_COLORS = ["#00E676", "#0F172A", "#64748B"];

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

  if (error) return <div className="p-8"><ErrorState message={error} onRetry={loadData} /></div>;
  if (loading || !data) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-8">
        <LoadingState text="Loading NIFTY 50 derivatives intelligence & market metrics…" />
      </div>
    );
  }

  const { overview, futures, options, comparison } = data;

  const totalCleanedRecords = overview.instruments.reduce((acc, i) => acc + i.records, 0);

  const volumeData = [
    { name: "Futures", value: comparison.volume_shares.futures_pct },
    { name: "Call Options (CE)", value: comparison.volume_shares.ce_pct },
    { name: "Put Options (PE)", value: comparison.volume_shares.pe_pct },
  ];

  const oiData = [
    { name: "Futures", value: comparison.open_interest_shares.futures_pct },
    { name: "Call Options (CE)", value: comparison.open_interest_shares.ce_pct },
    { name: "Put Options (PE)", value: comparison.open_interest_shares.pe_pct },
  ];

  const instrumentBars = overview.instruments.map((i) => ({
    name: i.instrument.replace(" Options", ""),
    records: i.records,
    pct: i.percentage,
  }));

  return (
    <div className="space-y-0 text-[#0F172A] bg-white selection:bg-[#00E676]/30">
      {/* =========================================================================
          SECTION B: HERO SECTION
          ========================================================================= */}
      <section className="relative overflow-hidden pt-8 pb-16 sm:pt-14 sm:pb-24 border-b border-border bg-gradient-to-b from-[#F5F6F5]/50 via-white to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Headline & Action Column */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E8F5E9] border border-[#00E676]/30 text-xs font-semibold text-[#00C853] shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-[#00E676] animate-pulse" />
                <span>NIFTY 50 DERIVATIVES RESEARCH PLATFORM</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#0F172A] leading-[1.12]">
                Understand the <span className="underline decoration-[#00E676] decoration-wavy decoration-2 underline-offset-8">market</span>.
                <br />
                Explore the <span className="bg-[#E8F5E9] text-[#00C853] px-2 rounded-lg">data</span>.
                <br />
                Discover the patterns.
              </h1>

              <p className="text-base sm:text-lg lg:text-xl text-[#475569] max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Explore the NIFTY 50 derivatives market through historical data, statistical analysis, and machine learning.
              </p>

              {/* Two CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-2">
                <Link
                  href="/analytics"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#0F172A] text-white font-semibold text-sm hover:bg-[#1E293B] shadow-sm transition-all group"
                >
                  <span>Explore Analytics</span>
                  <ArrowRight size={16} className="text-[#00E676] group-hover:translate-x-1 transition-transform" />
                </Link>

                <a
                  href="#learn-fno"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white text-[#0F172A] font-semibold text-sm border-2 border-border hover:border-[#0F172A] hover:bg-[#F5F6F5] transition-all"
                >
                  <BookOpen size={16} className="text-[#00C853]" />
                  <span>Learn F&amp;O</span>
                </a>
              </div>

              {/* Key Trust Badges */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 pt-4 text-xs text-[#64748B] font-mono">
                <span className="flex items-center gap-1.5">
                  <CheckCircle size={14} className="text-[#00C853]" /> NSE Contract-Wise Data
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle size={14} className="text-[#00C853]" /> Zero Synthetic Mocks
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle size={14} className="text-[#00C853]" /> Open Access Research
                </span>
              </div>
            </div>

            {/* Right Original Illustration Column */}
            <div className="lg:col-span-5 flex items-center justify-center">
              <HeroRocketChartIllustration size={440} className="max-w-full" />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION C: DATASET SNAPSHOT RIBBON
          ========================================================================= */}
      <section className="bg-[#F5F6F5] border-b border-border py-8 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
                <Database size={14} className="text-[#00C853]" />
                <span>Dataset Scale &amp; Verification</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] mt-0.5">
                5-Year Historical Research Corpus
              </h2>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-border text-xs text-[#64748B]">
              <Calendar size={13} className="text-[#00C853]" />
              <span>{formatDate(overview.study_period.start_date)} — {formatDate(overview.study_period.end_date)}</span>
              {overview.study_period.is_partial && (
                <span className="text-[#D97706] font-semibold">(Sep 2026 Partial)</span>
              )}
            </div>
          </div>

          {/* Metric Figures with Minimalist Separators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 bg-white rounded-2xl p-6 sm:p-8 border border-border shadow-2xs">
            {/* Raw Records */}
            <div className="space-y-1">
              <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Raw Records</p>
              <p className="text-2xl sm:text-3xl font-extrabold font-mono text-[#0F172A]">
                {formatNumber(overview.total_raw_records, { compact: true })}
              </p>
              <p className="text-[11px] text-[#64748B]">2,681,746 contract observations</p>
            </div>

            {/* Cleaned Records */}
            <div className="space-y-1 border-l border-border pl-4 sm:pl-6">
              <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Cleaned Records</p>
              <p className="text-2xl sm:text-3xl font-extrabold font-mono text-[#00C853]">
                {formatNumber(totalCleanedRecords, { compact: true })}
              </p>
              <p className="text-[11px] text-[#64748B]">Deduplicated &amp; validated</p>
            </div>

            {/* Trading Sessions */}
            <div className="space-y-1 border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6">
              <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Trading Sessions</p>
              <p className="text-2xl sm:text-3xl font-extrabold font-mono text-[#0F172A]">
                {comparison.common_trading_days.toLocaleString("en-IN")}
              </p>
              <p className="text-[11px] text-[#64748B]">Common market dates</p>
            </div>

            {/* Core Instruments */}
            <div className="space-y-1 border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6">
              <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Instruments</p>
              <p className="text-2xl sm:text-3xl font-extrabold font-mono text-[#0F172A]">
                3 <span className="text-sm font-sans font-normal text-[#94A3B8]">Classes</span>
              </p>
              <p className="text-[11px] text-[#64748B]">Futures, CE Calls &amp; PE Puts</p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION D: WHAT ARE YOU HERE TO EXPLORE? (4 INTERACTIVE CARDS)
          ========================================================================= */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <span className="text-xs font-bold font-mono tracking-widest text-[#00C853] uppercase">
            STRUCTURED RESEARCH SUITE
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#0F172A] mt-2">
            What are you here to explore?
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#475569]">
            Select an analytical domain to inspect contract-wise price mechanics, liquidity distribution, or statistical models.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Futures */}
          <Link
            href="/futures"
            className="group flex flex-col justify-between bg-white rounded-2xl border-2 border-border p-6 hover:border-[#0F172A] hover:shadow-lg transition-all duration-200"
          >
            <div>
              <div className="h-44 flex items-center justify-center bg-[#F5F6F5] rounded-xl p-2 mb-6 group-hover:scale-[1.02] transition-transform">
                <FuturesContractIllustration size={200} />
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded bg-[#E8F5E9] text-[#00C853]">
                  FUTURES
                </span>
                <ArrowUpRight size={16} className="text-[#94A3B8] group-hover:text-[#0F172A] transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-[#0F172A] group-hover:text-[#00C853] transition-colors">
                Index Futures
              </h3>
              <p className="text-xs text-[#475569] mt-2 leading-relaxed">
                Analyze historical futures prices, volume velocity, daily turnover, and near-month contract open interest dynamics.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-border/80 flex items-center text-xs font-semibold text-[#0F172A] group-hover:text-[#00C853]">
              <span>Explore Futures</span>
              <ArrowRight size={14} className="ml-1.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 2: Options */}
          <Link
            href="/options"
            className="group flex flex-col justify-between bg-white rounded-2xl border-2 border-border p-6 hover:border-[#0F172A] hover:shadow-lg transition-all duration-200"
          >
            <div>
              <div className="h-44 flex items-center justify-center bg-[#F5F6F5] rounded-xl p-2 mb-6 group-hover:scale-[1.02] transition-transform">
                <OptionsDualIllustration size={200} />
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded bg-[#E8F5E9] text-[#00C853]">
                  OPTIONS
                </span>
                <ArrowUpRight size={16} className="text-[#94A3B8] group-hover:text-[#0F172A] transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-[#0F172A] group-hover:text-[#00C853] transition-colors">
                Options Chain &amp; PCR
              </h3>
              <p className="text-xs text-[#475569] mt-2 leading-relaxed">
                Inspect 2.56M Call (CE) and Put (PE) contracts, strike concentration, weekly/monthly expirations, and Put-Call sentiment ratios.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-border/80 flex items-center text-xs font-semibold text-[#0F172A] group-hover:text-[#00C853]">
              <span>Explore Options</span>
              <ArrowRight size={14} className="ml-1.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 3: Market Analytics */}
          <Link
            href="/analytics"
            className="group flex flex-col justify-between bg-white rounded-2xl border-2 border-border p-6 hover:border-[#0F172A] hover:shadow-lg transition-all duration-200"
          >
            <div>
              <div className="h-44 flex items-center justify-center bg-[#F5F6F5] rounded-xl p-2 mb-6 group-hover:scale-[1.02] transition-transform">
                <MarketAnalyticsIllustration size={200} />
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded bg-[#E8F5E9] text-[#00C853]">
                  ANALYTICS
                </span>
                <ArrowUpRight size={16} className="text-[#94A3B8] group-hover:text-[#0F172A] transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-[#0F172A] group-hover:text-[#00C853] transition-colors">
                Comparative Analytics
              </h3>
              <p className="text-xs text-[#475569] mt-2 leading-relaxed">
                Cross-instrument statistical comparisons, Pearson correlation matrices, premium turnover distribution, and liquidity ratios.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-border/80 flex items-center text-xs font-semibold text-[#0F172A] group-hover:text-[#00C853]">
              <span>Explore Analytics</span>
              <ArrowRight size={14} className="ml-1.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 4: Machine Learning */}
          <Link
            href="/ml"
            className="group flex flex-col justify-between bg-white rounded-2xl border-2 border-border p-6 hover:border-[#0F172A] hover:shadow-lg transition-all duration-200"
          >
            <div>
              <div className="h-44 flex items-center justify-center bg-[#F5F6F5] rounded-xl p-2 mb-6 group-hover:scale-[1.02] transition-transform">
                <MachineLearningIllustration size={200} />
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded bg-[#FEF3C7] text-[#D97706]">
                  ML MODEL
                </span>
                <ArrowUpRight size={16} className="text-[#94A3B8] group-hover:text-[#0F172A] transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-[#0F172A] group-hover:text-[#00C853] transition-colors">
                Directional ML Models
              </h3>
              <p className="text-xs text-[#475569] mt-2 leading-relaxed">
                Extra Trees classifier trained on 42 technical and derivatives features. Evaluate test accuracy, F1-scores, and live inference.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-border/80 flex items-center text-xs font-semibold text-[#0F172A] group-hover:text-[#00C853]">
              <span>Explore ML Models</span>
              <ArrowRight size={14} className="ml-1.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </section>

      {/* =========================================================================
          SECTION E: EDUCATIONAL STORYTELLING (FINOLOGY-STYLE CONCEPT PLAYGROUND)
          ========================================================================= */}
      <EducationalStorytelling />

      {/* =========================================================================
          SECTION F: EDITORIAL INSIGHTS (FUTURES & OPTIONS DEEP-DIVES)
          ========================================================================= */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-24">
        {/* Editorial Block 1: Futures Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F5E9] text-[#00C853] text-xs font-bold font-mono">
              <TrendingUp size={14} />
              <span>FUTURES INSIGHTS</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight leading-tight">
              Near-Month Concentration &amp; Continuous Roll Dynamics
            </h2>
            <p className="text-sm sm:text-base text-[#475569] leading-relaxed">
              In the Indian equity derivatives structure, liquidity is aggressively concentrated in near-month contracts. Across our 1,421 trading sessions, NIFTY 50 futures advanced from post-pandemic recovery levels through to all-time highs above ₹26,000.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-[#F5F6F5] border border-border">
                <span className="text-[11px] text-[#94A3B8] font-mono block">LATEST CLOSE</span>
                <span className="text-xl font-bold font-mono text-[#0F172A]">
                  {futures.latest_close != null ? `₹${formatNumber(futures.latest_close)}` : "—"}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-[#F5F6F5] border border-border">
                <span className="text-[11px] text-[#94A3B8] font-mono block">AVG DAILY VOLUME</span>
                <span className="text-xl font-bold font-mono text-[#00C853]">
                  {formatNumber(futures.avg_daily_contracts, { compact: true })}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-[#F5F6F5] border border-border col-span-2 sm:col-span-1">
                <span className="text-[11px] text-[#94A3B8] font-mono block">DAILY TURNOVER</span>
                <span className="text-xl font-bold font-mono text-[#0F172A]">
                  ₹{formatNumber(futures.avg_daily_turnover_lakhs, { compact: true })}L
                </span>
              </div>
            </div>

            <div>
              <Link
                href="/futures"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F172A] text-white text-xs font-semibold hover:bg-[#1E293B] transition-colors"
              >
                <span>Deep-Dive Futures Data</span>
                <ArrowRight size={14} className="text-[#00E676]" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 bg-[#F5F6F5] p-6 sm:p-8 rounded-3xl border border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#0F172A]">Record Distribution by Derivative Instrument</h3>
              <span className="text-xs font-mono text-[#94A3B8]">DEDUPLICATED SAMPLES</span>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={instrumentBars} layout="vertical" margin={{ left: 10, right: 10 }}>
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={85}
                    tick={{ fontSize: 11, fill: "#475569", fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(v: number) => [formatNumber(v, { decimals: 0 }), "Records"]}
                    contentStyle={{
                      backgroundColor: "#FFFFFF",
                      border: "1px solid #E5E7EB",
                      borderRadius: 8,
                      fontSize: 12,
                      color: "#0F172A",
                    }}
                  />
                  <Bar dataKey="records" radius={[0, 6, 6, 0]} maxBarSize={30}>
                    {instrumentBars.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[11px] text-[#64748B] mt-3 text-center">
              Options represent &gt;99% of total contract rows due to multi-strike weekly &amp; monthly expiration chains.
            </p>
          </div>
        </div>

        {/* Editorial Block 2: Options Market Shares */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 order-2 lg:order-1 bg-[#F5F6F5] p-6 sm:p-8 rounded-3xl border border-border">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Volume Share Chart */}
              <div className="bg-white p-4 rounded-2xl border border-border text-center">
                <span className="text-xs font-bold text-[#0F172A]">Volume Traded Share</span>
                <div className="h-44 my-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={volumeData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={42}
                        outerRadius={68}
                        paddingAngle={3}
                        stroke="#FFFFFF"
                        strokeWidth={2}
                      >
                        {volumeData.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: number) => `${v.toFixed(2)}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-[11px] font-mono text-[#00C853] font-bold">
                  CE: {comparison.volume_shares.ce_pct.toFixed(1)}% | PE: {comparison.volume_shares.pe_pct.toFixed(1)}%
                </div>
              </div>

              {/* Open Interest Share Chart */}
              <div className="bg-white p-4 rounded-2xl border border-border text-center">
                <span className="text-xs font-bold text-[#0F172A]">Open Interest Share</span>
                <div className="h-44 my-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={oiData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={42}
                        outerRadius={68}
                        paddingAngle={3}
                        stroke="#FFFFFF"
                        strokeWidth={2}
                      >
                        {oiData.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: number) => `${v.toFixed(2)}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-[11px] font-mono text-[#0F172A] font-bold">
                  CE: {comparison.open_interest_shares.ce_pct.toFixed(1)}% | PE: {comparison.open_interest_shares.pe_pct.toFixed(1)}%
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 order-1 lg:order-2 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F5E9] text-[#00C853] text-xs font-bold font-mono">
              <Layers size={14} />
              <span>OPTIONS MARKET DYNAMICS</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight leading-tight">
              Call vs Put Volume Equilibrium &amp; Hedging Demands
            </h2>
            <p className="text-sm sm:text-base text-[#475569] leading-relaxed">
              Options volume dominates daily market activity, reflecting retail speculative participation and institutional systemic hedges. The Put-Call Ratio (PCR) operates as a primary contrarian indicator, oscillating between 0.6 and 1.6 across market regimes.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-[#F5F6F5] border border-border">
                <span className="text-[11px] text-[#94A3B8] font-mono block">AVERAGE PCR (OI)</span>
                <span className="text-2xl font-bold font-mono text-[#00C853]">
                  {formatNumber(comparison.average_pcr, { decimals: 4 })}
                </span>
                <span className="text-[10px] text-[#64748B] block mt-1">Slight bullish equilibrium</span>
              </div>
              <div className="p-4 rounded-xl bg-[#F5F6F5] border border-border">
                <span className="text-[11px] text-[#94A3B8] font-mono block">MEDIAN PCR (OI)</span>
                <span className="text-2xl font-bold font-mono text-[#0F172A]">
                  {formatNumber(comparison.median_pcr, { decimals: 4 })}
                </span>
                <span className="text-[10px] text-[#64748B] block mt-1">Robust midpoint baseline</span>
              </div>
            </div>

            <div>
              <Link
                href="/options"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F172A] text-white text-xs font-semibold hover:bg-[#1E293B] transition-colors"
              >
                <span>Deep-Dive Options Data</span>
                <ArrowRight size={14} className="text-[#00E676]" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION G: MACHINE LEARNING & STATISTICAL PREVIEW
          ========================================================================= */}
      <section className="py-16 sm:py-20 bg-[#F5F6F5] border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-border text-xs font-bold font-mono text-[#D97706] mb-3">
              <Brain size={14} />
              <span>QUANTITATIVE RESEARCH METRICS</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
              Machine Learning Model Audit
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#475569]">
              Rigorous, transparent reporting of machine learning results on real derivatives features. No inflated claims.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Model Scorecard */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-2xs space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <h3 className="text-lg font-bold text-[#0F172A]">Extra Trees Classifier</h3>
                  <p className="text-xs text-[#64748B]">5-Day Ahead Directional Prediction (Up / Down / Neutral)</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#E8F5E9] text-[#00C853] text-xs font-bold font-mono">
                  42 FEATURES
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className="p-3.5 rounded-xl bg-[#F5F6F5] border border-border">
                  <span className="text-[10px] text-[#94A3B8] font-mono block">TEST ACCURACY</span>
                  <span className="text-2xl font-bold font-mono text-[#0F172A]">38.46%</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#F5F6F5] border border-border">
                  <span className="text-[10px] text-[#94A3B8] font-mono block">MACRO F1</span>
                  <span className="text-2xl font-bold font-mono text-[#0F172A]">0.3224</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#F5F6F5] border border-border">
                  <span className="text-[10px] text-[#94A3B8] font-mono block">TRAIN ROWS</span>
                  <span className="text-2xl font-bold font-mono text-[#00C853]">{overview.ml_dataset.train_rows}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#F5F6F5] border border-border">
                  <span className="text-[10px] text-[#94A3B8] font-mono block">TEST ROWS</span>
                  <span className="text-2xl font-bold font-mono text-[#0F172A]">{overview.ml_dataset.test_rows}</span>
                </div>
              </div>

              {/* Academic Transparency Note */}
              <div className="p-4 rounded-xl bg-[#F5F6F5] border border-border text-xs text-[#475569] space-y-1">
                <p className="font-semibold text-[#0F172A]">Dataset Partition Discrepancy Note:</p>
                <p className="leading-relaxed text-[#64748B]">
                  {overview.ml_dataset.split_discrepancy_note}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-[#94A3B8]">Includes Confusion Matrix &amp; Feature Importance</span>
                <Link
                  href="/ml"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00C853] hover:underline"
                >
                  <span>Open ML Evaluation Suite</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Right Caution / Market Disclaimer Column */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-2xs space-y-5">
              <div className="flex items-center gap-3 text-[#D97706]">
                <ShieldAlert size={22} className="shrink-0" />
                <h3 className="font-bold text-base text-[#0F172A]">Market Reality &amp; EMH Disclosure</h3>
              </div>

              <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                Equity derivatives exhibit extreme noise and near-martingale properties. The test accuracy of 38.46% (against a 33.3% 3-class random baseline) validates the Efficient Market Hypothesis (EMH): retail direction cannot be reliably forecasted through past price/volume alone.
              </p>

              <div className="p-4 rounded-2xl bg-[#FEF3C7]/40 border border-[#D97706]/30 space-y-2">
                <p className="text-xs font-semibold text-[#92400E]">Data Limitation Coverage:</p>
                <p className="text-[11px] text-[#B45309] leading-relaxed">
                  {overview.data_limitation.limitation_text}
                </p>
                <div className="text-[10px] font-mono text-[#B45309] font-bold pt-1">
                  Verified Raw Coverage: {formatPercentage(overview.data_limitation.coverage_percentage)}
                </div>
              </div>

              <p className="text-[11px] text-[#94A3B8]">
                This model is strictly educational for analyzing feature interactions and algorithm behavior under financial distribution drift.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION I: FOOTER
          ========================================================================= */}
      <footer className="border-t border-border bg-white pt-12 pb-16 text-xs text-[#64748B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-border">
            {/* Brand column */}
            <div className="md:col-span-5 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#0F172A] flex items-center justify-center">
                  <TrendingUp size={16} className="text-[#00E676]" />
                </div>
                <span className="font-bold text-base text-[#0F172A] tracking-tight">
                  NIFTY 50 <span className="text-[#00C853]">F&amp;O</span> Analytics
                </span>
              </div>
              <p className="text-xs text-[#475569] max-w-sm leading-relaxed">
                Quantitative exploratory data analysis and predictive modelling of NIFTY 50 Futures and Options contracts from January 2021 to September 2026.
              </p>
              <div className="text-[11px] font-mono text-[#94A3B8]">
                Data Source: National Stock Exchange of India (NSE)
              </div>
            </div>

            {/* Quick Links */}
            <div className="md:col-span-3 space-y-2">
              <h4 className="font-bold text-[#0F172A] uppercase tracking-wider text-[11px]">Analytics Modules</h4>
              <ul className="space-y-1.5 font-medium">
                <li><Link href="/futures" className="hover:text-[#0F172A] transition-colors">Index Futures Analysis</Link></li>
                <li><Link href="/options" className="hover:text-[#0F172A] transition-colors">Options Chain &amp; PCR</Link></li>
                <li><Link href="/analytics" className="hover:text-[#0F172A] transition-colors">Comparative Statistics</Link></li>
                <li><Link href="/ml" className="hover:text-[#0F172A] transition-colors">Directional ML Models</Link></li>
              </ul>
            </div>

            {/* Platform & Research */}
            <div className="md:col-span-4 space-y-2">
              <h4 className="font-bold text-[#0F172A] uppercase tracking-wider text-[11px]">Research &amp; Documentation</h4>
              <ul className="space-y-1.5 font-medium">
                <li><Link href="/about" className="hover:text-[#0F172A] transition-colors">Methodology &amp; Architecture</Link></li>
                <li><a href="#learn-fno" className="hover:text-[#0F172A] transition-colors">F&amp;O Concepts &amp; Mechanics</a></li>
                <li><span className="text-[#94A3B8]">FastAPI REST Analytics Backend</span></li>
                <li><span className="text-[#94A3B8]">PyArrow Zero-Copy Parquet Engine</span></li>
              </ul>
            </div>
          </div>

          {/* Legal / Research Disclaimer */}
          <div className="pt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-[11px] text-[#94A3B8]">
            <p>
              © {new Date().getFullYear()} NIFTY 50 F&amp;O Analytics Research Project. Strictly for educational and quantitative analysis.
            </p>
            <p className="max-w-xl text-left md:text-right text-[#94A3B8]">
              Disclaimer: Not investment advice or a recommendation to buy or sell securities. Derivatives trading involves substantial risk of loss. Not affiliated with or endorsed by the National Stock Exchange of India (NSE).
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
