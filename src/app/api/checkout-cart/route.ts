/* ──────────────────────────────────────────────────────────────
   src/app/api/checkout-cart/route.ts
   – Sepeti Stripe’a aktarır + Supabase’e booking yazar
   (Ön onay e-postası kaldırıldı – mail yalnızca webhook’ta gönderilecek)
────────────────────────────────────────────────────────────── */
import { NextResponse }  from 'next/server'
import { stripe }        from '@/lib/stripe'
import { supabase }      from '@/lib/supabaseClient'
import { createClient }  from '@supabase/supabase-js'

/* admin client → RLS baypas */
const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,      // .env.local → SUPABASE_SERVICE_KEY=...
  { auth: { persistSession: false } },
)

export async function POST(req: Request) {
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
      mode                : 'payment',
      client_reference_id : bookingRef,
      payment_method_types: ['card'],
      line_items,
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?ref=${bookingRef}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url : `${process.env.NEXT_PUBLIC_SITE_URL}/cart`,
    })

    /* ---------- 4. Booking tablolarına yaz ---------- */
    const insertRows = items.map((it: any) => {
      const qty   = Number(it.quantity || 1)
      const price = Number(it.amount) / 100  // fils → AED

      const tarihFix  = typeof it.tarih === 'string'
        ? it.tarih.slice(0, 10) : it.tarih ?? null

      const pickupFix = typeof it.pickup_time === 'string'
        ? it.pickup_time.trim() : it.pickup_time ?? null

      return {
        booking_ref : bookingRef,
        product_id  : it.id,
        fullName    : it.fullName   ?? '',
        phone       : it.phone      ?? '',
        email       : it.email      ?? '',
        adult_count : it.adult      ?? 0,
        child_count : it.child      ?? 0,
        infant_count: it.infant     ?? 0,
        tarih       : tarihFix,
        pickup_time : pickupFix,
        otel_adi    : it.otel ?? it.hotel ?? '',
        region      : it.region     ?? '',
        child_ages  : it.childAges  ?? [],
        total       : price * qty,
        payment_id  : session.id,
        status      : 'pending_payment',
      }
    })

    const { error: dbErr } = await admin.from('bookings').insert(insertRows)
    if (dbErr) {
      console.error('❌ Supabase insert error:', dbErr)
      return NextResponse.json({ error: 'DB insert failed' }, { status: 500 })
    }

    /* ---------- 5. Başarılı yanıt ---------- */
    return NextResponse.json({ url: session.url, bookingRef }, { status: 200 })
  } catch (err) {
    console.error('❌ checkout-cart error:', err)
    return NextResponse.json(
      { error: 'Sunucu hatası, lütfen tekrar deneyin.' },
      { status: 500 },
    )
  }
}
