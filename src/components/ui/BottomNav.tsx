'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Music, Sparkles, BookOpen, FileText, Heart } from 'lucide-react';

const NAV_ITEMS = [
  { icon: Home,     label: 'HOME',    href: '/home'    as const },
  { icon: Music,    label: 'MUSIC',   href: '/music'   as const },
  { icon: Sparkles, label: 'LUMINA',  href: '/lumina'  as const },
  { icon: BookOpen, label: 'LIBRARY', href: '/library' as const },
  { icon: FileText, label: 'JOURNAL', href: '/journal' as const },
  { icon: Heart,    label: 'YOU',     href: '/you'     as const },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-[#09091a]/90 backdrop-blur-md border-t border-white/[0.06]">
      <div className="flex items-center justify-around px-4 py-3 max-w-lg mx-auto">
        {NAV_ITEMS.map(({ icon: Icon, label, href }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={label}
              href={href}
              className={`flex flex-col items-center gap-1 transition-colors ${
                active ? 'text-amber-300/80' : 'text-white/25 hover:text-white/45'
              }`}
            >
              <Icon size={18} />
              <span className="text-[8px] tracking-wider">{label}</span>
              {active && <span className="w-3 h-0.5 rounded-full bg-amber-300/60" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
