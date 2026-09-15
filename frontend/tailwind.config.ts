import type { Config } from "tailwindcss";

// TideEye design tokens — see design-system/MASTER.md.
// Colors are wired to CSS variables defined in app/globals.css so we can add
// a dark theme later without touching components.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: "var(--card)",
        border: "var(--border)",
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          hover: "var(--primary-hover)",
          foreground: "var(--primary-foreground)",
        },
        secondary: "var(--secondary)",
        accent: "var(--accent)",
        ring: "var(--ring)",
        risk: {
          safe: "var(--risk-safe)",
          caution: "var(--risk-caution)",
          avoid: "var(--risk-avoid)",
          unknown: "var(--risk-unknown)",
        },
      },
      fontFamily: {
        heading: ["var(--font-heading)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        lg: "12px",
        md: "10px",
        sm: "8px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(15,23,42,0.04), 0 4px 12px rgba(15,23,42,0.06)",
        lift: "0 8px 24px rgba(15,23,42,0.10)",
      },
    },
  },
  plugins: [],
};

export default config;
