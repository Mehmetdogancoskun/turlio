// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";

export const metadata: Metadata = {
  title: "Turlio",
  description: "Gezilecek turlarınızı ve etkinliklerinizi kolayca rezerve edin",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <head>
        {/* Google Fonts */}
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Lato:wght@400;500;700&display=swap"
          rel="stylesheet"
        />

        {/* Google Maps JS API */}
        <script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.GOOGLE_MAPS_API_KEY}&libraries=places`}
          async
          defer
        ></script>
      </head>
      <body className="antialiased bg-[var(--color-background)] text-[var(--color-foreground)]">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
