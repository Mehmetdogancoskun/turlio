'use client';

import {
  forwardRef, useRef, useEffect, useImperativeHandle,
} from 'react';
import Script from 'next/script';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { GuestInfo } from '@/context/CartContext';

declare global { interface Window { google: typeof google } }

/* ── Zod şema ── */
const schema = z.object({
  fullname: z.string().min(3),
  phone: z.string().regex(/^\+?\d.{6,}$/),
  email: z.string().email(),
  hotel: z.string().min(2),
  region: z.enum([
    'dubai','abu-dhabi','sharjah','ras-al-khaimah',
    'fujairah','ajman','umm-al-quwain',
  ]),
});
type FormData = z.infer<typeof schema>;

export interface CustomerFormHandle { isValid: () => boolean }
interface Props { onValidChange?: (g:GuestInfo|null)=>void }

const GOOGLE_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY!;

/* Emirlik bul */
const toRegion = (place: google.maps.places.PlaceResult) =>{
  const map: Record<string, FormData['region']> = {
    'dubai':'dubai','abu dhabi':'abu-dhabi','sharjah':'sharjah',
    'ras al khaimah':'ras-al-khaimah','fujairah':'fujairah',
    'ajman':'ajman','umm al quwain':'umm-al-quwain',
  };
  const em = place.address_components?.find(c=>c.types.includes('administrative_area_level_1'))
           ?.long_name.toLowerCase();
  return map[em ?? ''] ?? null;
};

const CustomerForm = forwardRef<CustomerFormHandle,Props>(
({ onValidChange }, ref) => {
  const {
    register, setValue, watch,
    formState:{ isValid },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
  });
  useImperativeHandle(ref, () => ({ isValid: () => isValid }), [isValid]);

  /* Autocomplete init */
  const inputRef = useRef<HTMLInputElement>(null);
  const initAutocomplete = () => {
    if (!window.google || !inputRef.current) return;
    const ac = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ['lodging'],
      componentRestrictions:{ country:'ae' },
    });
    ac.addListener('place_changed', () => {
      const p = ac.getPlace();
      const reg = toRegion(p);
      if (p.name && reg) {
        setValue('hotel', p.name);
        setValue('region', reg, { shouldValidate:true });
      }
    });
  };

  /* Form değişim callback */
  useEffect(()=>{
    const sub=watch(v=>onValidChange?.(
      schema.safeParse(v).success ? v as GuestInfo : null
    ));
    return ()=>sub.unsubscribe();
  },[watch,onValidChange]);

  return (
    <>
      {/* ✔ Script yalnızca bir kez yüklenir */}
      {GOOGLE_KEY && (
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${GOOGLE_KEY}&libraries=places`}
          strategy="afterInteractive"
          onLoad={initAutocomplete}
        />
      )}

      <form className="space-y-4" autoComplete="off" noValidate>
        {[
          ['fullname','Ad Soyad','text'],
          ['phone','Telefon','tel'],
          ['email','E-posta','email'],
        ].map(([name,label,type])=>(
          <label key={name} className="block">
            <span className="mb-1 block text-sm font-medium">{label}</span>
            <input {...register(name as keyof FormData)} type={type} className="input"/>
          </label>
        ))}

        <label className="block">
          <span className="mb-1 block text-sm font-medium">Otel / Adres</span>
          <input
            {...register('hotel')}
            ref={(el)=>{ register('hotel').ref(el); inputRef.current=el }}
            placeholder="Otel / Adres yazın"
            className="input"
          />
        </label>
      </form>
    </>
  );
});
CustomerForm.displayName='CustomerForm';
export { CustomerForm };
