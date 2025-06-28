'use client';

import {
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from 'react';
import Script from 'next/script';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { GuestInfo } from '@/context/CartContext';

declare global {
  interface Window { google: typeof google }
}

/* ───── Zod şema ───── */
const schema = z.object({
  fullname: z.string().min(3, 'Ad Soyad gerekli'),
  phone   : z.string().regex(/^\+?\\d.{6,}$/,'Geçerli telefon girin'),
  email   : z.string().email('Geçerli e-posta girin'),
  hotel   : z.string().min(2,'Otel / Adres gerekli'),
  region  : z.enum([
    'dubai','abu-dhabi','sharjah',
    'ras-al-khaimah','fujairah','ajman','umm-al-quwain',
  ]),
});
export type CustomerFormData = z.infer<typeof schema>;

/* ───── Public API ───── */
export interface CustomerFormHandle{ isValid:()=>boolean }
interface Props{ onValidChange?:(g:GuestInfo|null)=>void }

const GOOGLE_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY!;

/* Emirlik eşleştirme */
const extractRegion = (place:google.maps.places.PlaceResult) =>{
  const em = place.address_components?.find(c=>
    c.types.includes('administrative_area_level_1')
  )?.long_name?.toLowerCase();
  return ({
    'dubai':'dubai','abu dhabi':'abu-dhabi','sharjah':'sharjah',
    'ras al khaimah':'ras-al-khaimah','fujairah':'fujairah',
    'ajman':'ajman','umm al quwain':'umm-al-quwain',
  } as const)[em as keyof typeof em] ?? null;
};

const CustomerForm = forwardRef<CustomerFormHandle,Props>(
({ onValidChange },ref)=>{

  const {
    register,setValue,watch,
    formState:{isValid},
  } = useForm<CustomerFormData>({
    resolver:zodResolver(schema),
    mode:'onChange',
    defaultValues:{ fullname:'',phone:'',email:'',hotel:'' },
  });

  useImperativeHandle(ref,()=>({ isValid:()=>isValid }),[isValid]);

  /* ---------- Google Places ---------- */
  const inputRef = useRef<HTMLInputElement>(null);

  const initAutocomplete = ()=>{
    if(!window.google||!inputRef.current) return;
    const ac=new window.google.maps.places.Autocomplete(inputRef.current,{
      types:['lodging'],
      componentRestrictions:{ country:'ae' },   // tek satırda ayarı değiştirebilirsin
    });
    ac.addListener('place_changed',()=>{
      const p=ac.getPlace();
      const reg=extractRegion(p);
      if(p.name && reg){
        setValue('hotel',p.name);
        setValue('region',reg,{shouldValidate:true,shouldDirty:true});
      }
    });
  };

  /* ---------- Script yüklenince ---------- */
  useEffect(()=>{
    if(window.google) initAutocomplete();
  },[]);

  /* ---------- Form değişince üst bileşene bildir ---------- */
  useEffect(()=>{
    const sub=watch(v=>{
      onValidChange?.(schema.safeParse(v).success ? v as GuestInfo : null);
    });
    return()=>sub.unsubscribe();
  },[watch,onValidChange]);

  /* ---------- JSX ---------- */
  return(
    <>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${GOOGLE_KEY}&libraries=places`}
        strategy="afterInteractive"
        onLoad={initAutocomplete}
      />
      <form className="space-y-4" autoComplete="off" noValidate>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Ad Soyad</span>
          <input {...register('fullname')} className="input" />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium">Telefon</span>
          <input {...register('phone')} type="tel" className="input"/>
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium">E-posta</span>
          <input {...register('email')} type="email" className="input"/>
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium">Otel / Adres</span>
          <input
            {...register('hotel')}
            ref={el=>{
              register('hotel').ref(el);
              inputRef.current=el;
            }}
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
