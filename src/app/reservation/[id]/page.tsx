// src/app/reservation/[id]/page.tsx
import { supabase } from '@/lib/supabaseClient';
import StepIndicator from '@/components/StepIndicator';
import BackToHomeButton from '@/components/BackToHomeButton';
import RezervasyonForm from '@/components/RezervasyonForm';

interface Product {
  id: number;
  tur_adi: string;
  para_birimi: string;
  fiyat: number;
  price_child: number | null;
  price_infant: number | null;
  sub_category: string | null;   // ← eklendi
}

export default async function ReservationPage({
  params,
}: {
  params: { id: string };
}) {
  const productId = Number(params.id);

  const { data: product, error } = await supabase
    .from<Product>('urunler')
    .select(
      'id,tur_adi,fiyat,para_birimi,price_child,price_infant,sub_category' // ← sub_category eklendi
    )
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

  product.price_child  = product.price_child  ?? 0;
  product.price_infant = product.price_infant ?? 0;

  return (
    <main className="bg-gray-900 min-h-screen text-white p-10">
      <StepIndicator currentStep={1} />

      <div className="mt-4 mb-6">
        <BackToHomeButton />
      </div>

      <h1 className="text-3xl font-bold mb-4">{product.tur_adi}</h1>
      <p className="text-xl mb-8">
        Yetişkin: {product.fiyat.toFixed(2)} {product.para_birimi} |{' '}
        Çocuk: {product.price_child.toFixed(2)} {product.para_birimi} |{' '}
        Bebek: {product.price_infant.toFixed(2)} {product.para_birimi}
      </p>

      {/* Client-side Rezervasyon Formu */}
      <RezervasyonForm
        product={product}
        subCategory={product.sub_category ?? ''}
      />
    </main>
  );
}