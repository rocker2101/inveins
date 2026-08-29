import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#faf9f5",
        ink: "#141413",
        body: "#3d3d3a",
        "body-strong": "#252523",
        muted: "#6c6a64",
        "muted-soft": "#8e8b82",
        hairline: "#e6dfd8",
        "hairline-soft": "#ebe6df",
        primary: {
          DEFAULT: "#cc785c",
          active: "#a9583e",
          disabled: "#e6dfd8",
        },
        surface: {
          soft: "#f5f0e8",
          card: "#efe9de",
          "cream-strong": "#e8e0d2",
          dark: "#181715",
          "dark-elevated": "#252320",
          "dark-soft": "#1f1e1b",
        },
        accent: {
          teal: "#5db8a6",
          amber: "#e8a55a",
        },
      },
      fontFamily: {
        serif: ["Copernicus", "Playfair Display", "Tiempos Headline", "Cormorant Garamond", "serif"],
        sans: ["StyreneB", "Plus Jakarta Sans", "Inter", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      borderRadius: {
        xs: "4px",
        sm: "6px",
        md: "8px",
        lg: "12px",
        xl: "16px",
      },
      boxShadow: {
        claude: "0 1px 3px rgba(20, 20, 19, 0.06)",
        "claude-lg": "0 8px 30px rgba(20, 20, 19, 0.08)",
      },
    },
  },
  plugins: [],
};
export default config;

