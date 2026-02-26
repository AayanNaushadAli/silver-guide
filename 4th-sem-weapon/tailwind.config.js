/** @type {import('tailwindcss').Config} */
module.exports = {
  // This tells Tailwind to look inside App.tsx and your entire src folder
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#6B8E23",
        "primary-dark": "#4a6318",
        "background-light": "#FDFCF5",
        "background-dark": "#1c2111",
        "surface": "#F4F1EA",
        "surface-dark": "#2a3020",
        "text-main": "#2C3E50",
        "text-muted": "#95A5A6",
        "accent": "#E67E22",
        "gold": "#F1C40F",
      },
      fontFamily: {
        "display": ["Space Grotesk", "sans-serif"],
        "body": ["Satoshi", "sans-serif"],
        "mono": ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        "soft": "0 4px 20px -2px rgba(107, 142, 35, 0.15)",
        "inner-soft": "inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)",
      }
    },
  },
  plugins: [],
}