// src/components/TrustIcons.tsx
import { ShieldCheck, PhoneCall, DollarSign, Clock } from 'lucide-react';

const items = [
  { icon: ShieldCheck, label: 'Güvenli Ödeme' },
  { icon: DollarSign,  label: 'En İyi Fiyat'  },
  { icon: PhoneCall,   label: '7/24 Destek'   },
  { icon: Clock,       label: 'Ücretsiz İptal'},
];

export default function TrustIcons() {
  return (
    <section className="bg-white py-6">
      <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
        {items.map(({ icon: Icon, label }) => (
          <div key={label} className="flex flex-col items-center gap-2">
            <Icon className="h-8 w-8 text-emerald-600" />
            <p className="text-sm font-medium">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
