/* ──────────────────────────────────────────────────────────────
   src/app/checkout/page.tsx
   - Adım 3: Stripe Checkout’a yönlendirme
   - Yeni “PageShell” kabı ile tutarlı görünüm
   ──────────────────────────────────────────────────────────── */

'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import StepIndicator from '@/components/StepIndicator'
import PageShell     from '@/components/PageShell'   // ★ Ortak çerçeve

export default function CheckoutPage() {
  /* ---------- URL parametreleri & yönlendirme ---------- */
  const router     = useRouter()
  const params     = useSearchParams()
  const bookingId  = params.get('bookingId')
  const productId  = params.get('productId')

  /* ➊  Stripe Checkout oturumu oluştur ve yönlendir */
  useEffect(() => {
    if (!bookingId || !productId) return

    ;(async () => {
      const res = await fetch('/api/checkout', {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({
          bookingId : Number(bookingId),
          productId : Number(productId),
        }),
      })

      const { url } = await res.json()
      if (url) router.push(url)
    })()
  }, [bookingId, productId, router])

  /* ---------- JSX ---------- */
  return (
    <PageShell className="max-w-3xl mx-auto px-4 py-10">
      {/* Adım göstergesi (Rezervasyon → Özet → **Ödeme**) */}
      <StepIndicator currentStep={3} />

      <h1 className="mt-8 mb-6 text-center text-3xl font-heading font-bold">
        Ödeme sayfasına yönlendiriliyorsunuz…
      </h1>

      <p className="text-center text-gray-600">
        Lütfen birkaç saniye bekleyin; güvenli ödeme sayfasına aktarılıyorsunuz.
      </p>

      {/* Yükleniyor animasyonu */}
      <div className="mt-12 flex justify-center">
        <span className="relative inline-flex h-12 w-12">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
          <span className="relative inline-flex h-12 w-12 rounded-full bg-primary" />
        </span>
      </div>
    </PageShell>
  )
}
