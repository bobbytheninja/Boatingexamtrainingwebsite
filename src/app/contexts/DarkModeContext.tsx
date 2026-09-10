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
  const [isAnimating, setIsAnimating] = useState(false);

  // Apply dark mode class to document element immediately on init
  useEffect(() => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('[DarkModeContext] 🎨 APPLYING DARK MODE');
    console.log('[DarkModeContext] darkMode state:', darkMode);
    console.log('[DarkModeContext] document.documentElement:', document.documentElement);
    console.log('[DarkModeContext] Current classes BEFORE:', document.documentElement.className);
    
    if (darkMode) {
      document.documentElement.classList.add('dark');
      console.log('[DarkModeContext] ✅ ADDED "dark" class');
      // Force style update by setting attribute as well
      document.documentElement.setAttribute('data-theme', 'dark');
      document.body.style.backgroundColor = '#1e293b'; // slate-800 (lighter)
    } else {
      document.documentElement.classList.remove('dark');
      console.log('[DarkModeContext] ❌ REMOVED "dark" class');
      document.documentElement.removeAttribute('data-theme');
      document.body.style.backgroundColor = '#ffffff'; // white
    }
    
    console.log('[DarkModeContext] Current classes AFTER:', document.documentElement.className);
    console.log('[DarkModeContext] Has "dark" class?:', document.documentElement.classList.contains('dark'));
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
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

  const toggleDarkMode = () => {
    console.log('[DarkModeContext] 🌓 Toggle called! Current:', darkMode, '-> New:', !darkMode);
    setDarkModeState(prev => !prev);
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