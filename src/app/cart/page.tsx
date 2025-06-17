/* ────────────────────────────────────────────────
   src/app/cart/page.tsx • Sepet Listeleme
   (StepIndicator kaldırıldı – artık 4‑adım akışına dâhil değil)
──────────────────────────────────────────────── */

'use client'

import Link                 from 'next/link'
import { ShoppingCart, Trash2 } from 'lucide-react'
import { useCart }          from '@/context/CartContext'

export default function CartPage() {
  const { cart, removeFromCart, clearCart } = useCart()

  /* Genel toplam — lineTotal yoksa unitPrice × quantity */
  const grandTotal = cart.reduce(
    (sum, i) => sum + (i.lineTotal ?? (i.unitPrice ?? 0) * (i.quantity ?? 1)),
    0,
  )

  /* ───────────── 1) SEPET BOŞ ───────────── */
  if (cart.length === 0) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-24 text-center">
        <ShoppingCart className="mx-auto h-12 w-12 text-primary mb-6" />

        <h1 className="text-3xl font-heading font-bold mb-6">
          Sepetiniz boş
        </h1>

        <Link href="/" className="btn-primary inline-block">
          Alışverişe Devam Et
        </Link>
      </main>
    )
  }

  /* ───────────── 2) SEPET DOLU ───────────── */
  return (
    <main className="mx-auto max-w-5xl px-4 py-10 text-gray-800">
      {/* Başlık */}
      <h1 className="mb-8 flex items-center gap-3 text-3xl font-heading font-bold">
        <ShoppingCart className="h-8 w-8 text-primary" />
        Sepetiniz
      </h1>

      {/* Ürün listesi */}
      <div className="divide-y divide-gray-200 border-y border-gray-200">
        {cart.map((item, idx) => (
          <div
            key={`${item.id}-${idx}`}
            className="flex items-center justify-between py-4"
          >
            <div>
              <p className="font-medium">{item.tur_adi}</p>
              <p className="text-sm text-gray-600">
                Toplam:{' '}
                {(item.lineTotal ??
                  (item.unitPrice ?? 0) * (item.quantity ?? 1)
                ).toFixed(2)}{' '}
                {item.para_birimi ?? 'AED'}
              </p>
            </div>

            {/* Sil */}
            <button
              onClick={() => removeFromCart(idx)}
              aria-label="Ürünü sil"
              className="text-red-600 hover:text-red-500 transition-colors"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        ))}
      </div>

      {/* Alt kısım */}
      <div className="mt-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <button onClick={clearCart} className="btn-secondary">
          Sepeti Boşalt
        </button>

        <p className="text-xl font-heading font-bold">
          Toplam: {grandTotal.toFixed(2)} AED
        </p>

        <Link href="/cart/confirm" className="btn-primary">
          Ödeme Adımına Geç
        </Link>
      </div>

      {/* Alışverişe devam – sepet doluyken de gösteriyoruz */}
      <Link
        href="/"
        className="block mt-10 text-center text-primary underline hover:opacity-80"
      >
        Alışverişe Devam Et
      </Link>
    </main>
  )
}
