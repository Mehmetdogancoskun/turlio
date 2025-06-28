// next.config.js
/** @type {import('next').NextConfig} */

/* ───────── 1. Supabase ana makinesini ortam değişkeninden çek ───────── */
const SUPABASE_URL      = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''; // ör.: https://xxxx.supabase.co
const SUPABASE_HOSTNAME = SUPABASE_URL
  ? new URL(SUPABASE_URL).hostname
  : 'qiqcsmuybtuxngckkvwf.supabase.co';

/* ───────── 2. Next.js ana ayar bloğu ────────────────────────────────── */
const nextConfig = {
  /* Görsel optimizasyonu */
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: SUPABASE_HOSTNAME, pathname: '/storage/v1/object/public/**' },
      { protocol: 'https', hostname: SUPABASE_HOSTNAME, pathname: '/storage/v1/object/sign/**' },
      { protocol: 'http',  hostname: 'localhost', port: '54321', pathname: '/storage/v1/object/**' },
    ],
    minimumCacheTTL: 60,
    // dangerouslyAllowSVG: true,   // ihtiyaca göre aç
  },

  /* Performans / çıktı */
  output: 'standalone',
  compress: true,
  poweredByHeader: false,

  /* 🔐  ESLint – build’te hatalara takılma (kalıcı) */
  eslint: {
    ignoreDuringBuilds: true,
  },

  /* CSS kritik içerik (Critters) */
  experimental: {
    optimizeCss: true,
    // inlineCss: true, // ikisini aynı anda açma
  },

  /* Güvenlik başlıkları */
  async headers() {
    return [
      {
        source: '/_next/image',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, immutable' },
        ],
      },
      {
        source: '/:path*',
        headers: [
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-DNS-Prefetch-Control',    value: 'on' },
        ],
      },
    ];
  },

  /* Yönlendirmeler */
  async redirects() {
    return [
      { source: '/products/tours',     destination: '/products/category/tur',      permanent: true },
      { source: '/products/transfers', destination: '/products/category/transfer', permanent: true },
      { source: '/products/visa',      destination: '/products/category/vize',     permanent: true },
    ];
  },
};

module.exports = nextConfig;
