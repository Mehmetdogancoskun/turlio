/* ──────────────────────────────────────────────────────────────
   src/app/api/checkout-cart/route.ts
   –  Sepeti Stripe’a aktarır + Supabase’e booking yazar
────────────────────────────────────────────────────────────── */
import { NextResponse }      from 'next/server'
import { stripe }            from '@/lib/stripe'
import { supabase }          from '@/lib/supabaseClient'
import { sendEmail }         from '@/lib/sendEmail'
import type { EmailContent } from '@/lib/sendEmail'

export async function POST (req: Request) {
  try {
    /* ---------- 1. Gövde kontrolü ---------- */
    const { items } = await req.json()
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Sepet boş' }, { status: 400 })
    }

    /* ---------- 2. booking_ref üret ---------- */
    const { data: seq, error: seqErr } = await supabase.rpc('next_booking_seq')
    if (seqErr || seq == null) {
      
      return NextResponse.json({ error: 'Sıra numarası alınamadı' }, { status: 500 })
    }
    const bookingRef = `${new Date().getFullYear()}-${String(seq).padStart(6, '0')}`

    /* ---------- 3. Stripe line_items ---------- */
    const line_items = items.map((it: any) => ({
      price_data: {
        currency    : it.currency || 'aed',
        product_data: { name: it.name || `Ürün #${it.id}` },
        unit_amount : Number(it.amount),
      },
      quantity: Number(it.quantity || 1),
    }))

    const session = await stripe.checkout.sessions.create({
      mode                 : 'payment',
      client_reference_id  : bookingRef,
      payment_method_types : ['card'],
      line_items,
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?ref=${bookingRef}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url : `${process.env.NEXT_PUBLIC_SITE_URL}/cart`,
    })

    /* ---------- 4. Booking tablolarına yaz ---------- */
    const insertRows = items.map((it: any) => {
      const qty   = Number(it.quantity || 1)
      const price = Number(it.amount) / 100  // fils → dirhem

      // 👇 burada hem it.tarih hem it.date baktık, pickup_time da aynı şekilde
      const rawDate = it.tarih ?? it.date ?? null
      const tarihToInsert = typeof rawDate === 'string'
        ? rawDate.slice(0,10)  // "2025-06-24T.." → "2025-06-24"
        : rawDate

      const rawPickup = it.pickup_time ?? it.pickup ?? null
      const pickupToInsert = typeof rawPickup === 'string'
        ? rawPickup.trim()
        : null

      return {
        booking_ref : bookingRef,
        product_id  : it.id,
        fullName    : it.fullName   ?? '',
        phone       : it.phone      ?? '',
        email       : it.email      ?? '',
        adult_count : it.adult      ?? 0,
        child_count : it.child      ?? 0,
        infant_count: it.infant     ?? 0,
        tarih       : tarihToInsert,      // ← düzeltildi
        pickup_time : pickupToInsert,     // ← düzeltildi
        otel_adi    : it.otel      ?? it.hotel  ?? '',
        region      : it.region     ?? '',
        child_ages  : it.childAges  ?? [],
        total       : price * qty,
        payment_id  : session.id,
        status      : 'pending_payment',
      }
    })

    const { error: dbErr } = await supabase.from('bookings').insert(insertRows)
    if (dbErr) {
      console.error('❌ Supabase insert error:', dbErr)
      return NextResponse.json({ error: 'DB insert failed' }, { status: 500 })
    }
    
    /* 5) E-postayı gönder (ve logla) */
    try {
      const first = insertRows[0]
      const grandTotal = insertRows.reduce((sum, r) => sum + r.total, 0).toFixed(2)
      const emailPayload: EmailContent = {
        to     : first.email!,
        subject: `Turlio Rezervasyon Onayı • ${bookingRef}`,
        html   : `
          <h2>Rezervasyonunuz alındı 🎉</h2>
          <p>Sayın <strong>${first.fullName}</strong>,</p>
          <p>Aşağıdaki rezervasyon(lar)ınız başarıyla oluşturuldu.</p>
          <ul>
            ${insertRows.map(r => `<li>${r.product_id} – ${r.total.toFixed(2)} AED</li>`).join('')}
          </ul>
          <p><strong>Genel Toplam: ${grandTotal} AED</strong></p>
          <p>Rezervasyon Kodu: <strong>${bookingRef}</strong></p>
        `,
      }
      console.log('📧 Sending confirmation email to', first.email)
      await sendEmail(emailPayload)
      console.log('📧 Confirmation email sent successfully')
    } catch (mailErr) {
      console.error('❌ Mail gönderilemedi:', mailErr)      // ✔️ oluşan hatayı console’a bas
    }

    /* ---------- 5. Başarılı yanıt ---------- */
    return NextResponse.json({ url: session.url, bookingRef }, { status: 200 })

  } catch (err) {
    console.error('❌ checkout-cart error:', err)
    return NextResponse.json(
      { error: 'Sunucu hatası, lütfen tekrar deneyin.' },
      { status: 500 }
    )
  }
}
