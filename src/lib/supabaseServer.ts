/* src/lib/supabaseServer.ts */
import { createClient } from '@supabase/supabase-js'

/**
 * Sunucu ortamı için Supabase client
 *  – Hizmet anahtarını (SUPABASE_SERVICE_KEY) kullanırsan RLS’i baypas eder
 *  – Sadece okunacaksa anon key de yeter
 */
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  // okumak yeterliyse anon-key; INSERT/UPDATE gerekiyorsa service key:
  process.env.SUPABASE_SERVICE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: { persistSession: false },
    global: { fetch },          // Next.js edge/fetch uyumu
  },
)
