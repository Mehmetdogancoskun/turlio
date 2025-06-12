// src/components/ProductCard.tsx
'use client';

import Link from 'next/link';

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
}

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="border border-gray-700 rounded-lg overflow-hidden bg-gray-900 flex flex-col">
      {/* Görsel */}
      <Link
        href={`/products/${product.id}`}
        className="block relative h-48 bg-gray-800 flex items-center justify-center hover:opacity-90 transition-opacity"
      >
        {product.indirim && (
          <span className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
            -{product.indirim}%
          </span>
        )}
        {product.gorsel_url ? (
          <img
            src={product.gorsel_url}
            alt={product.tur_adi}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-gray-500">Görsel yok</span>
        )}
      </Link>

      {/* Bilgi */}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="text-lg font-semibold text-white mb-1">{product.tur_adi}</h3>
        <p className="text-sm text-gray-400 mb-2">{product.sub_category}</p>
        <div className="flex items-center justify-between mb-4">
          <div>
            {product.indirim && product.fiyatEski !== undefined && (
              <span className="line-through text-sm text-gray-500 mr-2">
                {product.fiyatEski.toFixed(2)} {product.para_birimi}
              </span>
            )}
            <span className="font-bold text-xl text-white">
              {product.fiyat.toFixed(2)} {product.para_birimi}
            </span>
          </div>
          {product.rating != null && (
            <span className="text-yellow-400 text-sm">⭐ {product.rating.toFixed(1)}</span>
          )}
        </div>

        {/* Keşfet / Detaylar */}
        <Link
          href={`/products/${product.id}`}
          className="mt-auto bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-center transition"
        >
          Keşfet
        </Link>
      </div>
    </div>
  );
}
