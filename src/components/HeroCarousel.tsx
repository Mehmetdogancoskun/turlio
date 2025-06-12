// src/components/HeroCarousel.tsx
'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

const IMAGES = ['/hero/1.webp', '/hero/2.webp', '/hero/3.webp'];
const INTERVAL = 4000; // ms

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setIndex((i) => (i + 1) % IMAGES.length),
      INTERVAL
    );
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative w-full h-[60vh] overflow-hidden">
      {IMAGES.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt="Turlio Hero"
          fill
          priority={i === 0}
          sizes="100vw"
          className={`object-cover transition-opacity duration-700 ${
            i === index ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}

      {/* karartma katmanı */}
      <div className="absolute inset-0 bg-black/40" />

      {/* başlık */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center text-white px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-heading font-bold">
          Hayalindeki Tatili Bul
        </h1>
      </div>
    </div>
  );
}
