'use client';

import { ChangeEvent } from 'react';
import { Search } from 'lucide-react';

export default function SearchBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="flex items-center max-w-md mx-auto mb-6">
      <Search className="w-5 h-5 text-gray-400 absolute ml-3 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder="Ürün adı ara..."
        className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />
    </div>
  );
}
