import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Samma guld/espresso-palett som den statiska showroom-sidan
        accent: {
          DEFAULT: "#3f3530",
          light: "#c9ab6e",
          dark: "#342c28",
        },
        warm: {
          50: "#faf6ee",
          100: "#f3ead2",
          200: "#e4d4a8",
          300: "#c9ab6e",
          400: "#b8964f",
          500: "#9a7a3d",
          600: "#7a5f2e",
        },
        earth: {
          DEFAULT: "#8a7348",
          light: "#c9ab6e",
          dark: "#5c4a32",
        },
        panel: {
          DEFAULT: "#3f3530",
          deep: "#342c28",
        },
        ink: "#3a3226",
        "ink-muted": "#6b5c45",
      },
      boxShadow: {
        soft: "0 4px 16px rgba(42, 32, 24, 0.22)",
        card: "0 4px 20px rgba(90, 70, 35, 0.1)",
      },
    },
  },
  plugins: [],
};

export default config;
