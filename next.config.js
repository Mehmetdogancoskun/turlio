/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // next/image → Supabase Storage izni (yeni sözdizimi)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'qiqcsmuybtuxngckkvwf.supabase.co',
        pathname: '/storage/**',
      },
    ],
  },

  // İleride başka ayarlar (rewrites, redirects, env…) gerekirse
  // buraya ekleyebilirsiniz.
};

export default nextConfig;   // ← Next 15’te tercih edilen ES Module dışa-aktarım
