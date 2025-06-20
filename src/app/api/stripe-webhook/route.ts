export const runtime = 'nodejs'
console.log('🔥 stripe-webhook ROUTE NodeJS’te başladı')

console.log('🔥 stripe-webhook ROUTE ÇAĞRILDI');

import { NextResponse } from 'next/server'
import { stripe }       from '@/lib/stripe'
import { supabase }     from '@/lib/supabaseClient'
import { sendEmail }    from '@/lib/sendEmail'
import { createClient } from '@supabase/supabase-js'
import type StripeType  from 'stripe'

/* ───────── Admin bağlantı (RLS’i baypas) ───────── */
const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,          // .env.local → SUPABASE_SERVICE_KEY=...
  { auth: { persistSession: false } },
)

export async function POST (req: Request) {
  /* ───────── 0) Stripe imza doğrulama ───────── */
  const sig = req.headers.get('stripe-signature')!
  const buf = await req.arrayBuffer()

  let event: StripeType.Event
  try {
    event = stripe.webhooks.constructEvent(
      Buffer.from(buf),
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    )
  } catch (err) {
    console.error('Webhook imza hatası:', err)
    return NextResponse.json({}, { status: 400 })
  }

  if (event.type !== 'checkout.session.completed') {
    return NextResponse.json({ received: true })
  }

  const session    = event.data.object as StripeType.Checkout.Session
  const bookingRef = session.client_reference_id || '—'

  /* ───────── 1) Rezervasyon satırlarını güncelle ───────── */
  const { data: rows, error: upErr } = await admin
    .from('bookings')
    .update({ status: 'paid' })
    .eq('booking_ref', bookingRef)
    .select('*')

  console.log('🔍 bookingRef =', bookingRef, 'rows =', rows?.length, upErr || '')

  if (upErr) {
    console.error('❌ Supabase update hatası:', upErr)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
  if (!rows || rows.length === 0) {
    console.warn('⚠️ booking_ref ile eşleşen satır yok:', bookingRef)
    return NextResponse.json({ ok: true })
  }

  /* ───────── 2) Ürün bilgileri ───────── */
  const ids = [...new Set(rows.map(r => r.product_id))]
  const { data: prods } = await admin
    .from('urunler')
    .select('id, tur_adi, para_birimi')
    .in('id', ids)

  const prodMap: Record<number, { name: string; cur: string }> = {}
  prods?.forEach(p => (prodMap[p.id] = { name: p.tur_adi, cur: p.para_birimi }))

  const currency = prods?.[0]?.para_birimi || 'AED'
  const fmtDate  = (d?: string | null) =>
    d ? new Date(d).toLocaleDateString('tr-TR') : '-'

  /* ───────── 3) Mail HTML’i ───────── */
  const rowsHtml = rows
    .map(r => {
      const p    = prodMap[r.product_id]
      const name = p?.name || `Ürün #${r.product_id}`
      const cur  = p?.cur  || currency
      const kisi = `${r.adult_count}+${r.child_count}+${r.infant_count}`
      const saat = r.pickup_time || '-'
      const otel = r.otel_adi?.trim() || r.region || '-'

      return `
        <tr>
          <td>${name}</td>
          <td align="center">${fmtDate(r.tarih)}</td>
          <td align="center">${saat}</td>
          <td>${otel}</td>
          <td align="center">${kisi}</td>
          <td align="right">${r.total.toFixed(2)} ${cur}</td>
        </tr>`
    })
    .join('')

  const grand = rows.reduce((s, r) => s + r.total, 0).toFixed(2)

  const html = `
    <h2 style="margin:0 0 12px">Rezervasyon Onayı – ${bookingRef}</h2>
    <p>Sayın <strong>${rows[0].fullName || 'Misafir'}</strong>, ödemeniz başarıyla alınmıştır.</p>

    <table border="1" cellpadding="6" style="border-collapse:collapse;font-size:14px;margin:16px 0">
      <thead>
        <tr style="background:#f0f0f0">
          <th>Ürün</th><th>Tarih</th><th>Saat</th><th>Otel/Bölge</th><th>Y+Ç+B</th><th>Tutar</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
        <tr style="background:#f9f9f9">
          <td colspan="5" align="right"><b>Genel Toplam</b></td>
          <td align="right"><b>${grand} ${currency}</b></td>
        </tr>
      </tbody>
    </table>

    <p>Rezervasyon kodu: <strong>${bookingRef}</strong></p>
    <p style="margin-top:24px">Turlio ekibi iyi geziler diler!</p>
  `;

  /* ───────── 4) Mail gönder ───────── */
  try {
    await sendEmail({
      to     : rows[0].email,
      subject: `Turlio Rezervasyon Onayı – ${bookingRef}`,
      html,
    })
    console.log('📧 Ödeme sonrası onay e-postası gönderildi:', bookingRef)
  } catch (mailErr) {
    console.error('❌ E-posta gönderilemedi:', mailErr)
  }

  return NextResponse.json({ ok: true })
}
