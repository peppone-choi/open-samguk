/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}", "./src/components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Game theme colors
        sammo: {
          base1: "#0f172a", // Deep Slate (Modernized from #141c65)
          base2: "#064e3b", // Deep Emerald (Modernized from #00582c)
          base3: "#451a03", // Deep Amber/Brown (Modernized from #704615)
          base4: "#4a044e", // Deep Fuchsia (Modernized from #70153b)
          nbase2: "#0f172a", // Matches base1
        },
        // Premium accents
        gold: {
          100: "#fbf6d8",
          200: "#f6e8a4",
          300: "#f0d667",
          400: "#ecc236",
          500: "#eab308", // Base Gold
          600: "#ca8a04",
          700: "#a16207",
          800: "#854d0e",
          900: "#713f12",
          glow: "#ffd700",
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
        "fade-in": "fadeIn 0.4s ease-out",
        "pulse-glow": "pulseGlow 3s ease-in-out infinite",
        "slide-in": "slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
        "border-beam": "border-beam calc(var(--duration)*1s) infinite linear",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", filter: "blur(4px)" },
          "100%": { opacity: "1", filter: "blur(0)" },
        },
        pulseGlow: {
          "0%, 100%": {
            boxShadow: "0 0 10px hsl(45 90% 60% / 0.1), 0 0 0 1px hsl(45 90% 60% / 0.1)",
          },
          "50%": {
            boxShadow: "0 0 25px hsl(45 90% 60% / 0.3), 0 0 0 1px hsl(45 90% 60% / 0.3)",
          },
        },
        slideIn: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
        shimmer: {
          from: { backgroundPosition: "0 0" },
          to: { backgroundPosition: "-200% 0" },
        },
        "border-beam": {
          "100%": { "offset-distance": "100%" },
        },
      },
      boxShadow: {
        glow: "0 0 20px -5px hsl(45 90% 60% / 0.3)",
        "glow-sm": "0 0 10px -2px hsl(45 90% 60% / 0.2)",
        "glow-lg": "0 0 30px -5px hsl(45 90% 60% / 0.4)",
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
        "inner-light": "inset 0 1px 0 0 rgba(255, 255, 255, 0.05)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "glass-gradient":
          "linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.00) 100%)",
        metallic: "linear-gradient(180deg, #1e293b 0%, #0f172a 100%)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
