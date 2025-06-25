/* Veriyi getirir + BookingForm’u çağırır               */

import Image        from 'next/image'
import { notFound } from 'next/navigation'
import StepIndicator from '@/components/StepIndicator'
import { supabase }  from '@/lib/supabaseClient'
import BookingForm   from './BookingForm'   //  ✅ yeni

interface Product {
  id: number
  tur_adi: string
  gorsel_url: string | null
  aciklama: string
  dahil_olanlar: string
  haric_olanlar: string
  fiyat: number
  para_birimi: string
  sub_category: string | null
}

export const revalidate = 60  // ISR

export default async function ProductBody({ productId }: { productId: number }) {
  /* 1) Ürünü çek */
  const { data: product, error } = await supabase
    .from<Product>('urunler')
    .select('*')
    .eq('id', productId)
    .single()

  if (error || !product) notFound()

  /* 2) JSX */
  return (
    <>
      <StepIndicator currentStep={1} />

      <h1 className="mb-6 text-3xl md:text-4xl font-heading font-bold">
        {product.tur_adi}
      </h1>

      {/* görsel */}
      <div className="relative aspect-[4/3] w-full rounded-lg shadow overflow-hidden">
        {product.gorsel_url ? (
          <Image
            src={product.gorsel_url}
            alt={product.tur_adi}
            fill
            sizes="(max-width:640px) 100vw, 50vw"
            className="object-cover"
            priority
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-200 text-gray-500">
            Görsel yok
          </div>
        )}
      </div>

      {/* açıklamalar */}
      <section className="prose prose-slate dark:prose-invert max-w-none mt-8">
        <p>{product.aciklama}</p>
        <h2>Neler Dahil?</h2>
        <p>{product.dahil_olanlar}</p>
        <h2>Neler Hariç?</h2>
        <p>{product.haric_olanlar}</p>
      </section>

      {/* ——— Rezervasyon Formu ——— */}
      <BookingForm product={product} />
    </>
  )
}
