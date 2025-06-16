/* src/components/BackButton.tsx */
'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function BackButton({ className = '' }: { className?: string }) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.back()}
      className={`inline-flex items-center gap-2 text-secondary hover:underline ${className}`}
    >
      <ArrowLeft size={20} /> Geri
    </button>
  );
}
