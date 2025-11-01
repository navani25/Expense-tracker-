import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { translations } from './translations';
// THIS IS THE FIX: The path is now corrected to look outside the components folder.
import { LANGUAGES } from '../constants';

type LanguageCode = typeof LANGUAGES[number]['code'];

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>('en');

  const setLanguage = useCallback((lang: LanguageCode) => {
    setLanguageState(lang);
  }, []);

  const t = useCallback((key: string): string => {
    const langKey = language as keyof typeof translations;
    const fallbackKey = 'en' as keyof typeof translations;
    
    const langTranslations = translations[langKey];
    const fallbackTranslations = translations[fallbackKey];
    
    return (langTranslations as Record<string, string>)?.[key] || (fallbackTranslations as Record<string, string>)?.[key] || key;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};