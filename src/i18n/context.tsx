'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import en from './translations/en.json';
import bn from './translations/bn.json';
import hi from './translations/hi.json';

export type Language = 'en' | 'bn' | 'hi';

type TranslationsDict = Record<string, unknown>;

const translations: Record<Language, TranslationsDict> = {
  en: en as TranslationsDict,
  bn: bn as TranslationsDict,
  hi: hi as TranslationsDict,
};

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  isLoaded: boolean;
}

const I18nContext = createContext<I18nContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key) => key,
  isLoaded: false,
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('krishibondhu_lang') as Language;
      if (stored && ['en', 'bn', 'hi'].includes(stored)) {
        setLanguageState(stored);
        document.documentElement.lang = stored;

        // Sync with Google Translate
        const gtVal = stored === 'en' ? '/en/en' : `/en/${stored}`;
        document.cookie = `googtrans=${gtVal}; path=/;`;
      }
    } catch {
      // Ignore localStorage errors in private browsing
    }
    setIsLoaded(true);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('krishibondhu_lang', lang);
      document.documentElement.lang = lang;

      // Sync Google Translate cookie
      const gtVal = lang === 'en' ? '/en/en' : `/en/${lang}`;
      document.cookie = `googtrans=${gtVal}; path=/;`;
      if (typeof window !== 'undefined' && window.location.hostname) {
        document.cookie = `googtrans=${gtVal}; path=/; domain=${window.location.hostname};`;
        document.cookie = `googtrans=${gtVal}; path=/; domain=.${window.location.hostname};`;
      }

      // If Google Translate combo box is rendered, trigger programmatic change
      const combo = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
      if (combo) {
        combo.value = lang;
        combo.dispatchEvent(new Event('change'));
      }
    } catch {
      // Ignore
    }
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.');
    
    // 1. Try target language
    let current: unknown = translations[language];
    for (const k of keys) {
      if (current && typeof current === 'object' && k in (current as Record<string, unknown>)) {
        current = (current as Record<string, unknown>)[k];
      } else {
        current = undefined;
        break;
      }
    }

    // 2. Fall back to English visibly if missing
    if (typeof current !== 'string') {
      let fallback: unknown = translations['en'];
      for (const k of keys) {
        if (fallback && typeof fallback === 'object' && k in (fallback as Record<string, unknown>)) {
          fallback = (fallback as Record<string, unknown>)[k];
        } else {
          fallback = undefined;
          break;
        }
      }
      current = typeof fallback === 'string' ? fallback : key;
    }

    let result = typeof current === 'string' ? current : key;

    // 3. Interpolate params {var}
    if (params && typeof result === 'string') {
      Object.entries(params).forEach(([paramKey, val]) => {
        result = result.replace(new RegExp(`{${paramKey}}`, 'g'), String(val));
      });
    }

    return result;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t, isLoaded }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  return useContext(I18nContext);
}
