// src/components/ProductList.tsx
'use client';

import { useState, type ChangeEvent } from 'react';
import ProductCard from './ProductCard';
// DEĞİŞİKLİK: CategoryIcons importunu düzelttik. Artık default değil.
import { CategoryIcons, type CatKey } from './CategoryIcons';
import SearchBar from './SearchBar';

// DEĞİŞİKLİK: 'export default function' yerine 'export const' kullandık.
export const ProductList = ({ products }: { products: any[] }) => {
  const [selectedCat, setSelectedCat] = useState<CatKey | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // 1) Kategoriye göre filtrele
  let filtered = !selectedCat || selectedCat === 'hepsi'
    ? products
    : products.filter(p => p.product_type === selectedCat);

  // 2) Arama terimine göre filtrele
  filtered = filtered.filter(p =>
    p.tur_adi.toLowerCase().includes(searchTerm.toLowerCase())
  );

  console.log('🔍 selectedCat:', selectedCat, '→ filtered count:', filtered.length);

  return (
    <>
      {/* Kategori ikonları */}
      <CategoryIcons selected={selectedCat} onSelect={setSelectedCat} />

      {/* Arama çubuğu */}
      <SearchBar
        value={searchTerm}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
      />

      {/* Ürün kartları */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4 mt-8">
        {filtered.map(item => (
          <ProductCard key={item.id} product={item} />
        ))}
      </div>
    </>
  );
}