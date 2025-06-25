/* ────────────────────────────────────────────────
   src/app/products/[id]/page.tsx
   Tekil ürün detay rotası  →  /products/[id]
   • Header / Footer ve temel düzen PageShell içinde
──────────────────────────────────────────────── */

import { notFound }      from 'next/navigation'

import PageShell         from '@/components/PageShell'
import BackButton        from '@/components/BackButton'
import ProductBody       from './ProductBody'

/** 
 *  Statik-önbellek (ISR) istiyorsanız satırı açın:
 *  export const dynamic = 'force-static'
 */
// export const dynamic = 'force-static'

interface Params {
  params: { id: string }
}

export default function ProductPage({ params }: Params) {
  /* URL parametresini güvenli biçimde sayıya çevir */
  const id = Number.parseInt(params.id ?? '', 10)

  /* Geçersiz ID → 404 */
  if (!id) return notFound()

  return (
    <PageShell>
      <div className="mx-auto max-w-4xl space-y-8 px-4">
        {/* Geri butonu (tarayıcı geçmişine göre) */}
        <BackButton />

        {/* Sunucu tarafı bileşeni – tüm veriyi kendi getirir */}
        <ProductBody productId={id} />
      </div>
    </PageShell>
  )
}
