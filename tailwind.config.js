/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.html", "./js/**/*.js"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "Noto Sans KR", "system-ui", "sans-serif"],
        passage: ["Inter", "Roboto", "Noto Sans KR", "system-ui", "sans-serif"],
      },
      colors: {
        brand: { 50: "#eef2ff", 100: "#e0e7ff", 500: "#6366f1", 600: "#4f46e5", 700: "#4338ca" },
      },
    },
  },
  plugins: [],
};
