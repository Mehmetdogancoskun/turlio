// src/components/CartIcon.tsx
'use client';

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function CartIcon() {
  const { items } = useCart();
  const totalQty = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <Link
      href="/cart"
      className="relative inline-flex items-center justify-center w-10 h-10 bg-gray-800 rounded-full hover:bg-gray-700 transition-shadow shadow-sm"
      aria-label="Sepetim"
    >
      <ShoppingCart className="w-6 h-6 text-white" />
      {totalQty > 0 && (
        <span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 
                         bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 
                         flex items-center justify-center shadow-md border-2 border-gray-800">
          {totalQty}
        </span>
      )}
    </Link>
  );
}
