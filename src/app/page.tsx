// src/app/page.tsx

import HeroCarousel from '@/components/HeroCarousel';
import { CategoryIcons } from '@/components/CategoryIcons';
import { ProductList } from '@/components/ProductList';
import { supabase } from '@/lib/supabaseClient';

export default async function HomePage() {
  // 1) Ürünleri alıyoruz
  const { data: products, error } = await supabase
    .from('urunler')
    .select('*');  // <<< noktalı virgül burada

  if (error) {
    console.error('Error fetching products:', error);
    // İsterseniz burada kullanıcıya hata mesajı gösteren bir UI ekleyebilirsiniz
  }

  return (
    <main className="bg-white text-gray-800">

      {/* === TAILWIND TEST SATIRI === */}
       <div className="fixed top-0 left-0 right-0 z-[9999] bg-primary text-white text-center py-2">
       TEST TAILWIND
       </div>



      
      {/* Hero */}
      <HeroCarousel />
     
      {/* Kategori ikonları */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <CategoryIcons />
      </section>
        
      {/* Ürün listesi */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-heading font-bold mb-6 text-center">
          Turlar & Aktiviteler
        </h2>
        <ProductList products={products || []} />
      </section>
    </main>
  );
}
