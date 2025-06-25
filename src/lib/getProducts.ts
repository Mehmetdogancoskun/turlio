// src/lib/getProducts.ts
import { supabase } from '@/lib/supabaseClient';
import type { CatKey } from '@/components/CategoryIcons';

/** İlgili product_type’a göre ürünleri getirir. */
export async function getProductsByType(type: CatKey) {
  const { data, error } = await supabase
    .from('urunler')
    .select('*')
    .eq('product_type', type);

  if (error) {
    console.error('Supabase getProductsByType:', error);
    return [];
  }
  return data ?? [];
}
