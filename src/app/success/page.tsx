// src/app/success/page.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import StepIndicator from '@/components/StepIndicator';

interface Booking {
  id: number;
  booking_ref: string;
  product_id: number;
  fullName: string;
  phone: string;
  email: string;
  adult_count: number;
  child_count: number;
  infant_count: number;
  tarih: string;
  pickup_time: string | null;
  otel_adi: string;
  region: string;
  child_ages: number[];
  total: number;
}

interface Product {
  tur_adi: string;
  para_birimi: string;
}

export default function SuccessPage() {
  const router = useRouter();
  const params = useSearchParams();

  // Öncelikle ref parametresini dene, yoksa bookingId’ye bak
  const bookingRefParam = params.get('ref');
  const bookingIdParam  = params.get('booking');
  const [booking, setBooking]   = useState<Booking | null>(null);
  const [product, setProduct]   = useState<Product | null>(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    (async () => {
      let query = supabase.from<Booking>('bookings').select('*').limit(1);
      if (bookingRefParam) {
        query = query.eq('booking_ref', bookingRefParam);
      } else if (bookingIdParam) {
        query = query.eq('id', Number(bookingIdParam));
      } else {
        router.replace('/');
        return;
      }
      const { data: b, error } = await query.single();
      if (error || !b) {
        router.replace('/');
        return;
      }
      setBooking(b);

      const { data: p } = await supabase
        .from<Product>('urunler')
        .select('tur_adi, para_birimi')
        .eq('id', b.product_id)
        .single();
      setProduct(p || null);
      setLoading(false);
    })();
  }, [bookingRefParam, bookingIdParam, router]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <p>Yükleniyor…</p>
      </main>
    );
  }

  if (!booking || !product) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-6">
        <p>Rezervasyon bulunamadı.</p>
        <Link href="/" className="mt-4 text-emerald-400 underline">
          Ana Sayfaya Dön
        </Link>
      </main>
    );
  }

  return (
    <main className="bg-gray-900 min-h-screen text-white p-6 flex flex-col items-center">
      <StepIndicator currentStep={3} />

      <h1 className="text-4xl font-bold mt-6 mb-4">Teşekkürler!</h1>
      <p className="mb-6">Rezervasyonunuz başarıyla tamamlandı.</p>

      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md space-y-2">
        <p>
          <span className="font-semibold">Rezervasyon No:</span> {booking.booking_ref}
        </p>
        <p>
          <span className="font-semibold">Tur Adı:</span> {product.tur_adi}
        </p>
        <p>
          <span className="font-semibold">Ad Soyad:</span> {booking.fullName}
        </p>
        <p>
          <span className="font-semibold">Telefon:</span> {booking.phone}
        </p>
        <p>
          <span className="font-semibold">E-posta:</span> {booking.email}
        </p>
        <p>
          <span className="font-semibold">Tarih:</span> {booking.tarih}
        </p>
        {booking.pickup_time && (
          <p>
            <span className="font-semibold">Alınış Saati:</span> {booking.pickup_time}
          </p>
        )}
        <p>
          <span className="font-semibold">Otel:</span> {booking.otel_adi}
        </p>
        <p>
          <span className="font-semibold">Bölge:</span> {booking.region}
        </p>
        <p>
          <span className="font-semibold">Yetişkin:</span> {booking.adult_count}
        </p>
        <p>
          <span className="font-semibold">Çocuk:</span> {booking.child_count}
        </p>
        <p>
          <span className="font-semibold">Bebek:</span> {booking.infant_count}
        </p>
        {booking.child_ages.length > 0 && (
          <p>
            <span className="font-semibold">Çocuk Yaşları:</span> {booking.child_ages.join(', ')}
          </p>
        )}
        <p>
          <span className="font-semibold">Toplam Tutar:</span> {booking.total.toFixed(2)} AED
        </p>
      </div>

      <Link
        href="/"
        className="mt-8 bg-emerald-600 hover:bg-emerald-700 px-6 py-2 rounded font-semibold"
      >
        Ana Sayfaya Dön
      </Link>
    </main>
  );
}