// src/app/layout.tsx
import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';

import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { Header } from '@/components/Header';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Turlio',
  description: 'Gezilecek turlarınızı ve etkinliklerinizi kolayca rezerve edin',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <head>
        <script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
          async
          defer
        />
      </head>
      <body className={`${poppins.className} antialiased bg-gray-50 text-gray-800`}>
        {/* ✔︎ TÜM UYGULAMA CartProvider İÇİNDE */}
        <CartProvider>
          <Header />
          <main>{children}</main>
          {/* İleride Footer eklenecek */}
        </CartProvider>
      </body>
    </html>
  );
}
