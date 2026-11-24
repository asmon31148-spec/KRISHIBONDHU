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
        pine: {
          50: "#F2F7F4",
          100: "#EAF2EC",
          700: "#2A5E44",
          800: "#1E4733",
          900: "#143224",
          950: "#0E1A14",
        },
        paper: {
          50: "#F9F7F2",
          100: "#F3EFE6",
          200: "#E8E2D5",
          300: "#D6CDBC",
        },
        ochre: {
          50: "#FDF5EC",
          100: "#FBE7D2",
          500: "#D9822B",
          600: "#BF6D1C",
          700: "#A95E13",
        },
        loam: {
          100: "#F6F3EE",
          800: "#423425",
          900: "#2D2319",
        },
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
