"use client";

import React from "react";

interface IllustrationProps {
  className?: string;
  size?: number;
}

/**
 * Hero Rocket & Growth Trajectory Illustration
 * Inspired by fintech line-art with vivid green accents (#00E676),
 * Indian Rupee coin stacks, and financial candlestick trajectory.
 */
export function HeroRocketChartIllustration({ className = "", size = 480 }: IllustrationProps) {
  return (
    <div className={`relative inline-block select-none ${className}`}>
      <svg
        viewBox="0 0 500 450"
        width={size}
        height={(size * 450) / 500}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto drop-shadow-sm"
      >
        <defs>
          <linearGradient id="rocketGlow" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#00E676" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#00E676" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="chartTrail" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0F172A" />
            <stop offset="60%" stopColor="#00E676" />
            <stop offset="100%" stopColor="#00E676" />
          </linearGradient>
          <pattern id="diagonalHatch" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="8" stroke="#E2E8F0" strokeWidth="1.5" />
          </pattern>
        </defs>

        {/* Ambient Decorative Accents (+ and o) */}
        <g stroke="#94A3B8" strokeWidth="2" strokeLinecap="round">
          <line x1="45" y1="80" x2="45" y2="92" />
          <line x1="39" y1="86" x2="51" y2="86" />

          <line x1="440" y1="260" x2="440" y2="272" />
          <line x1="434" y1="266" x2="446" y2="266" />

          <line x1="180" y1="40" x2="180" y2="52" />
          <line x1="174" y1="46" x2="186" y2="46" />
        </g>
        <circle cx="95" cy="140" r="4.5" stroke="#00E676" strokeWidth="2.5" fill="none" />
        <circle cx="430" cy="110" r="5" stroke="#0F172A" strokeWidth="2.5" fill="none" />
        <circle cx="360" cy="380" r="3.5" stroke="#00E676" strokeWidth="2" fill="none" />

        {/* Outer Circular Boundary Aura */}
        <circle
          cx="260"
          cy="235"
          r="190"
          stroke="#E2E8F0"
          strokeWidth="1.5"
          strokeDasharray="6 6"
        />
        <circle
          cx="260"
          cy="235"
          r="170"
          stroke="#00E676"
          strokeWidth="1.5"
          strokeOpacity="0.4"
        />

        {/* Background Grid Bars (Bar chart growth base) */}
        <g stroke="#0F172A" strokeWidth="2.5" strokeLinejoin="round">
          {/* Bar 1 */}
          <rect x="70" y="330" width="34" height="65" rx="4" fill="#FFFFFF" />
          {/* Bar 2 */}
          <rect x="120" y="295" width="34" height="100" rx="4" fill="url(#diagonalHatch)" />
          {/* Bar 3 */}
          <rect x="170" y="255" width="34" height="140" rx="4" fill="#FFFFFF" />
          {/* Bar 4 */}
          <rect x="220" y="210" width="34" height="185" rx="4" fill="#F5F6F5" />
          {/* Bar 5 (Green accent bar) */}
          <rect x="270" y="160" width="34" height="235" rx="4" fill="#00E676" fillOpacity="0.15" />
          <line x1="270" y1="160" x2="304" y2="160" stroke="#00E676" strokeWidth="3" />
        </g>

        {/* Stacked Rupee Coins (Reference 1 & 3 inspired) */}
        <g stroke="#0F172A" strokeWidth="2.5" strokeLinejoin="round">
          {/* Coin Stack 1 */}
          <g transform="translate(105, 330)">
            <ellipse cx="22" cy="50" rx="22" ry="7" fill="#F5F6F5" />
            <ellipse cx="22" cy="42" rx="22" ry="7" fill="#F5F6F5" />
            <ellipse cx="22" cy="34" rx="22" ry="7" fill="#FFFFFF" />
            <ellipse cx="22" cy="26" rx="22" ry="7" fill="#FFFFFF" />
            <ellipse cx="22" cy="18" rx="22" ry="7" fill="#FFFFFF" />
            <text x="18" y="22" fontSize="11" fontWeight="bold" fill="#0F172A" fontFamily="monospace">₹</text>
          </g>

          {/* Coin Stack 2 (Taller with Green highlights) */}
          <g transform="translate(155, 305)">
            <ellipse cx="24" cy="70" rx="24" ry="7.5" fill="#E8F5E9" stroke="#00C853" strokeWidth="1.5" />
            <ellipse cx="24" cy="62" rx="24" ry="7.5" fill="#FFFFFF" />
            <ellipse cx="24" cy="54" rx="24" ry="7.5" fill="#FFFFFF" />
            <ellipse cx="24" cy="46" rx="24" ry="7.5" fill="#FFFFFF" />
            <ellipse cx="24" cy="38" rx="24" ry="7.5" fill="#FFFFFF" />
            <ellipse cx="24" cy="30" rx="24" ry="7.5" fill="#FFFFFF" />
            <ellipse cx="24" cy="22" rx="24" ry="7.5" fill="#FFFFFF" />
            <ellipse cx="24" cy="14" rx="24" ry="7.5" fill="#00E676" fillOpacity="0.2" />
            <text x="20" y="18" fontSize="13" fontWeight="bold" fill="#0F172A" fontFamily="monospace">₹</text>
          </g>
        </g>

        {/* Growth Curve Trajectory line launching rocket into stratosphere */}
        <path
          d="M 60 380 Q 140 375, 200 310 T 320 180"
          stroke="url(#chartTrail)"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />

        {/* Rocket Thruster Smoke & Energy Trail */}
        <path
          d="M 285 220 Q 300 240, 275 260 Q 295 245, 310 205"
          fill="#00E676"
          fillOpacity="0.3"
        />
        <path
          d="M 298 208 L 275 235 L 290 230 L 280 248 L 310 216 Z"
          fill="#00E676"
          stroke="#0F172A"
          strokeWidth="2"
        />

        {/* THE ROCKET (Black outline, white fill, green accents) */}
        <g transform="translate(290, 80) rotate(38)">
          {/* Rocket Body */}
          <path
            d="M 45 0 C 70 30, 75 90, 72 130 L 18 130 C 15 90, 20 30, 45 0 Z"
            fill="#FFFFFF"
            stroke="#0F172A"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          {/* Rocket Nose Cone Accent */}
          <path
            d="M 45 0 C 58 18, 63 38, 65 52 L 25 52 C 27 38, 32 18, 45 0 Z"
            fill="#0F172A"
          />
          {/* Porthole Window */}
          <circle cx="45" cy="78" r="14" fill="#FFFFFF" stroke="#0F172A" strokeWidth="3" />
          <circle cx="45" cy="78" r="9" fill="#00E676" stroke="#0F172A" strokeWidth="2" />
          <circle cx="42" cy="75" r="3" fill="#FFFFFF" />

          {/* Left Fin */}
          <path
            d="M 20 95 L 0 135 L 18 130 Z"
            fill="#FFFFFF"
            stroke="#0F172A"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          {/* Right Fin */}
          <path
            d="M 70 95 L 90 135 L 72 130 Z"
            fill="#FFFFFF"
            stroke="#0F172A"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          {/* Bottom Engine Exhaust Nozzle */}
          <rect x="32" y="130" width="26" height="8" rx="2" fill="#0F172A" />
        </g>

        {/* Floating Fintech Indicator Badges */}
        {/* NIFTY 50 ATH Callout */}
        <g transform="translate(340, 60)" className="animate-bounce" style={{ animationDuration: "3s" }}>
          <rect x="0" y="0" width="110" height="34" rx="8" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2" />
          <circle cx="16" cy="17" r="4.5" fill="#00E676" />
          <text x="27" y="16" fontSize="10" fontWeight="bold" fill="#0F172A" fontFamily="sans-serif">NIFTY 50</text>
          <text x="27" y="27" fontSize="9" fill="#00C853" fontWeight="bold" fontFamily="monospace">₹26,215 ▲</text>
        </g>

        {/* Open Interest Chip */}
        <g transform="translate(40, 240)">
          <rect x="0" y="0" width="90" height="30" rx="6" fill="#0F172A" />
          <text x="12" y="19" fontSize="9" fontWeight="bold" fill="#00E676" fontFamily="monospace">
            OI: 1.42M
          </text>
        </g>

        {/* PCR Ratio Badge */}
        <g transform="translate(330, 320)">
          <rect x="0" y="0" width="85" height="28" rx="6" fill="#F5F6F5" stroke="#CBD5E1" strokeWidth="1.5" />
          <text x="10" y="18" fontSize="10" fontWeight="bold" fill="#0F172A" fontFamily="sans-serif">
            PCR <tspan fill="#00C853">1.04</tspan>
          </text>
        </g>
      </svg>
    </div>
  );
}

