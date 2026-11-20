"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import SplitFlapText from "../SplitFlapText";
import LetterGlitch from "../LetterGlitch";
import "./IntroScreen.css";

interface IntensityState {
  glitchAmount: number;
  baseOpacity: number;
  flow: number;
}

const STAGE_CONFIGS: Record<number, { label: string; intensity: IntensityState }> = {
  0: {
    // FUTURES — 100% full intensity
    label: "STAGE 01/03 // NIFTY INDEX FUTURES",
    intensity: { glitchAmount: 0.65, baseOpacity: 0.20, flow: 0.6 },
  },
  1: {
    // AND — 65% intensity
    label: "STAGE 02/03 // CROSS-DERIVATIVE CORRELATION",
    intensity: { glitchAmount: 0.38, baseOpacity: 0.13, flow: 0.4 },
  },
  2: {
    // OPTIONS — 25% intensity (subtle focus on OPTIONS)
    label: "STAGE 03/03 // VOLATILITY SURFACE & OPTIONS CHAIN",
    intensity: { glitchAmount: 0.12, baseOpacity: 0.05, flow: 0.2 },
  },
};

export default function IntroScreen() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [stageLabel, setStageLabel] = useState(STAGE_CONFIGS[0].label);
  const [intensity, setIntensity] = useState<IntensityState>(STAGE_CONFIGS[0].intensity);
  const [progress, setProgress] = useState(8);
  const [responsive, setResponsive] = useState({
    fontSize: 52,
    gap: 6,
    tileRadius: 8,
  });

  const targetIntensityRef = useRef<IntensityState>(STAGE_CONFIGS[0].intensity);
  const lerpFrameRef = useRef<number | null>(null);

  // Responsive sizing for mobile, tablet, and desktop
  const updateResponsiveSize = useCallback(() => {
    if (typeof window === "undefined") return;
    const width = window.innerWidth;
    if (width < 440) {
      setResponsive({ fontSize: 24, gap: 3, tileRadius: 4 });
    } else if (width < 640) {
      setResponsive({ fontSize: 32, gap: 4, tileRadius: 6 });
    } else if (width < 860) {
      setResponsive({ fontSize: 42, gap: 5, tileRadius: 7 });
    } else {
      setResponsive({ fontSize: 52, gap: 6, tileRadius: 8 });
    }
  }, []);

  // Smooth lerp interpolation for LetterGlitch intensity transitions
  useEffect(() => {
    if (!visible) return;

    const lerp = (start: number, end: number, factor: number) =>
      start + (end - start) * factor;

    const animateIntensity = () => {
      setIntensity((prev) => {
        const target = targetIntensityRef.current;
        const nextGlitch = lerp(prev.glitchAmount, target.glitchAmount, 0.08);
        const nextOpacity = lerp(prev.baseOpacity, target.baseOpacity, 0.08);
        const nextFlow = lerp(prev.flow, target.flow, 0.08);

        return {
          glitchAmount: Math.round(nextGlitch * 1000) / 1000,
          baseOpacity: Math.round(nextOpacity * 1000) / 1000,
          flow: Math.round(nextFlow * 1000) / 1000,
        };
      });

      lerpFrameRef.current = requestAnimationFrame(animateIntensity);
    };

    lerpFrameRef.current = requestAnimationFrame(animateIntensity);

    return () => {
      if (lerpFrameRef.current) cancelAnimationFrame(lerpFrameRef.current);
    };
  }, [visible]);

  // Session check & initialization
  useEffect(() => {
    setMounted(true);
    updateResponsiveSize();
    window.addEventListener("resize", updateResponsiveSize);

    const hasSeenIntro = sessionStorage.getItem("fno_intro_seen");
    if (!hasSeenIntro) {
      setVisible(true);
    }

    const handleReplay = () => {
      sessionStorage.removeItem("fno_intro_seen");
      setFadingOut(false);
      setCurrentWordIndex(0);
      setStageLabel(STAGE_CONFIGS[0].label);
      targetIntensityRef.current = STAGE_CONFIGS[0].intensity;
      setIntensity(STAGE_CONFIGS[0].intensity);
      setProgress(10);
      setVisible(true);
    };

    window.addEventListener("fno:replay-intro", handleReplay);

    return () => {
      window.removeEventListener("resize", updateResponsiveSize);
      window.removeEventListener("fno:replay-intro", handleReplay);
    };
  }, [updateResponsiveSize]);

  const completeIntro = useCallback(() => {
    setProgress(100);
    setFadingOut(true);
    try {
      sessionStorage.setItem("fno_intro_seen", "true");
    } catch {
      // Ignore storage errors in private browsing
    }
    window.setTimeout(() => {
      setVisible(false);
    }, 1050); // match transition duration
  }, []);

  const handleSkip = useCallback(() => {
    completeIntro();
  }, [completeIntro]);

  // Progress bar updater
  useEffect(() => {
    if (!visible || fadingOut) return;
    const interval = window.setInterval(() => {
      setProgress((p) => (p < 95 ? p + 1.2 : p));
    }, 100);
    return () => clearInterval(interval);
  }, [visible, fadingOut]);

  // Keyboard shortcut (Escape to skip)
  useEffect(() => {
    if (!visible) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleSkip();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [visible, handleSkip]);

  const handleWordChange = (index: number) => {
    setCurrentWordIndex(index);
    if (STAGE_CONFIGS[index]) {
      setStageLabel(STAGE_CONFIGS[index].label);
      targetIntensityRef.current = STAGE_CONFIGS[index].intensity;
    }
    // Update progress markers
    if (index === 0) setProgress(25);
    if (index === 1) setProgress(60);
    if (index === 2) setProgress(88);
  };

  if (!mounted || !visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Futures & Options Application Intro"
      className={`fixed inset-0 z-[100] flex flex-col justify-between overflow-hidden select-none transition-opacity duration-1000 ease-out ${
        fadingOut ? "opacity-0 pointer-events-none" : "opacity-100"
      } intro-screen-container`}
    >
      {/* Background Layer: LetterGlitch */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{ width: "100%", height: "100%" }}
      >
        <LetterGlitch
          glitchColors={["#ffffff", "#61dca3"]}
          glitchAmount={intensity.glitchAmount}
          baseOpacity={intensity.baseOpacity}
          speed={1}
          flow={intensity.flow}
          clickEffect="tear"
        />
      </div>

      {/* Subtle radial vignette & scanline texture */}
      <div className="absolute inset-0 z-[1] pointer-events-none bg-[radial-gradient(ellipse_at_center,_rgba(8,13,22,0.35)_0%,_rgba(8,13,22,0.85)_100%)]" />
      <div className="absolute inset-0 z-[2] pointer-events-none opacity-20 intro-scanline" />

      {/* Top Terminal Status Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b intro-terminal-border text-[11px] sm:text-xs tracking-wider">
        <div className="flex items-center gap-3">
          <span className="intro-pulse-dot" />
          <span className="font-semibold text-[#f8fafc]">
            NSE:NIFTY50 <span className="intro-accent-green">QUANTITATIVE SUITE</span>
          </span>
          <span className="hidden md:inline-block text-[#94a3b8] border-l border-white/10 pl-3">
            PROTOCOL v2.4 · LOW LATENCY
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="hidden sm:inline-block text-[#94a3b8]">
            {stageLabel}
          </span>
          <button
            onClick={handleSkip}
            className="flex items-center gap-1.5 px-3 py-1 rounded border border-white/10 hover:border-white/30 text-[#94a3b8] hover:text-[#f8fafc] bg-white/[0.03] transition-colors text-[10px] sm:text-xs"
          >
            <span>SKIP</span>
            <kbd className="hidden sm:inline-block bg-white/10 px-1 rounded text-[9px]">ESC</kbd>
          </button>
        </div>
      </header>

      {/* Center Cinematic Area: SplitFlapText & Quantitative Metadata */}
      <main className="relative z-10 flex flex-col items-center justify-center px-4 my-auto">
        {/* Subtle Stage Tracker Chip */}
        <div className="mb-6 flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-black/40 backdrop-blur text-[11px] text-[#94a3b8] tracking-widest">
          <span className="w-1.5 h-1.5 rounded-full bg-[#61dca3]" />
          <span>{stageLabel}</span>
        </div>

        {/* The Mechanical SplitFlapText Display */}
        <div className="flex items-center justify-center max-w-full overflow-x-hidden p-2">
          <SplitFlapText
            words={["FUTURES", "AND", "OPTIONS"]}
            flipDuration={0.12}
            stagger={0.06}
            cycleDelay={1800}
            charset="alphanumeric"
            flipsPerChar={8}
            order="left"
            align="center"
            tileStyle="board"
            tileColor="#111827"
            textColor="#f8fafc"
            glare={0}
            depth={0.5}
            tileRadius={responsive.tileRadius}
            gap={responsive.gap}
            fontSize={responsive.fontSize}
            loop={false}
            padTo={12}
            intro
            onWordChange={handleWordChange}
            onComplete={completeIntro}
          />
        </div>

        {/* Subtitle / Quantitative Baseline */}
        <div className="mt-8 text-center space-y-1">
          <p className="text-xs sm:text-sm font-medium tracking-[0.2em] text-[#f8fafc]">
            ANALYTICS & MACHINE LEARNING TERMINAL
          </p>
          <p className="text-[11px] sm:text-xs text-[#94a3b8]">
            Study Period: Jan 2021 — Sep 2026 · 1,421 Daily Sessions
          </p>
        </div>
      </main>

      {/* Bottom Terminal Footer & Initialization Bar */}
      <footer className="relative z-10 px-6 py-4 border-t intro-terminal-border text-[11px] sm:text-xs text-[#94a3b8]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-3">
            <span className="text-[#61dca3]">DATABASE READY</span>
            <span>2.56M CONTRACT RECORDS</span>
            <span className="hidden md:inline">· FASTAPI ML PIPELINE</span>
          </div>
          <div className="text-[10px] sm:text-xs text-[#94a3b8]">
            WORKSPACE INITIALIZATION: {Math.round(progress)}%
          </div>
        </div>

        {/* Progress Bar Line */}
        <div className="w-full h-[2px] bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full intro-progress-bar"
            style={{ width: `${progress}%` }}
          />
        </div>
      </footer>
    </div>
  );
}
