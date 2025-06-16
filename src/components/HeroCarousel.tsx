'use client'; // ← MUTLAKA bu satır dosyanın en başında, boşluk ya da yorum OLAMAZ

import React, { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import useEmblaCarousel, { EmblaOptionsType } from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Slide {
  id: number;
  img: string;
  title: string;
  subtitle: string;
  cta?: { label: string; href: string };
}

const slides: Slide[] = [
  {
    id: 1,
    img: '/hero/1.webp',
    title: 'Dubai’nin Muhteşem Turları',
    subtitle: 'Şehrin en ikonik yerlerini keşfedin',
    cta: { label: 'Turları Gör', href: '/products/tours' },
  },
  {
    id: 2,
    img: '/hero/2.webp',
    title: 'Çöl Safarisi Macerası',
    subtitle: 'Adrenalin dolu bir gün sizi bekliyor',
    cta: { label: 'Safari Rezervasyonu', href: '/products/transfers' },
  },
  {
    id: 3,
    img: '/hero/3.webp',
    title: 'VIP Havalimanı Transferi',
    subtitle: 'Konforlu ve hızlı ulaşım',
    cta: { label: 'Transfer Seçenekleri', href: '/products/transfers' },
  },
];

const options: EmblaOptionsType = { loop: true };

export default function HeroCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel(options, [
    Autoplay({ delay: 4500, stopOnInteraction: false }),
  ]);
  const [selected, setSelected] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelected(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
  }, [emblaApi, onSelect]);

  const prev = () => emblaApi?.scrollPrev();
  const next = () => emblaApi?.scrollNext();

  return (
    <div className="relative h-full w-full">
      {/* viewport */}
      <div ref={emblaRef} className="h-full w-full overflow-hidden">
        <div className="embla__container flex h-full">
          {slides.map((s) => (
            <div
              key={s.id}
              className="embla__slide relative h-full shrink-0 grow-0 basis-full"
            >
              <Image
                src={s.img}
                alt={s.title}
                fill
                priority
                sizes="100vw"
                className="object-cover object-center"
              />

              {/* gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent z-10 pointer-events-none" />

              {/* metin + CTA */}
              <div className="absolute bottom-12 left-1/2 z-20 w-full max-w-2xl -translate-x-1/2 px-4 text-center text-white">
                <h2 className="text-3xl md:text-4xl font-heading font-bold drop-shadow">
                  {s.title}
                </h2>
                <p className="mt-2 text-base md:text-lg drop-shadow">
                  {s.subtitle}
                </p>
                {s.cta && (
                  <Link
                    href={s.cta.href}
                    className="mt-4 inline-block bg-secondary hover:bg-secondary/90 text-white font-semibold py-2 px-6 rounded-lg transition z-20"
                  >
                    {s.cta.label}
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* oklar */}
      <button
        onClick={prev}
        className="hidden md:flex items-center justify-center absolute top-1/2 left-4 z-30 h-10 w-10 -translate-y-1/2 rounded-full bg-black/40 hover:bg-black/60 text-white"
      >
        <ChevronLeft />
      </button>
      <button
        onClick={next}
        className="hidden md:flex items-center justify-center absolute top-1/2 right-4 z-30 h-10 w-10 -translate-y-1/2 rounded-full bg-black/40 hover:bg-black/60 text-white"
      >
        <ChevronRight />
      </button>

      {/* nokta gösterge */}
      <div className="absolute bottom-4 left-1/2 z-30 flex -translate-x-1/2 gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => emblaApi?.scrollTo(i)}
            className={`h-3 w-3 rounded-full transition ${
              i === selected ? 'bg-primary' : 'bg-white/60'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
