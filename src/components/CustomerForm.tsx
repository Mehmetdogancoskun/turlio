'use client'

import {
  forwardRef,
  useImperativeHandle,
  useEffect,
} from 'react'
import { useForm }                  from 'react-hook-form'
import { z }                        from 'zod'
import { zodResolver }              from '@hookform/resolvers/zod'
import type { GuestInfo }           from '@/context/CartContext'

/* ─────── Şema ─────── */
const schema = z.object({
  fullname: z.string().min(3, 'Ad Soyad gerekli'),
  phone   : z.string().regex(/^\+?\d.{6,}$/, 'Geçerli telefon girin'),
  email   : z.string().email('Geçerli e-posta girin'),
  hotel   : z.string().min(2, 'Otel / Adres gerekli'),
  region  : z.string().optional(),
})
export type CustomerFormData = z.infer<typeof schema>

/* dışarıya sunulan API */
export interface CustomerFormHandle { isValid: () => boolean }

interface Props {
  onValidChange?: (info: GuestInfo | null) => void
  regionExternal?: string | null
}

/* ─────── Bileşen ─────── */
const CustomerForm = forwardRef<CustomerFormHandle, Props>(
({ onValidChange, regionExternal }, ref) => {

  const {
    register,
    setValue,
    trigger,           // formu elle doğrulamak için
    getValues,
    watch,
    formState: { isValid },
  } = useForm<CustomerFormData>({
    resolver : zodResolver(schema),
    mode     : 'onChange',
    defaultValues: {
      fullname: '',
      phone   : '',
      email   : '',
      hotel   : '',
    },
  })

  /* başka bileşenler .isValid() diyebilsin */
  useImperativeHandle(ref, () => ({ isValid: () => isValid }), [isValid])

  /* Haricî bölge geldiğinde forma yaz – yalnızca değiştiğinde */
  useEffect(() => {
    if (regionExternal) {
      setValue('region', regionExternal, {
        shouldValidate : false,
        shouldDirty    : false,
      })
    }
  }, [regionExternal, setValue])

  /* Form izleyicisi – tek abonelik, loop’suz */
  useEffect(() => {
    const sub = watch(() => {
      // RHF’nin dahili “isValid”i anında güncellensin
      trigger()
      const ok = schema.safeParse(getValues()).success
      onValidChange?.(ok ? (getValues() as GuestInfo) : null)
    })
    return () => sub.unsubscribe()
  }, [watch, trigger, getValues, onValidChange])

  /* ─────── JSX ─────── */
  return (
    <form className="space-y-4" autoComplete="off" noValidate>
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
        <input {...register('hotel')} className="input" />
      </div>

      {getValues().region && (
        <div>
          <label className="block mb-1 text-sm font-medium">Bölge</label>
          <input
            value={getValues().region}
            readOnly
            className="input bg-gray-100 cursor-not-allowed"
          />
        </div>
      )}
    </form>
  )
})
CustomerForm.displayName = 'CustomerForm'
export { CustomerForm }
