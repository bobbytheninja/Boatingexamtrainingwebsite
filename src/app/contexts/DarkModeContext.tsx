import React, { createContext, useContext, useState, useEffect } from 'react';

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
      const initialValue = stored ? JSON.parse(stored) : false; // Default: false = light mode
      console.log('[DarkModeContext] Initializing with:', initialValue);
      return initialValue;
    } catch (error) {
      console.error('[DarkModeContext] Error reading from localStorage:', error);
      return false; // Default to light mode on error
    }
  });

  // Apply dark mode class to document element immediately on init
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.removeAttribute('data-theme');
    }
    // Let CSS custom properties handle body/html background — no direct style assignment
    // so the .dark-transitioning rule can animate it uniformly.
    document.body.style.backgroundColor = '';
  }, [darkMode]);

  // Persist dark mode to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('darkMode', JSON.stringify(darkMode));
      console.log('[DarkModeContext] Dark mode saved to localStorage:', darkMode);
    } catch (error) {
      console.error('[DarkModeContext] Error saving to localStorage:', error);
    }
  }, [darkMode]);

  const TRANSITION_MS = 350;

  const toggleDarkMode = () => {
    document.documentElement.classList.add('dark-transitioning');
    setDarkModeState(prev => !prev);
    setTimeout(() => {
      document.documentElement.classList.remove('dark-transitioning');
    }, TRANSITION_MS);
  };

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