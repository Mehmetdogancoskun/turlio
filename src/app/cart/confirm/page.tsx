'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { format } from 'date-fns';

export default function ConfirmPage() {
  const { cart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  /* Genel Toplam ---------------------------------------------------- */
  const total =
    cart?.reduce(
      (sum, i) =>
        sum + (i.lineTotal ?? i.unitPrice * (i.quantity ?? 1) ?? 0),
      0
    ) ?? 0;

  /* Sepet boşsa ------------------------------------------------------ */
  if (!cart || cart.length === 0) {
    return (
      <main className="min-h-screen p-10 bg-gray-900 text-white text-center">
        <h1 className="text-2xl mb-4">Sepetiniz Boş</h1>
        <Link href="/cart" className="underline text-emerald-400">
          Sepete Dön
        </Link>
      </main>
    );
  }

  /* Stripe’a yönlendir ------------------------------------------------ */
  const handlePay = async () => {
    setLoading(true);
    try {
      const minimalItems = cart.map((i) => ({
        id: i.id,
        tur_adi: i.tur_adi,
        fiyat:  i.lineTotal,
        quantity: 1,
        lineTotal: i.lineTotal,

        fullName: i.fullName,
        phone: i.phone,
        email: i.email,
        adult: i.adult,
        child: i.child,
        infant: i.infant,
        tarih: i.tarih,
        pickup_time: i.pickup_time,
        otel: i.otel,
        region: i.region,
        child_ages: i.child_ages,
      }));

      const res = await fetch('/api/checkout-cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: minimalItems }),
      });

      const { url } = await res.json();
      if (url) router.push(url);
    } finally {
      setLoading(false);
    }
  };

  /* JSX -------------------------------------------------------------- */
  return (
    <main className="min-h-screen p-10 bg-gray-900 text-white">
      <h1 className="text-3xl mb-6 text-center">Sipariş Özeti</h1>

      <ul className="space-y-4 max-w-md mx-auto">
        {cart.map((it, idx) => (
          <li
            key={`${it.id}-${idx}`} // benzersiz anahtar
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
              Yetişkin: {it.adult ?? 0} | Çocuk: {it.child ?? 0} | Bebek:{' '}
              {it.infant ?? 0}
            </p>

            {it.region && (
              <p className="text-sm text-gray-400">Bölge: {it.region}</p>
            )}

            <p className="text-sm">
              Ara Toplam:{' '}
              {(it.lineTotal ?? it.unitPrice * (it.quantity ?? 1) ?? 0).toFixed(
                2
              )}{' '}
              AED
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
          disabled={loading}
          className="bg-emerald-600 hover:bg-emerald-700 px-6 py-2 rounded disabled:opacity-60"
        >
          {loading ? 'Yönlendiriliyor…' : 'Ödemeye Geç'}
        </button>
      </div>
    </main>
  );
}
