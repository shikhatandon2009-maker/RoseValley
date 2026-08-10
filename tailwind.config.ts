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
        palette: {
          snow: "#F7EEED",
          mistyRose: "#FAE6E7",
          mimiPink: "#F7D1D8",
          orchidPink: "#F4BBC9",
          amaranthPink: "#F6A6BB",
          deepRose: "#4A0D25",
          darkObsidian: "#1A0510",
        },
        luxury: {
          blush: "#FAE6E7",
          petal: "#F7D1D8",
          rose: "#F4BBC9",
          peony: "#F6A6BB",
          pink: "#F6A6BB",
          flamingo: "#E08A9A",
          fuchsia: "#4A0D25",
          raspberry: "#6B0F34",
          magenta: "#3D081E",
          mulberry: "#1A0510",
        },
      },
      fontFamily: {
        serif: ["var(--font-cormorant)", "Cormorant Garamond", "Playfair Display", "serif"],
        sans: ["var(--font-jakarta)", "Plus Jakarta Sans", "Inter", "sans-serif"],
      },
      backgroundImage: {
        "gradient-palette": "linear-gradient(135deg, #F7EEED 0%, #FAE6E7 40%, #F7D1D8 100%)",
        "gradient-pink-header": "linear-gradient(90deg, #F6A6BB 0%, #F4BBC9 50%, #F6A6BB 100%)",
        "gradient-pink-cart": "linear-gradient(135deg, #F6A6BB 0%, #F4BBC9 100%)",
        "gradient-deep-rose": "linear-gradient(135deg, #4A0D25 0%, #6B0F34 100%)",
      },
    },
  },
  plugins: [],
};
export default config;
