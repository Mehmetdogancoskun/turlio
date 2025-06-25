/** @type {import('next').NextConfig} */
const nextConfig = {
  /* ——————————————————————————————
     Uzaktan (Supabase) görseller
  —————————————————————————————— */
  images: {
    /* 1 ) Yeni <Next 13.1+ loader yolu */
    remotePatterns: [
      {
        protocol : 'https',
        // kendi Supabase projenizin ana host’u
        hostname : 'qiqcsmuybtuxngckkvwf.supabase.co',
        // storage kökündeki tüm klasör/objeler
        pathname : '/storage/v1/object/**',
      },
    ],
    /* 2 ) Geriye-dönük “domains” desteği */
    domains: ['qiqcsmuybtuxngckkvwf.supabase.co'],
  },

  /* ——————————————————————————————
     Google Maps API (ön-yüklemeli skript)
     – _layout.tsx içinde <script … async defer/> ekli olmalı
  —————————————————————————————— */
  experimental: {
    optimizeCss: true,
  },

  /* ——————————————————————————————
     Varsa mevcut redirect’ler
  —————————————————————————————— */
  async redirects() {
    return [
      {
        source      : '/products/tours',
        destination : '/products/category/tur',
        permanent   : true,
      },
      {
        source      : '/products/transfers',
        destination : '/products/category/transfer',
        permanent   : true,
      },
      {
        source      : '/products/visa',
        destination : '/products/category/vize',
        permanent   : true,
      },
    ];
  },
};

module.exports = nextConfig;
