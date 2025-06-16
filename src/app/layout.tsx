/* src/app/layout.tsx – kök yerleşim  */
import type { Metadata }  from 'next'
import { Inter, Poppins } from 'next/font/google'
import './globals.css'

import { CartProvider   } from '@/context/CartContext'
import { SearchProvider } from '@/context/SearchContext'
import Header  from '@/components/Header'
import Footer  from '@/components/Footer'

/* ——— Google Fonts ——— */
const inter = Inter({ subsets: ['latin'], weight: ['400','500','600','700'], variable: '--font-inter' })
const pop   = Poppins({ subsets: ['latin'], weight: ['400','500','600','700'], variable: '--font-poppins' })

/* ——— Metadata ——— */
export const metadata: Metadata = {
  title:       'Turlio',
  description: 'Gezilecek turlarınızı ve etkinliklerinizi kolayca rezerve edin',
}

/* ——— Layout bileşeni ——— */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${inter.variable} ${pop.variable}`}>
      <head>
        <script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
          async defer
        />
      </head>

      <body className="font-body antialiased bg-gray-50 text-gray-800">
        <CartProvider>
          <SearchProvider>
            <Header />          {/* ← TEK Header burada */}
            <main>{children}</main>
            <Footer />
          </SearchProvider>
        </CartProvider>
      </body>
    </html>
  )
}
