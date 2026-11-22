"use client";

import React, { useState } from "react";
import { ArrowRight, CheckCircle2, ShieldCheck, Zap, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Concept {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  summary: string;
  steps: {
    num: string;
    title: string;
    description: string;
  }[];
  keyTakeaway: string;
  formula?: string;
}

const CONCEPTS: Concept[] = [
  {
    id: "call-option",
    title: "Call Option (CE)",
    subtitle: "The Right to Buy",
    tag: "Bullish Instrument",
    summary:
      "A Call Option gives the buyer the right, but never the obligation, to purchase NIFTY 50 index units at an agreed Strike Price before expiration.",
    steps: [
      {
        num: "01",
        title: "Pay Token Premium",
        description: "The buyer pays an upfront, non-refundable cash premium (e.g., ₹120) to the option seller.",
      },
      {
        num: "02",
        title: "Lock Agreed Strike",
        description: "The strike price (e.g., ₹25,000) is guaranteed regardless of how high market prices climb.",
      },
      {
        num: "03",
        title: "Asymmetric Upside",
        description: "If NIFTY hits ₹25,500, the contract is worth ₹500. Net gain = ₹500 - ₹120 = ₹380 per unit.",
      },
    ],
    keyTakeaway: "Maximum loss is capped strictly at the premium paid. Maximum upside is theoretically unlimited.",
    formula: "Payoff = Max(0, Spot Price - Strike Price) - Premium Paid",
  },
  {
    id: "put-option",
    title: "Put Option (PE)",
    subtitle: "The Right to Sell",
    tag: "Bearish & Hedging",
    summary:
      "A Put Option gives the buyer the right to sell the underlying asset at a predetermined price, serving as essential downside portfolio insurance.",
    steps: [
      {
        num: "01",
        title: "Purchase Downside Insurance",
        description: "An investor or trader pays a premium to hedge against sharp index corrections.",
      },
      {
        num: "02",
        title: "Guaranteed Floor Price",
        description: "Secures a guaranteed selling price even if the broader market crashes unexpectedly.",
      },
      {
        num: "03",
        title: "Inverse Market Payoff",
        description: "As the market price drops below the strike price minus premium, the put option value surges.",
      },
    ],
    keyTakeaway: "Acts as pure portfolio insurance. Enables downside monetization with strictly capped upfront risk.",
    formula: "Payoff = Max(0, Strike Price - Spot Price) - Premium Paid",
  },
  {
    id: "futures-vs-options",
    title: "Futures vs Options",
    subtitle: "Obligation vs Choice",
    tag: "Core Mechanics",
    summary:
      "While Futures represent a binding two-sided contract with symmetric risk, Options provide asymmetric leverage with discretionary execution.",
    steps: [
      {
        num: "01",
        title: "Futures Obligation",
        description: "Both buyer and seller are legally bound to settle at the future price. Daily MTM margin applies.",
      },
      {
        num: "02",
        title: "Options Discretion",
        description: "Only the option seller has an obligation. The buyer can simply let an out-of-the-money option expire worthless.",
      },
      {
        num: "03",
        title: "Capital Efficiency",
        description: "Futures require heavy initial span margins (~10-15%); option buyers pay only the fraction of premium.",
      },
    ],
    keyTakeaway: "Futures offer linear delta-one tracking; options provide convex risk-reward with volatility exposure.",
  },
  {
    id: "open-interest",
    title: "Open Interest (OI)",
    subtitle: "Active Capital Commitments",
    tag: "Market Breadth",
    summary:
      "Open Interest represents the total number of outstanding contracts currently held by market participants that have not yet been closed or exercised.",
    steps: [
      {
        num: "01",
        title: "Volume vs OI",
        description: "Volume counts every trade executed today. OI only counts contracts carried forward overnight.",
      },
      {
        num: "02",
        title: "Institutional Footprint",
        description: "Rising prices with rising OI confirms strong institutional accumulation (fresh long positions).",
      },
      {
        num: "03",
        title: "Unwinding Pressure",
        description: "Sudden drops in OI during price drops signal aggressive long unwinding and margin liquidations.",
      },
    ],
    keyTakeaway: "OI reveals where institutional market makers are willing to commit overnight margin capital.",
  },
  {
    id: "pcr-sentiment",
    title: "Put-Call Ratio (PCR)",
    subtitle: "The Sentiment Barometer",
    tag: "Quantitative Signal",
    summary:
      "PCR is calculated by dividing total Put Open Interest by total Call Open Interest, offering a real-time gauge of market bias and potential turning points.",
    steps: [
      {
        num: "01",
        title: "Bullish Threshold (> 1.0)",
        description: "Heavy put writing by institutional option sellers reflects strong support and upward confidence.",
      },
      {
        num: "02",
        title: "Contrarian Zone (> 1.4)",
        description: "Extreme put writing can signify overcrowded bullish sentiment, prompting contrarian market pullbacks.",
      },
      {
        num: "03",
        title: "Bearish Threshold (< 0.7)",
        description: "Excess call writing shows aggressive overhead resistance and cautious institutional hedging.",
      },
    ],
    keyTakeaway: "Historical average in our 1,421-day dataset is 1.0423, reflecting steady index expansion with periodic mean reversion.",
    formula: "PCR (OI) = Total Put Open Interest / Total Call Open Interest",
  },
];

export function EducationalStorytelling() {
  const [activeTab, setActiveTab] = useState(CONCEPTS[0].id);
  const current = CONCEPTS.find((c) => c.id === activeTab) || CONCEPTS[0];

  return (
    <section id="learn-fno" className="py-16 sm:py-24 bg-[#F5F6F5] border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-border text-xs font-semibold text-[#0F172A] mb-4 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#00E676]" />
            FINOLOGY-STYLE INTERACTIVE LEARNING
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#0F172A]">
            Learn Derivatives with <span className="text-[#00C853]">Visual Clarity</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#475569] leading-relaxed">
            Futures and Options can feel intimidating with jargon. Here is how they actually work in practice, illustrated step-by-step.
          </p>
        </div>

        {/* Concept Selector Tabs */}
        <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
          {CONCEPTS.map((concept) => (
            <button
              key={concept.id}
              onClick={() => setActiveTab(concept.id)}
              className={cn(
                "px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold shrink-0 transition-all cursor-pointer",
                activeTab === concept.id
                  ? "bg-[#0F172A] text-white shadow-sm"
                  : "bg-white text-[#475569] hover:text-[#0F172A] hover:bg-white/80 border border-border"
              )}
            >
              {concept.title}
            </button>
          ))}
        </div>

        {/* Active Concept Interactive Card */}
        <div className="bg-white rounded-3xl border border-border p-6 sm:p-10 lg:p-12 shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-md text-xs font-semibold font-mono bg-[#E8F5E9] text-[#00C853] border border-[#00E676]/30">
                  {current.tag}
                </span>
                <span className="text-xs font-mono text-[#94A3B8]">{current.subtitle}</span>
              </div>

              <div>
                <h3 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
                  {current.title}
                </h3>
                <p className="mt-2 text-base text-[#475569] leading-relaxed">
                  {current.summary}
                </p>
              </div>

              {/* 3 Step Sequence */}
              <div className="space-y-3 pt-2">
                {current.steps.map((step) => (
                  <div
                    key={step.num}
                    className="flex items-start gap-4 p-3.5 rounded-xl bg-[#F5F6F5] border border-border/80 hover:border-[#00E676]/40 transition-colors"
                  >
                    <span className="font-mono text-xs font-bold px-2 py-1 rounded bg-[#0F172A] text-[#00E676] shrink-0">
                      {step.num}
                    </span>
                    <div>
                      <h4 className="text-sm font-semibold text-[#0F172A]">{step.title}</h4>
                      <p className="text-xs text-[#475569] mt-0.5 leading-normal">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Takeaway & Formula Pill */}
              <div className="pt-2 space-y-3">
                <div className="flex items-start gap-2.5 text-xs text-[#0F172A] bg-[#E8F5E9]/60 p-3.5 rounded-xl border border-[#00E676]/20">
                  <CheckCircle2 size={16} className="text-[#00C853] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-[#00C853]">Core Principle: </span>
                    {current.keyTakeaway}
                  </div>
                </div>

                {current.formula && (
                  <div className="p-3 rounded-lg bg-[#F5F6F5] border border-border font-mono text-xs text-[#475569]">
                    <span className="text-[#94A3B8] font-sans font-medium mr-2">Payoff Formula:</span>
                    <span className="text-[#0F172A] font-semibold">{current.formula}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Visual Diagram Column */}
            <div className="lg:col-span-5 bg-[#F5F6F5] rounded-2xl p-6 sm:p-8 border border-border flex flex-col items-center justify-center text-center">
              {/* Concept Specific Interactive Graphic */}
              {current.id === "call-option" && (
                <div className="w-full space-y-6">
                  <div className="relative mx-auto w-40 h-40 rounded-full border-4 border-dashed border-[#00E676] flex flex-col items-center justify-center bg-white shadow-sm p-4">
                    <span className="text-2xl font-bold font-mono text-[#0F172A]">₹25,000</span>
                    <span className="text-[11px] font-semibold text-[#00C853] uppercase tracking-wider">
                      Strike Price
                    </span>
                    <span className="text-[10px] text-[#94A3B8] mt-1">Premium Paid: ₹120</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-white rounded-xl border border-border">
                      <div className="text-[#E11D48] font-bold">Market &lt; ₹25,000</div>
                      <div className="text-[11px] text-[#64748B] mt-1">Loss capped at ₹120</div>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-border">
                      <div className="text-[#00C853] font-bold">Market &gt; ₹25,120</div>
                      <div className="text-[11px] text-[#64748B] mt-1">Profit expands linearly</div>
                    </div>
                  </div>
                </div>
              )}

              {current.id === "put-option" && (
                <div className="w-full space-y-6">
                  <div className="relative mx-auto w-40 h-40 rounded-full border-4 border-dashed border-[#E11D48] flex flex-col items-center justify-center bg-white shadow-sm p-4">
                    <ShieldCheck size={36} className="text-[#E11D48] mb-1" />
                    <span className="text-sm font-bold text-[#0F172A]">FLOOR PRICE</span>
                    <span className="text-[10px] text-[#94A3B8] mt-0.5">Crash Insurance</span>
                  </div>
                  <div className="p-3.5 bg-white rounded-xl border border-border text-xs text-[#475569]">
                    If NIFTY plunges 500 points, put value increases to offset portfolio losses rupee-for-rupee.
                  </div>
                </div>
              )}

              {current.id === "futures-vs-options" && (
                <div className="w-full space-y-4 text-xs text-left">
                  <div className="p-3.5 bg-white rounded-xl border border-border space-y-1">
                    <div className="font-bold text-[#0F172A] flex items-center justify-between">
                      <span>Futures (Linear)</span>
                      <span className="text-[#00C853] font-mono">Δ = 1.0</span>
                    </div>
                    <p className="text-[11px] text-[#64748B]">
                      Every 1-point move in NIFTY 50 equals exactly ₹25 or ₹50 P&amp;L per lot.
                    </p>
                  </div>
                  <div className="p-3.5 bg-white rounded-xl border border-border space-y-1">
                    <div className="font-bold text-[#0F172A] flex items-center justify-between">
                      <span>Options (Nonlinear)</span>
                      <span className="text-[#0F172A] font-mono">0 &lt; Δ &lt; 1</span>
                    </div>
                    <p className="text-[11px] text-[#64748B]">
                      P&amp;L sensitivity depends on Strike Moneyness, Volatility (IV), and Time to Expiry (Theta).
                    </p>
                  </div>
                </div>
              )}

              {current.id === "open-interest" && (
                <div className="w-full space-y-4">
                  <div className="flex items-center justify-around p-4 bg-white rounded-xl border border-border">
                    <div className="text-center">
                      <div className="text-lg font-bold font-mono text-[#0F172A]">VOLUME</div>
                      <div className="text-[10px] text-[#94A3B8]">Day Trades Count</div>
                    </div>
                    <div className="h-8 w-px bg-border" />
                    <div className="text-center">
                      <div className="text-lg font-bold font-mono text-[#00C853]">OPEN INT</div>
                      <div className="text-[10px] text-[#94A3B8]">Overnight Stakes</div>
                    </div>
                  </div>
                  <p className="text-xs text-[#475569]">
                    In our dataset, average daily futures contracts traded is ~173.8K, while open interest averages 1.4M+ units.
                  </p>
                </div>
              )}

              {current.id === "pcr-sentiment" && (
                <div className="w-full space-y-4">
                  <div className="p-4 bg-white rounded-xl border border-border text-center space-y-2">
                    <div className="text-3xl font-extrabold font-mono text-[#00C853]">1.0423</div>
                    <div className="text-xs font-semibold text-[#0F172A]">Dataset Average PCR (OI)</div>
                    <div className="w-full bg-[#E5E7EB] h-2 rounded-full overflow-hidden">
                      <div className="bg-[#00E676] h-full" style={{ width: "62%" }} />
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-[#94A3B8]">
                      <span>0.6 (Oversold)</span>
                      <span>1.0 (Neutral)</span>
                      <span>1.5 (Overbought)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
