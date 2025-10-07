import { useState, useEffect } from 'react';
import en from '../locales/en.json';

type TranslationKey = string;
type TranslationValue = string | Record<string, any>;

interface Translations {
  [key: string]: TranslationValue;
}

// Simple translation hook
export const useTranslation = () => {
  const [locale, setLocale] = useState<string>('en');
  const [translations, setTranslations] = useState<Translations>(en);

  // Get nested translation by key (e.g., 'pages.home.hero.title')
  const t = (key: TranslationKey): string => {
    const keys = key.split('.');
    let value: any = translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation key not found: ${key}`);
        return key; // Return key as fallback
      }
    }
    
    return typeof value === 'string' ? value : key;
  };

  // Change language (for future use)
  const changeLanguage = async (newLocale: string) => {
    try {
      // For now, only English is supported
      if (newLocale === 'en') {
        setTranslations(en);
        setLocale(newLocale);
      }
    } catch (error) {
      console.error(`Failed to load locale: ${newLocale}`, error);
    }
  };

  return {
    t,
    locale,
    changeLanguage,
  };
};
