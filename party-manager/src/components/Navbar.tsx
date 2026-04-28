'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from '@/lib/supabase/auth';
import { useRouter } from 'next/navigation';

const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard', icon: '🔥' },
  { href: '/payments', label: 'Pagamentos', icon: '💰' },
  { href: '/gallery', label: 'Galeria', icon: '📸' },
  { href: '/checklist', label: 'Checklist', icon: '✅' },
  { href: '/admin', label: 'Admin', icon: '⚙️' },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push('/');
  }

  return (
    <nav
      className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--background)]/95 backdrop-blur-sm"
      aria-label="Navegação principal"
    >
      <div className="mx-auto max-w-4xl flex items-center justify-between px-4 py-2">
        <Link
          href="/dashboard"
          className="text-lg font-bold text-[var(--primary)] shrink-0"
        >
          🔥 Churras
        </Link>

        {/* Desktop nav */}
        <ul className="hidden sm:flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                    isActive
                      ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                      : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]'
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              onClick={handleSignOut}
              className="rounded-md px-3 py-1.5 text-sm text-[var(--muted-foreground)] hover:text-[var(--destructive)] hover:bg-[var(--muted)] transition-colors"
            >
              Sair
            </button>
          </li>
        </ul>

        {/* Mobile nav */}
        <ul className="flex sm:hidden items-center gap-0.5 overflow-x-auto">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`flex flex-col items-center rounded-md px-2 py-1 text-xs transition-colors ${
                    isActive
                      ? 'text-[var(--primary)]'
                      : 'text-[var(--muted-foreground)]'
                  }`}
                  aria-label={link.label}
                >
                  <span className="text-base">{link.icon}</span>
                </Link>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              onClick={handleSignOut}
              className="flex flex-col items-center rounded-md px-2 py-1 text-xs text-[var(--muted-foreground)] transition-colors"
              aria-label="Sair"
            >
              <span className="text-base">🚪</span>
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}
