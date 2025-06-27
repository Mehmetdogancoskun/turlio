import Image from 'next/image'
import { notFound } from 'next/navigation'
import StepIndicator from '@/components/StepIndicator'
import ProductCard from '@/components/ProductCard'
import { supabase } from '@/lib/supabaseClient'
import BookingForm from './BookingForm'

interface Product {
  id: number
  tur_adi: string
  gorsel_url: string | null
  aciklama: string
  dahil_olanlar: string
  haric_olanlar: string
  fiyat: number
  para_birimi: string
  sub_category: string | null
  video_url?: string | null // opsiyonel – gömmek için
}

export const revalidate = 60 // ISR

export default async function ProductBody({ productId }: { productId: number }) {
  /* 1) Ürün verisi ------------------------------------------------------- */
  const { data: product, error } = await supabase
    .from<Product>('urunler')
    .select('*')
    .eq('id', productId)
    .single()

  if (error || !product) notFound()

  /* 2) Benzer ürünler ---------------------------------------------------- */
  const { data: similar = [] } = await supabase
    .from<Product>('urunler')
    .select('id, tur_adi, gorsel_url, fiyat, para_birimi')
    .neq('id', productId)
    .eq('sub_category', product.sub_category)
    .limit(8)

  /* 3) Medya dizisi (görsel + varsa video) ------------------------------ */
  const media: { type: 'image' | 'video'; src: string }[] = []
  if (product.gorsel_url) media.push({ type: 'image', src: product.gorsel_url })
  if (product.video_url) media.push({ type: 'video', src: product.video_url })

  /* 4) JSX -------------------------------------------------------------- */
  return (
    <>
      <StepIndicator currentStep={1} />

      {/* ————————————————— HERO + REZERVASYON ————————————————— */}
      <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px] animate-fadeIn">
        {/* ---- Medya Galerisi & Başlık ---- */}
        <article>
          <h1 className="mb-6 text-3xl md:text-4xl font-heading font-bold">
            {product.tur_adi}
          </h1>

          {/* scroll‑snap galeri (JS yok) */}
          <div className="flex overflow-x-auto gap-2 snap-x snap-mandatory rounded-lg">
            {media.map((m, i) => (
              <div
                key={i}
                className="relative snap-center shrink-0 w-full lg:w-2/3 aspect-[4/3]"
              >
                {m.type === 'image' ? (
                  <Image
                    src={m.src}
                    alt={`${product.tur_adi} görsel ${i + 1}`}
                    fill
                    sizes="(max-width:1024px) 100vw, 66vw"
                    className="object-cover rounded-lg"
                    priority={i === 0}
                  />
                ) : (
                  <iframe
                    src={m.src}
                    title={`${product.tur_adi} video ${i + 1}`}
                    className="h-full w-full rounded-lg"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                )}
              </div>
            ))}
          </div>

          {/* ---- Sekmeli içerik yerine hafif accordion ---- */}
          <section className="mt-8 space-y-4">
            {[
              { label: 'Açıklama', value: product.aciklama },
              { label: 'Neler Dahil?', value: product.dahil_olanlar },
              { label: 'Neler Hariç?', value: product.haric_olanlar },
            ].map(({ label, value }) => (
              <details
                key={label}
                open
                className="group rounded-lg bg-slate-50/60 dark:bg-slate-800/60 p-4 transition-colors"
              >
                <summary className="cursor-pointer list-none font-semibold text-lg select-none">
                  {label}
                </summary>
                <div className="prose prose-slate dark:prose-invert max-w-none pt-2">
                  <p>{value}</p>
                </div>
              </details>
            ))}
          </section>
        </article>

        {/* ---- Sticky Rezervasyon Formu ---- */}
        <aside className="lg:sticky lg:top-24">
          <BookingForm product={product} />
        </aside>
      </div>

      {/* ————————————————— BENZER TURLAR ————————————————— */}
      {similar.length > 0 && (
        <section className="mt-14 animate-fadeIn">
          <h2 className="mb-4 text-2xl font-heading font-semibold">Benzer Turlar</h2>

          {/* yatay kaydırılabilir kart listesi */}
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2">
            {similar.map((p) => (
              <div
                key={p.id}
                className="snap-start shrink-0 w-60 sm:w-64 lg:w-56"
              >
                <ProductCard product={p as any} />
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  )
}
