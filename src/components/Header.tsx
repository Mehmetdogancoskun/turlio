// src/components/Header.tsx
'use client';

import { useState, useContext } from 'react';
import Link from 'next/link';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { CartContext } from '@/context/CartContext'; // CartContext yolunu kontrol edin

const navLinks = [
  { href: '/products/tours', label: 'Turlar' },
  { href: '/products/transfers', label: 'Transfer' },
  { href: '/products/visa', label: 'Vize' },
  { href: '/contact', label: 'İletişim' },
];

export const Header = () => {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { cart } = useContext(CartContext);
  const itemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="bg-primary text-white shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold">
              Turlio
            </Link>
          </div>

          {/* Desktop Menü */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-white/80 transition-colors">
                {link.label}
              </Link>
            ))}
          </div>

          {/* Sağ Taraftaki İkonlar (Sepet ve Mobil Menü Butonu) */}
          <div className="flex items-center space-x-4">
            {/* Sepet İkonu */}
            <Link href="/cart" className="relative hidden md:block">
              <ShoppingCart className="h-6 w-6 hover:text-white/80 transition-colors" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-secondary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Mobil Menü Butonu (Hamburger) */}
            <div className="md:hidden">
              <button onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}>
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobil Menü Açılır Alanı */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-4">
            <div className="flex flex-col space-y-4 pt-4">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className="hover:bg-primary-dark rounded-md px-3 py-2" onClick={() => setMobileMenuOpen(false)}>
                  {link.label}
                </Link>
              ))}
              <Link href="/cart" className="border-t border-white/20 pt-4 flex items-center justify-between" onClick={() => setMobileMenuOpen(false)}>
                <span>Sepetim</span>
                <div className="relative">
                  <ShoppingCart className="h-6 w-6" />
                  {itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-secondary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {itemCount}
                    </span>
                  )}
                </div>
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};