// src/app/cart/confirm/page.tsx
'use client';

import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';

export default function ConfirmPage() {
  const { items } = useCart();
  const router   = useRouter();

  const total = items.reduce((s, i) => s + i.fiyat * i.quantity, 0);

  // Sepet boşsa geri
  if (items.length === 0) {
    return (
      <main className="min-h-screen p-10 bg-gray-900 text-white text-center">
        <h1 className="text-2xl mb-4">Sepetiniz Boş</h1>
        <Link href="/cart" className="underline text-emerald-400">Sepete Dön</Link>
      </main>
    );
  }

  // Stripe checkout’a yönlendiren handler
  const handlePay = async () => {
    const res = await fetch('/api/checkout-cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    });
    const { url } = await res.json();
    if (url) router.push(url);
  };

  return (
    <main className="min-h-screen p-10 bg-gray-900 text-white">
      <h1 className="text-3xl mb-6 text-center">Sipariş Özeti</h1>

      <ul className="space-y-4 max-w-md mx-auto">
        {items.map(it => (
          <li
  key={it.id}
  className="border border-gray-700 rounded p-4 space-y-1"
>
  <p className="font-semibold">{it.tur_adi}</p>
  {it.tarih && (
    <p className="text-sm text-gray-400">
      Tarih: {format(new Date(it.tarih), 'dd.MM.yyyy')}
    </p>
  )}
  {it.otel && (
    <p className="text-sm text-gray-400">Otel: {it.otel}</p>
  )}
  {it.pickup_time && (
    <p className="text-sm text-gray-400">
      Alınış Saati: {it.pickup_time}
    </p>
  )}
  <p className="text-sm text-gray-400">
    Yetişkin: {it.adult ?? 0} | Çocuk: {it.child ?? 0} | Bebek: {it.infant ?? 0}
  </p>
  {it.region && (
    <p className="text-sm text-gray-400">Bölge: {it.region}</p>
  )}
  <p className="text-sm">
    Ara Toplam: {(it.fiyat * it.quantity).toFixed(2)} AED
  </p>
</li>
        ))}
      </ul>

      <p className="text-xl font-bold text-center mt-8">
        Genel Toplam: {total.toFixed(2)} AED
      </p>

      <div className="flex justify-center gap-6 mt-8">
        <Link
          href="/cart"
          className="bg-gray-700 hover:bg-gray-600 px-6 py-2 rounded"
        >
          Geri Dön
        </Link>

        <button
          onClick={handlePay}
          className="bg-emerald-600 hover:bg-emerald-700 px-6 py-2 rounded"
        >
          Ödemeye Geç
        </button>
      </div>
    </main>
  );
}