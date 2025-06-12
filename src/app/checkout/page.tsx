// src/app/checkout/page.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import StepIndicator from '@/components/StepIndicator';

export default function CheckoutPage() {
  const router = useRouter();
  const params = useSearchParams();
  const bookingId = params.get('bookingId');
  const productId = params.get('productId');

  useEffect(() => {
    if (!bookingId || !productId) return;
    (async () => {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: Number(bookingId),
          productId: Number(productId),
        }),
      });
      const { url } = await res.json();
      if (url) router.push(url);
    })();
  }, [bookingId, productId, router]);

  return (
    <main className="bg-gray-900 min-h-screen text-white p-10 flex flex-col items-center">
      <StepIndicator currentStep={2} />
      <h2 className="text-2xl font-semibold mt-4">Ödeme Sayfasına Yönlendiriliyorsunuz…</h2>
      <p className="mt-2">Lütfen bekleyiniz.</p>
    </main>
  );
}
