"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatNumber, formatDate, formatPercentage } from "@/lib/utils";
import type {
  ModelInfoResponse,
  ModelMetricsResponse,
  FeatureImportanceResponse,
  HistoricalPredictionsResponse,
  SampleFeaturesResponse,
  PredictResponse,
  ValidationModelScore,
} from "@/lib/types";
import { PageHeader } from "@/components/ui/PageHeader";
import { MetricDisplay } from "@/components/ui/MetricDisplay";
import { ChartContainer } from "@/components/ui/ChartContainer";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { DataTable, type Column } from "@/components/ui/DataTable";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
} from "recharts";
import { Brain, Cpu, Play, CheckCircle2, XCircle, AlertTriangle, Sparkles } from "lucide-react";

export default function MLPage() {
  const [modelInfo, setModelInfo] = useState<ModelInfoResponse | null>(null);
  const [metrics, setMetrics] = useState<ModelMetricsResponse | null>(null);
  const [featureImportance, setFeatureImportance] = useState<FeatureImportanceResponse | null>(null);
  const [historical, setHistorical] = useState<HistoricalPredictionsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Inference Playground State
  const [sample, setSample] = useState<SampleFeaturesResponse | null>(null);
  const [predictLoading, setPredictLoading] = useState(false);
  const [predictResult, setPredictResult] = useState<PredictResponse | null>(null);
  const [predictError, setPredictError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      api.mlModelInfo(),
      api.mlMetrics(),
      api.mlFeatureImportance(),
      api.mlHistoricalPredictions({ limit: 117 }),
      api.mlSampleFeatures("test"),
    ])
      .then(([infoRes, metRes, featRes, histRes, sampleRes]) => {
        setModelInfo(infoRes);
        setMetrics(metRes);
        setFeatureImportance(featRes);
        setHistorical(histRes);
        setSample(sampleRes);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleRunInference = async () => {
    if (!sample) return;
    try {
      setPredictLoading(true);
      setPredictError(null);
      const res = await api.mlPredict({ features: sample.features });
      setPredictResult(res);
    } catch (err: any) {
      setPredictError(err?.message || "Inference execution failed");
    } finally {
      setPredictLoading(false);
    }
  };

  if (error) return <ErrorState message={error} />;
  if (loading || !modelInfo || !metrics || !featureImportance || !historical) return <LoadingState />;

  // Top 15 features for bar chart
  const topFeatures = featureImportance.native_importance.slice(0, 15).map((f) => ({
    feature: f.feature.length > 25 ? `${f.feature.slice(0, 24)}…` : f.feature,
    importance: f.importance,
  }));

  const validationColumns: Column<ValidationModelScore>[] = [
    { header: "Model Architecture", accessorKey: "model" },
    {
      header: "Accuracy",
      accessorKey: "accuracy",
      align: "right",
      mono: true,
      cell: (r) => formatPercentage(r.accuracy * 100),
    },
    {
      header: "Macro F1",
      accessorKey: "macro_f1",
      align: "right",
      mono: true,
      cell: (r) => r.macro_f1.toFixed(4),
    },
    {
      header: "Balanced Acc",
      accessorKey: "balanced_accuracy",
      align: "right",
      mono: true,
      cell: (r) => formatPercentage(r.balanced_accuracy * 100),
    },
    {
      header: "Log Loss",
      accessorKey: "log_loss",
      align: "right",
      mono: true,
      cell: (r) => r.log_loss.toFixed(3),
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader
        title="Machine Learning Models & Direction Inference"
        description="Extra Trees 3-class classifier trained on 43 engineered features with purged walk-forward cross-validation."
        badge="Experimental ML"
      />

      {/* Primary Benchmark Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="border border-border rounded-md bg-background-surface p-3.5 space-y-1">
          <p className="text-[10px] uppercase tracking-wider text-foreground-muted flex items-center gap-1">
            <Brain size={11} className="text-brand" /> Test Accuracy
          </p>
          <p className="text-xl font-bold font-mono text-foreground">
            {formatPercentage(historical.recorded_accuracy)}
          </p>
          <p className="text-[10px] text-foreground-muted">Benchmark Recorded</p>
        </div>

        <div className="border border-border rounded-md bg-background-surface p-3.5 space-y-1">
          <p className="text-[10px] uppercase tracking-wider text-foreground-muted flex items-center gap-1">
            <Cpu size={11} className="text-brand" /> Test Macro F1
          </p>
          <p className="text-xl font-bold font-mono text-foreground">
            {historical.recorded_macro_f1.toFixed(4)}
          </p>
          <p className="text-[10px] text-foreground-muted">Unweighted Metric</p>
        </div>

        <div className="border border-border rounded-md bg-background-surface p-3.5 space-y-1">
          <p className="text-[10px] uppercase tracking-wider text-foreground-muted">Predictor Features</p>
          <p className="text-xl font-bold font-mono text-foreground">{modelInfo.feature_count}</p>
          <p className="text-[10px] text-foreground-muted">Engineered Variables</p>
        </div>

        <div className="border border-border rounded-md bg-background-surface p-3.5 space-y-1">
          <p className="text-[10px] uppercase tracking-wider text-foreground-muted">Selected Classifier</p>
          <p className="text-base font-bold text-foreground truncate">{modelInfo.selected_model}</p>
          <p className="text-[10px] text-foreground-muted">Ensemble Trees</p>
        </div>
      </div>

      {/* Model Specifications & Dataset Splits */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Model Architecture */}
        <div className="border border-border rounded-md bg-background-surface p-4 space-y-3">
          <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
            Architecture & Hyperparameters
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between border-b border-border/40 pb-1.5">
              <span className="text-foreground-secondary">Model Family</span>
              <span className="font-mono text-foreground font-medium">{modelInfo.selected_model_type}</span>
            </div>
            <div className="flex justify-between border-b border-border/40 pb-1.5">
              <span className="text-foreground-secondary">Number of Estimators</span>
              <span className="font-mono text-foreground">{modelInfo.hyperparameters.n_estimators} Trees</span>
            </div>
            <div className="flex justify-between border-b border-border/40 pb-1.5">
              <span className="text-foreground-secondary">Max Tree Depth</span>
              <span className="font-mono text-foreground">{modelInfo.hyperparameters.max_depth ?? "None"}</span>
            </div>
            <div className="flex justify-between border-b border-border/40 pb-1.5">
              <span className="text-foreground-secondary">Class Weighting</span>
              <span className="font-mono text-foreground">{modelInfo.hyperparameters.class_weight}</span>
            </div>
            <div className="flex justify-between border-b border-border/40 pb-1.5">
              <span className="text-foreground-secondary">Cross Validation</span>
              <span className="font-mono text-foreground">Purged Time-Series (3 Folds)</span>
            </div>
            <div className="flex justify-between pt-0.5">
              <span className="text-foreground-secondary">Target Direction Classes</span>
              <span className="font-mono text-foreground">-1 (Down), 0 (Sideways), +1 (Up)</span>
            </div>
          </div>
        </div>

        {/* Partition Details */}
        <div className="border border-border rounded-md bg-background-surface p-4 space-y-3">
          <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
            Time-Series Splits & Purging
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between border-b border-border/40 pb-1.5">
              <span className="text-foreground-secondary">Training Partition</span>
              <span className="font-mono text-foreground font-medium">{modelInfo.dataset_splits.train} obs (70%)</span>
            </div>
            <div className="flex justify-between border-b border-border/40 pb-1.5">
              <span className="text-foreground-secondary">Validation Partition</span>
              <span className="font-mono text-foreground font-medium">{modelInfo.dataset_splits.validation} obs (15%)</span>
            </div>
            <div className="flex justify-between border-b border-border/40 pb-1.5">
              <span className="text-foreground-secondary">Untouched Test Partition</span>
              <span className="font-mono text-foreground font-medium">{modelInfo.dataset_splits.test} obs (15%)</span>
            </div>
            <div className="flex justify-between border-b border-border/40 pb-1.5">
              <span className="text-foreground-secondary">Total Processed Rows</span>
              <span className="font-mono text-foreground">775 observations</span>
            </div>
          </div>
          <div className="p-2.5 rounded bg-background-subtle text-[11px] text-foreground-muted leading-relaxed">
            Note: Partitions sum to 773 rows because 2 boundary observations were strictly purged to eliminate forward-looking target contamination across temporal boundaries.
          </div>
        </div>
      </section>

      {/* Confusion Matrix & Validation Rankings */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Confusion Matrix */}
        <div className="border border-border rounded-md bg-background-surface p-4 space-y-3">
          <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
            Test Confusion Matrix (117 Observations)
          </h3>
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-border text-foreground-muted text-[11px]">
                <th className="p-2 text-left">Actual \ Predicted</th>
                <th className="p-2 text-center text-market-down">Pred Down</th>
                <th className="p-2 text-center text-market-neutral">Pred Sideways</th>
                <th className="p-2 text-center text-market-up">Pred Up</th>
                <th className="p-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="font-mono divide-y divide-border/40">
              {historical.confusion_matrix.map((row) => (
                <tr key={row.actual_label} className="hover:bg-background-subtle/40">
                  <td className="p-2 font-sans font-medium text-foreground">{row.actual_label}</td>
                  <td className={`p-2 text-center ${row.actual_label === "Down" ? "bg-market-down-bg font-bold text-market-down" : "text-foreground-secondary"}`}>{row.down}</td>
                  <td className={`p-2 text-center ${row.actual_label === "Sideways" ? "bg-market-neutral-bg font-bold text-market-neutral" : "text-foreground-secondary"}`}>{row.sideways}</td>
                  <td className={`p-2 text-center ${row.actual_label === "Up" ? "bg-market-up-bg font-bold text-market-up" : "text-foreground-secondary"}`}>{row.up}</td>
                  <td className="p-2 text-right text-foreground font-medium">{row.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-[11px] text-foreground-muted">
            Directional thresholds: Down (return &lt; -0.10%), Sideways (-0.10% to +0.10%), Up (return &gt; +0.10%).
          </p>
        </div>

        {/* Validation Model Benchmark Ranking */}
        <div className="border border-border rounded-md bg-background-surface p-4 space-y-3">
          <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
            Validation Model Benchmarks
          </h3>
          <DataTable columns={validationColumns} data={metrics.validation_comparison} maxHeight="220px" />
        </div>
      </section>

      {/* Feature Importance Bar Chart */}
      <ChartContainer
        title="Top 15 Predictor Features (Gini Impurity Importance)"
        subtitle="Relative contribution of engineered features in tree splits"
      >
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topFeatures} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: "var(--text-muted)" }} domain={[0, "auto"]} />
              <YAxis
                dataKey="feature"
                type="category"
                width={130}
                tick={{ fontSize: 10, fill: "var(--text-secondary)" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(val: number) => [val.toFixed(4), "Importance"]}
                contentStyle={{
                  backgroundColor: "var(--chart-tooltip-bg)",
                  border: "1px solid var(--chart-tooltip-border)",
                  borderRadius: 6,
                  fontSize: 11,
                }}
              />
              <Bar dataKey="importance" fill="#3b82f6" radius={[0, 3, 3, 0]} maxBarSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartContainer>

      {/* Interactive Inference Playground */}
      <section className="border border-brand/30 rounded-md bg-background-surface p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-brand" />
              <h3 className="text-sm font-semibold text-foreground">
                Experimental Direction Inference Playground
              </h3>
            </div>
            <p className="text-[12px] text-foreground-muted">
              Execute live prediction through the trained Extra Trees model pipeline with an authentic test session vector.
            </p>
          </div>
          <button
            onClick={handleRunInference}
            disabled={predictLoading || !sample}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-brand text-white text-xs font-semibold hover:bg-brand/90 transition-opacity disabled:opacity-50 shrink-0"
          >
            <Play size={13} fill="currentColor" />
            <span>{predictLoading ? "Evaluating…" : "Run Inference"}</span>
          </button>
        </div>

        {sample && (
          <div className="p-3 rounded bg-background-subtle border border-border/60 text-xs grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div>
              <span className="text-foreground-muted">Sample Date:</span>{" "}
              <span className="font-mono text-foreground font-medium">{sample.date}</span>
            </div>
            <div>
              <span className="text-foreground-muted">Target Session:</span>{" "}
              <span className="font-mono text-foreground font-medium">{sample.target_date}</span>
            </div>
            <div>
              <span className="text-foreground-muted">Ground Truth:</span>{" "}
              <span className="font-mono text-foreground font-medium">{sample.actual_label} ({sample.actual_direction})</span>
            </div>
            <div>
              <span className="text-foreground-muted">Partition:</span>{" "}
              <span className="font-mono text-brand font-medium uppercase">{sample.split} Set</span>
            </div>
          </div>
        )}

        {predictError && (
          <div className="p-3 rounded bg-market-down-bg border border-market-down/30 text-market-down text-xs">
            {predictError}
          </div>
        )}

        {predictResult && (
          <div className="p-4 rounded-md border border-border bg-background-subtle space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground-muted uppercase">Inference Output</span>
              <span className="text-[11px] font-mono text-brand">Confidence: {formatPercentage(predictResult.confidence * 100)}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className={`p-3 rounded border text-center ${
                predictResult.predicted_direction === -1 ? "border-market-down bg-market-down-bg" : "border-border bg-background-surface opacity-60"
              }`}>
                <p className="text-[10px] text-foreground-muted uppercase font-semibold">Down (-1)</p>
                <p className="text-lg font-bold font-mono text-market-down">
                  {formatPercentage(predictResult.probabilities.down * 100)}
                </p>
              </div>

              <div className={`p-3 rounded border text-center ${
                predictResult.predicted_direction === 0 ? "border-market-neutral bg-market-neutral-bg" : "border-border bg-background-surface opacity-60"
              }`}>
                <p className="text-[10px] text-foreground-muted uppercase font-semibold">Sideways (0)</p>
                <p className="text-lg font-bold font-mono text-market-neutral">
                  {formatPercentage(predictResult.probabilities.sideways * 100)}
                </p>
              </div>

              <div className={`p-3 rounded border text-center ${
                predictResult.predicted_direction === 1 ? "border-market-up bg-market-up-bg" : "border-border bg-background-surface opacity-60"
              }`}>
                <p className="text-[10px] text-foreground-muted uppercase font-semibold">Up (+1)</p>
                <p className="text-lg font-bold font-mono text-market-up">
                  {formatPercentage(predictResult.probabilities.up * 100)}
                </p>
              </div>
            </div>

            <p className="text-[11px] text-foreground-muted">
              {predictResult.disclaimer} · {predictResult.target_limitation}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
