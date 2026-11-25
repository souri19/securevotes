/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        obsidian: '#0B1120',
        graphite: '#141D30',
        ivory: '#F7F6F2',
        champagne: '#E5A93C',
        tealcivic: '#0D9488',
        sand: '#DDDAD0',
        coral: '#E05A47',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
