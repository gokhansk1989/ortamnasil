import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#FFFBF7",
        card: "#ffffff",
        surface: "#FFF7ED",
        surface2: "#F0FDFA",
        ink: "#1C1917",
        primary: { DEFAULT: "#F97316", dark: "#EA580C", light: "#FB923C" },
        teal: { DEFAULT: "#0D9488", dark: "#0F766E", light: "#2DD4BF" },
        body: "#44403C",
        muted: "#78716C",
        faint: "#A8A29E",
        faint2: "#D6D3D1",
        line: "#F5F0EB",
        inputline: "#E7E0DA",
        accent: "#FBBF24",
        accentMono: "#FCD34D",
        onDarkMuted: "#D6D3D1",
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
        hover: "0 10px 32px rgba(249,115,22,.12)",
        glow: "0 0 40px rgba(249,115,22,.18)",
        "glow-teal": "0 0 40px rgba(13,148,136,.18)",
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
