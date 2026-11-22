import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        cream: {
          50: "#FAF9F5",
          100: "#F4F2E9",
          200: "#E8E5D8",
          300: "#D6D1BF",
        },
        brand: {
          dark: "#081C15",
          forest: "#1B4332",
          leaf: "#2D6A4F",
          emerald: "#40916C",
          mint: "#52B788",
          light: "#D8F3DC",
          harvest: "#D97706",
          harvestLight: "#FEF3C7",
          harvestDark: "#92400E",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-inter)",
          "Noto Sans Bengali",
          "Noto Sans Devanagari",
          "Hind Siliguri",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
        bengali: ["'Noto Sans Bengali'", "'Hind Siliguri'", "sans-serif"],
        hindi: ["'Noto Sans Devanagari'", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
