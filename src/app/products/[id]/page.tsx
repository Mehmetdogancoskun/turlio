// src/app/products/[id]/page.tsx
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import StepIndicator from '@/components/StepIndicator';
import BackToHomeButton from '@/components/BackToHomeButton';

interface Product {
  id: number;
  tur_adi: string;
  gorsel_url: string | null;
  aciklama: string | null;
  dahil_olanlar: string | null;
  haric_olanlar: string | null;
  fiyat: number;
  para_birimi: string;
}

export default async function ProductPage({
  params,
}: {
  params: { id: string };
}) {
  const productId = Number(params.id);

  /* ───────── Supabase sorgusu ───────── */
  const { data: product, error } = await supabase
    .from<Product>('urunler')
    .select('*')
    .eq('id', productId)
    .single();

  if (error || !product) {
    return (
      <main className="bg-gray-900 min-h-screen text-white p-10 flex flex-col items-center">
        <BackToHomeButton />
        <p className="mt-6">Ürün bulunamadı.</p>
      </main>
    );
  }

  /* ───────── JSX ───────── */
  return (
    <main className="bg-gray-900 min-h-screen text-white py-10 px-4">
      {/* Adım göstergesi + geri butonu */}
      <div className="max-w-4xl mx-auto">
        <StepIndicator currentStep={1} />
        <div className="mt-4 mb-6">
          <BackToHomeButton />
        </div>

        {/* Başlık */}
        <h1 className="text-4xl font-bold mb-6">{product.tur_adi}</h1>

        {/* Görsel – sabit oran + sınırlı genişlik */}
        {product.gorsel_url ? (
          <div className="relative w-full overflow-hidden aspect-[4/3] rounded-lg mb-6">
            <Image
              src={product.gorsel_url}
              alt={product.tur_adi}
              fill
              sizes="(max-width:768px) 100vw, 768px"
              className="object-cover"
              priority
            />
          </div>
        ) : (
          <div className="flex items-center justify-center bg-gray-800 aspect-[4/3] rounded-lg mb-6">
            <span className="text-gray-400">Görsel yok</span>
          </div>
        )}

        {/* İçerik sütunu */}
        <div className="space-y-6">
          {/* Açıklama */}
          {product.aciklama && (
            <p className="whitespace-pre-line">{product.aciklama}</p>
          )}

          {/* Dahil / Hariç listeleri */}
          {product.dahil_olanlar && (
            <>
              <h2 className="text-2xl font-semibold">Neler Dahil</h2>
              <p className="whitespace-pre-line">{product.dahil_olanlar}</p>
            </>
          )}

          {product.haric_olanlar && (
            <>
              <h2 className="text-2xl font-semibold">Neler Hariç</h2>
              <p className="whitespace-pre-line">{product.haric_olanlar}</p>
            </>
          )}

          {/* Fiyat */}
          <p className="text-xl font-bold">
            Fiyat: {product.fiyat.toFixed(2)} {product.para_birimi}
          </p>

          {/* Rezervasyon butonu */}
          <Link
            href={`/reservation/${product.id}`}
            className="block bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded text-center transition"
          >
            Rezervasyon Yap
          </Link>
        </div>
      </div>
    </main>
  );
}
