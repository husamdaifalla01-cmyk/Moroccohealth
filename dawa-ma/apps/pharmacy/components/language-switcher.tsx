'use client';

import { useI18n, locales, localeConfig } from '@/lib/i18n/context';

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();

  return (
    <div className="flex items-center gap-1 bg-[var(--bg-surface)] rounded p-0.5">
      {locales.map((loc) => (
        <button
          key={loc}
          onClick={() => setLocale(loc)}
          className={`px-2.5 py-1 text-xs font-medium rounded transition-all ${
            locale === loc
              ? 'bg-[var(--accent-primary)] text-white'
              : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]'
          }`}
          title={localeConfig[loc].name}
        >
          {loc.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
