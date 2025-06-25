/*  src/app/products/category/[type]/page.tsx
    Örnek URL’ler:
      /products/category/tur
      /products/category/transfer
      /products/category/bilet
      /products/category/vize
---------------------------------------------------------------- */

import PageShell          from '@/components/PageShell'
import ProductCard        from '@/components/ProductCard'
import { supabase }       from '@/lib/supabaseServer'
import { CATEGORY_LABEL } from '@/lib/categoryMap'
import type { CatKey }    from '@/components/CategoryIcons'

export const dynamic = 'force-static'   // ISR-benzeri davranış

export default async function CategoryPage({
  params,
}: {
  params: { type: CatKey }              // dinamik segment
}) {
  const TYPE_KEY = params.type as CatKey   // ‘tur’ | ‘transfer’ | …

  /* 1)  Veriyi çek */
  const { data, error } = await supabase
    .from('urunler')
    .select('*')
    .eq('product_type', TYPE_KEY)

  /* 2)  Başlık metni */
  const title = CATEGORY_LABEL[TYPE_KEY] ?? 'Ürünler'

  /* 3)  JSX */
  return (
    <PageShell>
      <div className="mx-auto max-w-7xl px-4 py-12">
        <h1 className="mb-8 text-3xl font-heading font-bold">{title}</h1>

        {error && (
          <p className="text-red-600">
            Sunucu hatası: {error.message}
          </p>
        )}

        {!error && data?.length === 0 && (
          <p className="text-gray-600">
            Bu kategoriye ait ürün bulunamadı.
          </p>
        )}

        <div className="grid gap-6 grid-cols-[repeat(auto-fill,minmax(280px,1fr))]">
          {data?.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </PageShell>
  )
}
