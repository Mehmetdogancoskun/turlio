import { NextResponse }          from 'next/server';
import { stripe }                from '@/lib/stripe';
import { supabase }              from '@/lib/supabaseClient';
import { sendEmail }             from '@/lib/sendEmail';          // 🆕  e-posta yardımcı fonksiyonu
import type { EmailContent }     from '@/lib/sendEmail';

/**
 * POST /api/checkout-cart
 * Body: { items:[{…}] }
 * Döner: { url, bookingRef }
 */
export async function POST(req: Request) {
  try {
    /* ------------------------------------------------------------------ */
    const { items } = await req.json();
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Sepet boş' }, { status: 400 });
    }

    /* 1) booking_ref üret ------------------------------------------------ */
    const { data: seqData, error: seqErr } = await supabase.rpc('next_booking_seq');
    if (seqErr || seqData == null) {
      console.error('Supabase sıra hatası:', seqErr);
      return NextResponse.json({ error: 'Sıra numarası alınamadı' }, { status: 500 });
    }
    const bookingRef = `${new Date().getFullYear()}-${String(seqData).padStart(6, '0')}`;

    /* 2) Stripe line_items ---------------------------------------------- */
    const line_items = items.map((it: any) => ({
      price_data: {
        currency: 'aed',
        product_data: { name: it.tur_adi },
        unit_amount: Math.round(Number(it.unitPrice ?? it.fiyat) * 100), // fils
      },
      quantity: Number(it.quantity ?? 1),
    }));

    /* 3) Stripe Checkout Session --------------------------------------- */
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      client_reference_id: bookingRef,
      payment_method_types: ['card'],
      line_items,
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?ref=${bookingRef}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${process.env.NEXT_PUBLIC_SITE_URL}/cart`,
    });

    console.log('▶️ SUCCESS_URL:', session.success_url);

    /* 4) Booking kayıtları --------------------------------------------- */
    const insertRows = items.map((it: any) => {
      const qty   = Number(it.quantity ?? 1);
      const price = Number(it.unitPrice ?? it.fiyat);
      return {
        booking_ref:  bookingRef,
        product_id:   it.id,
        fullName:     it.fullName   ?? '',
        phone:        it.phone      ?? '',
        email:        it.email      ?? '',
        adult_count:  it.adult      ?? 0,
        child_count:  it.child      ?? 0,
        infant_count: it.infant     ?? 0,
        tarih:        it.tarih      || null,
        pickup_time:  it.pickup_time|| null,
        otel_adi:     it.otel       ?? '',
        region:       it.region     ?? '',
        child_ages:   it.child_ages ?? [],
        total:        price * qty,                  // satır toplamı
        payment_id:   session.id,
        status:       'pending_payment',
      };
    });

    const { error: insertErr } = await supabase.from('bookings').insert(insertRows);
    if (insertErr) {
      console.error('❌ INSERT ERROR:', insertErr);
      return NextResponse.json({ error: 'DB insert failed' }, { status: 500 });
    }

    /* 5) Müşteriye e-posta gönder -------------------------------------- */
    try {
      const first = insertRows[0];
      const grandTotal = insertRows.reduce((s, r) => s + r.total, 0).toFixed(2);

      const email: EmailContent = {
        to: first.email,
        subject: `Turlio Rezervasyon Onayı • ${bookingRef}`,
        html: `
          <h2>Rezervasyonunuz alındı 🎉</h2>
          <p>Sayın <strong>${first.fullName || 'Müşterimiz'}</strong>,</p>
          <p>Aşağıdaki rezervasyon(lar)ınız başarıyla oluşturuldu.</p>

          <table style="border-collapse:collapse">
            <thead>
              <tr><th align="left">Ürün</th><th>Adet</th><th align="right">Tutar (AED)</th></tr>
            </thead>
            <tbody>
              ${insertRows.map(r => `
                <tr>
                  <td>${items.find((it:any)=>it.id===r.product_id)?.tur_adi}</td>
                  <td align="center">${r.adult_count + r.child_count + r.infant_count}</td>
                  <td align="right">${r.total.toFixed(2)}</td>
                </tr>
              `).join('')}
              <tr><td colspan="2" align="right"><strong>Genel Toplam</strong></td>
                  <td align="right"><strong>${grandTotal}</strong></td></tr>
            </tbody>
          </table>

          <p>Referans Kodu: <strong>${bookingRef}</strong></p>
          <p>Herhangi bir sorunuz olursa <a href="mailto:info@turlio.com">info@turlio.com</a> üzerinden bize ulaşabilirsiniz.</p>
          <p>Keyifli geziler dileriz!<br>Turlio Ekibi</p>
        `,
      };
      await sendEmail(email);
      console.log('📧  Rezervasyon e-postası gönderildi:', first.email);
    } catch (mailErr) {
      // e-posta hatası rezervasyonu bozmasın, sadece logla
      console.error('📧 Mail gönderilemedi:', mailErr);
    }

    /* 6) Yanıt ---------------------------------------------------------- */
    return NextResponse.json({ url: session.url, bookingRef }, { status: 200 });

  } catch (err) {
    console.error('❌ checkout-cart error:', err);
    return NextResponse.json(
      { error: 'Sunucu hatası, lütfen tekrar deneyin.' },
      { status: 500 }
    );
  }
}
