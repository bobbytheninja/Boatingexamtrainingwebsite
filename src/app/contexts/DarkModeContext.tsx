import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { setTopBarColor, THEME_TOP_COLOR } from '../utils/topBarColor';

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

  // Skip the cross-fade on first paint — there is nothing to fade from, and
  // animating the initial render just delays it.
  const firstRun = useRef(true);

  useEffect(() => {
    const root = document.documentElement;

    // Elements style themselves from a mix of `dark:` classes and inline styles
    // keyed off this context. Those switch at different moments, so without a
    // shared transition the theme change arrives in visible stages. This turns
    // one on for the duration of the switch only — leaving it on permanently
    // would make ordinary hovers and focus rings feel sluggish.
    let timer: number | undefined;
    if (!firstRun.current && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      root.classList.add('theme-transition');
      timer = window.setTimeout(() => root.classList.remove('theme-transition'), 660);
    }
    firstRun.current = false;

    if (darkMode) {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      setTopBarColor(THEME_TOP_COLOR.dark);
    } else {
      root.classList.remove('dark');
      root.removeAttribute('data-theme');
      setTopBarColor(THEME_TOP_COLOR.light);
    }

    return () => {
      if (timer) window.clearTimeout(timer);
    };
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