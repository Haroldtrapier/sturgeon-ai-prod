/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        sand: {
          50: '#faf9f6',
          100: '#f5f3ed',
          200: '#e8e4d9',
          300: '#d6d0c1',
          400: '#b8b1a0',
          500: '#9a9282',
          600: '#7d7568',
          700: '#625c52',
          800: '#4a453e',
          900: '#332f2a',
          950: '#1f1c19',
        },
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float-delayed 5s ease-in-out 1s infinite',
      },
    },
  },
  plugins: [],
}
