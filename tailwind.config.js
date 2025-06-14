/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary:   { DEFAULT: '#2196F3', dark: '#1976D2' },
        secondary: { DEFAULT: '#FF6E40', dark: '#E45B2D' },
        accent:    { DEFAULT: '#4CAF50' },
      },
      fontFamily: {
        heading: ['Poppins', 'ui-sans-serif', 'system-ui'],
        body:    ['Poppins', 'ui-sans-serif', 'system-ui'],
      },
    },
  },
  plugins: [],
};
