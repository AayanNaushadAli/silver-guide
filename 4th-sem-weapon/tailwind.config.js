/** @type {import('tailwindcss').Config} */
module.exports = {
  // This tells Tailwind to look inside App.tsx and your entire src folder
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        "primary": "#6B8E23",
        "background-light": "#FDFCF5",
        "background-dark": "#1A1C14",
      },
      fontFamily: {
        "display": ["Space Grotesk", "sans-serif"],
        "body": ["Satoshi", "sans-serif"]
      },
    },
  },
  plugins: [],
}