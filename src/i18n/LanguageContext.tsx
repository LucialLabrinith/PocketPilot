import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, translations } from './translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  useIndicNumerals: boolean;
  setUseIndicNumerals: (val: boolean) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  formatNumber: (value: number | string) => string;
  formatCurrency: (value: number | string, currency?: string) => string;
  formatDate: (dateStr: string) => string;
  formatDigits: (val: string | number) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Indic digit mappings
const devanagariDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
const teluguDigits = ['౦', '౧', '౨', '౩', '౪', '౫', '౬', '౭', '౮', '౯'];

export function convertToIndicDigits(str: string, lang: Language): string {
  if (lang === 'hi' || lang === 'mr') {
    return str.replace(/[0-9]/g, d => devanagariDigits[parseInt(d, 10)]);
  } else if (lang === 'te') {
    return str.replace(/[0-9]/g, d => teluguDigits[parseInt(d, 10)]);
  }
  return str;
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('pocketpilot_lang') as Language) || 'en';
  });

  const [useIndicNumerals, setUseIndicNumeralsState] = useState<boolean>(() => {
    return localStorage.getItem('pocketpilot_indic_numerals') === 'true';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('pocketpilot_lang', lang);
  };

  const setUseIndicNumerals = (val: boolean) => {
    setUseIndicNumeralsState(val);
    localStorage.setItem('pocketpilot_indic_numerals', String(val));
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    const entry = translations[key];
    let text = entry ? (entry[language] || entry.en) : key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(new RegExp(`{${k}}`, 'g'), String(v));
      });
    }
    return text;
  };

  const formatDigits = (val: string | number): string => {
    const s = String(val);
    if (useIndicNumerals && (language === 'hi' || language === 'mr' || language === 'te')) {
      return convertToIndicDigits(s, language);
    }
    return s;
  };

  const formatNumber = (value: number | string): string => {
    const num = typeof value === 'number' ? value : parseFloat(value || '0');
    if (isNaN(num)) return '0.00';

    // Format with Indian grouping (Lakhs/Crores) for Indian locales
    const localeString = (language === 'hi' || language === 'mr' || language === 'te')
      ? 'en-IN'
      : 'en-US';

    const formatted = new Intl.NumberFormat(localeString, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);

    if (useIndicNumerals && (language === 'hi' || language === 'mr' || language === 'te')) {
      return convertToIndicDigits(formatted, language);
    }
    return formatted;
  };

  const formatCurrency = (value: number | string, currency = 'USD'): string => {
    const formattedNum = formatNumber(value);
    const sym = currency === 'INR' ? '₹' :
      currency === 'EUR' ? '€' :
      currency === 'GBP' ? '£' : '$';

    return `${sym} ${formattedNum}`;
  };

  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;

    const locale = language === 'hi' ? 'hi-IN' :
      language === 'mr' ? 'mr-IN' :
      language === 'te' ? 'te-IN' : 'en-US';

    const formatted = new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);

    if (useIndicNumerals && (language === 'hi' || language === 'mr' || language === 'te')) {
      return convertToIndicDigits(formatted, language);
    }
    return formatted;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        useIndicNumerals,
        setUseIndicNumerals,
        t,
        formatNumber,
        formatCurrency,
        formatDate,
        formatDigits,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
