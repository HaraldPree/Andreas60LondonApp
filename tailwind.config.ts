import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#003366",
          50: "#E6EEF5",
          100: "#CCDCEC",
          200: "#99B9D9",
          300: "#6695C5",
          400: "#3372B2",
          500: "#003366",
          600: "#002952",
          700: "#001F3D",
          800: "#001429",
          900: "#000A14",
        },
        gold: {
          DEFAULT: "#E5A00D",
          50: "#FBF1D5",
          100: "#F9E8B6",
          200: "#F4D278",
          300: "#EFBC3A",
          400: "#E5A00D",
          500: "#B7800A",
          600: "#896008",
          700: "#5B4005",
          800: "#2D2003",
        },
        cream: {
          DEFAULT: "#F8F6F1",
          50: "#FDFCFA",
          100: "#F8F6F1",
          200: "#EFEADD",
          300: "#E6DEC9",
        },
        ink: {
          dark: "#1A1A2E",
          mid: "#4A4A5A",
          light: "#7A7A8A",
        },
        success: "#2D8F5E",
        warning: "#D44638",
        info: "#2980B9",
      },
      fontFamily: {
        display: ['var(--font-playfair)', 'Georgia', 'serif'],
        body: ['var(--font-dmsans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'ui-monospace', 'monospace'],
      },
      maxWidth: {
        app: "480px",
      },
      boxShadow: {
        card: "0 2px 8px rgba(0, 51, 102, 0.06), 0 1px 2px rgba(0, 51, 102, 0.04)",
        elevated: "0 4px 16px rgba(0, 51, 102, 0.10), 0 2px 4px rgba(0, 51, 102, 0.06)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        heartbeat: "heartbeat 1.4s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        heartbeat: {
          "0%, 60%, 100%": { transform: "scale(1)" },
          "20%": { transform: "scale(1.28)" },
          "40%": { transform: "scale(1.1)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
