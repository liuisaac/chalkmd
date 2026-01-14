/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'topbar': "#f0f0f0",
        'midbar': "#f4f4f4",
        'offwhite': '#f8f8f8',
        'offpurple': '#8250ff'
      },
      fontFamily: {
        syne: ['Syne', 'sans-serif'],
        inconsolata: ['Inconsolata', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}