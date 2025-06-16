'use client';

import { useState } from 'react';
import {
  LayoutGrid,
  Globe,
  Car,
  Ticket,
  ShieldCheck,
} from 'lucide-react';

export type CatKey = 'hepsi' | 'tur' | 'transfer' | 'bilet' | 'vize';

export const categories: {
  key: CatKey;
  label: string;
  icon: React.ComponentType<any>;
}[] = [
  { key: 'hepsi',    label: 'Tümü',    icon: LayoutGrid },
  { key: 'tur',      label: 'Tur',     icon: Globe      },
  { key: 'transfer', label: 'Transfer',icon: Car        },
  { key: 'bilet',    label: 'Bilet',   icon: Ticket     },
  { key: 'vize',     label: 'Vize',    icon: ShieldCheck},
];

interface Props {
  selected?: CatKey | null;
  onSelect?: (cat: CatKey | null) => void;
}

export function CategoryIcons({
  selected,
  onSelect,
}: Props) {
  const [internal, setInternal] = useState<CatKey | null>('hepsi');
  const active      = selected ?? internal;
  const setSelected = onSelect  ?? setInternal;

  return (
    <div className="flex gap-6">
      {categories.map(({ key, label, icon: Icon }) => {
        const isActive = active === key;
        return (
          <button
            key={key}
            onClick={() => setSelected(isActive ? null : key)}
            className={`flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-full transition-transform
              ${
                isActive
                  ? 'bg-gradient-to-br from-emerald-500 to-green-400 text-white shadow-lg scale-110'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
          >
            <Icon className="h-7 w-7" />
            <span className="text-[11px] font-semibold uppercase tracking-wide">
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
