/* Veriyi getirir + sayfa içeriğini çizer
   Server Component olduğu için “use client” yok                  */

import Image       from 'next/image';
import Link        from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import StepIndicator from '@/components/StepIndicator';

interface Product {
  id: number;
  tur_adi: string;
  gorsel_url: string | null;
  aciklama: string;
  dahil_olanlar: string;
  haric_olanlar: string;
  fiyat: number;
  para_birimi: string;
}

export default async function ProductBody({ productId }: { productId: number }) {
  /* 1) Supabase’ten ürünü çek (SSR) */
  const { data: product, error } = await supabase
    .from<Product>('urunler')
    .select('*')
    .eq('id', productId)
    .single();

  if (error || !product) {
    return (
      <p className="text-center text-red-600 py-20">
        Ürün bulunamadı / sunucu hatası.
      </p>
    );
  }

  /* 2) Görünüm */
  return (
    <>
      {/* Adım göstergesi */}
      <StepIndicator currentStep={1} />

      {/* Başlık */}
      <h1 className="text-3xl md:text-4xl font-heading font-bold mb-6">
        {product.tur_adi}
      </h1>

      {/* Görsel */}
      {product.gorsel_url ? (
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg shadow">
          <Image
            src={product.gorsel_url}
            alt={product.tur_adi}
            fill
            sizes="(max-width:640px) 100vw, 50vw"
            className="object-cover"
            priority
          />
        </div>
      ) : (
        <div className="aspect-[4/3] flex items-center justify-center rounded-lg bg-gray-200 text-gray-500">
          Görsel yok
        </div>
      )}

      {/* Açıklama */}
      <section className="prose prose-slate max-w-none dark:prose-invert mt-8">
        <p>{product.aciklama}</p>

        <h2>Neler Dahil?</h2>
        <p>{product.dahil_olanlar}</p>

        <h2>Neler Hariç?</h2>
        <p>{product.haric_olanlar}</p>
      </section>

      {/* Fiyat + CTA */}
      <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <p className="text-2xl font-bold text-primary">
          {product.fiyat.toFixed(2)} {product.para_birimi}
        </p>

        <Link
          href={`/reservation/${product.id}`}
          className="btn-primary text-center sm:w-auto"
        >
          Rezervasyon Yap
        </Link>
      </div>
    </>
  );
}
