/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Semantic design system tokens
        background: {
          DEFAULT: "var(--bg-primary)",
          subtle: "var(--bg-subtle)",
          surface: "var(--bg-surface)",
          panel: "var(--bg-panel)",
        },
        border: {
          DEFAULT: "var(--border-subtle)",
          strong: "var(--border-strong)",
        },
        foreground: {
          DEFAULT: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
        },
        brand: {
          DEFAULT: "var(--brand-accent)",
          subtle: "var(--brand-subtle)",
        },
        market: {
          up: "var(--market-up)",
          "up-bg": "var(--market-up-bg)",
          down: "var(--market-down)",
          "down-bg": "var(--market-down-bg)",
          neutral: "var(--market-neutral)",
          "neutral-bg": "var(--market-neutral-bg)",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          '"Helvetica Neue"',
          "Arial",
          "sans-serif",
        ],
        mono: [
          '"SF Mono"',
          "Menlo",
          "Monaco",
          "Consolas",
          '"Liberation Mono"',
          "monospace",
        ],
      },
    },
  },
  plugins: [],
};
