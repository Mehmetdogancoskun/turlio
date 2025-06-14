// src/components/ProductList.tsx
'use client';

import { useState, ChangeEvent } from 'react';
import ProductCard from './ProductCard';
import { CategoryIcons, type CatKey } from './CategoryIcons';
import SearchBar from './SearchBar';

/* Basit ürün tipi — veritabanı alanlarını bozmadık */
interface Product {
  id: number;
  tur_adi: string;
  gorsel_url: string | null;
  product_type: CatKey;          // 'tur' | 'transfer' | …
  sub_category: string;
  fiyat: number;
  para_birimi: string;
  indirim?: number;
  fiyatEski?: number;
  rating?: number;
}

export const ProductList = ({ products }: { products: Product[] }) => {
  const [selectedCat, setSelectedCat] = useState<CatKey | null>(null);
  const [searchTerm, setSearchTerm]   = useState('');

  /* 1) Kategori filtreleme --------------------------------------- */
  let filtered =
    !selectedCat || selectedCat === 'hepsi'
      ? products
      : products.filter((p) => p.product_type === selectedCat);

  /* 2) Arama filtreleme ------------------------------------------- */
  filtered = filtered.filter((p) =>
    p.tur_adi.toLowerCase().includes(searchTerm.toLowerCase())
  );

  console.log(
    '🔍 selectedCat:',
    selectedCat,
    '→ filtered count:',
    filtered.length
  );

  return (
    <>
      {/* Kategori ikonları */}
      <CategoryIcons selected={selectedCat} onSelect={setSelectedCat} />

      {/* Arama çubuğu */}
      <SearchBar
        value={searchTerm}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setSearchTerm(e.target.value)
        }
      />

      {/* Ürün kartları */}
      <div className="grid gap-6 grid-cols-[repeat(auto-fill,minmax(280px,1fr))] px-4 mt-8">
        {filtered.map((item) => (
          <ProductCard key={item.id} product={item} />
        ))}
      </div>
    </>
  );
};
