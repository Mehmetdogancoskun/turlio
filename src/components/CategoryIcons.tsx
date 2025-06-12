// src/components/CategoryIcons.tsx
'use client';

import { LayoutGrid, Globe, Car, Ticket, ShieldCheck } from 'lucide-react';

export type CatKey = 'hepsi' | 'tur' | 'transfer' | 'bilet' | 'vize';
export const categories: { key: CatKey; label: string; icon: any }[] = [
  { key: 'hepsi',    label: 'Tümü',    icon: LayoutGrid   },
  { key: 'tur',      label: 'Tur',      icon: Globe        },
  { key: 'transfer', label: 'Transfer', icon: Car          },
  { key: 'bilet',    label: 'Bilet',    icon: Ticket       },
  { key: 'vize',     label: 'Vize',     icon: ShieldCheck  },
];

export default function CategoryIcons({
  selected,
  onSelect,
}: {
  selected: CatKey | null;
  onSelect: (cat: CatKey | null) => void;
}) {
  return (
    <div className="flex justify-center items-center gap-8 my-8">
      {categories.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => onSelect(selected === key ? null : key)}
          className={`
            flex flex-col items-center justify-center gap-2
            w-20 h-20 rounded-full
            transition-all duration-200
            ${selected === key
              ? 'bg-gradient-to-br from-emerald-500 to-green-400 shadow-lg scale-110'
              : 'bg-gray-800 hover:bg-gray-700'}
          `}
        >
          <Icon className={`
            w-8 h-8
            ${selected === key ? 'text-white' : 'text-gray-400 hover:text-white'}
          `} />
          <span className={`
            text-xs uppercase font-semibold
            ${selected === key ? 'text-white' : 'text-gray-300'}
          `}>
            {label}
          </span>
        </button>
      ))}
    </div>
  );
}
