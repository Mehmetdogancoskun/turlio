// src/app/cart/page.tsx
'use client';

import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';

export default function CartPage() {
  const { cart, removeFromCart, clearCart } = useCart();

  // Genel toplam (lineTotal varsa onu, yoksa unitPrice × qty)
  const totalPrice = cart.reduce(
    (sum, i) => sum + (i.lineTotal ?? i.unitPrice * (i.quantity ?? 1) ?? 0),
    0
  );

  // Sepet boşsa ------------------------------------------------------
  if (cart.length === 0) {
    return (
      <main className="bg-gray-900 min-h-screen text-white p-10 flex flex-col items-center">
        <h1 className="text-3xl mb-6">Sepetiniz Boş</h1>
        <Link
          href="/"
          className="inline-block bg-emerald-600 hover:bg-emerald-700 px-6 py-2 rounded"
        >
          Ana Sayfaya Dön
        </Link>
      </main>
    );
  }

  // Sepet doluyken ---------------------------------------------------
  return (
    <main className="bg-gray-900 min-h-screen text-white p-10">
      <h1 className="text-3xl mb-8 flex items-center gap-3">
        <ShoppingCart className="w-7 h-7" /> Sepetiniz
      </h1>

      {/* Ürün listesi */}
      <ul className="space-y-6">
        {cart.map((item, idx) => (
          <li
            key={`${item.id}-${idx}`}           // benzersiz anahtar
            className="flex justify-between items-center border-b border-gray-700 pb-4"
          >
            <div>
              <p className="font-semibold">{item.tur_adi}</p>
              <p className="text-sm text-gray-400">
                Toplam:{' '}
                {(item.lineTotal ?? item.unitPrice ?? 0).toFixed(2)} AED
              </p>
            </div>
            <button
              onClick={() => removeFromCart(idx)}
              className="text-red-500 hover:text-red-400"
            >
              Sil
            </button>
          </li>
        ))}
      </ul>

      {/* Alt kısım: toplam & butonlar */}
      <div className="mt-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <button
          onClick={clearCart}
          className="bg-red-600 hover:bg-red-700 px-5 py-2 rounded"
        >
          Sepeti Boşalt
        </button>

        <p className="text-xl font-bold">
          Toplam: {totalPrice.toFixed(2)} AED
        </p>

        <Link
          href="/cart/confirm"
          className="mt-6 bg-emerald-600 hover:bg-emerald-700 px-6 py-2 rounded inline-block text-center"
        >
          Devam Et
        </Link>
      </div>

      <Link
        href="/"
        className="block mt-8 text-center text-emerald-400 underline"
      >
        Alışverişe Devam Et
      </Link>
    </main>
  );
}
