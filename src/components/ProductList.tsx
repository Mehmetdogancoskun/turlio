'use client'

import { useState } from 'react'
import ProductCard                     from './ProductCard'
import { CategoryIcons, type CatKey }  from './CategoryIcons'

/* ——— Veritabanı tipiniz ——— */
interface Product {
  id: number
  tur_adi: string
  gorsel_url: string | null
  product_type: CatKey
  sub_category: string
  fiyat: number
  para_birimi: string
  indirim?: number
  fiyatEski?: number
  rating?: number
}

/* ——— Bileşen ——— */
export function ProductList({ products }: { products: Product[] }) {
  /* yalnızca kategori filtresi tutuyoruz */
  const [selectedCat, setSelectedCat] = useState<CatKey | null>('hepsi')

  /* filtrele */
  const shown =
    !selectedCat || selectedCat === 'hepsi'
      ? products
      : products.filter(p => p.product_type === selectedCat)

  return (
    <>
      {/* ▶︎ SADECE Kategori ikonları */}
      <CategoryIcons selected={selectedCat} onSelect={setSelectedCat} />

      {/* ürün kartları */}
      <div className="grid gap-6 grid-cols-[repeat(auto-fill,minmax(280px,1fr))] mt-8">
        {shown.map(p => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </>
  )
}
