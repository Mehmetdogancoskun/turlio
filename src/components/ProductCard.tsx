/* src/components/ProductCard.tsx
   – Sadece renk satırlarını güncelledik                  */

import Link   from 'next/link'
import Image  from 'next/image'
import { Star } from 'lucide-react'

interface Props {
  product: {
    id: number
    tur_adi: string
    gorsel_url: string | null
    sub_category?: string | null
    fiyat: number
    para_birimi: string
    indirim?: number
    fiyatEski?: number
    rating?: number
  }
}

export default function ProductCard({ product }: Props) {
  const {
    id, tur_adi, gorsel_url, sub_category,
    fiyat, para_birimi, indirim, fiyatEski, rating,
  } = product

  return (
    <article className="flex flex-col border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      {/* ——— Görsel ——— */}
      <Link href={`/products/${id}`} className="relative block h-48 overflow-hidden">
        {gorsel_url ? (
          <Image
            src={gorsel_url}
            alt={tur_adi}
            fill
            sizes="(max-width:640px) 100vw, 280px"
            className="object-cover object-center hover:scale-105 transition-transform duration-300"
            priority
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-gray-100 text-gray-400">
            Görsel yok
          </div>
        )}

        {indirim && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
            -{indirim}%
          </span>
        )}
      </Link>

      {/* ——— İçerik ——— */}
      <div className="flex flex-col flex-1 p-4">
        {/* Başlık – daha koyu */}
        <h3 className="font-semibold text-gray-600 dark:text-gray-100 line-clamp-2">
          {tur_adi}
        </h3>

        {/* Alt kategori – bir ton koyu */}
        {sub_category && (
          <p className="text-sm text-gray-500 dark:text-gray-400 capitalize mt-1">
            {sub_category.replace('_', ' ')}
          </p>
        )}

        {/* Fiyat */}
        <div className="mt-2">
          {fiyatEski && (
            <span className="text-sm text-gray-400 line-through mr-2">
              {fiyatEski.toFixed(0)} {para_birimi}
            </span>
          )}
          <span className="text-lg font-bold text-primary">
            {fiyat.toFixed(0)} {para_birimi}
          </span>
        </div>

        {/* Puan */}
        {rating && (
          <div className="flex items-center text-sm text-yellow-400 mt-1">
            <Star size={14} className="fill-yellow-400 mr-1" /> {rating.toFixed(1)}
          </div>
        )}

        {/* Buton */}
        <Link
          href={`/reservation/${id}`}
          className="btn-primary w-full mt-auto"
        >
          Hemen Rezervasyon
        </Link>
      </div>
    </article>
  )
}
