'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export const locales = ['en', 'fr', 'ar'] as const;
export type Locale = (typeof locales)[number];

export const localeConfig: Record<Locale, { name: string; dir: 'ltr' | 'rtl' }> = {
  en: { name: 'English', dir: 'ltr' },
  fr: { name: 'Français', dir: 'ltr' },
  ar: { name: 'العربية', dir: 'rtl' },
};

export const defaultLocale: Locale = 'fr';

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

// Import all messages
import en from '@/messages/en.json';
import fr from '@/messages/fr.json';
import ar from '@/messages/ar.json';

const messages: Record<Locale, Record<string, unknown>> = { en, fr, ar };

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split('.');
  let current: unknown = obj;

  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return path; // Return the key if not found
    }
  }

  return typeof current === 'string' ? current : path;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('locale') as Locale;
    if (saved && locales.includes(saved)) {
      setLocaleState(saved);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      document.documentElement.lang = locale;
      document.documentElement.dir = localeConfig[locale].dir;
    }
  }, [locale, mounted]);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('locale', newLocale);
  };

  const t = (key: string): string => {
    return getNestedValue(messages[locale] as Record<string, unknown>, key);
  };

  if (!mounted) {
    return null;
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, dir: localeConfig[locale].dir }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}

export function useTranslations(namespace?: string) {
  const { t, locale, dir } = useI18n();

  return {
    t: (key: string) => t(namespace ? `${namespace}.${key}` : key),
    locale,
    dir,
  };
}
