'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
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
    <div className="min-h-screen bg-gray-50" dir={dir}>
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 ${dir === 'rtl' ? 'right-0' : 'left-0'} z-50 w-64 bg-indigo-900 text-white`}>
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 px-6 border-b border-indigo-800">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <span className="text-indigo-600 font-bold">D</span>
          </div>
          <div>
            <span className="font-semibold text-lg">DAWA.ma</span>
            <span className="block text-xs text-indigo-300">{t('administration')}</span>
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
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-indigo-800 text-white'
                    : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'
                )}
              >
                <span className="text-lg">{item.icon}</span>
                {t(item.key)}
              </Link>
            );
          })}
        </nav>

        {/* User Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-indigo-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-indigo-700 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">
                {user?.name?.charAt(0) || 'A'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.name || 'Admin'}
              </p>
              <p className="text-xs text-indigo-300 truncate">
                {user?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full border-indigo-600 text-indigo-200 hover:bg-indigo-800 hover:text-white"
            onClick={logout}
          >
            {t('logout')}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={dir === 'rtl' ? 'pr-64' : 'pl-64'}>
        {/* Top Header */}
        <header className="sticky top-0 z-40 h-16 bg-white border-b border-gray-200 flex items-center px-6">
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-gray-900">
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
                className={`w-64 ${dir === 'rtl' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
              />
              <span className={`absolute ${dir === 'rtl' ? 'right-3' : 'left-3'} top-2.5 text-gray-400`}>🔍</span>
            </div>
            {/* Notifications */}
            <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
              <span className="text-xl">🔔</span>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
