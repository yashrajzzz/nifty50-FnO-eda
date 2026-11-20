import { PageHeader } from "@/components/ui/PageHeader";

export default function AboutPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader
        title="About This Project"
        description="NIFTY 50 Futures and Options — Exploratory Data Analysis"
      />
      <div className="border border-border rounded-md bg-background-surface p-5 space-y-3 text-[13px] text-foreground-secondary leading-relaxed max-w-2xl">
        <p>
          This application presents an exploratory data analysis of NIFTY 50 derivatives
          traded on the National Stock Exchange of India, covering January 2021 through
          September 2026 (partial).
        </p>
        <p>
          The project is an educational research tool. All metrics are derived from processed
          historical data and do not constitute financial advice or trading recommendations.
        </p>
        <p>
          The &ldquo;Underlying Value&rdquo; column in the dataset is a derivatives-implied
          proxy and is not an independently verified official NIFTY 50 spot close.
        </p>
      </div>
    </div>
  );
}
