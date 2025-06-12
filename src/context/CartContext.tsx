// src/context/CartContext.tsx
'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

/* ——— Interface yalnızca tek kez ve dosya seviyesinde ——— */
export interface CartItem {
  id: number;
  tur_adi: string;
  fiyat: number;
  quantity: number;
  tarih?: string;
  otel?: string;
  region?: string;
  pickup_time?: string;
  adult?: number;
  child?: number;
  infant?: number;
  email?: string;
  fullName?: string;
}

/* ——— Context tanımı ——— */
interface CartContextValue {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: number) => void;
  updateItem: (id: number, qty: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (newItem: CartItem) => {
    setItems(prev => {
      const found = prev.find(i => i.id === newItem.id);
      if (found) {
        return prev.map(i =>
          i.id === newItem.id
            ? { ...i, quantity: i.quantity + newItem.quantity }
            : i
        );
      }
      return [...prev, newItem];
    });
  };

  const removeItem = (id: number) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const updateItem = (id: number, qty: number) => {
    setItems(prev =>
      prev.map(i => (i.id === id ? { ...i, quantity: qty } : i))
    );
  };

  const clearCart = () => setItems([]);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be inside CartProvider');
  return ctx;
}