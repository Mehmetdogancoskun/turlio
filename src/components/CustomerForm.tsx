'use client';

import {
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { GuestInfo } from '@/context/CartContext';

declare global {
  interface Window {
    google: typeof google;
  }
}

/* ───────── Şema ───────── */
const schema = z.object({
  fullname: z.string().min(3, 'Ad Soyad gerekli'),
  phone: z.string().regex(/^\+?\d.{6,}$/, 'Geçerli telefon girin'),
  email: z.string().email('Geçerli e-posta girin'),
  hotel: z.string().min(2, 'Otel / Adres gerekli'),
  region: z.enum([
    'dubai',
    'abu-dhabi',
    'sharjah',
    'ras-al-khaimah',
    'fujairah',
    'ajman',
    'umm-al-quwain',
  ]),
});
export type CustomerFormData = z.infer<typeof schema>;

export interface CustomerFormHandle {
  isValid: () => boolean;
}

interface Props {
  onValidChange?: (info: GuestInfo | null) => void;
}

const GOOGLE_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ?? '';

function extractRegion(
  place: google.maps.places.PlaceResult
): CustomerFormData['region'] | null {
  const emirate = place.address_components?.find((c) =>
    c.types.includes('administrative_area_level_1')
  )?.long_name.toLowerCase();

  switch (emirate) {
    case 'dubai':
      return 'dubai';
    case 'abu dhabi':
      return 'abu-dhabi';
    case 'sharjah':
      return 'sharjah';
    case 'ras al khaimah':
      return 'ras-al-khaimah';
    case 'fujairah':
      return 'fujairah';
    case 'ajman':
      return 'ajman';
    case 'umm al quwain':
      return 'umm-al-quwain';
    default:
      return null;
  }
}

const CustomerForm = forwardRef<CustomerFormHandle, Props>(
  ({ onValidChange }, ref) => {
    const {
      register,
      setValue,
      formState: { isValid },
      watch,
    } = useForm<CustomerFormData>({
      resolver: zodResolver(schema),
      mode: 'onChange',
      defaultValues: {
        fullname: '',
        phone: '',
        email: '',
        hotel: '',
        region: undefined,
      },
    });

    /* Parent’a isValid() API’si */
    useImperativeHandle(ref, () => ({ isValid: () => isValid }), [isValid]);

    /* Google Places yükle → sadece BAE otelleri */
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      if (!inputRef.current || !GOOGLE_KEY) return;

      function init() {
        const ac = new window.google.maps.places.Autocomplete(inputRef.current!, {
          componentRestrictions: { country: 'ae' },
          types: ['lodging'],
        });
        ac.addListener('place_changed', () => {
          const place = ac.getPlace();
          const reg = extractRegion(place);
          if (place.name && reg) {
            setValue('hotel', place.name);
            setValue('region', reg, { shouldValidate: true, shouldDirty: true });
          }
        });
      }

      if (!window.google) {
        const s = document.createElement('script');
        s.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_KEY}&libraries=places`;
        s.async = true;
        s.onload = init;
        document.body.appendChild(s);
      } else {
        init();
      }
    }, [setValue]);

    /* Form değişimi üst bileşene aktar */
    useEffect(() => {
      const sub = watch((v) =>
        onValidChange?.(schema.safeParse(v).success ? (v as GuestInfo) : null)
      );
      return () => sub.unsubscribe();
    }, [watch, onValidChange]);

    /* ───────── UI ───────── */
    return (
      <form className="space-y-4" noValidate autoComplete="off">
        <div>
          <label className="block mb-1 text-sm font-medium">Ad Soyad</label>
          <input {...register('fullname')} className="input" />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">Telefon</label>
          <input {...register('phone')} type="tel" className="input" />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">E-posta</label>
          <input {...register('email')} type="email" className="input" />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">Otel / Adres</label>
          <input
            {...register('hotel')}
            ref={(el) => {
              register('hotel').ref(el);
              inputRef.current = el;
            }}
            placeholder="Otel / Adres yazın"
            className="input"
          />
        </div>
      </form>
    );
  }
);
CustomerForm.displayName = 'CustomerForm';
export { CustomerForm };
