import React, { createContext, useContext, ReactNode, useState } from 'react';
import { translations, Language, TranslationDictionary } from '../locales';

// Keys should be any key from the dictionary
type TranslationKey = keyof TranslationDictionary;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey | string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load from local storage or default to zh-HK
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('dev_app_language');
    return (saved as Language) || 'zh-HK';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('dev_app_language', lang);
  };

  const t = (key: TranslationKey | string): string => {
    const dict = translations[language] as Record<string, string>;
    const fallback = translations['zh-HK'] as Record<string, string>;
    // Fallback to zh-HK if key missing in current language, then key itself
    return dict?.[key] || fallback?.[key] || (key as string);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
