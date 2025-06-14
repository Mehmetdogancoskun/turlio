// src/app/success/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabaseClient';
import StepIndicator from '@/components/StepIndicator';
import { useCart } from '@/context/CartContext';          // ★ eklendi

/* ---------- Tipler (DB) ----------------------------------------- */
interface BookingRow {
  id: number;
  booking_ref: string;
  product_id: number;
  fullName: string;
  phone: string;
  email: string;
  adult_count: number;
  child_count: number;
  infant_count: number;
  tarih: string | null;
  pickup_time: string | null;
  otel_adi: string;
  region: string;
  child_ages: number[] | null;
  total: number;
}
interface Product {
  id: number;
  tur_adi: string;
  para_birimi: string;
}

/* ---------- Bileşen --------------------------------------------- */
export default function SuccessPage() {
  const router  = useRouter();
  const params  = useSearchParams();
  const { clearCart } = useCart();                     // ★ eklendi

  const bookingRefParam = params.get('ref');
  const bookingIdParam  = params.get('booking');
  const sessionIdParam  = params.get('session_id');

  const [rows, setRows]         = useState<BookingRow[] | null>(null);
  const [productMap, setProductMap] = useState<Record<number, Product>>({});
  const [loading, setLoading]   = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  /* ---------- Supabase sorguları --------------------------------- */
  useEffect(() => {
    (async () => {
      let q = supabase.from<BookingRow>('bookings').select('*');
      if (bookingRefParam)      q = q.eq('booking_ref', bookingRefParam);
      else if (bookingIdParam)  q = q.eq('id', Number(bookingIdParam));
      else if (sessionIdParam)  q = q.eq('payment_id', sessionIdParam);
      else { setErrorMsg('URL parametresi eksik'); setLoading(false); return; }

      const { data: bRows, error: bErr } = await q;
      if (bErr || !bRows || bRows.length === 0) {
        setErrorMsg('Rezervasyon bulunamadı.');
        clearCart();                                 // ★ hata durumunda da temizle
        localStorage.setItem('turlioCart','[]');     //   &
        setLoading(false);
        return;
      }
      setRows(bRows);

      /* Ürün başlıklarını topluca getir */
      const ids = [...new Set(bRows.map(r => r.product_id))];
      const { data: prods } = await supabase
        .from<Product>('urunler')
        .select('id, tur_adi, para_birimi')
        .in('id', ids);

      const map: Record<number, Product> = {};
      prods?.forEach(p => (map[p.id] = p));
      setProductMap(map);

      /* --- Sepeti kesin boşalt --- */
      clearCart();                                   // ★ başarı durumunda temizle
      localStorage.setItem('turlioCart','[]');       //   &
      /* --------------------------- */

      setLoading(false);
    })();
  /* clearCart da dependency listesine eklendi */
  }, [bookingRefParam, bookingIdParam, sessionIdParam, clearCart]);

  /* ---------- Durum görünümleri (değişmedi) ----------------------- */
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <p>Yükleniyor…</p>
      </main>
    );
  }
  if (errorMsg || !rows) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-6">
        <p>{errorMsg || 'Rezervasyon bulunamadı.'}</p>
        <Link href="/" className="mt-4 text-emerald-400 underline">Ana Sayfaya Dön</Link>
      </main>
    );
  }

  /* ---------- Hesaplamalar (değişmedi) --------------------------- */
  const grandTotal = rows.reduce((s, r) => s + (r.total ?? 0), 0);
  const currency   = productMap[rows[0].product_id]?.para_birimi || 'AED';

  /* ---------- JSX (değişmedi) ------------------------------------ */
  return (
    <main className="bg-gray-900 min-h-screen text-white p-6 flex flex-col items-center">
      <StepIndicator currentStep={3} />

      <h1 className="text-4xl font-bold mt-6 mb-2">Teşekkürler!</h1>
      <p className="mb-6 text-center max-w-md">
        Rezervasyon bilgileriniz <span className="font-semibold">{rows[0].email}</span> adresine gönderilmiştir.
      </p>

      <p className="mb-4 text-lg">
        <span className="font-semibold">Rezervasyon No:</span> {rows[0].booking_ref}
      </p>

      {/* Ürün tablosu */}
      <div className="w-full max-w-2xl overflow-x-auto mb-8">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-800">
              <th className="px-3 py-2 text-left">Ürün</th>
              <th className="px-3 py-2">Tarih</th>
              <th className="px-3 py-2">Kişi</th>
              <th className="px-3 py-2 text-right">Tutar</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} className="border-b border-gray-700">
                <td className="px-3 py-2">
                  {productMap[r.product_id]?.tur_adi ?? `Ürün #${r.product_id}`}
                </td>
                <td className="px-3 py-2 text-center">
                  {r.tarih ? format(new Date(r.tarih), 'dd.MM.yyyy') : '-'}
                </td>
                <td className="px-3 py-2 text-center">
                  {r.adult_count} + {r.child_count} + {r.infant_count}
                </td>
                <td className="px-3 py-2 text-right whitespace-nowrap">
                  {r.total.toFixed(2)} {currency}
                </td>
              </tr>
            ))}
            <tr>
              <td colSpan={3} className="px-3 py-2 text-right font-semibold">Genel Toplam</td>
              <td className="px-3 py-2 text-right font-bold">
                {grandTotal.toFixed(2)} {currency}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <Link
        href="/"
        className="mt-6 bg-emerald-600 hover:bg-emerald-700 px-6 py-2 rounded font-semibold"
      >
        Ana Sayfaya Dön
      </Link>
    </main>
  );
}
