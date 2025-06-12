/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary:   "#2196F3",
        secondary: "#FF6E40",
        accent:    "#4CAF50",
      },
      fontFamily: {
        heading: ["Poppins", "ui-sans-serif", "system-ui"],
        body:    ["Lato",    "ui-sans-serif", "system-ui"],
      },
    },
  },
  plugins: [],
};
