/* --------------------------------------------------------------
   ❷ “Sipariş Özeti” → Stripe Checkout
   src/app/cart/confirm/page.tsx
-------------------------------------------------------------- */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link          from 'next/link'
import { format }    from 'date-fns'
import { ShoppingCart } from 'lucide-react'

import { useCart }     from '@/context/CartContext'
import StepIndicator   from '@/components/StepIndicator'

export default function ConfirmPage () {
  /* sepetteki veriler */
  const { cart, removeFromCart } = useCart()
  const router  = useRouter()
  const [busy , setBusy] = useState(false)

  /* ── 1 · Sepet boşsa ─────────────────────────────────────── */
  if (!cart.length) {
    return (
      <main className="min-h-[70vh] flex flex-col items-center justify-center gap-6 text-center px-4">
        <ShoppingCart size={46} className="text-gray-400" />
        <h1 className="text-2xl font-heading font-bold">Sepetiniz boş</h1>

        {/* Alışverişe Devam Et */}
        <Link href="/" className="btn-primary">Alışverişe Devam Et</Link>
      </main>
    )
  }

  /* ── 2 · Genel toplam (bilgi amaçlı) ─────────────────────── */
  const grandTotal = cart.reduce((sum, i) => {
    const raw = String(i.lineTotal ?? i.unitPrice ?? '0').replace(',', '.')
    return sum + Number(raw) * (i.quantity ?? 1)
  }, 0)

  /* ── 3 · Stripe Checkout yönlendirmesi ───────────────────── */
  const handlePayment = async () => {
    if (busy) return
    setBusy(true)

    const items = cart.map(i => {
      const dec  = Number(String(i.lineTotal ?? i.unitPrice ?? '0').replace(',', '.'))
      const fils = Math.round(dec * 100)        // Stripe tam sayı ister

      return {
        /* Stripe alanları */
        id       : i.id,
        tur_adi  : i.tur_adi,
        amount   : fils,
        currency : 'aed',

        /* Geri-uyumluluk */
        unitPrice: dec,
        fiyat    : dec,
        quantity : 1,

        /* Rezervasyon ayrıntıları */
        fullName    : i.fullName    ?? '',
        phone       : i.phone       ?? '',
        email       : i.email       ?? '',
        adult       : i.adult       ?? 0,
        child       : i.child       ?? 0,
        infant      : i.infant      ?? 0,
        tarih       : i.tarih       ? String(i.tarih) : null,   // BOS → null
        pickup_time : i.pickup_time ? String(i.pickup_time) : null,
        otel        : i.otel        ?? '',
        region      : i.region      ?? '',
        child_ages  : i.child_ages  ?? [],
      }
    })

    try {
      const res = await fetch('/api/checkout-cart', {
        method : 'POST',
        headers: { 'Content-Type':'application/json' },
        body   : JSON.stringify({ items }),
      })

      if (!res.ok) throw new Error(`API hatası (${res.status})`)
      const { url, error } = await res.json()
      if (error || !url)  throw new Error(error ?? 'Stripe URL alınamadı')

      router.push(url)                               // 🚀 Stripe Checkout
    } catch (err) {
      console.error('checkout-cart error:', err)
      alert('Ödeme sayfasına yönlendirilemedi. Lütfen tekrar deneyin.')
      setBusy(false)
    }
  }

  /* ── 4 · JSX ─────────────────────────────────────────────── */
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 text-gray-800">
      <StepIndicator currentStep={2} />

      <h1 className="mt-8 mb-6 text-center text-3xl font-heading font-bold">
        Sipariş Özeti
      </h1>

      {/* Ürün listesi */}
      <ul className="space-y-4">
        {cart.map((it, idx) => (
          <li key={`${it.id}-${idx}`} className="rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="flex justify-between items-start gap-4">
              <div>
                <p className="font-semibold">{it.tur_adi}</p>

                {it.tarih && (
                  <p className="text-sm text-gray-500">
                    Tarih: {format(new Date(it.tarih), 'dd.MM.yyyy')}
                  </p>
                )}
                {it.otel && <p className="text-sm text-gray-500">Otel: {it.otel}</p>}
                {it.pickup_time && (
                  <p className="text-sm text-gray-500">Alınış: {it.pickup_time}</p>
                )}
                <p className="text-sm text-gray-500">
                  Yetişkin: {it.adult ?? 0} | Çocuk: {it.child ?? 0} | Bebek: {it.infant ?? 0}
                </p>
                {it.region && <p className="text-sm text-gray-500">Bölge: {it.region}</p>}
              </div>

              <div className="text-right whitespace-nowrap">
                <p className="font-semibold">
                  {Number(String(it.lineTotal ?? it.unitPrice).replace(',', '.')).toFixed(2)} AED
                </p>
                <button
                  type="button"
                  onClick={() => removeFromCart(idx)}
                  className="mt-2 text-xs text-red-600 hover:underline"
                >
                  Sil
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* Genel toplam */}
      <p className="mt-10 text-center text-xl font-bold">
        Genel Toplam: {grandTotal.toFixed(2)} AED
      </p>

      {/* Aksiyon butonları */}
      <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
        <Link href="/"    className="btn-secondary sm:w-40 text-center">
          Alışverişe Devam Et
        </Link>

        <Link href="/cart" className="btn-secondary sm:w-40 text-center">
          Sepete Dön
        </Link>

        {/* Ödemeye Geç (vurgulu) */}
        <button
          type="button"
          onClick={handlePayment}
          disabled={busy}
          className="btn-primary sm:w-48 text-lg py-3 shadow-lg hover:scale-105 transition-transform disabled:opacity-60"
        >
          {busy ? 'Yönlendiriliyor…' : 'Ödemeye Geç'}
        </button>
      </div>
    </main>
  )
}