/**
 * Futures Contract Visual Illustration
 */
export function FuturesContractIllustration({ className = "", size = 280 }: IllustrationProps) {
  return (
    <svg viewBox="0 0 300 220" width={size} height={(size * 220) / 300} fill="none" className={className}>
      <rect x="10" y="10" width="280" height="200" rx="16" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="2" />
      <rect x="10" y="10" width="280" height="42" rx="16" fill="#F5F6F5" />
      <circle cx="32" cy="31" r="5" fill="#0F172A" />
      <circle cx="48" cy="31" r="5" fill="#94A3B8" />
      <circle cx="64" cy="31" r="5" fill="#00E676" />
      <text x="84" y="35" fontSize="11" fontWeight="bold" fill="#0F172A" fontFamily="sans-serif">
        NIFTY INDEX FUTURES
      </text>

      {/* Candlesticks & Linear Trend */}
      <g stroke="#0F172A" strokeWidth="2">
        {/* Candlestick 1 */}
        <line x1="50" y1="90" x2="50" y2="160" stroke="#CBD5E1" />
        <rect x="42" y="105" width="16" height="38" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2" rx="2" />

        {/* Candlestick 2 */}
        <line x1="95" y1="80" x2="95" y2="150" stroke="#CBD5E1" />
        <rect x="87" y="95" width="16" height="35" fill="#00E676" stroke="#0F172A" strokeWidth="2" rx="2" />

        {/* Candlestick 3 */}
        <line x1="140" y1="70" x2="140" y2="145" stroke="#CBD5E1" />
        <rect x="132" y="80" width="16" height="40" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2" rx="2" />

        {/* Candlestick 4 */}
        <line x1="185" y1="60" x2="185" y2="135" stroke="#CBD5E1" />
        <rect x="177" y="70" width="16" height="42" fill="#00E676" stroke="#0F172A" strokeWidth="2" rx="2" />

        {/* Forward Arrow */}
        <path d="M 40 145 C 90 130, 160 110, 245 75" stroke="#00C853" strokeWidth="3" strokeLinecap="round" />
        <path d="M 235 75 L 245 75 L 245 85" stroke="#00C853" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      <g transform="translate(195, 145)">
        <rect x="0" y="0" width="85" height="46" rx="8" fill="#0F172A" />
        <text x="10" y="18" fontSize="9" fill="#94A3B8" fontFamily="sans-serif">SETTLEMENT</text>
        <text x="10" y="34" fontSize="11" fontWeight="bold" fill="#00E676" fontFamily="monospace">T+0 CASH</text>
      </g>
    </svg>
  );
}

