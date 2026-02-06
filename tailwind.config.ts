import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        primary: "#B9FF66",
        secondary: "#191A23",
        accent: "#F3F3F3",

        brand: {
          25: "#f2f7ff",
          50: "#ecf3ff",
          100: "#dde9ff",
          200: "#c2d6ff",
          300: "#9cb9ff",
          400: "#7592ff",
          500: "#465fff",
          600: "#3641f5",
          700: "#2a31d8",
          800: "#252dae",
          900: "#262e89",
          950: "#161950",
        },

        gray: {
          25: "#fcfcfd",
          50: "#f9fafb",
          100: "#f2f4f7",
          200: "#e4e7ec",
          300: "#d0d5dd",
          400: "#98a2b3",
          500: "#667085",
          600: "#475467",
          700: "#344054",
          800: "#1d2939",
          900: "#101828",
          950: "#0c111d",
        },

        success: { 500: "#12b76a" },
        error: { 500: "#f04438" },
        warning: { 500: "#f79009" },
      },

      fontSize: {
        h1: "60px font-medium",
        h2: "40px",
        h3: "30px",
        h4: "20px",
        p: "18px",
        h1Mobile: "43px",
        h2Mobile: "36px",
        h3Mobile: "26px",
        h4Mobile: "18px",
        pMobile: "16px",
      },

      screens: {
        "2xsm": "375px",
        "xsm": "425px",
        "3xl": "2000px",
      },

      boxShadow: {
        "theme-sm": "0 1px 3px rgba(16,24,40,.1)",
        "theme-md": "0 4px 8px rgba(16,24,40,.1)",
        "theme-lg": "0 12px 16px rgba(16,24,40,.08)",
      },

      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },

      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
