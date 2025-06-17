/* --------------------------------------------------------------
   SUCCESS  –  Ödeme / Rezervasyon Tamamlandı
-------------------------------------------------------------- */
'use client'

import { useEffect, useState } from 'react'
import { useSearchParams }     from 'next/navigation'
import Link                    from 'next/link'
import { format, isValid }     from 'date-fns'
import { supabase }            from '@/lib/supabaseClient'
import StepIndicator           from '@/components/StepIndicator'
import { useCart }             from '@/context/CartContext'

/* ---------- DB tipleri ------------------------------------- */
interface BookingRow {
  id:            number
  booking_ref:   string
  product_id:    number
  email:         string | null
  tarih:         string | Date | null   // <— “date” kolonu
  pickup_time:   string | null
  otel_adi:      string
  region:        string
  adult_count:   number
  child_count:   number
  infant_count:  number
  total:         number
}
interface Product {
  id: number
  tur_adi: string
  para_birimi: string
}

/* ----------------------------------------------------------- */
export default function SuccessPage() {
  const params                 = useSearchParams()
  const { clearCart }          = useCart()

  const [rows,        setRows]        = useState<BookingRow[]|null>(null)
  const [productMap,  setProductMap]  = useState<Record<number,Product>>({})
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState<string|null>(null)

  /* ---------- Supabase sorguları --------------------------- */
  useEffect(() => {
    const ref  = params.get('ref')
    const sess = params.get('session_id')

    ;(async () => {
      if (!ref && !sess) { setError('URL parametresi eksik'); setLoading(false); return }

      let q = supabase.from<BookingRow>('bookings').select('*')
      q = ref ? q.eq('booking_ref', ref) : q.eq('payment_id', sess!)
      const { data, error } = await q
      if (error || !data?.length) { setError('Rezervasyon bulunamadı'); setLoading(false); return }

      setRows(data)

      const ids = [...new Set(data.map(r => r.product_id))]
      const { data: prods } = await supabase
        .from<Product>('urunler')
        .select('id, tur_adi, para_birimi')
        .in('id', ids)

      const map: Record<number,Product> = {}
      prods?.forEach(p => (map[p.id]=p))
      setProductMap(map)

      clearCart()                       // Sepeti sıfırla
      localStorage.setItem('turlioCart','[]')

      setLoading(false)
    })()
  }, [params, clearCart])

  /* ---------- Loader / Error ------------------------------- */
  if (loading) {
    return <main className="min-h-screen flex items-center justify-center"><p>Yükleniyor…</p></main>
  }
  if (error || !rows) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-6">
        <p>{error ?? 'Bilinmeyen hata.'}</p>
        <Link href="/" className="underline text-primary">Ana Sayfa</Link>
      </main>
    )
  }

  /* ---------- Hesaplamalar -------------------------------- */
  const grandTotal = rows.reduce((s,r)=>s+(r.total??0),0)
  const currency   = productMap[rows[0].product_id]?.para_birimi ?? 'AED'
  const emailShown = rows[0].email || 'belirttiğiniz e-posta adresine'
  const bookingRef = rows[0].booking_ref

  /* ---------- Kesin çalışan tarih biçimlendirici ---------- */
  const fmtDate = (raw: string | Date | null): string => {
    if (!raw) return '–'

    // Postgres DATE alanı supabase-js ile her zaman "YYYY-MM-DD" döner.
    // TIMESTAMP ise "YYYY-MM-DDThh:mm:ss…". İki durumda da ilk 10 karakter güncel tarihi verir.
    if (typeof raw === 'string') {
      const isoTen = raw.slice(0,10)                 // "2025-06-24"
      const parts  = isoTen.split('-')               // ["2025","06","24"]
      if (parts.length === 3) return `${parts[2]}.${parts[1]}.${parts[0]}`
      // düşmezse new Date dene
      const d = new Date(raw)
      return isValid(d) ? format(d, 'dd.MM.yyyy') : '–'
    }

    // Already a Date instance
    return isValid(raw) ? format(raw as Date, 'dd.MM.yyyy') : '–'
  }

  /* ---------- JSX ----------------------------------------- */
  return (
    <main className="bg-white text-gray-800 px-4 py-10 min-h-screen flex flex-col items-center">
      <StepIndicator currentStep={4} />

      <h1 className="text-4xl font-bold mt-6 mb-2">Teşekkürler!</h1>

      <p className="mb-6 text-lg">
        <span className="font-semibold">Rezervasyon No:</span>{' '}
        <span className="font-extrabold tracking-wide text-primary">{bookingRef}</span>
      </p>

      <p className="mb-8 text-center max-w-md text-gray-700">
        Rezervasyon bilgileriniz <span className="font-semibold">{emailShown}</span> adresine gönderilmiştir.
      </p>

      {/* Özet tablosu */}
      <div className="w-full max-w-4xl overflow-x-auto mb-10">
        <table className="min-w-full text-sm border border-gray-200">
          <thead className="bg-gray-100 text-gray-700 whitespace-nowrap">
            <tr>
              <th className="px-3 py-2 text-left">Ürün</th>
              <th className="px-3 py-2">Tarih</th>
              <th className="px-3 py-2">Saat</th>
              <th className="px-3 py-2">Otel / Bölge</th>
              <th className="px-3 py-2">Kişi</th>
              <th className="px-3 py-2 text-right">Tutar</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} className="border-t text-gray-700 whitespace-nowrap">
                <td className="px-3 py-2">
                  {productMap[r.product_id]?.tur_adi ?? `Ürün #${r.product_id}`}
                </td>
                <td className="px-3 py-2 text-center">{fmtDate(r.tarih)}</td>
                <td className="px-3 py-2 text-center">{r.pickup_time?.slice(0,5) || '–'}</td>
                <td className="px-3 py-2">{r.otel_adi?.trim() || r.region || '–'}</td>
                <td className="px-3 py-2 text-center">
                  {r.adult_count}+{r.child_count}+{r.infant_count}
                </td>
                <td className="px-3 py-2 text-right">
                  {r.total.toFixed(2)} {currency}
                </td>
              </tr>
            ))}

            <tr className="font-semibold text-gray-800">
              <td colSpan={5} className="px-3 py-2 text-right">Genel Toplam</td>
              <td className="px-3 py-2 text-right">
                {grandTotal.toFixed(2)} {currency}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <Link href="/" className="btn-primary">Ana Sayfaya Dön</Link>
    </main>
  )
}
