/* ────────────────────────────────────────────────
   src/app/api/book/route.ts • Tekli rezervasyon
   (Eski akış için geriye‑uyumluluk)
──────────────────────────────────────────────── */

import { NextResponse } from 'next/server'
import { supabase }    from '@/lib/supabaseClient'

export async function POST(req: Request) {
  const form = await req.formData()

  /* 1) Form verilerini al */
  const product_id   = Number(form.get('product_id'))
  const fullName     = String(form.get('fullName'))
  const phone        = String(form.get('phone'))
  const email        = String(form.get('email'))
  const adult_count  = Number(form.get('adult_count'))
  const child_count  = Number(form.get('child_count'))
  const infant_count = Number(form.get('infant_count'))
  const tarih        = String(form.get('tarih'))

  /* pickup_time  ▼ (her iki anahtarı da destekle) */
  const rawTime =
    form.get('pickup_time') /* yeni ad  */ ??
    form.get('alinis_saati') /* eski ad */
  const pickup_time = rawTime ? String(rawTime) : null

  const otel_adi = String(form.get('otel_adi'))

  /* 2) Ürün fiyatlarını çek */
  const { data: prod, error: prodErr } = await supabase
    .from('urunler')
    .select('fiyat, price_child, price_infant')
    .eq('id', product_id)
    .single()

  if (prodErr || !prod) {
    return NextResponse.json(
      { ok: false, error: 'Ürün bulunamadı' },
      { status: 400 },
    )
  }

  /* 3) Otel pickup ek fiyatını çek */
  const { data: hotel } = await supabase
    .from('oteller')
    .select('pickup_ek_fiyat')
    .eq('ad', otel_adi)
    .single()

  const pickupFee = hotel?.pickup_ek_fiyat ?? 0

  /* 4) Toplam hesapla */
  const total =
    prod.fiyat        * adult_count +
    prod.price_child  * child_count +
    prod.price_infant * infant_count +
    pickupFee         * (adult_count + child_count + infant_count)

  /* 5) Rezervasyonu oluştur */
  const { data: booking, error } = await supabase
    .from('bookings')
    .insert({
      product_id,
      fullName,
      phone,
      email,
      adult_count,
      child_count,
      infant_count,
      tarih,          // YYYY‑MM‑DD (string)
      pickup_time,    // ← artık doğru kolon adı!
      otel_adi,
      total,
      status: 'pending_payment',
    })
    .select('id')
    .single()

  if (error || !booking) {
    console.error('Booking insert error:', error)
    return NextResponse.json(
      { ok: false, error: error?.message || 'DB hatası' },
      { status: 500 },
    )
  }

  /* 6) bookingId’yi dön */
  return NextResponse.json(
    { bookingId: booking.id },
    { status: 201 },
  )
}
