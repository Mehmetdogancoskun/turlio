// src/components/ProductCard.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

interface Product {
  id: number;
  tur_adi: string;
  gorsel_url: string | null;
  sub_category: string;
  fiyat: number;
  para_birimi: string;
  indirim?: number;
  fiyatEski?: number;
  rating?: number;

  /* Sepete eklenirken eklenen alanlar (opsiyonel) */
  unitPrice?: number;
  lineTotal?: number;
}

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();

  /* Yardımcı: fiyatı TR biçiminde yaz */
  const fmt = (n: number) =>
    n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden flex flex-col">
      {/* Görsel ------------------------------------------------------- */}
      <Link
        href={`/products/${product.id}`}
        className="relative block bg-gray-100 overflow-hidden aspect-[4/3]"
      >
        {product.indirim != null && product.fiyatEski != null && (
          <span className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
            -{product.indirim}%
          </span>
        )}

        {product.gorsel_url ? (
          <Image
            src={product.gorsel_url}
            alt={product.tur_adi}
            fill
            sizes="(max-width:640px) 100vw, (max-width:1024px) 33vw, 25vw"
            className="object-cover"
            priority
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-gray-500">
            Görsel yok
          </span>
        )}
      </Link>

      {/* İçerik ------------------------------------------------------- */}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-heading font-semibold text-gray-900 mb-1">
          {product.tur_adi}
        </h3>
        <p className="text-sm text-gray-500 mb-2">{product.sub_category}</p>

        <div className="flex items-center justify-between mb-4">
          <div>
            {product.indirim != null && product.fiyatEski != null && (
              <span className="line-through text-sm text-gray-400 mr-2">
                {fmt(product.fiyatEski)} {product.para_birimi}
              </span>
            )}
            <span className="text-primary font-bold text-xl">
              {fmt(product.fiyat)} {product.para_birimi}
            </span>
          </div>

          {product.rating != null && (
            <span className="text-yellow-400 text-sm">
              ⭐ {product.rating.toFixed(1)}
            </span>
          )}
        </div>

        {/* Butonlar --------------------------------------------------- */}
        <div className="mt-auto flex gap-2">
          <button
            onClick={() =>
              addToCart({
                ...product,
                unitPrice: product.fiyat,
                lineTotal: product.fiyat,
                quantity: 1,
              })
            }
            className="btn-primary flex-1"
          >
            Sepete Ekle
          </button>

          <Link
            href={`/products/${product.id}`}
            className="btn-secondary flex-1 text-center"
          >
            Detaylar
          </Link>
        </div>
      </div>
    </div>
  );
}
