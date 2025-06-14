import type { Metadata } from 'next';
import Script from 'next/script';
import { Poppins } from 'next/font/google';
import './globals.css';

import { Header } from '@/components/Header';
import { CartProvider } from '@/context/CartContext';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Turlio',
  description:
    'Gezilecek turlarınızı ve etkinliklerinizi kolayca rezerve edin',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <head>
        {/* Google Maps JS (yalnızca Places, bölge=AE) */}
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&region=AE`}
          strategy="beforeInteractive"
        />
      </head>
      <body
        className={`${poppins.className} antialiased bg-gray-50 text-gray-800`}
      >
        <CartProvider>
          <Header />
          <main>{children}</main>
          {/* İleride Footer buraya gelecek */}
        </CartProvider>
      </body>
    </html>
  );
}
