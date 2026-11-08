import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#07111F",
        navy: "#0B1729",
        panel: "#101F35",
        cyan: "var(--cyan)",
        blue: "var(--blue)",
        violet: "var(--violet)",
        good: "var(--good)",
        warn: "var(--warn)",
        bad: "var(--bad)",
        body: "var(--text)",
        muted: "var(--muted)",
      },
      fontFamily: {
        sans: ["Inter Variable", "Inter", "system-ui", "sans-serif"],
        display: ["Manrope Variable", "Manrope", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      boxShadow: {
        glass: "0 24px 80px -28px rgba(0, 0, 0, 0.65)",
        clay: "0 12px 28px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,.16)",
        glow: "0 0 32px -8px var(--cyan)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      keyframes: {
        drift: {
          "0%, 100%": { transform: "translate3d(0,0,0)" },
          "50%": { transform: "translate3d(0,-12px,0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "0.45" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        drift: "drift 7s ease-in-out infinite",
        shimmer: "shimmer 2.2s linear infinite",
        "pulse-soft": "pulseSoft 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
