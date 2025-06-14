'use client';

import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useContext,
} from 'react';

/* ───────── CartItem tipi ─────────
   • unitPrice  : tek yetişkin fiyatı (Stripe’a gider)
   • lineTotal  : bu satır için hesaplanmış toplam (yetişkin+çocuk+…)
   • quantity   : aynı üründen kaç adet “satır” eklendi (genelde 1)
   • Diğer alanlar (fullName, tarih…) opsiyoneldir ve
     [key:string]:any imzası sayesinde tip hatası vermez.
*/
export interface CartItem {
  id: number;
  tur_adi: string;
  unitPrice: number;
  lineTotal: number;
  quantity: number;
  [key: string]: any; // opsiyonel ekstra alanlar
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  addItem: (item: Omit<CartItem, 'quantity'>) => void; // alias
  removeFromCart: (index: number) => void;
  clearCart: () => void;
}

/* ───────── Context ───────── */
export const CartContext = createContext<CartContextType | undefined>(
  undefined
);

/* ───────── Provider ───────── */
export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  /* Sayfa ilk açıldığında sepeti localStorage'dan yükle */
useEffect(() => {
  try {
    const stored = localStorage.getItem('turlioCart');
    if (stored) {
      const parsed: CartItem[] = JSON.parse(stored);

      /* ↻ Eski formatı yeniye çevir */
      const migrated = parsed.map((it) => {
        // lineTotal yoksa unitPrice yoksa price/fiyat alanından üret
        if (it.lineTotal === undefined) {
          const base = (it as any).unitPrice ?? (it as any).price ?? it.fiyat ?? 0;
          return {
            ...it,
            unitPrice: base,
            lineTotal: base * (it.quantity ?? 1),
          };
        }
        return it;
      });

      setCart(migrated);
    }
  } catch (err) {
    console.error('localStorage parse error:', err);
  }
}, []);

  

  /* LocalStorage’ye kaydet */
  useEffect(() => {
    localStorage.setItem('turlioCart', JSON.stringify(cart));
  }, [cart]);

  /* Ürün ekle */
  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    setCart((prev) => [
      ...prev,
      { ...item, quantity: 1 }, // her rezervasyon ayrı satır
    ]);
  };

  /* Ürün sil */
  const removeFromCart = (index: number) => {
  setCart(prevCart => prevCart.filter((_, i) => i !== index));
};

  /* Sepeti temizle */
  const clearCart = () => setCart([]);

  const value: CartContextType = {
    cart,
    addToCart,
    addItem: addToCart, // geriye dönük uyumluluk
    removeFromCart,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

/* ───────── Hook ───────── */
export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
};
