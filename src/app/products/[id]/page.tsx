// src/app/products/[id]/page.tsx
import { supabase } from '@/lib/supabaseClient';
import StepIndicator from '@/components/StepIndicator';
import BackToHomeButton from '@/components/BackToHomeButton';
import Link from 'next/link';

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

export default async function ProductPage({ params }: { params: { id: string } }) {
  const productId = Number(params.id);
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

  return (
    <main className="bg-gray-900 min-h-screen text-white p-10">
      {/* Adım 1 Gösterge */}
      <StepIndicator currentStep={1} />

      {/* Ana Sayfa Butonu */}
      <div className="mt-4 mb-6">
        <BackToHomeButton />
      </div>

      {/* Başlık */}
      <h1 className="text-4xl font-bold mb-6">{product.tur_adi}</h1>

      {/* Görsel */}
      {product.gorsel_url && (
        <img
          src={product.gorsel_url}
          alt={product.tur_adi}
          className="w-full max-h-[400px] object-cover rounded mb-6"
        />
      )}

      {/* Açıklama */}
      <p className="mb-4 whitespace-pre-line">{product.aciklama}</p>

      {/* Dahil / Hariç */}
      <h2 className="text-2xl font-semibold mb-2">Neler Dahil</h2>
      <p className="mb-4 whitespace-pre-line">{product.dahil_olanlar}</p>
      <h2 className="text-2xl font-semibold mb-2">Neler Hariç</h2>
      <p className="mb-6 whitespace-pre-line">{product.haric_olanlar}</p>

      {/* Fiyat */}
      <p className="text-xl font-bold mb-8">
        Fiyat: {product.fiyat.toFixed(2)} {product.para_birimi}
      </p>

      {/* Rezervasyon Sayfasına Git */}
      <Link
        href={`/reservation/${product.id}`}
        className="block bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded text-center transition"
      >
        Rezervasyon Yap
      </Link>
    </main>
  );
}
