import { PageHeader } from "@/components/ui/PageHeader";
import {
  BookOpen,
  Database,
  Brain,
  Layers,
  AlertTriangle,
  Code2,
  Calendar,
  ShieldAlert,
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <PageHeader
        title="About NIFTY 50 Futures & Options EDA"
        description="Comprehensive research project, exploratory data analysis, and predictive modeling on derivatives traded on the National Stock Exchange of India (NSE)."
        badge="Research Documentation"
      />

      {/* Overview Card */}
      <section className="border border-border rounded-md bg-background-surface p-5 space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <BookOpen size={16} className="text-brand" />
          Project Overview & Objectives
        </div>
        <p className="text-xs text-foreground-secondary leading-relaxed">
          The goal of this research project is to conduct an in-depth empirical investigation of liquidity, volume distribution, Open Interest dynamics, and directional predictability across NIFTY 50 index derivatives. The study encompasses futures and options contracts from January 2021 through September 2026 (partial), examining how cross-instrument metrics interact across varying market regimes.
        </p>
      </section>

      {/* Dataset & Scope */}
      <section className="border border-border rounded-md bg-background-surface p-5 space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Database size={16} className="text-brand" />
          Dataset Architecture & Coverage
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded bg-background-subtle border border-border/60 space-y-1">
            <span className="text-[10px] uppercase font-semibold text-foreground-muted">Study Horizon</span>
            <p className="font-mono text-foreground font-medium">Jan 2021 — Sep 2026</p>
            <p className="text-[10px] text-market-neutral">September 2026 partial</p>
          </div>
          <div className="p-3 rounded bg-background-subtle border border-border/60 space-y-1">
            <span className="text-[10px] uppercase font-semibold text-foreground-muted">Raw Scale</span>
            <p className="font-mono text-foreground font-medium">~2.68M Records</p>
            <p className="text-[10px] text-foreground-muted">Contract-level tick data</p>
          </div>
          <div className="p-3 rounded bg-background-subtle border border-border/60 space-y-1">
            <span className="text-[10px] uppercase font-semibold text-foreground-muted">Common Days</span>
            <p className="font-mono text-foreground font-medium">1,421 Sessions</p>
            <p className="text-[10px] text-foreground-muted">Simultaneous alignment</p>
          </div>
        </div>

        <div className="space-y-2 text-xs text-foreground-secondary leading-relaxed">
          <p>
            The underlying data covers three core derivative instrument classifications:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-foreground-secondary">
            <li><strong>Index Futures:</strong> 4,294 contract observations across monthly expirations.</li>
            <li><strong>Call Options (CE):</strong> 1,261,810 contract rows representing European call contracts.</li>
            <li><strong>Put Options (PE):</strong> 1,300,689 contract rows representing European put contracts.</li>
          </ul>
        </div>
      </section>

      {/* 6 Notebook Research Workflow */}
      <section className="border border-border rounded-md bg-background-surface p-5 space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Layers size={16} className="text-brand" />
          Six-Stage Research Methodology
        </div>
        <div className="space-y-3 text-xs">
          <div className="p-3 rounded border border-border/60 bg-background-subtle/60 space-y-1">
            <span className="font-mono text-[11px] text-brand font-semibold">Notebook 01 — Data Understanding</span>
            <p className="text-foreground-secondary">Audit of raw NSE tick data, column schemas, trading calendar verification, and timestamp continuity checks.</p>
          </div>
          <div className="p-3 rounded border border-border/60 bg-background-subtle/60 space-y-1">
            <span className="font-mono text-[11px] text-brand font-semibold">Notebook 02 — Data Cleaning & Preprocessing</span>
            <p className="text-foreground-secondary">Deduplication, date parsing, zero-volume handling without artificial imputation, and conversion to columnar Parquet format.</p>
          </div>
          <div className="p-3 rounded border border-border/60 bg-background-subtle/60 space-y-1">
            <span className="font-mono text-[11px] text-brand font-semibold">Notebook 03 — Exploratory Data Analysis</span>
            <p className="text-foreground-secondary">Univariate and bivariate analysis of price trajectories, contract volume distributions, notional turnover, and Put-Call Ratio (PCR).</p>
          </div>
          <div className="p-3 rounded border border-border/60 bg-background-subtle/60 space-y-1">
            <span className="font-mono text-[11px] text-brand font-semibold">Notebook 04 — Comparative Statistical Analysis</span>
            <p className="text-foreground-secondary">Distribution testing, skewness, kurtosis, Spearman rank correlations, and cross-instrument market share metrics.</p>
          </div>
          <div className="p-3 rounded border border-border/60 bg-background-subtle/60 space-y-1">
            <span className="font-mono text-[11px] text-brand font-semibold">Notebook 05 — Feature Engineering</span>
            <p className="text-foreground-secondary">Construction of 43 predictor features across momentum, volatility, volume ratios, and Put-Call Ratio oscillators.</p>
          </div>
          <div className="p-3 rounded border border-border/60 bg-background-subtle/60 space-y-1">
            <span className="font-mono text-[11px] text-brand font-semibold">Notebook 06 — Machine Learning Integration</span>
            <p className="text-foreground-secondary">Purged walk-forward cross-validation, hyperparameter tuning, Extra Trees benchmark (38.46% test accuracy, 0.3224 Macro F1).</p>
          </div>
        </div>
      </section>

      {/* Machine Learning Specifications */}
      <section className="border border-border rounded-md bg-background-surface p-5 space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Brain size={16} className="text-brand" />
          Machine Learning Formulation
        </div>
        <p className="text-xs text-foreground-secondary leading-relaxed">
          The machine learning objective is framed as a 3-class classification problem predicting next-day direction:
        </p>
        <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
          <div className="p-2 rounded bg-market-down-bg border border-market-down/20 text-market-down">
            <strong>-1: Down</strong>
            <p className="text-[10px] text-foreground-muted">Return &lt; -0.10%</p>
          </div>
          <div className="p-2 rounded bg-market-neutral-bg border border-market-neutral/20 text-market-neutral">
            <strong>0: Sideways</strong>
            <p className="text-[10px] text-foreground-muted">-0.10% to +0.10%</p>
          </div>
          <div className="p-2 rounded bg-market-up-bg border border-market-up/20 text-market-up">
            <strong>+1: Up</strong>
            <p className="text-[10px] text-foreground-muted">Return &gt; +0.10%</p>
          </div>
        </div>
        <p className="text-xs text-foreground-secondary leading-relaxed">
          The dataset contains 775 labelled daily observations partitioned chronologically: 541 training, 115 validation, and 117 test rows. 2 boundary records were purged to prevent forward-looking target leakage.
        </p>
      </section>

      {/* Technology Stack */}
      <section className="border border-border rounded-md bg-background-surface p-5 space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Code2 size={16} className="text-brand" />
          Technical Implementation
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="p-2 rounded bg-background-subtle border border-border/40">
            <span className="text-[10px] text-foreground-muted block">Backend</span>
            <span className="font-semibold text-foreground">FastAPI & Uvicorn</span>
          </div>
          <div className="p-2 rounded bg-background-subtle border border-border/40">
            <span className="text-[10px] text-foreground-muted block">Frontend</span>
            <span className="font-semibold text-foreground">Next.js 14 & React</span>
          </div>
          <div className="p-2 rounded bg-background-subtle border border-border/40">
            <span className="text-[10px] text-foreground-muted block">Styling</span>
            <span className="font-semibold text-foreground">Tailwind CSS</span>
          </div>
          <div className="p-2 rounded bg-background-subtle border border-border/40">
            <span className="text-[10px] text-foreground-muted block">Data & ML</span>
            <span className="font-semibold text-foreground">Scikit-learn & PyArrow</span>
          </div>
        </div>
      </section>

      {/* Critical Disclaimers */}
      <section className="border border-market-neutral/30 rounded-md bg-market-neutral-bg p-5 space-y-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <ShieldAlert size={16} className="text-market-neutral" />
          Important Data Limitation & Disclaimer
        </div>
        <p className="text-xs text-foreground-secondary leading-relaxed">
          <strong>Underlying Value Proxy:</strong> The &ldquo;Underlying Value&rdquo; field present in this dataset is derived from options and futures settlement proxies with approximately 68.26% direct date coverage. It is <em>not</em> an independently verified official NIFTY 50 cash spot index closing value.
        </p>
        <p className="text-xs text-foreground-secondary leading-relaxed">
          <strong>Non-Commercial Educational Research:</strong> This platform is purely an educational exploratory tool and retrospective data analysis suite. It is not an algorithmic trading engine, nor does it provide financial, investment, or trading recommendations.
        </p>
      </section>
    </div>
  );
}