/**
 * Options Dual Strike & Premium Illustration
 */
export function OptionsDualIllustration({ className = "", size = 280 }: IllustrationProps) {
  return (
    <svg viewBox="0 0 300 220" width={size} height={(size * 220) / 300} fill="none" className={className}>
      <rect x="10" y="10" width="280" height="200" rx="16" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="2" />

      {/* Axis line */}
      <line x1="40" y1="170" x2="260" y2="170" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
      <line x1="150" y1="40" x2="150" y2="180" stroke="#E2E8F0" strokeWidth="1.5" strokeDasharray="4 4" />
      <text x="135" y="195" fontSize="10" fill="#94A3B8" fontFamily="sans-serif">ATM STRIKE</text>

      {/* Call Option Curve (Green) */}
      <path
        d="M 40 160 L 150 160 L 250 60"
        stroke="#00C853"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Put Option Curve (Red) */}
      <path
        d="M 50 60 L 150 160 L 255 160"
        stroke="#E11D48"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="4 3"
      />

      {/* Call Badge */}
      <g transform="translate(190, 45)">
        <rect x="0" y="0" width="80" height="26" rx="6" fill="#E8F5E9" stroke="#00C853" strokeWidth="1.5" />
        <text x="10" y="17" fontSize="10" fontWeight="bold" fill="#00C853" fontFamily="sans-serif">CALL (CE) ▲</text>
      </g>

      {/* Put Badge */}
      <g transform="translate(30, 45)">
        <rect x="0" y="0" width="80" height="26" rx="6" fill="#FFE4E6" stroke="#E11D48" strokeWidth="1.5" />
        <text x="12" y="17" fontSize="10" fontWeight="bold" fill="#E11D48" fontFamily="sans-serif">PUT (PE) ▼</text>
      </g>
    </svg>
  );
}

/**
 * Market Analytics & Distribution Illustration
 */
