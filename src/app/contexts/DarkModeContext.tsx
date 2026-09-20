import React, { createContext, useContext, useState, useEffect } from 'react';
import { setThemeTopColor, THEME_TOP_COLOR } from '../utils/topBarColor';

interface DarkModeContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (value: boolean) => void;
}

const DarkModeContext = createContext<DarkModeContextType | undefined>(undefined);

export function DarkModeProvider({ children }: { children: React.ReactNode }) {
  // Initialize dark mode from localStorage or default to FALSE (light mode)
  // For new users, the app will start in light mode
  // For returning users, it will remember their preference
  const [darkMode, setDarkModeState] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('darkMode');
      return stored ? JSON.parse(stored) : false;
    } catch {
      return false;
    }
  });
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const root = document.documentElement;

    if (darkMode) {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      setThemeTopColor(THEME_TOP_COLOR.dark);
    } else {
      root.classList.remove('dark');
      root.removeAttribute('data-theme');
      setThemeTopColor(THEME_TOP_COLOR.light);
    }
  }, [darkMode]);

  useEffect(() => {
    try {
      localStorage.setItem('darkMode', JSON.stringify(darkMode));
    } catch {}
  }, [darkMode]);

  const toggleDarkMode = () => setDarkModeState(prev => !prev);

  const setDarkMode = (value: boolean) => {
    setDarkModeState(value);
  };

  return (
    <DarkModeContext.Provider value={{ darkMode, toggleDarkMode, setDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
}

export function useDarkMode() {
  const context = useContext(DarkModeContext);
  if (context === undefined) {
    throw new Error('useDarkMode must be used within a DarkModeProvider');
  }
  return context;
}