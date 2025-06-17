import { NextResponse } from 'next/server'
import { stripe }       from '@/lib/stripe'
import { supabase }     from '@/lib/supabaseClient'
import { sendEmail }    from '@/lib/sendEmail'
import type StripeType  from 'stripe'

export async function POST(req: Request) {
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

  const session        = event.data.object as StripeType.Checkout.Session
  const bookingRef     = session.client_reference_id!

  /* ───────── 1) Rezervasyon satırlarını “paid” yap ───────── */
  const { data: rows } = await supabase
    .from('bookings')
    .update({ status: 'paid' })
    .eq('booking_ref', bookingRef)
    .select('*')

  if (!rows || rows.length === 0) return NextResponse.json({ ok: true })

  /* ───────── 2) Ürün bilgilerini getir ───────── */
  const ids = [...new Set(rows.map(r => r.product_id))]
  const { data: prods } = await supabase
    .from('urunler')
    .select('id, tur_adi, para_birimi')
    .in('id', ids)

  const prodMap: Record<number, { name: string; cur: string }> = {}
  prods?.forEach(p => (prodMap[p.id] = { name: p.tur_adi, cur: p.para_birimi }))

  const currency  = prods?.[0]?.para_birimi || 'AED'
  const fmt = (d?: string | null) =>
    d ? new Date(d).toLocaleDateString('tr-TR') : '-'

  /* ───────── 3) Ayrıntılı tablo HTML’i ───────── */
  const rowsHtml = rows
    .map(r => {
      const p     = prodMap[r.product_id]
      const name  = p?.name || `Ürün #${r.product_id}`
      const cur   = p?.cur  || currency
      const kisi  = `${r.adult_count}+${r.child_count}+${r.infant_count}`
      const saat  = r.pickup_time || '-'
      const otel  = r.otel_adi?.trim() || r.region || '-'

      return `
        <tr>
          <td>${name}</td>
          <td style="text-align:center">${fmt(r.tarih)}</td>
          <td style="text-align:center">${saat}</td>
          <td>${otel}</td>
          <td style="text-align:center">${kisi}</td>
          <td style="text-align:right">${r.total.toFixed(2)} ${cur}</td>
        </tr>
      `
    })
    .join('')

  const grandTotal = rows.reduce((s, r) => s + r.total, 0).toFixed(2)

  const html = `
    <h2 style="margin:0 0 12px 0">Rezervasyon Onayı – ${bookingRef}</h2>
    <p>
      Sayın <strong>${rows[0].fullName || 'Misafir'}</strong>,<br/>
      Ödemeniz başarıyla alınmıştır. Aşağıda onaylanan rezervasyon(lar)ınızın
      ayrıntıları bulunmaktadır.
    </p>

    <table border="1" cellpadding="6" style="border-collapse:collapse;font-size:14px;margin:16px 0">
      <thead>
        <tr style="background:#f0f0f0">
          <th>Ürün</th><th>Tarih</th><th>Saat</th><th>Otel/Bölge</th><th>Kişi<br/>(Y/Ç/B)</th><th>Tutar</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
        <tr style="background:#f9f9f9">
          <td colspan="5" style="text-align:right"><b>Genel Toplam</b></td>
          <td style="text-align:right"><b>${grandTotal} ${currency}</b></td>
        </tr>
      </tbody>
    </table>

    <p>
      Rezervasyon numaranız: <strong>${bookingRef}</strong><br/>
      Herhangi bir sorunuz olursa bu numara ile bize ulaşabilirsiniz.
    </p>

    <p style="margin-top:24px">Turlio ekibi iyi geziler diler!</p>
  `

  /* ───────── 4) Mail gönder ───────── */
  try {
    await sendEmail({
      to     : rows[0].email,
      subject: `Turlio Rezervasyon Onayı – ${bookingRef}`,
      html,
    })
    console.log('📧 Ödeme sonrası onay e‑postası gönderildi:', bookingRef)
  } catch (mailErr) {
    console.error('❌ E‑posta gönderilemedi:', mailErr)
    /* Mail hatası ana akışı bozmaz */
  }

  return NextResponse.json({ ok: true })
}
