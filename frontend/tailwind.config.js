/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bigbull-blue': '#003B73',
        'bigbull-gold': '#FFD700',
        'bigbull-dark': '#1A2B3C',
        'bigbull-light': '#F7F9FC',
        'bigbull-green': '#00A389',
        'bigbull-red': '#E63946',
        'bigbull-accent': '#F7931A',
      },
    },
  },
  plugins: [],
} 