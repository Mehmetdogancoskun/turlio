/* src/types/product.ts
   – Supabase ‘urunler’ tablosuna karşılık gelen tip */

export interface Product {
  id:            number
  tur_adi:       string
  para_birimi:   string
  fiyat:         number
  price_child?:  number | null
  price_infant?: number | null
  sub_category?: string | null
}
