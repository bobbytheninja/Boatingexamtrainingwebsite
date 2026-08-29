import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language } from '../data/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('yacht-exam-language');
    if (saved) return saved as Language;
    // Auto-detect Bulgarian browser on first visit
    const lang = (navigator.language || (navigator.languages && navigator.languages[0]) || '').toLowerCase();
    if (lang.startsWith('bg')) return 'Bulgarian';
    return 'Bulgarian'; // Default to Bulgarian — primary market; Google crawler gets Bulgarian content
  });

  // Save to localStorage whenever language changes
  useEffect(() => {
    localStorage.setItem('yacht-exam-language', language);
  }, [language]);

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
