/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  presets: [require("nativewind/preset")],
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        trip: {
          blue: "#287dfa",
          bg: "#f5f7fa",
          dark: "#333333",
          gray: "#999999",
        },
        luxe: {
          ink: "#000666",
          navy: "#1a237e",
          surface: "#f8f9fa",
          gold: "#fed65b",
        },
      },
    },
  },
  plugins: [],
};
