/*  src/app/HomeClient.tsx  */
'use client'

import { useState, useEffect }                from 'react'
import { useSearch }                          from '@/context/SearchContext'
import HeroCarousel                           from '@/components/HeroCarousel'
import { CategoryIcons, type CatKey }         from '@/components/CategoryIcons'
import ProductCard                            from '@/components/ProductCard'
import { supabase }                           from '@/lib/supabaseClient'

/* ───────── Veri tipleri ───────── */
interface Product {
  id:           number
  tur_adi:      string
  gorsel_url:   string | null
  product_type: CatKey
  sub_category: string
  fiyat:        number
  para_birimi:  string
  indirim?:     number
  fiyatEski?:   number
  rating?:      number
}

/* ───────── Ana bileşen ───────── */
export default function HomeClient() {
  /* ► Header’daki arama alanıyla paylaşılan global state */
  const { term } = useSearch()

  /* ► Yerel state */
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [filtered,    setFiltered]    = useState<Product[]>([])
  const [selectedCat, setSelectedCat] = useState<CatKey>('hepsi')

  /* 1) Supabase’ten veriyi çek */
  useEffect(() => {
    supabase
      .from('urunler')
      .select('*')
      .then(({ data, error }) => {
        if (error) console.error(error)
        else setAllProducts(data ?? [])
      })
  }, [])

  /* 2) Kategori veya arama değiştiğinde filtrele */
  useEffect(() => {
    let tmp = allProducts

    if (selectedCat !== 'hepsi') {
      tmp = tmp.filter(p => p.product_type === selectedCat)
    }
    if (term) {
      tmp = tmp.filter(p =>
        p.tur_adi.toLowerCase().includes(term.toLowerCase())
      )
    }
    setFiltered(tmp)
  }, [allProducts, selectedCat, term])

  /* ───────── JSX ───────── */
  return (
    <main className="bg-white text-gray-800">
      {/* ── HERO + Kategori kartı */}
      <section className="relative">
        {/* Hero görüntüsü */}
        <div className="relative h-[55vh] min-h-[320px] max-h-[600px] overflow-hidden">
          <HeroCarousel />
        </div>

        {/* Kategori kartı  (Hero’nun alt kenarına “yapışık”) */}
        <div
          className="
            pointer-events-none          /* altındaki butonlara tıklanabilsin   */
            absolute left-1/2 bottom-0   /* hero’nun alt-ortasına kilitle        */
            -translate-x-1/2 translate-y-[70%]  /* yarım kart aşağı sarksın        */
            z-20
          "
        >
          <div className="pointer-events-auto category-bar flex">
            <CategoryIcons
              selected={selectedCat}
              onSelect={setSelectedCat}
            />
          </div>
        </div>
      </section>

      {/* ── ÜRÜNLER */}
      <section className="mx-auto max-w-7xl px-4 pt-40 pb-12">
        {/*  pt-40 ≈ kategori kartı yüksekliği + ekstra boşluk                    */}
        <h2 className="mb-6 text-center text-3xl font-heading font-bold">
          Turlar&nbsp;&amp;&nbsp;Aktiviteler
        </h2>

        <div className="grid gap-6 grid-cols-[repeat(auto-fill,minmax(280px,1fr))]">
          {filtered.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </main>
  )
}
