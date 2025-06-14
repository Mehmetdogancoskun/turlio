import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabaseClient';
import { sendEmail } from '@/lib/sendEmail';

export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature')!;
  const buf = await req.arrayBuffer();

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      Buffer.from(buf),
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook imza hatası:', err);
    return NextResponse.json({}, { status: 400 });
  }

  if (event.type !== 'checkout.session.completed') {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const bookingRef = session.client_reference_id!;

  /* 1) Booking satırlarını güncelle (‘paid’) + oku */
  const { data: rows } = await supabase
    .from('bookings')
    .update({ status: 'paid' })
    .eq('booking_ref', bookingRef)
    .select('*');

  if (!rows || rows.length === 0) return NextResponse.json({ ok: true });

  /* 2) Ürün adlarını topla */
  const ids = [...new Set(rows.map(r => r.product_id))];
  const { data: prods } = await supabase
    .from('urunler')
    .select('id, tur_adi, para_birimi')
    .in('id', ids);

  const map: Record<number, string> = {};
  prods?.forEach(p => (map[p.id] = p.tur_adi));

  /* 3) E-posta HTML’i hazırla */
  const currency = prods?.[0]?.para_birimi || 'AED';
  const rowsHtml = rows
    .map(
      r => `<tr>
        <td>${map[r.product_id] || 'Ürün #' + r.product_id}</td>
        <td style="text-align:center">${r.tarih || '-'}</td>
        <td style="text-align:center">${r.adult_count}+${r.child_count}+${r.infant_count}</td>
        <td style="text-align:right">${r.total.toFixed(2)}&nbsp;${currency}</td>
      </tr>`
    )
    .join('');

  const grand = rows.reduce((s, r) => s + r.total, 0).toFixed(2);

  const html = `
    <h2>Rezervasyon Onayı – ${bookingRef}</h2>
    <p>Sayın ${rows[0].fullName}, ödeme işleminiz başarıyla alınmıştır.</p>
    <table border="1" cellpadding="6" style="border-collapse:collapse">
      <thead>
        <tr style="background:#eee">
          <th>Ürün</th><th>Tarih</th><th>Kişi</th><th>Tutar</th>
        </tr>
      </thead>
      <tbody>${rowsHtml}
        <tr>
          <td colspan="3" style="text-align:right"><b>Genel Toplam</b></td>
          <td style="text-align:right"><b>${grand}&nbsp;${currency}</b></td>
        </tr>
      </tbody>
    </table>
    <p>Rezervasyon numaranız: <b>${bookingRef}</b></p>
    <p>Turlio ekibi iyi geziler diler!</p>
  `;

  /* 4) Mail gönder */
  await sendEmail({
    to: rows[0].email,
    subject: `Turlio Rezervasyon Onayı – ${bookingRef}`,
    html,
  });

  return NextResponse.json({ ok: true });
}
