'use client';

import { useState, useEffect, useRef, FormEvent } from 'react';
import { useRouter }   from 'next/navigation';
import { supabase }    from '@/lib/supabaseClient';
import { useCart }     from '@/context/CartContext';

/* --------------------------------------------------------------
   Tipler
-------------------------------------------------------------- */
interface Product {
  id:            number;
  tur_adi:       string;
  para_birimi:   string;
  fiyat:         number;
  price_child:   number | null;
  price_infant:  number | null;
}

interface Props {
  product:     Product;
  subCategory: string;              // “transfer” ise alınış saati alanı göster
}

/* --------------------------------------------------------------
   Bileşen
-------------------------------------------------------------- */
export default function RezervasyonForm({ product, subCategory }: Props) {
  const router        = useRouter();
  const { addToCart } = useCart();

  /* ---------------------------- Form State ---------------------------- */
  const [fullName , setFullName ] = useState('');
  const [phone    , setPhone    ] = useState('');
  const [email    , setEmail    ] = useState('');
  const [tarih    , setTarih    ] = useState('');
  const [otel     , setOtel     ] = useState('');
  const [region   , setRegion   ] = useState('');

  const hotelRef = useRef<HTMLInputElement>(null);

  const [pickupTime , setPickupTime ] = useState('');
  const [adult ,  setAdult ] = useState(1);
  const [child ,  setChild ] = useState(0);
  const [infant,  setInfant] = useState(0);
  const [childAges, setChildAges] = useState<number[]>([]);

  const [pickupFee , setPickupFee ] = useState(0);   // otel başına ek ücret
  const [regionMultiplier, setRegionMultiplier] = useState(1);

  /* -------------------- Google Autocomplete (otel) -------------------- */
  useEffect(() => {
    if (!hotelRef.current) return;

    const ac = new window.google.maps.places.Autocomplete(
      hotelRef.current,
      {
        types: ['establishment', 'geocode'],
        componentRestrictions: { country: 'ae' },
      },
    );

    ac.addListener('place_changed', () => {
      const place = ac.getPlace();
      setOtel(place.formatted_address || place.name || '');

      const comp = place.address_components?.find(c =>
        c.types.includes('administrative_area_level_1') ||
        c.types.includes('locality'),
      );
      setRegion(comp?.long_name || '');
    });
  }, []);

  /* ---------------------- Pickup ek ücreti (Supabase) ----------------- */
  useEffect(() => {
    if (!otel) { setPickupFee(0); return; }

    (async () => {
      const { data } = await supabase
        .from('oteller')
        .select('pickup_ek_fiyat')
        .eq('ad', otel)
        .single();

      setPickupFee(data?.pickup_ek_fiyat ?? 0);
    })();
  }, [otel]);

  /* --------------------- Bölge çarpanı (Supabase) --------------------- */
  useEffect(() => {
    if (!region) { setRegionMultiplier(1); return; }

    (async () => {
      const { data } = await supabase
        .from('region_pricing')
        .select('multiplier')
        .eq('region', region)
        .single();

      setRegionMultiplier(data?.multiplier ?? 1);
    })();
  }, [region]);

  /* ------------- Çocuk sayısına göre yaş listesi senk ----------------- */
  useEffect(() => {
    setChildAges(prev => {
      const arr = [...prev];
      while (arr.length < child) arr.push(2);
      while (arr.length > child) arr.pop();
      return arr;
    });
  }, [child]);

  /* ------------------------- FİYAT HESABI ----------------------------- */
  const childPrice  = product.price_child  && product.price_child  > 0
    ? product.price_child
    : product.fiyat;

  const infantPrice = product.price_infant || 0;

  const totalBase =
      product.fiyat * adult +
      childPrice     * child +
      infantPrice    * infant +
      pickupFee      * (adult + child + infant);

  const total = totalBase * regionMultiplier;

  /* -------------------------- SUBMIT ---------------------------------- */
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    addToCart({
      id:        product.id,
      tur_adi:   product.tur_adi,
      unitPrice: product.fiyat,          // 1 yetişkin
      lineTotal: Number(total.toFixed(2)),
      quantity:  1,

      // rezervasyon bilgileri
      fullName,
      phone,
      email,
      adult,
      child,
      infant,
      tarih,
      pickup_time: pickupTime,
      otel,
      region,
      child_ages: childAges,
    });

    router.push('/cart');
  };

  /* --------------------------- JSX ----------------------------------- */
  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 max-w-md mx-auto text-gray-800"
    >
      {/* ——— TOPLAM FİYAT ——— */}
      <p className="text-lg font-semibold">
        Toplam:&nbsp;
        {total.toFixed(2)}&nbsp;{product.para_birimi}
      </p>

      {region && regionMultiplier !== 1 && (
        <p className="text-sm text-gray-600">
          Bölge çarpanı: {regionMultiplier.toFixed(2)} ({region})
        </p>
      )}

      {/* ——— KİŞİSEL BİLGİLER ——— */}
      <input
        placeholder="Adınız Soyadınız"
        value={fullName}
        onChange={e => setFullName(e.target.value)}
        className="w-full px-3 py-2 rounded border border-gray-300 bg-gray-100"
        required
      />

      <input
        placeholder="Telefon (+905…)"
        value={phone}
        onChange={e => setPhone(e.target.value)}
        className="w-full px-3 py-2 rounded border border-gray-300 bg-gray-100"
        required
      />

      <input
        type="email"
        placeholder="E-posta"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="w-full px-3 py-2 rounded border border-gray-300 bg-gray-100"
        required
      />

      {/* ——— TARİH / OTEL / ALINIŞ SAATİ ——— */}
      <input
        type="date"
        value={tarih}
        onChange={e => setTarih(e.target.value)}
        className="w-full px-3 py-2 rounded border border-gray-300 bg-gray-100"
        required
      />

      <input
        ref={hotelRef}
        placeholder="Otel adı veya adres"
        value={otel}
        onChange={e => setOtel(e.target.value)}
        className="w-full px-3 py-2 rounded border border-gray-300 bg-gray-100"
        required
      />

      {subCategory === 'transfer' && (
        <input
          type="time"
          value={pickupTime}
          onChange={e => setPickupTime(e.target.value)}
          className="w-full px-3 py-2 rounded border border-gray-300 bg-gray-100"
        />
      )}

      {/* ——— KİŞİ SAYILARI ——— */}
      <div className="grid grid-cols-3 gap-2">
        <NumberInput label="Yetişkin" min={1} value={adult}  setValue={setAdult}  />
        <NumberInput label="Çocuk"   min={0} value={child}  setValue={setChild}  />
        <NumberInput label="Bebek"   min={0} value={infant} setValue={setInfant} />
      </div>

      {/* ——— ÇOCUK YAŞLARI ——— */}
      {child > 0 && (
        <div>
          <label className="text-sm block mb-1">Çocuk Yaşları</label>
          <div className="flex gap-2">
            {childAges.map((age, idx) => (
              <select
                key={idx}
                value={age}
                onChange={e => {
                  const arr = [...childAges];
                  arr[idx] = Number(e.target.value);
                  setChildAges(arr);
                }}
                className="px-3 py-1 rounded border border-gray-300 bg-gray-100"
              >
                {Array.from({ length: 17 }, (_, i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
            ))}
          </div>
        </div>
      )}

      {/* ——— SUBMIT BUTONU ——— */}
      <button type="submit" className="btn-primary w-full">
        Rezervasyonu Sepete Ekle
      </button>
    </form>
  );
}

/* --------------------------------------------------------------
   Yardımcı <NumberInput/> – tekrarı azaltmak için
-------------------------------------------------------------- */
function NumberInput({
  label,
  min,
  value,
  setValue,
}: {
  label: string;
  min: number;
  value: number;
  setValue: (n: number) => void;
}) {
  return (
    <div>
      <label className="text-sm block">{label}</label>
      <input
        type="number"
        min={min}
        value={value}
        onChange={e => setValue(Math.max(min, Number(e.target.value)))}
        className="w-full px-3 py-2 rounded border border-gray-300 bg-gray-100"
      />
    </div>
  );
}
