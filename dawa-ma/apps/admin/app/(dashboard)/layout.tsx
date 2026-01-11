'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';
import { LanguageSwitcher } from '@/components/language-switcher';
import { useTranslations } from '@/lib/i18n/context';

const navigationKeys = [
  { key: 'dashboard', href: '/dashboard', icon: '📊' },
  { key: 'users', href: '/users', icon: '👥' },
  { key: 'pharmacies', href: '/pharmacies', icon: '🏥' },
  { key: 'couriers', href: '/couriers', icon: '🚚' },
  { key: 'orders', href: '/orders', icon: '📦' },
  { key: 'verifications', href: '/verifications', icon: '✅' },
  { key: 'auditLogs', href: '/audit-logs', icon: '📝' },
  { key: 'reports', href: '/reports', icon: '📈' },
  { key: 'settings', href: '/settings', icon: '⚙️' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { t, dir } = useTranslations('nav');

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }} dir={dir}>
      {/* Sidebar */}
      <aside
        className={`sidebar fixed inset-y-0 ${dir === 'rtl' ? 'right-0' : 'left-0'} z-50 w-64`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 px-6 border-b" style={{ borderColor: 'var(--border-primary)' }}>
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--accent-primary)' }}
          >
            <span className="text-white font-bold text-lg">D</span>
          </div>
          <div>
            <span className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>DAWA.ma</span>
            <span className="block text-xs" style={{ color: 'var(--text-muted)' }}>{t('administration')}</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navigationKeys.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.key}
                href={item.href}
                className={cn(
                  'nav-item',
                  isActive && 'nav-item-active'
                )}
              >
                <span className="text-lg">{item.icon}</span>
                {t(item.key)}
              </Link>
            );
          })}
        </nav>

        {/* User Info */}
        <div
          className="absolute bottom-0 left-0 right-0 p-4 border-t"
          style={{ borderColor: 'var(--border-primary)' }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: 'var(--bg-surface)' }}
            >
              <span style={{ color: 'var(--text-primary)' }} className="font-semibold">
                {user?.name?.charAt(0) || 'A'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                {user?.name || 'Admin'}
              </p>
              <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                {user?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
              </p>
            </div>
          </div>
          <button
            className="btn-secondary w-full text-sm"
            onClick={logout}
          >
            {t('logout')}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={dir === 'rtl' ? 'pr-64' : 'pl-64'}>
        {/* Top Header */}
        <header
          className="sticky top-0 z-40 h-16 flex items-center px-6 border-b"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--border-primary)'
          }}
        >
          <div className="flex-1">
            <h1 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              {t(navigationKeys.find((n) => pathname.startsWith(n.href))?.key || 'dashboard')}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {/* Language Switcher */}
            <LanguageSwitcher />
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder={t('dashboard') === 'Dashboard' ? 'Search...' : 'Rechercher...'}
                className={`input w-64 ${dir === 'rtl' ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
              />
              <span
                className={`absolute ${dir === 'rtl' ? 'right-3' : 'left-3'} top-2.5`}
                style={{ color: 'var(--text-muted)' }}
              >
                🔍
              </span>
            </div>
            {/* Notifications */}
            <button
              className="relative p-2 rounded-lg transition-colors hover:bg-[var(--bg-elevated)]"
              style={{ color: 'var(--text-secondary)' }}
            >
              <span className="text-xl">🔔</span>
              <span
                className="absolute top-1 right-1 w-2 h-2 rounded-full status-online"
              />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
