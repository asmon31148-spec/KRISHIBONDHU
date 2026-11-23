'use client';

import React from 'react';
import { useTranslation, Language } from '@/i18n/context';
import { Languages } from 'lucide-react';

interface LanguageSelectorProps {
  variant?: 'header' | 'inline' | 'dropdown';
  className?: string;
}

const LANGUAGES: { code: Language; label: string; nativeName: string }[] = [
  { code: 'en', label: 'English', nativeName: 'English' },
  { code: 'bn', label: 'Bengali', nativeName: 'বাংলা' },
  { code: 'hi', label: 'Hindi', nativeName: 'हिन्दी' },
];

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  variant = 'header',
  className = '',
}) => {
  const { language, setLanguage } = useTranslation();

  if (variant === 'inline') {
    return (
      <div className={`flex items-center gap-1.5 p-1 bg-cream-100 rounded-lg border border-cream-200 ${className}`}>
        {LANGUAGES.map((l) => (
          <button
            key={l.code}
            type="button"
            onClick={() => setLanguage(l.code)}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-all ${
              language === l.code
                ? 'bg-brand-forest text-white shadow-sm'
                : 'text-brand-dark/80 hover:text-brand-dark hover:bg-cream-200/60'
            }`}
          >
            {l.nativeName}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <label htmlFor="language-select" className="sr-only">
        Language
      </label>
      <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 text-xs sm:text-sm font-medium bg-cream-100/90 hover:bg-cream-200 border border-cream-200/90 rounded-lg text-brand-dark transition-colors">
        <Languages className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-leaf shrink-0" aria-hidden="true" />
        <select
          id="language-select"
          value={language}
          onChange={(e) => setLanguage(e.target.value as Language)}
          className="bg-transparent border-none text-brand-dark font-semibold focus:ring-0 focus:outline-none cursor-pointer pr-1 text-xs sm:text-sm max-w-[70px] sm:max-w-none"
        >
          {LANGUAGES.map((l) => (
            <option key={l.code} value={l.code} className="bg-white text-gray-900">
              {l.nativeName}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
