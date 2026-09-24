import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./context/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        void: "#08070a",
        ink: "#0f0d11",
        panel: "#151217",
        seam: "#2a2530",
        bone: "#efe9e1",
        smoke: "#a9a2ac",
        oxblood: "#6e0d25",
        oxblood2: "#9c1836",
        rust: "#3a1116",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      letterSpacing: {
        tightest: "-0.04em",
      },
      boxShadow: {
        stitch: "0 0 0 1px rgba(239,233,225,0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
