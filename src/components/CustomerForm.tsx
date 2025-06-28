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

/* ───────── Zod şema ───────── */
const schema = z.object({
  fullname: z.string().min(3, 'Ad Soyad gerekli'),
  phone: z
    .string()
    .regex(/^\+?\d.{6,}$/, 'Geçerli telefon girin (örn. +905…)'),
  email: z.string().email('Geçerli e-posta girin'),
  hotel: z.string().min(2, 'Otel adı gerekli'),
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

/* Emirlik eşleme */
function extractRegion(place: google.maps.places.PlaceResult): CustomerFormData['region'] | null {
  const comp = place.address_components ?? [];
  const emirate = comp.find((c) =>
    c.types.includes('administrative_area_level_1')
  )?.long_name?.toLowerCase();

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
      getValues,
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

    /* Expose to parent */
    useImperativeHandle(ref, () => ({ isValid: () => isValid }), [isValid]);

    /* -------- Google Places yükle 1 kez -------- */
    const inputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
      if (!inputRef.current || !GOOGLE_KEY) return;

      // Script zaten ekliyse tekrar ekleme
      if (!window.google) {
        const s = document.createElement('script');
        s.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_KEY}&libraries=places`;
        s.async = true;
        document.body.appendChild(s);
        s.onload = initAutocomplete;
      } else {
        initAutocomplete();
      }

      function initAutocomplete() {
        if (!window.google || !inputRef.current) return;
        const ac = new window.google.maps.places.Autocomplete(inputRef.current!, {
          componentRestrictions: { country: 'ae' },
          types: ['lodging'],
        });

        ac.addListener('place_changed', () => {
          const place = ac.getPlace();
          const reg = extractRegion(place);
          if (reg) {
            setValue('hotel', place.name ?? '');
            setValue('region', reg, { shouldValidate: true, shouldDirty: true });
          }
        });
      }
    }, [setValue]);

    /* -------- Form değişimi ana sayfaya bildir -------- */
    useEffect(() => {
      const sub = watch((values) => {
        const ok = schema.safeParse(values).success;
        onValidChange?.(ok ? (values as GuestInfo) : null);
      });
      return () => sub.unsubscribe();
    }, [watch, onValidChange]);

    /* -------- JSX -------- */
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
          <label className="block mb-1 text-sm font-medium">
            Otel (yalnızca BAE)
          </label>
          <input
            {...register('hotel')}
            ref={(el) => {
              register('hotel').ref(el);
              inputRef.current = el;
            }}
            placeholder="Otel adı girin"
            className="input"
          />
          <p className="mt-1 text-xs text-gray-500">
            Sadece BAE’deki oteller listelenir.
          </p>
        </div>
      </form>
    );
  }
);
CustomerForm.displayName = 'CustomerForm';
export { CustomerForm };
