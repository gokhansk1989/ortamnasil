import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#FFFAF7",
        card: "#ffffff",
        surface: "#FFF0F3",
        surface2: "#F8F0FF",
        ink: "#1A1A2E",
        primary: { DEFAULT: "#FF2D78", dark: "#E0255E", light: "#FF6BA1" },
        purple: { DEFAULT: "#7C3AED", dark: "#6D28D9", light: "#A78BFA" },
        body: "#3D3D56",
        muted: "#6B6B8A",
        faint: "#9090AC",
        faint2: "#B0B0C8",
        line: "#F0E8EE",
        inputline: "#E0D4DE",
        accent: "#FFD60A",
        accentMono: "#FFE066",
        onDarkMuted: "#B8A8C8",
        light: {
          green: "#2eb586",
          yellow: "#e8b93c",
          orange: "#eb8a4a",
          red: "#e05d4b",
          gray: "#9090AC",
        },
      },
      fontFamily: {
        sans: ["var(--font-grotesk)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: { card: "18px", pill: "999px" },
      boxShadow: {
        hover: "0 10px 32px rgba(255,45,120,.15)",
        glow: "0 0 40px rgba(255,45,120,.20)",
        "glow-purple": "0 0 40px rgba(124,58,237,.20)",
      },
      keyframes: {
        blink: { "0%,100%": { opacity: "1" }, "50%": { opacity: ".35" } },
        pop: {
          "0%": { transform: "scale(.6)", opacity: "0" },
          "70%": { transform: "scale(1.06)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        wiggle: {
          "0%,100%": { transform: "rotate(-2deg)" },
          "50%": { transform: "rotate(2deg)" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: {
        blink: "blink 2s infinite",
        pop: "pop .3s ease-out",
        float: "float 3s ease-in-out infinite",
        wiggle: "wiggle 2s ease-in-out infinite",
        slideUp: "slideUp .5s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
