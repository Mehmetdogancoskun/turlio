// src/components/HeroSection.tsx
'use client';

import React from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import Image from 'next/image';
import Link from 'next/link';

const IMAGE_PATHS = [
  '/Users/mehmetdogancoskun/Documents/dev/turlio/public/hero/1.webp', // Lütfen bu yolların doğru olduğundan emin olun
  '/Users/mehmetdogancoskun/Documents/dev/turlio/public/hero/2.webp',
  '/Users/mehmetdogancoskun/Documents/dev/turlio/public/hero/3.webp',
];

export const HeroSection = () => {
  const [emblaRef] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 4000, stopOnInteraction: false })]);

  return (
    <div className="embla" ref={emblaRef}>
      <div className="embla__container h-[70vh] min-h-[500px] max-h-[700px]">
        {IMAGE_PATHS.map((src, index) => (
          <div className="embla__slide relative" key={index}>
            <Image
              src={src}
              alt={`Dubai Hero Image ${index + 1}`}
              fill // 'layout="fill"' yerine 'fill' kullanıyoruz
              style={{ objectFit: 'cover' }} // 'objectFit' artık style içinde
              quality={85}
              className="brightness-[0.6]" // Karartma efektini biraz artırdık
              priority={index === 0}
            />
          </div>
        ))}
      </div>
      
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center text-white px-4">
        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight drop-shadow-lg animate-fade-in-down">
          Dubai'de Unutulmaz Anılar Biriktirin
        </h1>
        <p className="mt-4 max-w-2xl text-lg md:text-xl font-light drop-shadow-md animate-fade-in-up">
          En iyi turlar, güvenli transferler ve sorunsuz vize işlemleriyle hayalinizdeki BAE tatilini planlayın.
        </p>
        {/* YENİ: Harekete Geçirici Buton */}
        <Link href="#turlar" passHref>
          <button className="mt-8 px-8 py-3 bg-secondary hover:bg-opacity-90 text-white font-bold rounded-full shadow-lg transition-transform transform hover:scale-105 animate-fade-in">
            Turları Keşfet
          </button>
        </Link>
      </div>
    </div>
  );
};