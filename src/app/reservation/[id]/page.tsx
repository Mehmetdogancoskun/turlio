/*  src/app/reservation/[id]/page.tsx
    ----------------------------------------------------------
    Rezervasyon adımı – ortak PageShell içinde açılır;
    Header + Footer + tema her sayfada aynıdır.
----------------------------------------------------------------*/

import PageShell        from '@/components/PageShell'
import BackButton       from '@/components/BackButton'
import StepIndicator    from '@/components/StepIndicator'
import RezervasyonForm  from '@/components/RezervasyonForm'
import { supabase }     from '@/lib/supabaseClient'
import type { Product } from '@/types/product'

/* ——— Server component ---------------------------------------- */
export default async function ReservationPage({
  params,
}: {
  params: Promise<{ id: string }>         // <- Promise olarak geliyor
}) {
  const { id }   = await params          // ← önce await
  const productId = Number(id)

  /* veriyi çek */
  const { data: product, error } = await supabase
    .from<Product>('urunler')
    .select(
      'id,tur_adi,fiyat,para_birimi,price_child,price_infant,sub_category',
    )
    .eq('id', productId)
    .single()

  /* ------------- Hata / bulunamadı ------------- */
  if (error || !product) {
    return (
      <PageShell>
        <div className="mx-auto max-w-xl py-24 text-center space-y-6">
          <BackButton />
          <p className="text-xl font-semibold">Ürün bulunamadı.</p>
        </div>
      </PageShell>
    )
  }

  /* sayısal alanları garanti altına al */
  const adult  = product.fiyat
  const child  = product.price_child  ?? 0
  const infant = product.price_infant ?? 0

  /* ------------- Normal Görünüm ------------- */
  return (
    <PageShell>
      <div className="mx-auto max-w-3xl px-4 pb-16 space-y-8">
        {/* üst şerit */}
        <div className="flex items-center justify-between pt-6">
          <BackButton />
          <StepIndicator currentStep={2} />
        </div>

        {/* başlık + özet fiyatlar */}
        <header className="space-y-3">
          <h1 className="text-3xl font-heading font-bold">
            {product.tur_adi}
          </h1>
          <p className="text-lg">
            Yetişkin: <b>{adult.toFixed(2)}</b> {product.para_birimi} &nbsp;|&nbsp;
            Çocuk: <b>{child.toFixed(2)}</b> {product.para_birimi} &nbsp;|&nbsp;
            Bebek: <b>{infant.toFixed(2)}</b> {product.para_birimi}
          </p>
        </header>

        {/* form (client component) */}
        <RezervasyonForm
          product={{
            ...product,
            fiyat: adult,
            price_child : child,
            price_infant: infant,
          }}
          subCategory={product.sub_category ?? ''}
        />
      </div>
    </PageShell>
  )
}
