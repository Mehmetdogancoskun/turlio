// src/components/BackToHomeButton.tsx
'use client';

import Link from 'next/link';
import { Home } from 'lucide-react';

export default function BackToHomeButton() {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2 text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded transition"
    >
      <Home className="w-5 h-5" />
      Ana Sayfa
    </Link>
  );
}
