// tailwind.config.ts

import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // DEĞİŞİKLİK: Projemizin renk paletini buraya ekliyoruz.
      colors: {
        primary: {
          DEFAULT: '#2196F3', // Ana Mavi Renk
          // hover, focus gibi durumlar için daha koyu bir ton ekleyebiliriz
          // 'dark': '#1976D2', 
        },
        secondary: {
          DEFAULT: '#FF6E40', // Ana Turuncu Renk
        },
        accent: {
          DEFAULT: '#4CAF50', // Ana Yeşil Renk
        },
        // Arka plan için Tailwind'in kendi gri tonlarını (bg-white, bg-gray-50, vb.)
        // kullanmaya devam edeceğiz. Bu bize esneklik sağlar.
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};
export default config;