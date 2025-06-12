import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabaseClient';   // ← Bu satırı mutlaka ekleyin

export async function POST(req: Request) {
  const { items } = await req.json();
  if (!items?.length) {
    return NextResponse.json({ error: 'Sepet boş' }, { status: 400 });
  }

  // 1) booking_ref üret
  const { data: seqData, error: seqErr } = await supabase.rpc('next_booking_seq');
  if (seqErr || seqData == null) {
    return NextResponse.json({ error: 'Sıra numarası alınamadı' }, { status: 500 });
  }
  const seq = seqData as number;
  const bookingRef = `${new Date().getFullYear()}-${String(seq).padStart(6,'0')}`;

  // 2) Stripe Session
  const line_items = items.map((it: any) => ({
    price_data: {
      currency: 'aed',
      product_data: { name: it.tur_adi },
      unit_amount: Math.round(it.fiyat * 100),
    },
    quantity: it.quantity,
  }));
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    client_reference_id: bookingRef,
    payment_method_types: ['card'],
    line_items,
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?ref=${bookingRef}`,
    cancel_url:  `${process.env.NEXT_PUBLIC_SITE_URL}/cart`,
  });

  // 3) Booking kaydı
  const insertRows = items.map((it: any) => ({
    booking_ref:  bookingRef,
    product_id:   it.id,
    fullName:     it.fullName  || '',
    phone:        it.phone     || '',
    email:        it.email     || '',
    adult_count:  it.adult     || 0,
    child_count:  it.child     || 0,
    infant_count: it.infant    || 0,
    tarih:        it.tarih     || '',
    pickup_time:  it.pickup_time || null,
    otel_adi:     it.otel      || '',
    region:       it.region    || '',
    child_ages:   it.child_ages || [],
    total:        it.fiyat,
    payment_id:   session.id,
    status:       'pending_payment',
  }));
  await supabase.from('bookings').insert(insertRows);

  return NextResponse.json({ url: session.url, bookingRef });
}