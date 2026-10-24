/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fef7ee',
          100: '#fdedd6',
          200: '#fbd7ac',
          300: '#f7bb77',
          400: '#f29540',
          500: '#ee771b',
          600: '#df5e12',
          700: '#b94611',
          800: '#933815',
          900: '#773015',
          950: '#401608',
        }
      }
    },
  },
  plugins: [],
}
