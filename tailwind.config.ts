import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        paper: "#EAEEE9",
        paperDark: "#DEE3D9",
        ink: "#1F3330",
        inkLight: "#3C5450",
        brass: "#B8863B",
        brassLight: "#D6AC63",
        clay: "#A6503F",
        sage: "#7C9484",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        body: ["var(--font-plex-sans)", "sans-serif"],
        mono: ["var(--font-plex-mono)", "monospace"],
      },
      boxShadow: {
        ledger: "0 1px 0 rgba(31,51,48,0.08), 0 12px 30px -12px rgba(31,51,48,0.25)",
      },
      borderRadius: {
        stamp: "3px",
      },
    },
  },
  plugins: [],
};
export default config;
