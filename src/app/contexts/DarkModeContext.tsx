import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
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

  const waveTimer = useRef<number | undefined>(undefined);

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

  /**
   * Puts the wave classes on <html> *before* the state change.
   *
   * This used to live in the effect below, which runs after React has
   * committed the new colours — by then the browser has already started
   * transitioning them using each component's own `transition-all
   * duration-[400ms]`, and a class arriving afterwards cannot retime a
   * transition already in flight. That is why text kept easing however low the
   * duration went, and why two cards on the same page could move at different
   * speeds: it depended on when each one committed relative to the class.
   *
   * Setting it synchronously first means the rules are in place before a
   * single colour changes.
   */
  const armThemeWave = (goingDark: boolean) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const root = document.documentElement;
    if (waveTimer.current) window.clearTimeout(waveTimer.current);
    root.classList.remove('theme-wave-dark', 'theme-wave-light');
    root.classList.add('theme-wave', goingDark ? 'theme-wave-dark' : 'theme-wave-light');
    // Outlast the last band: 150ms delay + 280ms travel.
    waveTimer.current = window.setTimeout(() => {
      root.classList.remove('theme-wave', 'theme-wave-dark', 'theme-wave-light');
    }, 460);
  };

  const toggleDarkMode = () => {
    // Read from this render's value rather than the updater: a side effect
    // inside an updater runs twice under StrictMode.
    armThemeWave(!darkMode);
    setDarkModeState(prev => !prev);
  };

  const setDarkMode = (value: boolean) => {
    armThemeWave(value);
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