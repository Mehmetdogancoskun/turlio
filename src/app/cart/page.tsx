/* ────────────────────────────────────────────────
   Sepet / Rezervasyon ekranı
──────────────────────────────────────────────── */
'use client'

import { useState, useEffect } from 'react'
import Link                    from 'next/link'
import { useRouter }           from 'next/navigation'
import { format }              from 'date-fns'
import {
  ShoppingCart,
  Trash2,
  ShoppingBag,
} from 'lucide-react'

import {
  useCart,
  type CartItem,
} from '@/context/CartContext'
import {
  CustomerForm,
  type CustomerInfo,
} from '@/components/CustomerForm'
import OrderSummary            from '@/components/OrderSummary'
import { supabase }            from '@/lib/supabaseClient'

/* Yardımcı ------------------------------------------------------------ */
const toNum  = (v: unknown) => Number(String(v ?? '0').replace(',', '.'))
const toFils = (aed: number) => Math.round(aed * 100)          // AED → fils

/* Minimal number-input ------------------------------------------------ */
function NumInput({
  value,
  min = 0,
  onChange,
}: {
  value: number
  min?: number
  onChange: (v: number) => void
}) {
  return (
    <input
      type="number"
      min={min}
      value={value}
      inputMode="numeric"
      pattern="[0-9]*"
      onChange={(e) => onChange(Math.max(min, Number(e.target.value)))}
      className="w-16 rounded border border-gray-300 px-2 py-1 text-sm text-center"
    />
  )
}

/* Yaş listeleri ------------------------------------------------------- */
const CHILD_AGES  = [2, 3, 4, 5, 6]
const INFANT_AGES = [0, 1, 2]

