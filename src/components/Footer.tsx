/* src/components/Footer.tsx */
import Link from 'next/link';
import {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
} from 'lucide-react';

/* ➊  TikTok ikonunu react‑icons’tan alıyoruz  */
import { FaTiktok } from 'react-icons/fa';

const year = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="mt-24 bg-gray-900 text-gray-100">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-3">
        {/* Dil / Para ******************************************************** */}
        <div>
          <h4 className="text-sm font-semibold mb-4">Dil</h4>
          <select className="w-full rounded-lg bg-gray-800 p-2 text-sm">
            <option>Türkçe</option>
            <option>English</option>
          </select>

          <h4 className="mt-6 text-sm font-semibold mb-4">Para birimi</h4>
          <select className="w-full rounded-lg bg-gray-800 p-2 text-sm">
            <option>BAE Dirhemi (د.إ)</option>
            <option>TRY</option>
            <option>USD</option>
          </select>
        </div>

        {/* Destek *********************************************************** */}
        <div>
          <h4 className="text-sm font-semibold mb-4">Destek</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/contact">İletişim</Link></li>
            <li><Link href="/help">Yasal Bildirim</Link></li>
            <li><Link href="/privacy">Gizlilik Politikası</Link></li>
          </ul>
        </div>

        {/* Şirket ************************************************************ */}
        <div>
          <h4 className="text-sm font-semibold mb-4">Şirket</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/about">Hakkımızda</Link></li>
            <li><Link href="/blog">Blog</Link></li>
            <li><Link href="/careers">Kariyer</Link></li>
          </ul>
        </div>
      </div>

      {/* Alt satır + Sosyal medya ****************************************** */}
      <div className="border-t border-white/10 py-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
          <p className="text-xs text-gray-400">
            © {year} Turlio. Tüm hakları saklıdır.
          </p>

          {/* ➋  Linkedin çıktı – TikTok girdi, renklendirme eklendi */}
          <div className="flex gap-4 text-gray-300">
            <a href="#" aria-label="Facebook"  className="hover:text-[#1877F2]"><Facebook size={20} /></a>
            <a href="#" aria-label="Instagram" className="hover:text-[#E4405F]"><Instagram size={20} /></a>
            <a href="#" aria-label="Twitter"   className="hover:text-[#1DA1F2]"><Twitter size={20} /></a>
            <a href="#" aria-label="YouTube"   className="hover:text-[#FF0000]"><Youtube size={20} /></a>
            <a href="#" aria-label="TikTok"    className="hover:text-[#000000]"><FaTiktok size={20} /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
