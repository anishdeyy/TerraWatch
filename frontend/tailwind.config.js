/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        earth: {
          50: '#f2f7f4',
          100: '#e1ede6',
          200: '#c5dcd0',
          300: '#9ec2b1',
          400: '#72a38e',
          500: '#528771',
          600: '#406c5a',
          700: '#2d6a4f',
          800: '#1b4332',
          900: '#081c15',
          950: '#040d0a',
        },
        forest: {
          DEFAULT: '#1b4332',
          light: '#2d6a4f',
          dark: '#081c15',
        },
        moss: '#52b788',
        mint: '#d8f3dc',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
