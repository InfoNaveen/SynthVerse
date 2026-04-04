import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0f",
        foreground: "#e2e8f0",
        card: "#111827",
        muted: "#1e293b",
        "muted-foreground": "#64748b",
        border: "#1e293b",
        primary: "#00ff88",
        secondary: "#0088ff",
        destructive: "#ff2244",
        warning: "#ffaa00",
      },
      fontFamily: {
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      keyframes: {
        "pulse-green": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(0, 255, 136, 0.4)" },
          "50%": { boxShadow: "0 0 0 8px rgba(0, 255, 136, 0)" },
        },
        "pulse-red": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(255, 34, 68, 0.4)" },
          "50%": { boxShadow: "0 0 0 8px rgba(255, 34, 68, 0)" },
        },
        flicker: {
          "0%, 100%": { opacity: "1" },
          "33%": { opacity: "0.8" },
          "66%": { opacity: "0.6" },
          "77%": { opacity: "1" },
          "90%": { opacity: "0.3" },
        },
        "scan-line": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        "pulse-fast": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.3" },
        },
        ticker: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "glitch-1": {
          "0%, 100%": { clipPath: "inset(0 0 0 0)", transform: "translate(0)" },
          "20%": { clipPath: "inset(20% 0 60% 0)", transform: "translate(-2px, 2px)" },
          "40%": { clipPath: "inset(40% 0 20% 0)", transform: "translate(2px, -2px)" },
          "60%": { clipPath: "inset(60% 0 0 0)", transform: "translate(-1px, 1px)" },
          "80%": { clipPath: "inset(0 0 80% 0)", transform: "translate(1px, -1px)" },
        },
        "glitch-2": {
          "0%, 100%": { clipPath: "inset(0 0 0 0)", transform: "translate(0)" },
          "20%": { clipPath: "inset(60% 0 20% 0)", transform: "translate(2px, -2px)" },
          "40%": { clipPath: "inset(0 0 60% 0)", transform: "translate(-2px, 2px)" },
          "60%": { clipPath: "inset(20% 0 40% 0)", transform: "translate(1px, -1px)" },
          "80%": { clipPath: "inset(80% 0 0 0)", transform: "translate(-1px, 1px)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "type-cursor": {
          "0%, 100%": { borderColor: "#00ff88" },
          "50%": { borderColor: "transparent" },
        },
      },
      animation: {
        "pulse-green": "pulse-green 2s ease-in-out infinite",
        "pulse-red": "pulse-red 2s ease-in-out infinite",
        flicker: "flicker 3s linear infinite",
        "scan-line": "scan-line 3s linear infinite",
        "pulse-fast": "pulse-fast 1s ease-in-out infinite",
        ticker: "ticker 30s linear infinite",
        "glitch-1": "glitch-1 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite",
        "glitch-2": "glitch-2 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite reverse",
        "fade-in-up": "fade-in-up 0.6s ease-out forwards",
        "type-cursor": "type-cursor 1s step-end infinite",
      },
    },
  },
  plugins: [],
};

export default config;