export function MarketAnalyticsIllustration({ className = "", size = 280 }: IllustrationProps) {
  return (
    <svg viewBox="0 0 300 220" width={size} height={(size * 220) / 300} fill="none" className={className}>
      <rect x="10" y="10" width="280" height="200" rx="16" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="2" />

      {/* Bell curve distribution fill */}
      <path
        d="M 40 160 C 90 160, 110 150, 150 60 C 190 150, 210 160, 260 160 Z"
        fill="#00E676"
        fillOpacity="0.12"
      />
      <path
        d="M 40 160 C 90 160, 110 150, 150 60 C 190 150, 210 160, 260 160"
        stroke="#0F172A"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Mean center line */}
      <line x1="150" y1="50" x2="150" y2="170" stroke="#00C853" strokeWidth="2" strokeDasharray="3 3" />
      <circle cx="150" cy="60" r="5" fill="#00E676" stroke="#0F172A" strokeWidth="2" />

      {/* Standard Deviation Bands */}
      <line x1="110" y1="120" x2="110" y2="160" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="2 2" />
      <line x1="190" y1="120" x2="190" y2="160" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="2 2" />

      {/* Metric Callouts */}
      <g transform="translate(30, 40)">
        <rect x="0" y="0" width="75" height="24" rx="4" fill="#F5F6F5" stroke="#CBD5E1" />
        <text x="8" y="16" fontSize="9" fontWeight="bold" fill="#0F172A" fontFamily="monospace">σ = 1.042</text>
      </g>
      <g transform="translate(195, 40)">
        <rect x="0" y="0" width="80" height="24" rx="4" fill="#0F172A" />
        <text x="8" y="16" fontSize="9" fontWeight="bold" fill="#00E676" fontFamily="monospace">ρ = +0.871</text>
      </g>
    </svg>
  );
}

/**
 * Machine Learning Directional Tree Illustration
 */
export function MachineLearningIllustration({ className = "", size = 280 }: IllustrationProps) {
  return (
    <svg viewBox="0 0 300 220" width={size} height={(size * 220) / 300} fill="none" className={className}>
      <rect x="10" y="10" width="280" height="200" rx="16" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="2" />

      {/* Network Nodes */}
      <g stroke="#0F172A" strokeWidth="2">
        {/* Level 1: Root Node */}
        <line x1="150" y1="45" x2="90" y2="100" stroke="#CBD5E1" strokeWidth="2" />
        <line x1="150" y1="45" x2="210" y2="100" stroke="#CBD5E1" strokeWidth="2" />
        <circle cx="150" cy="45" r="16" fill="#0F172A" />
        <text x="142" y="49" fontSize="10" fontWeight="bold" fill="#00E676" fontFamily="monospace">X₁</text>

        {/* Level 2 Nodes */}
        <line x1="90" y1="100" x2="60" y2="155" stroke="#CBD5E1" strokeWidth="2" />
        <line x1="90" y1="100" x2="115" y2="155" stroke="#CBD5E1" strokeWidth="2" />
        <line x1="210" y1="100" x2="185" y2="155" stroke="#CBD5E1" strokeWidth="2" />
        <line x1="210" y1="100" x2="240" y2="155" stroke="#00C853" strokeWidth="2.5" />

        <circle cx="90" cy="100" r="13" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2" />
        <text x="83" y="104" fontSize="9" fontWeight="bold" fill="#0F172A" fontFamily="monospace">OI</text>

        <circle cx="210" cy="100" r="13" fill="#00E676" fillOpacity="0.2" stroke="#0F172A" strokeWidth="2" />
        <text x="200" y="104" fontSize="9" fontWeight="bold" fill="#0F172A" fontFamily="monospace">PCR</text>

        {/* Level 3 Leaf Nodes */}
        <circle cx="60" cy="155" r="10" fill="#FFE4E6" stroke="#E11D48" strokeWidth="1.5" />
        <text x="56" y="158" fontSize="8" fontWeight="bold" fill="#E11D48">▼</text>

        <circle cx="115" cy="155" r="10" fill="#F5F6F5" stroke="#94A3B8" strokeWidth="1.5" />
        <text x="111" y="158" fontSize="8" fontWeight="bold" fill="#64748B">—</text>

        <circle cx="185" cy="155" r="10" fill="#FFE4E6" stroke="#E11D48" strokeWidth="1.5" />
        <text x="181" y="158" fontSize="8" fontWeight="bold" fill="#E11D48">▼</text>

        <circle cx="240" cy="155" r="12" fill="#00E676" stroke="#0F172A" strokeWidth="2" />
        <text x="236" y="159" fontSize="10" fontWeight="bold" fill="#0F172A">▲</text>
      </g>

      <g transform="translate(60, 185)">
        <text x="0" y="12" fontSize="10" fill="#94A3B8" fontFamily="sans-serif">
          EXTRA TREES · 42 ENGINEERED FEATURES
        </text>
      </g>
    </svg>
  );
}
