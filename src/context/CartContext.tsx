/* ────────────────────────────────────────────────
   src/context/CartContext.tsx
──────────────────────────────────────────────── */
'use client'

import React, {
  createContext, useState, useEffect, useContext, ReactNode,
} from 'react'

/* ——— Satır tipi ——— */
export interface CartItem {
  id      : number
  tur_adi : string

  /* kişi fiyatları */
  unitPrice   : number          // yetişkin
  child_price : number          // çocuk  (== unitPrice fallback)
  infant_price: number          // bebek  (== 0   fallback)

  /* kişi sayıları */
  adult  : number
  child  : number
  infant : number
  child_ages?: number[]

  /* diğer */
  quantity         : number      // 1 rezerv. = 1 satır (şimdilik)
  region_multiplier: number      // ≥1 (varsayılan 1)
  region?          : string
  lineTotal        : number

  /* serbest alanlar (tarih, otel, pickup_time vb.) */
  [key: string]: any
}

/* ——— Misafir ——— */
export interface GuestInfo {
  fullname: string
  phone   : string
  email   : string
  hotel   : string
  room?   : string
  region? : string
}

/* ——— Context tipi ——— */
interface CartCtx {
  cart          : CartItem[]
  guestInfo     : GuestInfo | null
  addToCart     : (i: Omit<CartItem, 'quantity' | 'lineTotal'>) => void
  updateItem    : (idx: number, p: Partial<CartItem>) => void
  removeFromCart: (idx: number) => void
  clearCart     : () => void
  setGuestInfo  : (g: GuestInfo) => void
}

/* ——— Yardımcılar ——— */
const toNum = (v: unknown) => Number(String(v ?? '0').replace(',', '.'))

const calcLine = (r: Omit<CartItem, 'lineTotal'>) => {
  const adult  = r.adult  ?? 1
  const child  = r.child  ?? 0
  const infant = r.infant ?? 0

  const sub =
    (toNum(r.unitPrice)    * adult) +
    (toNum(r.child_price)  * child) +
    (toNum(r.infant_price) * infant)

  return +(sub * (r.region_multiplier ?? 1)).toFixed(2)
}

/* ——— Context ——— */
export const CartContext = createContext<CartCtx | undefined>(undefined)

/* ——— Provider ——— */
export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart , setCart ] = useState<CartItem[]>([])
  const [guest, setGuest] = useState<GuestInfo | null>(null)

  /* ▼ localStorage → state (ilk yük) */
  useEffect(() => {
    try {
      const rawCart  = localStorage.getItem('turlioCart')
      const rawGuest = localStorage.getItem('turlioGuest')

      if (rawCart) {
        const parsed: CartItem[] = JSON.parse(rawCart)

        // eski kayıtları migrate et
        const fixed = parsed.map(r => ({
          ...r,
          unitPrice    : toNum(r.unitPrice   ?? (r as any).fiyat),
          child_price  : toNum(r.child_price ?? r.unitPrice),
          infant_price : toNum(r.infant_price ?? 0),
          adult        : r.adult  ?? 1,
          child        : r.child  ?? 0,
          infant       : r.infant ?? 0,
          quantity     : 1,
          region_multiplier: r.region_multiplier ?? 1,
          lineTotal    : r.lineTotal ?? calcLine(r as CartItem),
        }))
        setCart(fixed)
      }
      if (rawGuest) setGuest(JSON.parse(rawGuest))
    } catch (e) { console.error('localStorage parse:', e) }
  }, [])

  /* ▲ state → localStorage */
  useEffect(() => {
    localStorage.setItem('turlioCart' , JSON.stringify(cart))
    localStorage.setItem('turlioGuest', JSON.stringify(guest))
  }, [cart, guest])

  /* ——— Actions ——— */
  const addToCart = (
    i: Omit<CartItem, 'quantity' | 'lineTotal'>,
  ) => {
    const row: CartItem = {
      ...i,
      unitPrice    : toNum(i.unitPrice),
      child_price  : toNum(i.child_price  ?? i.unitPrice),
      infant_price : toNum(i.infant_price ?? 0),
      adult        : i.adult  ?? 1,
      child        : i.child  ?? 0,
      infant       : i.infant ?? 0,
      quantity     : 1,
      region_multiplier: i.region_multiplier ?? 1,
      lineTotal    : 0, // geçici
    }
    row.lineTotal = calcLine(row)
    setCart(p => [...p, row])
  }

  const updateItem = (idx: number, patch: Partial<CartItem>) =>
    setCart(p => p.map((row, i) => {
      if (i !== idx) return row

      /* çocuk sayısı azaldıysa child_ages dizisini kısalt */
      let childAges = row.child_ages
      if ('child' in patch && childAges) {
        const len = Math.max(0, Number(patch.child))
        childAges = childAges.slice(0, len)
      }

      const merged = { ...row, ...patch, child_ages: childAges }
      return { ...merged, lineTotal: calcLine(merged) }
    }))

  const removeFromCart = (idx: number) =>
    setCart(p => p.filter((_, i) => i !== idx))

  const clearCart = () => setCart([])

  /* ——— Value ——— */
  const value: CartCtx = {
    cart,
    guestInfo   : guest,
    addToCart,
    updateItem,
    removeFromCart,
    clearCart,
    setGuestInfo: setGuest,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

/* ——— Hook ——— */
export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