/* ───────────────────────────────────────────────────────────────────── */
export default function CartPage() {
  const {
    cart,
    updateItem,
    removeFromCart,
    clearCart,
    guestInfo,
    setGuestInfo,
  } = useCart()

  const [guest, setGuest] = useState<CustomerInfo | null>(guestInfo)
  const [busy,  setBusy ] = useState(false)
  const router            = useRouter()

  /* Bölge çarpanı ----------------------------------------------------- */
  useEffect(() => {
    if (!guest?.region) return
    ;(async () => {
      const { data } = await supabase
        .from('region_pricing')
        .select('multiplier')
        .eq('region', guest.region)
        .single()

      const mul = data?.multiplier ?? 1
      cart.forEach((row, idx) => {
        if (row.region_multiplier !== mul) {
          updateItem(idx, { region_multiplier: mul, region: guest.region })
        }
      })
    })()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guest?.region])

  /* Tutarlar ---------------------------------------------------------- */
  const sub = cart.reduce((s, r) => s + toNum(r.lineTotal), 0)
  const vat = +(sub * 0.05).toFixed(2)
  const tot = +(sub + vat).toFixed(2)

  /* Sepet boş --------------------------------------------------------- */
  if (!cart.length) {
    return (
      <main className="min-h-[70vh] flex flex-col items-center justify-center gap-6 text-center px-4">
        <ShoppingCart size={46} className="text-gray-400" />
        <h1 className="text-2xl font-heading font-bold">Sepetiniz boş</h1>
        <Link href="/" className="btn-primary">Alışverişe Devam Et</Link>
      </main>
    )
  }

  /* Ödeme ------------------------------------------------------------- */
  const pay = async () => {
    if (busy || !guest) return
    setBusy(true)

    const items = cart.map((r) => ({
      id      : r.id,
      name    : r.tur_adi,
      amount  : toFils(toNum(r.lineTotal) * 1.05), // %5 KDV dâhil
      currency: 'aed',
      quantity: 1,
      ...r,
      ...guest,
    }))

    try {
      const res = await fetch('/api/checkout-cart', {
        method :'POST',
        headers:{ 'Content-Type':'application/json' },
        body   : JSON.stringify({ items, guestInfo: guest }),
      })
      const { url, error } = await res.json()
      if (!url) throw new Error(error ?? 'Stripe URL alınamadı')
      router.push(url)
    } catch (err) {
      console.error(err)
      alert('Ödeme sayfası açılamadı, lütfen tekrar deneyin.')
      setBusy(false)
    }
  }

  /* ------------------------------------------------ JSX -------------- */
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 text-gray-800 space-y-10">
      {/* Başlık */}
      <h1 className="flex items-center gap-3 text-3xl font-heading font-bold">
        <ShoppingCart className="h-8 w-8 text-primary" />
        Sepetimdeki Ürünler
      </h1>

      <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
        {/* SOL: Ürünler + Form */}
        <div className="space-y-10">
          {/* Ürünler */}
          <section className="space-y-4">
            {cart.map((r, idx) => (
              <article
                key={idx}
                className="rounded-lg border border-gray-200 p-4 space-y-3 hover:shadow-sm transition"
              >
                {/* Başlık / fiyat */}
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{r.tur_adi}</p>
                    {r.tarih && (
                      <p className="text-sm text-gray-600">
                        Tarih: {format(new Date(r.tarih), 'dd.MM.yyyy')}
                      </p>
                    )}
                    {r.hotel && (
                      <p className="text-sm text-gray-600">Otel: {r.hotel}</p>
                    )}
                    {r.region_multiplier !== 1 && (
                      <p className="text-xs text-gray-500">
                        Bölge çarpanı ×{r.region_multiplier.toFixed(2)}
                      </p>
                    )}
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-bold">
                      {toNum(r.lineTotal).toFixed(2)} AED
                    </p>
                    <button
                      onClick={() => removeFromCart(idx)}
                      className="mt-1 flex items-center gap-1 text-xs text-red-600 hover:underline"
                    >
                      <Trash2 size={14} /> Sil
                    </button>
                  </div>
                </div>

                {/* Kişi sayıları */}
                <div className="grid gap-2 sm:grid-cols-3">
                  <label className="flex flex-col gap-1 text-xs">
                    Yetişkin
                    <NumInput
                      min={1}
                      value={r.adult ?? 1}
                      onChange={(v) => updateItem(idx, { adult: v })}
                    />
                  </label>

                  <label className="flex flex-col gap-1 text-xs">
                    Çocuk
                    <NumInput
                      value={r.child ?? 0}
                      onChange={(v) => updateItem(idx, { child: v })}
                    />
                  </label>

                  <label className="flex flex-col gap-1 text-xs">
                    Bebek
                    <NumInput
                      value={r.infant ?? 0}
                      onChange={(v) => updateItem(idx, { infant: v })}
                    />
                  </label>
                </div>

                {/* Çocuk yaşları */}
                {(r.child ?? 0) > 0 && (
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    Yaş (2-6):
                    {Array.from({ length: r.child }, (_, c) => (
                      <select
                        key={c}
                        value={r.child_ages?.[c] ?? 2}
                        onChange={(e) => {
                          const arr = [...(r.child_ages ?? [])]
                          arr[c] = Number(e.target.value)
                          updateItem(idx, { child_ages: arr })
                        }}
                        className="rounded border px-1 py-0.5 text-sm"
                      >
                        {CHILD_AGES.map((a) => (
                          <option key={a} value={a}>{a}</option>
                        ))}
                      </select>
                    ))}
                  </div>
                )}

                {/* Bebek yaşları */}
                {(r.infant ?? 0) > 0 && (
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    Bebek Yaşı (0-2):
                    {Array.from({ length: r.infant }, (_, b) => (
                      <select
                        key={b}
                        value={r.infant_ages?.[b] ?? 0}
                        onChange={(e) => {
                          const arr = [...(r.infant_ages ?? [])]
                          arr[b] = Number(e.target.value)
                          updateItem(idx, { infant_ages: arr })
                        }}
                        className="rounded border px-1 py-0.5 text-sm"
                      >
                        {INFANT_AGES.map((a) => (
                          <option key={a} value={a}>{a}</option>
                        ))}
                      </select>
                    ))}
                  </div>
                )}

                {/* Opsiyonel alınış saati */}
                {r.sub_category === 'transfer' && (
                  <label className="flex flex-col gap-1 text-xs">
                    Alınış Saati
                    <input
                      type="time"
                      value={r.pickup_time ?? ''}
                      onChange={(e) =>
                        updateItem(idx, { pickup_time: e.target.value })
                      }
                      className="rounded border border-gray-300 px-2 py-1 text-sm"
                    />
                  </label>
                )}
              </article>
            ))}
          </section>

          {/* Alışverişe devam */}
          <Link
            href="/"
            className="group flex w-max items-center gap-2 text-primary transition hover:text-primary/80"
          >
            <ShoppingBag
              size={20}
              className="translate-x-px transition-transform group-hover:-rotate-6"
            />
            <span className="font-medium">Alışverişe Devam Et</span>
          </Link>

          {/* Müşteri formu */}
          <section>
            <h2 className="mb-4 text-xl font-bold">
              İletişim / Konaklama Bilgileri
            </h2>
            <CustomerForm
              regionExternal={guest?.region ?? null}
              onValidChange={(g) => {
                setGuest(g)
                if (g) setGuestInfo(g)
              }}
            />
          </section>
        </div>

        {/* SAĞ: Sipariş özeti */}
        <OrderSummary cart={cart} />
      </div>

      {/* Alt bar */}
      <div className="mt-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <button onClick={clearCart} className="btn-secondary">
          Sepeti Boşalt
        </button>

        <span className="text-xl font-heading font-bold">
          Ödenecek:&nbsp;{tot.toFixed(2)}&nbsp;AED
        </span>

        <button
          onClick={pay}
          disabled={busy || !guest}
          className="btn-primary sm:w-48 py-3 text-lg shadow-lg transition hover:scale-105 disabled:opacity-60"
        >
          {busy ? 'Yönlendiriliyor…' : 'Ödemeye Geç'}
        </button>
      </div>
    </main>
  )
}
