// src/app/page.tsx
import HeroCarousel from '@/components/HeroCarousel';
import ProductList  from '@/components/ProductList';
import TrustIcons   from '@/components/TrustIcons';
import CartIcon     from '@/components/CartIcon';
import { supabase } from '@/lib/supabaseClient';

export default async function HomePage() {
  /* Ürünleri çek */
  const { data: products } = await supabase
    .from('urunler')
    .select('*')
    .order('id', { ascending: true });

  return (
    <>
      {/* Hero + sepet ikonu */}
      <header className="relative">
        <HeroCarousel />
        <div className="absolute top-4 right-4 z-20">
          <CartIcon />
        </div>
      </header>

      {/* Güven ikonları */}
      <TrustIcons className="max-w-7xl mx-auto -mt-12 mb-10 relative z-10" />

      {/* Ana içerik */}
      <main className="bg-gray-900 min-h-screen p-6">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">
          Ürün Listesi
        </h1>

        <ProductList products={products || []} />
      </main>
    </>
  );
}
