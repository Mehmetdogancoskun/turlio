/*'use client';

import React from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import Image from 'next/image';
import Link from 'next/link';*/

/*  ◆◆ YALNIZCA BU 3 SATIR KALSIN ◆◆  */
const IMAGE_PATHS = ['/hero/1.webp', '/hero/2.webp', '/hero/3.webp'];

/*export const HeroSection = () => {
  const [emblaRef] = useEmblaCarousel(
    { loop: true },
    [Autoplay({ delay: 4000, stopOnInteraction: false })]
  );*/

  return (
    <div className="embla" ref={emblaRef}>
      {/* ↓ yükseklik ayarı yumuşatıldı */}
      <div className="embla__container h-[55vh] min-h-[320px] max-h-[600px]">
        {IMAGE_PATHS.map((src, index) => (
          <div className="embla__slide relative" key={index}>
            <Image
              src={src}
              alt={`Dubai Hero Image ${index + 1}`}
              fill
              style={{ objectFit: 'cover' }}
              quality={85}
              className="brightness-[0.6]"
              priority={index === 0}
            />
          </div>
        ))}
      </div>

      {/* üst yazı + CTA butonu değişmedi */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center text-white px-4">
        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight drop-shadow-lg">
          Dubai'de Unutulmaz Anılar Biriktirin
        </h1>
        <p className="mt-4 max-w-2xl text-lg md:text-xl font-light drop-shadow-md">
          En iyi turlar, güvenli transferler ve sorunsuz vize işlemleriyle hayalinizdeki BAE tatilini planlayın.
        </p>
        <Link href="#turlar">
          <button className="mt-8 px-8 py-3 btn-secondary rounded-full shadow-lg hover:scale-105 transition-transform">
            Turları Keşfet
          </button>
        </Link>
      </div>
    </div>
  );
};
