/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}", "./src/components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Game theme colors
        sammo: {
          base1: "#141c65", // Primary blue
          base2: "#00582c", // Green
          base3: "#704615", // Brown
          base4: "#70153b", // Purple
          nbase2: "#0c1a41", // Navigation background
        },
        // Nation colors (for dynamic styling)
        nation: {
          "000000": "#000000",
          FF0000: "#ff0000",
          800000: "#800000",
          A0522D: "#a0522d",
          FF6347: "#ff6347",
          FFA500: "#ffa500",
          FFDAB9: "#ffdab9",
          FFD700: "#ffd700",
          FFFF00: "#ffff00",
          "7CFC00": "#7cfc00",
          "00FF00": "#00ff00",
          808000: "#808000",
          "008000": "#008000",
          "2E8B57": "#2e8b57",
          "008080": "#008080",
          "20B2AA": "#20b2aa",
          "6495ED": "#6495ed",
          "7FFFD4": "#7fffd4",
          AFEEEE: "#afeeee",
          "87CEEB": "#87ceeb",
          "00FFFF": "#00ffff",
          "00BFFF": "#00bfff",
          "0000FF": "#0000ff",
          "000080": "#000080",
          "483D8B": "#483d8b",
          "7B68EE": "#7b68ee",
          BA55D3: "#ba55d3",
          800080: "#800080",
          FF00FF: "#ff00ff",
          FFC0CB: "#ffc0cb",
          F5F5DC: "#f5f5dc",
          E0FFFF: "#e0ffff",
          FFFFFF: "#ffffff",
          A9A9A9: "#a9a9a9",
          330000: "#330000",
        },
        // shadcn/ui theme colors
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-out",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "slide-in": "slideIn 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 5px hsl(43 50% 50% / 0.3)" },
          "50%": { boxShadow: "0 0 20px hsl(43 50% 50% / 0.6)" },
        },
        slideIn: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      boxShadow: {
        glow: "0 0 20px hsl(43 50% 50% / 0.15)",
        "glow-sm": "0 0 10px hsl(43 50% 50% / 0.1)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
