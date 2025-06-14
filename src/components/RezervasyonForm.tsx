'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabaseClient';

interface Product {
  id: number;
  tur_adi: string;
  para_birimi: string;
  fiyat: number;
  price_child: number | null;
  price_infant: number | null;
}

export default function RezervasyonForm({
  product,
  subCategory,
}: {
  product: Product;
  subCategory: string;
}) {
  const router = useRouter();
  const { addToCart } = useCart();

  /* ---------- State ---------- */
  const [fullName, setFullName] = useState('');
  const [phone, setPhone]       = useState('');
  const [email, setEmail] = useState('');
  const [tarih, setTarih]       = useState('');
  const [otel, setOtel]         = useState('');
  const hotelRef                = useRef<HTMLInputElement>(null);
  const [pickupTime, setPickupTime] = useState('');

  const [adult,  setAdult]  = useState(1);
  const [child,  setChild]  = useState(0);
  const [infant, setInfant] = useState(0);
  const [childAges, setChildAges] = useState<number[]>([]);

  const [pickupFee, setPickupFee]       = useState(0);
  const [region,    setRegion]          = useState('');
  const [regionMultiplier, setRegionMultiplier] = useState(1);

  /* ---------- Google Autocomplete ---------- */
  useEffect(() => {
    if (!hotelRef.current) return;
    const ac = new window.google.maps.places.Autocomplete(
      hotelRef.current,
      { types: ['establishment','geocode'], componentRestrictions:{ country:'ae' } }
    );
    ac.addListener('place_changed', () => {
      const place = ac.getPlace();
      setOtel(place.formatted_address || place.name || '');
      const comp = place.address_components?.find(c =>
        c.types.includes('administrative_area_level_1') ||
        c.types.includes('locality')
      );
      setRegion(comp?.long_name || '');
    });
  }, []);

  /* ---------- Supabase pickup ücreti ---------- */
  useEffect(() => {
    if (!otel) return setPickupFee(0);
    (async () => {
      const { data } = await supabase
        .from('oteller')
        .select('pickup_ek_fiyat')
        .eq('ad', otel)
        .single();
      setPickupFee(data?.pickup_ek_fiyat ?? 0);
    })();
  }, [otel]);

  /* ---------- Region multiplier ---------- */
  useEffect(() => {
    if (!region) return setRegionMultiplier(1);
    (async () => {
      const { data } = await supabase
        .from('region_pricing')
        .select('multiplier')
        .eq('region', region)
        .single();
      setRegionMultiplier(data?.multiplier ?? 1);
    })();
  }, [region]);

  /* ---------- Çocuk yaş dizisi ---------- */
  useEffect(() => {
    setChildAges(prev => {
      const arr = [...prev];
      while (arr.length < child) arr.push(2);
      while (arr.length > child) arr.pop();
      return arr;
    });
  }, [child]);

  /* ---------- Fiyat Hesabı ---------- */
  const childPrice  = product.price_child  && product.price_child  > 0 ? product.price_child  : product.fiyat;
  const infantPrice = product.price_infant || 0;

  const totalBase =
    product.fiyat * adult +
    childPrice     * child +
    infantPrice    * infant +
    pickupFee      * (adult + child + infant);

  const total = totalBase * regionMultiplier;

  /* ---------- Submit ---------- */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addToCart({
      id: product.id,
      tur_adi: product.tur_adi,
      unitPrice: product.fiyat,  // tek yetişkin birim fiyatı
      lineTotal: total,          // hesaplanmış genel toplam
      quantity: 1,
      fullName,
      phone,
      tarih,
      otel,
      region,
      pickup_time: pickupTime,
      adult,
      child,
      infant,
      child_ages: childAges,
      email,
    });
    router.push('/cart');
  };

  /* ---------- JSX ---------- */
  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto text-white">
      <p className="text-lg font-semibold">
        Toplam: {total.toFixed(2)} {product.para_birimi}
      </p>
      {region && regionMultiplier !== 1 && (
        <p className="text-sm text-gray-400">
          Bölge çarpanı: {regionMultiplier.toFixed(2)} ({region})
        </p>
      )}

      {/* Ad Soyad */}
      <input
        placeholder="Adınız Soyadınız"
        value={fullName}
        onChange={e => setFullName(e.target.value)}
        className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-600"
        required
      />

      {/* Telefon */}
      <input
        placeholder="Telefon (+905…)"
        value={phone}
        onChange={e => setPhone(e.target.value)}
        className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-600"
        required
      />

      <input
        type="email"
        placeholder="E-posta"
       value={email}
       onChange={e => setEmail(e.target.value)}
       required
       className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-600"
      />

      {/* Tarih */}
      <input
        type="date"
        value={tarih}
        onChange={e => setTarih(e.target.value)}
        className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-600"
        required
      />

      {/* Otel */}
      <input
        ref={hotelRef}
        placeholder="Otel adı veya adres"
        value={otel}
        onChange={e => setOtel(e.target.value)}
        className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-600"
        required
      />

      {/* Alınış Saati sadece transfer */}
      {subCategory === 'transfer' && (
        <input
          type="time"
          value={pickupTime}
          onChange={e => setPickupTime(e.target.value)}
          className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-600"
        />
      )}

      {/* Kişi Sayıları */}
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="text-sm">Yetişkin</label>
          <input
            type="number"
            min={1}
            value={adult}
            onChange={e => setAdult(Math.max(1, Number(e.target.value)))}
            className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-600"
          />
        </div>
        <div>
          <label className="text-sm">Çocuk</label>
          <input
            type="number"
            min={0}
            value={child}
            onChange={e => setChild(Math.max(0, Number(e.target.value)))}
            className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-600"
          />
        </div>
        <div>
          <label className="text-sm">Bebek</label>
          <input
            type="number"
            min={0}
            value={infant}
            onChange={e => setInfant(Math.max(0, Number(e.target.value)))}
            className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-600"
          />
        </div>
      </div>

      {/* Çocuk Yaşları */}
      {child > 0 && (
        <div>
          <label className="text-sm">Çocuk Yaşları</label>
          <div className="flex gap-2 mt-1">
            {childAges.map((age, idx) => (
              <select
                key={idx}
                value={age}
                onChange={e => {
                  const arr = [...childAges];
                  arr[idx] = Number(e.target.value);
                  setChildAges(arr);
                }}
                className="px-3 py-1 rounded bg-gray-800 border border-gray-600"
              >
                {Array.from({ length: 17 }).map((_, i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
            ))}
          </div>
        </div>
      )}

      <button
        type="submit"
        className="w-full bg-emerald-600 hover:bg-emerald-700 py-2 rounded"
      >
        Sepete Ekle
      </button>
    </form>
  );
}