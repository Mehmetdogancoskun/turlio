import { supabase } from '@/lib/supabaseClient';

export default async function Home() {
  // Veritabanından ilk 10 ürünü alıyoruz
  const { data, error } = await supabase
    .from('urunler')
    .select('id, tur_adi, fiyat, para_birimi')
    .order('id', { ascending: true })
    .limit(10);

  // Hata yakalama (örneğin env değişkeni eksikse)
  if (error) {
    return (
      <main style={{ color: 'red', padding: 20 }}>
        Hata: {error.message}
      </main>
    );
  }

  // Başarılıysa ürün listesi
  return (
    <main style={{ padding: 20, color: 'white' }}>
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>İlk 10 Ürün</h1>
      <ul>
        {data?.map((u) => (
          <li key={u.id} style={{ marginBottom: 8 }}>
            {u.tur_adi} — {u.fiyat} {u.para_birimi}
          </li>
        ))}
      </ul>
    </main>
  );
}
