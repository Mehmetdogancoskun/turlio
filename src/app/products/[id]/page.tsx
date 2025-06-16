/* Ürün-detay sayfasının kabı
   – Header/Footer ve temel düzeni PageShell’e bırakıyoruz          */

import PageShell   from '@/components/PageShell';   // Ortak sayfa iskeleti
import BackButton  from '@/components/BackButton';  // “Bir önceki sayfa”
import ProductBody from './ProductBody';            // Asıl içerik (aşağıda)

export const dynamic = 'force-static'; // → ISR davranışı (isteğe bağlı)

export default function ProductPage({ params }: { params: { id: string } }) {
  const id = Number(params.id); // URL → /products/123
  return (
    <PageShell>
      <div className="mx-auto max-w-4xl space-y-6 px-4">
        <BackButton />
        <ProductBody productId={id} />
      </div>
    </PageShell>
  );
}
