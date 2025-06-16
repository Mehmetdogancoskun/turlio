// src/app/page.tsx
import type { Metadata } from 'next'
import HomeClient from './HomeClient'          // ← client bileşen

export const metadata: Metadata = {
  title: 'Turlio',
  description: 'Gezilecek turlarınızı ve etkinliklerinizi kolayca rezerve edin',
}

export default function Page() {
  return <HomeClient />                        // başka JS yok!
}
