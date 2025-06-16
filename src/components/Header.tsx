/* ────────────────────────────────────────────────
   src/components/Header.tsx
   – Tek Header, arama için SearchContext kullanır
──────────────────────────────────────────────── */

'use client'

import { useState, useContext, FormEvent, useEffect } from 'react'
import Link        from 'next/link'
import {
  ShoppingCart,
  Ticket,
  Globe,
  Menu,
  X,
} from 'lucide-react'
import { CartContext }    from '@/context/CartContext'
import { useSearch }      from '@/context/SearchContext'

/* Yardımcı linkler  (Sepet & Rezervasyon) */
const UTIL_LINKS = [
  { href: '/cart',         label: 'Sepet',          Icon: ShoppingCart },
  { href: '/reservations', label: 'Rezervasyonlar', Icon: Ticket       },
] as const

export default function Header() {
  /* ───────────────────────────── state/ctx */
  const [open, setOpen] = useState(false)
  const { cart }        = useContext(CartContext)
  const { term, setTerm } = useSearch()

  /* toplam ürün adedi */
  const cartCount = cart.reduce((sum, line) => sum + line.quantity, 0)

  /* form submit’inde sayfa yenileme olmasın */
  const submit = (e: FormEvent) => e.preventDefault()

  /* ESC = menü kapat */
  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', esc)
    return () => document.removeEventListener('keydown', esc)
  }, [])

  /* body scroll lock (mobil menü açıkken) */
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
  }, [open])

  /* ───────────────────────────── render */
  return (
    <header className="sticky top-0 z-50 bg-primary text-white shadow-md">
      {/* Üst bar ---------------------------------------------------- */}
      <div className="border-b border-white/10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4">

          {/* logo ---------------------------------------------------- */}
          <Link href="/" className="shrink-0 text-xl font-extrabold tracking-tight">
            Turlio
          </Link>

          {/* arama  (lg ≥) ---------------------------------------- */}
          <form
            onSubmit={submit}
            className="hidden lg:flex flex-1 max-w-xl"
            role="search"
          >
            <input
              value={term}
              onChange={e => setTerm(e.target.value)}
              placeholder="Şehir, tur veya aktivite ara…"
              aria-label="Site içi arama"
              className="w-full rounded-l-lg bg-white/90 px-4 py-2 text-sm text-gray-900
                         placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-secondary/70"
            />
            <button
              type="submit"
              className="rounded-r-lg bg-secondary px-5 font-semibold hover:bg-secondary/90"
            >
              Ara
            </button>
          </form>

          {/* sağ ikonlar ------------------------------------------- */}
          <ul className="hidden md:flex items-center gap-6">
            {UTIL_LINKS.map(({ href, label, Icon }) => (
              <li key={href} className="relative">
                <Link
                  href={href}
                  title={label}
                  className="flex flex-col items-center text-xs hover:opacity-80"
                >
                  <Icon size={20} />
                  {label}
                  {href === '/cart' && cartCount > 0 && (
                    <span className="absolute -top-1 -right-3 flex h-5 w-5 items-center
                                      justify-center rounded-full bg-secondary text-[11px] font-bold">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </li>
            ))}

            {/* dil / para birimi */}
            <li>
              <button
                title="Dil & Para birimi"
                className="flex items-center gap-2 text-xs hover:opacity-80"
              >
                <Globe size={20} />
                TR&nbsp;/&nbsp;AED
              </button>
            </li>
          </ul>

          {/* hamburger --------------------------------------------- */}
          <button
            className="md:hidden"
            onClick={() => setOpen(o => !o)}
            aria-label="Menüyü Aç / Kapat"
          >
            {open ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobil panel ---------------------------------------------- */}
      {open && (
        <div className="md:hidden bg-primary px-4 pb-6">
          {/* Arama (mobil) */}
          <form onSubmit={submit} role="search" className="my-4 flex">
            <input
              value={term}
              onChange={e => setTerm(e.target.value)}
              placeholder="Şehir, tur veya aktivite ara…"
              aria-label="Site içi arama"
              className="flex-1 rounded-l-lg bg-white/90 px-4 py-2 text-sm text-gray-900"
            />
            <button
              type="submit"
              className="rounded-r-lg bg-secondary px-4 font-semibold"
            >
              Ara
            </button>
          </form>

          {/* Kısa bağlantılar */}
          <ul className="flex flex-col gap-4">
            {UTIL_LINKS.map(({ href, label, Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="flex items-center gap-3 py-2 hover:bg-white/10 rounded-lg"
                  onClick={() => setOpen(false)}
                >
                  <Icon size={20} />
                  {label}
                  {href === '/cart' && cartCount > 0 && (
                    <span className="ml-auto flex h-5 w-5 items-center justify-center
                                      rounded-full bg-secondary text-[11px] font-bold">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  )
}
