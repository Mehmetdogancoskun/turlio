// src/app/api/book/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req: Request) {
  const form = await req.formData();

  // 1) Form verilerini al
  const product_id   = Number(form.get('product_id'));
  const fullName     = String(form.get('fullName'));
  const phone        = String(form.get('phone'));
  const email        = String(form.get('email'));
  const adult_count  = Number(form.get('adult_count'));
  const child_count  = Number(form.get('child_count'));
  const infant_count = Number(form.get('infant_count'));
  const tarih        = String(form.get('tarih'));
  // rawTime form’da boşsa null olsun; yoksa string
  const rawTime      = form.get('alinis_saati');
  const alinis_saati = rawTime ? String(rawTime) : null;
  const otel_adi     = String(form.get('otel_adi'));

  // 2) Ürün fiyatını çek
  const { data: prod } = await supabase
    .from('urunler')
    .select('fiyat, price_child, price_infant')
    .eq('id', product_id)
    .single();
  if (!prod) {
    return NextResponse.json({ ok: false, error: 'Ürün bulunamadı' }, { status: 400 });
  }

  // 3) Otel pickup ek fiyatını çek
  const { data: hotel } = await supabase
    .from('oteller')
    .select('pickup_ek_fiyat')
    .eq('ad', otel_adi)
    .single();
  const pickupPrice = hotel?.pickup_ek_fiyat ?? 0;

  // 4) Toplam hesaplama
  const total =
    prod.fiyat * adult_count +
    prod.price_child * child_count +
    prod.price_infant * infant_count +
    pickupPrice * (adult_count + child_count + infant_count);

  // 5) Rezervasyonu oluştur
  const { data, error } = await supabase
    .from('bookings')
    .insert({
      product_id,
      fullName,
      phone,
      email,
      adult_count,
      child_count,
      infant_count,
      tarih,
      alinis_saati,       // artık doğru türde: string veya null :contentReference[oaicite:2]{index=2}
      otel_adi,
      total,
      status: 'pending_payment',
    })
    .select('id')
    .single();

  if (error || !data) {
    console.error('Booking insert error:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  // 6) bookingId’yi dön
  return NextResponse.json({ bookingId: data.id }, { status: 201 });
}
