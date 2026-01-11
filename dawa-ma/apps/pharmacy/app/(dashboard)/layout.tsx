'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { LanguageSwitcher } from '@/components/language-switcher';
import { useTranslations } from '@/lib/i18n/context';

const navigationKeys = [
  { key: 'dashboard', href: '/dashboard', icon: 'grid' },
  { key: 'orders', href: '/orders', icon: 'package' },
  { key: 'prescriptions', href: '/prescriptions', icon: 'file-text' },
  { key: 'inventory', href: '/inventory', icon: 'pill' },
  { key: 'finances', href: '/finances', icon: 'wallet' },
  { key: 'settings', href: '/settings', icon: 'settings' },
];

// Default pharmacy data (no auth required)
const defaultPharmacy = {
  name: 'Pharmacie Atlas',
  city: 'Casablanca',
};

// Icon component for cleaner code
function NavIcon({ name }: { name: string }) {
  const icons: Record<string, JSX.Element> = {
    grid: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
    package: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    'file-text': (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    pill: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
    wallet: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
    settings: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  };
  return icons[name] || null;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { t, dir } = useTranslations('nav');
  const pharmacy = defaultPharmacy;
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Find current nav index
  useEffect(() => {
    const index = navigationKeys.findIndex(
      (n) => pathname === n.href || pathname.startsWith(n.href + '/')
    );
    if (index >= 0) setSelectedIndex(index);
  }, [pathname]);

  // Keyboard navigation (J/K for up/down, Enter to navigate)
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'j':
          e.preventDefault();
          setSelectedIndex((i) => Math.min(i + 1, navigationKeys.length - 1));
          break;
        case 'k':
          e.preventDefault();
          setSelectedIndex((i) => Math.max(i - 1, 0));
          break;
        case 'enter':
          e.preventDefault();
          window.location.href = navigationKeys[selectedIndex].href;
          break;
      }
    },
    [selectedIndex]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const isRTL = dir === 'rtl';

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]" dir={dir}>
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 ${isRTL ? 'right-0' : 'left-0'} z-50 w-56 sidebar ${isRTL ? 'sidebar-rtl' : ''}`}
      >
        {/* Logo */}
        <div className="flex h-14 items-center gap-2 px-4 border-b border-white/[0.06]">
          <div className="w-7 h-7 bg-[var(--accent-primary)] rounded flex items-center justify-center">
            <span className="text-white font-bold text-sm">D</span>
          </div>
          <span className="font-semibold text-[var(--text-primary)]">DAWA.ma</span>
          <span className="text-[var(--text-muted)] text-xs font-mono ml-auto">v10</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navigationKeys.map((item, index) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const isSelected = index === selectedIndex;
            return (
              <Link
                key={item.key}
                href={item.href}
                className={`nav-item ${isActive ? 'active' : ''} ${isSelected && !isActive ? 'bg-[var(--bg-elevated)]' : ''}`}
              >
                <NavIcon name={item.icon} />
                <span>{t(item.key)}</span>
                {isSelected && (
                  <span className="kbd ml-auto">{index + 1}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Keyboard Hints */}
        <div className="px-4 py-3 border-t border-white/[0.06]">
          <div className="flex items-center gap-2 text-[var(--text-muted)] text-xs">
            <kbd className="kbd">J</kbd>
            <kbd className="kbd">K</kbd>
            <span>navigate</span>
            <kbd className="kbd ml-2">Enter</kbd>
            <span>select</span>
          </div>
        </div>

        {/* Pharmacy Info */}
        <div className="p-4 border-t border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[var(--accent-primary)]/20 rounded-full flex items-center justify-center">
              <span className="text-[var(--accent-primary)] font-semibold text-sm">
                {pharmacy.name.charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                {pharmacy.name}
              </p>
              <p className="text-xs text-[var(--text-muted)] truncate">
                {pharmacy.city}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={isRTL ? 'pr-56' : 'pl-56'}>
        {/* Top Header */}
        <header className="sticky top-0 z-40 h-14 bg-[var(--bg-secondary)] border-b border-white/[0.06] flex items-center px-6">
          <div className="flex-1">
            <h1 className="text-base font-medium text-[var(--text-primary)]">
              {t(navigationKeys.find((n) => pathname.startsWith(n.href))?.key || 'dashboard')}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <LanguageSwitcher />
            {/* Notifications */}
            <button className="relative p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] rounded transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--color-danger)] rounded-full" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
