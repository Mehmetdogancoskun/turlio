// src/app/cart/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';

export default function CartPage() {
  const { items, removeItem, clearCart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const totalPrice = items.reduce(
    (sum, i) => sum + i.fiyat * i.quantity,
    0
  );

  /* Sepet boşsa  ----------------------------------------- */
  if (items.length === 0) {
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

  /* Sepet doluyken  -------------------------------------- */
  const handleCheckout = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/checkout-cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });
      const { url } = await res.json();
      if (url) router.push(url);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-gray-900 min-h-screen text-white p-10">
      <h1 className="text-3xl mb-8 flex items-center gap-3">
        <ShoppingCart className="w-7 h-7" /> Sepetiniz
      </h1>

      {/* Ürün listesi */}
      <ul className="space-y-6">
        {items.map(item => (
          <li
            key={item.id}
            className="flex justify-between items-center border-b border-gray-700 pb-4"
          >
            <div>
              <p className="font-semibold">{item.tur_adi}</p>
              <p className="text-sm text-gray-400">
                {item.quantity} × {item.fiyat.toFixed(2)} AED
              </p>
            </div>
            <button
              onClick={() => removeItem(item.id)}
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