/* ────────────────────────────────────────────────
   src/components/ProductCard.tsx
   – “Hemen Rezervasyon” yerine doğrudan Sepete Ekle
──────────────────────────────────────────────── */

'use client'

import Image        from 'next/image'
import Link         from 'next/link'
import { useState } from 'react'
import { Star, Plus } from 'lucide-react'
import { useCart }   from '@/context/CartContext'

interface Props {
  product: {
    id            : number
    tur_adi       : string
    gorsel_url?   : string | null
    sub_category? : string | null
    fiyat         : number
    para_birimi   : string
    indirim?      : number
    fiyatEski?    : number
    rating?       : number
  }
}

export default function ProductCard({ product }: Props) {
  const { addToCart }  = useCart()
  const [adding, setAdding] = useState(false)

  const {
    id, tur_adi, gorsel_url, sub_category,
    fiyat, para_birimi, indirim, fiyatEski, rating,
  } = product

  /* ——— sepete ekle (yalın) ——— */
  const quickAdd = async () => {
    if (adding) return
    setAdding(true)

    /* ► minimum alanlar; otel / tarih seçimi detay sayfasında */
    addToCart({
      id,
      tur_adi,
      unitPrice        : fiyat,
      quantity         : 1,
      region_multiplier: 1,          // varsayılan – emirlik seçilince güncellenir
    })

    setAdding(false)
  }

  /* ——— JSX ——— */
  return (
    <article className="flex flex-col rounded-lg border border-gray-200 shadow-sm overflow-hidden bg-white dark:bg-gray-800">
      {/* Görsel */}
      <Link href={`/products/${id}`} className="relative block h-48 overflow-hidden group">
        {gorsel_url ? (
          <Image
            src={gorsel_url}
            alt={tur_adi}
            fill
            sizes="(max-width:640px) 100vw, 280px"
            className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
            priority
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gray-100 text-gray-400">
            Görsel yok
          </div>
        )}

        {indirim && (
          <span className="absolute top-2 left-2 rounded bg-red-600 px-2 py-0.5 text-xs font-semibold text-white">
            −{indirim}%
          </span>
        )}
      </Link>

      {/* İçerik */}
      <div className="flex flex-1 flex-col p-4">
        {/* Başlık */}
        <h3 className="line-clamp-2 font-semibold text-gray-700 dark:text-gray-100">
          {tur_adi}
        </h3>

        {/* Alt kategori */}
        {sub_category && (
          <p className="mt-0.5 text-sm capitalize text-gray-500 dark:text-gray-400">
            {sub_category.replace('_', ' ')}
          </p>
        )}

        {/* Fiyat */}
        <div className="mt-2">
          {fiyatEski && (
            <span className="mr-2 text-sm text-gray-400 line-through">
              {fiyatEski.toFixed(0)} {para_birimi}
            </span>
          )}
          <span className="text-lg font-bold text-primary">
            {fiyat.toFixed(0)} {para_birimi}
          </span>
        </div>

        {/* Puan */}
        {rating && (
          <div className="mt-1 flex items-center text-sm text-yellow-400">
            <Star size={14} className="mr-1 fill-yellow-400" />
            {rating.toFixed(1)}
          </div>
        )}

        {/* Aksiyonlar */}
        <div className="mt-auto flex gap-2 pt-4">
          {/* Detay sayfası */}
          <Link
            href={`/products/${id}`}
            className="btn-secondary flex-1"
          >
            Detay
          </Link>

          {/* Hızlı sepete ekle */}
          <button
            onClick={quickAdd}
            disabled={adding}
            aria-label="Sepete Ekle"
            className="btn-primary px-3 py-2"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>
    </article>
  )
}
