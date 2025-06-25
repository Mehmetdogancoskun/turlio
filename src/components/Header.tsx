/* ────────────────────────────────────────────────
   src/components/Header.tsx
   – Tek Header, arama için SearchContext kullanır
   – Kategori kısayolları (desktop + mobil) 2025-06-22
──────────────────────────────────────────────── */

'use client'

import { useState, useContext, FormEvent, useEffect } from 'react'
import Link        from 'next/link'

/* ikonlar */
import {
  ShoppingCart,
  Ticket,
  Globe,
  Menu,
  X,
} from 'lucide-react'

/* context’ler */
import { useCart }       from '@/context/CartContext'
import { useSearch }     from '@/context/SearchContext'

/* Katagori tanımı (CategoryIcons bileşeniyle aynı kaynaktan) */
import { categories }      from '@/components/CategoryIcons'
import { CATEGORY_LABEL }  from '@/lib/categoryMap'
/*  categories → [
      { key:'hepsi', label:'Tümü',     icon: … },
      { key:'tur',   label:'Tur',      icon: … },
      { key:'transfer', label:'Transfer', icon: … },
      …
   ]                                                          */

/* Sepet & Rezervasyon kısayolları */
const UTIL_LINKS = [
  { href: '/cart',         label: 'Sepet',          Icon: ShoppingCart },
  { href: '/reservations', label: 'Rezervasyonlar', Icon: Ticket       },
] as const

export default function Header() {
  /* ───────── state / ctx */
  const [open, setOpen]   = useState(false)
  const { cart }        = useCart()
  const { term, setTerm } = useSearch()

  /* toplam adet (rozet) */
  const cartCount = cart.reduce((s, l) => s + l.quantity, 0)

  /* form submit → sayfa yenilenmesin */
  const stopRefresh = (e: FormEvent) => e.preventDefault()

  /* ESC → menü kapat */
  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [])

  /* body scroll lock (mobil menü) */
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
  }, [open])

  /* ───────── JSX */
  return (
    <header className="sticky top-0 z-50 bg-primary text-white shadow-md">
      {/* Üst bar */}
      <div className="border-b border-white/10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-4">

          {/* Logo */}
          <Link
            href="/"
            className="shrink-0 text-xl font-extrabold tracking-tight"
          >
            Turlio
          </Link>

          {/* Arama (lg ▲) */}
          <form
            onSubmit={stopRefresh}
            role="search"
            className="hidden lg:flex flex-1 max-w-xl"
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

          {/* ▼ Kategori kısa yolları (yalnızca lg ▲) */}
          <nav className="hidden lg:flex items-center gap-4">
            {categories
              .filter(c => c.key !== 'hepsi')
              .map(({ key, label, icon: Icon }) => (
                <Link
                  key={key}
                  href={`/products/category/${key}`}
                  title={CATEGORY_LABEL[key]}
                  className="flex flex-col items-center text-xs px-2 py-1
                             rounded hover:bg-white/10 transition"
                >
                  <Icon className="h-5 w-5 mb-0.5" />
                  {label}
                </Link>
              ))}
          </nav>

          {/* Sepet / Rezervasyon / Dil (md ▲) */}
          <ul className="hidden md:flex items-center gap-6 ml-auto">
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

            {/* Dil & Para birimi */}
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

          {/* Hamburger (md ▼) */}
          <button
            className="md:hidden ml-auto"
            onClick={() => setOpen(o => !o)}
            aria-label="Menüyü Aç / Kapat"
          >
            {open ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobil panel */}
      {open && (
        <div className="md:hidden bg-primary px-4 pb-6">
          {/* Arama (mobil) */}
          <form onSubmit={stopRefresh} role="search" className="my-4 flex">
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
          <ul className="flex flex-col gap-4 mb-6">
            {UTIL_LINKS.map(({ href, label, Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 py-2 hover:bg-white/10 rounded-lg"
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

          {/* Mobil kategori linkleri */}
          <nav className="flex flex-wrap gap-4">
            {categories
              .filter(c => c.key !== 'hepsi')
              .map(({ key, label, icon: Icon }) => (
                <Link
                  key={key}
                  href={`/products/category/${key}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm"
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              ))}
          </nav>
        </div>
      )}
    </header>
  )
}
