'use client'

/* ───────────────────────────────
   Rezervasyon Formu (Ürün-detay)
   - Türkçe takvim
   - Yetişkin / Çocuk (2-6) / Bebek (0-2)
   - Opsiyonel alınış saati (transfer)
──────────────────────────────── */

import { useState, useMemo }      from 'react'
import { useRouter }              from 'next/navigation'
import { addDays, format }        from 'date-fns'
import { tr }                     from 'date-fns/locale'
import { DayPicker }              from 'react-day-picker'
import 'react-day-picker/dist/style.css'

import { useCart }                from '@/context/CartContext'
import NumberInput                from '@/components/NumberInput'

/* ─── Tipler ─── */
interface Product {
  id          : number
  tur_adi     : string
  fiyat       : number
  para_birimi : string
  sub_category: string | null       // “transfer” ise saat alanı görünür
}

/* ─────────────────────────────── */
export default function BookingForm({ product }: { product: Product }) {
  const router          = useRouter()
  const { addToCart }   = useCart()

  /* —— Form state —— */
  const [date     , setDate]     = useState<Date>()
  const [adult    , setAdult]    = useState(1)
  const [child    , setChild]    = useState(0)
  const [infant   , setInfant]   = useState(0)
  const [pickup   , setPickup]   = useState('')      // opsiyonel
  const [childAge , setChildAge] = useState<number[]>([]) // dinamik

  /* Çocuk yaşları senkronizasyonu */
  if (childAge.length !== child) {
    setChildAge(Array.from({ length: child }, () => 4))   // varsayılan ↓
  }

  /* —— Fiyat hesaplama —— */
  const total = useMemo(() => {
  const adultCost  = product.fiyat * adult
  const childCost  = product.fiyat * 0.75 * child   // %25 ind.
  const infantCost = 0                              // ücretsiz
  return +(adultCost + childCost + infantCost).toFixed(2)
}, [adult, child, infant, product.fiyat])

  /* —— Sepete ekle —— */
  const add = () => {
    if (!date) return alert('Lütfen tarih seçiniz.')
    addToCart({
      id          : product.id,
      tur_adi     : product.tur_adi,
      unitPrice   : product.fiyat,
      region_multiplier: 1,
      quantity    : 1,
      adult, child, infant,
      child_ages  : childAge,
      tarih       : format(date, 'yyyy-MM-dd'),
      pickup_time : pickup || null,
      hotel       : '',               // Cart sayfasında doldurulacak
    })
    router.push('/cart')
  }

  /* —— JSX —— */
  return (
    <div className="mt-10 flex flex-col gap-6 rounded-lg border border-gray-200 p-6 shadow-sm">
      {/* ── Tarih ────────────────────────── */}
      <section>
        <h2 className="mb-2 text-lg font-semibold">Tarih Seçin</h2>
        <DayPicker
          mode="single"
          selected={date}
          onSelect={setDate}
          fromDate={new Date()}
          toDate={addDays(new Date(), 365)}
          locale={tr}
          className="border rounded-lg p-2"
          captionLayout="dropdown"
          modifiersClassNames={{ selected: 'bg-primary text-white' }}
        />
      </section>

      {/* ── Kişi Sayısı ─────────────────── */}
      <section>
        <h2 className="mb-2 text-lg font-semibold">Kişi Sayısı</h2>

        <div className="flex flex-wrap gap-4">
          <NumberInput label="Yetişkin" value={adult}  min={1} onChange={setAdult} />
          <NumberInput label="Çocuk (2-6)" value={child} onChange={setChild} />
          <NumberInput label="Bebek (0-2)" value={infant} onChange={setInfant} />
        </div>

        {child > 0 && (
          <div className="mt-3">
            <p className="text-sm text-gray-600">Çocuk yaşları</p>
            <div className="flex flex-wrap gap-2">
              {childAge.map((age, i) => (
                <select
                  key={i}
                  value={age}
                  onChange={e => {
                    const arr = [...childAge]
                    arr[i] = Number(e.target.value)
                    setChildAge(arr)
                  }}
                  className="rounded border border-gray-300 px-2 py-[2px] text-sm"
                >
                  {Array.from({ length: 17 }, (_, n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ── Opsiyonel alınış saati ───────── */}
      {product.sub_category === 'transfer' && (
        <section>
          <h2 className="mb-2 text-lg font-semibold">Alınış Saati (opsiyonel)</h2>
          <input
            type="time"
            value={pickup}
            onChange={e => setPickup(e.target.value)}
            className="w-40 rounded border border-gray-300 px-3 py-1"
          />
        </section>
      )}

      {/* ── Toplam + CTA ─────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <p className="text-xl font-heading font-bold">
          Toplam:&nbsp;{total.toFixed(2)}&nbsp;{product.para_birimi}
        </p>
        <button onClick={add} className="btn-primary sm:w-48">
          Sepete Ekle
        </button>
      </div>
    </div>
  )
}
