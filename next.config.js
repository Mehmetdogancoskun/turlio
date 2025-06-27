// next.config.js
/** @type {import('next').NextConfig} */

/* ─────────── 1. Supabase ana makinesini ortam değişkeninden çek  ────────────
   • Prod / Preview / Lokal emülatör (http://localhost:54321) hepsini tek
     yerden yönetiriz.
   • process.env değişkenleri bu dosyada *build time*’da okunabilir. */
const SUPABASE_URL      = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';  // ör.: https://qiqcsmuybtuxngckkvwf.supabase.co
const SUPABASE_HOSTNAME = SUPABASE_URL ? new URL(SUPABASE_URL).hostname
                                        : 'qiqcsmuybtuxngckkvwf.supabase.co';

/* ─────────── 2. Next.js ana ayar bloğu ───────────────────────────────────── */
const nextConfig = {
  /* Görsel optimizasyonu ---------------------------------------------------- */
  images: {
    /** 🔐 Katı izin listesi (Next 14+). “domains” artık önerilmiyor :contentReference[oaicite:0]{index=0} */
    remotePatterns: [
      /* Public bucket */
      { protocol: 'https', hostname: SUPABASE_HOSTNAME, pathname: '/storage/v1/object/public/**' },

      /* İmzalı (token’lı) URL’ler */
      { protocol: 'https', hostname: SUPABASE_HOSTNAME, pathname: '/storage/v1/object/sign/**' },

      /* Lokal Supabase emülatörü için – istenmiyorsa silebilirsiniz */
      { protocol: 'http',  hostname: 'localhost',        port: '54321', pathname: '/storage/v1/object/**' },
    ],

    /** SVG hizmet ediyorsanız açın – aksi hâlde kapalı kalsın
     *  dangerouslyAllowSVG: true,
     */

    /** CDN’imiz olmadığı için, aynı imzalı URL’yi kısa süre cache’lemekte
        fayda var (Next.js 14’te minCacheTTL → minimumCacheTTL) */
    minimumCacheTTL: 60,  // saniye
  },

  /* Performans / build çıktısı -------------------------------------------- */
  output: 'standalone',      // Docker / serverless deploy’da tek klasör üretir
  compress: true,            // Gzip+Brotli
  poweredByHeader: false,

  /* CSS kritik içerik (Critters) – hâlâ çalışıyor ama opsiyonel. İstersen bırak. :contentReference[oaicite:1]{index=1} */
  experimental: {
    optimizeCss: true,
    /** Yeni alternatif → inlineCss. İkisini aynı anda açmayın
        inlineCss: true,
      */
  },

  /* Ek güvenlik ve önbellek başlıkları ------------------------------------- */
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

  /* Var olan redirect’ler --------------------------------------------------- */
  async redirects() {
    return [
      { source: '/products/tours',     destination: '/products/category/tur',      permanent: true },
      { source: '/products/transfers', destination: '/products/category/transfer', permanent: true },
      { source: '/products/visa',      destination: '/products/category/vize',     permanent: true },
    ];
  },
};

module.exports = nextConfig;
