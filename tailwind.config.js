// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  /* 1)  Utility’lerin taranacağı dosyalar
        Gerekirse kendi klasörlerinle genişletebilirsin                  */
  content: [
    './app/**/*.{ts,tsx,js,jsx}',
    './components/**/*.{ts,tsx,js,jsx}',
    './pages/**/*.{ts,tsx,js,jsx}',
    './layouts/**/*.{ts,tsx,js,jsx}',
  ],

  /* 2)  Tema özelleştirmeleri ------------------------------------------- */
  theme: {
    extend: {
      /* Renk paleti */
      colors: {
        primary: '#33A8FF',
      },

      /* ── Animasyon ───────────────────────────────────────────────────── */
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)'   },
        },
      },
      animation: {
        /* .animate-fadeIn → ‘fadeIn 0.4s ease-in-out both’ */
        fadeIn: 'fadeIn 0.4s ease-in-out both',
      },
    },
  },

  /* 3)  Resmî plugin + ihtiyaç duyarsan diğerleri ------------------------ */
  plugins: [require('@tailwindcss/typography')],
};
