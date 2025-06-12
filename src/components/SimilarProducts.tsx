// src/components/SimilarProducts.tsx
'use client';

import { useEffect, useState } from 'react';
import ProductCard from '@/components/ProductCard';
import { supabase } from '@/lib/supabaseClient';

export default function SimilarProducts({
  category,
  currentId,
}: {
  category: string;
  currentId: number;
}) {
  const [list, setList] = useState<Product[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('urunler')
        .select('*')
        .ilike('sub_category', category)
        .neq('id', currentId)
        .order('sira', { ascending: true })
        .limit(6);
      setList(data || []);
    })();
  }, [category]);

  if (list.length === 0) return null; // sadece kendisi varsa gösterme

  return (
    <section className="mt-12 px-4">
      <h2 className="text-2xl font-bold text-white mb-4">Benzer Turlar</h2>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {list.map((item) => (
          <div key={item.id} className="min-w-[240px]">
            <ProductCard product={item} />
          </div>
        ))}
      </div>
    </section>
  );
}

// tipi tanımla (aynı ProductCard’daki ile eşleşmeli)
interface Product {
  id: number;
  tur_adi: string;
  gorsel_url: string | null;
  sub_category: string;
  fiyat: number;
  para_birimi: string;
  fiyatEski?: number;
  indirim?: number;
  rating?: number;
}
