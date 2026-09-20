import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { flushSync } from 'react-dom';
import { runThemeTransition, getVariant } from '../utils/themeTransition';
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

  // Nothing to animate from on the first paint; animating it only delays
  // the initial render.
  const firstRun = useRef(true);

  useEffect(() => {
    const root = document.documentElement;

    // The wave runs top-down into dark and bottom-up back into light. The
    // classes carry both "a switch is happening" and which way it travels;
    // the delays per band live in the stylesheet.
    let timer: number | undefined;
    const bandFallback = getVariant() === 'wave'
      || typeof (document as any).startViewTransition !== 'function';
    if (!firstRun.current && bandFallback && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      root.classList.add('theme-wave', darkMode ? 'theme-wave-dark' : 'theme-wave-light');
      // Outlast the last band: 200ms delay + 420ms travel.
      timer = window.setTimeout(() => {
        root.classList.remove('theme-wave', 'theme-wave-dark', 'theme-wave-light');
      }, 640);
    }
    firstRun.current = false;

    if (darkMode) {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      setThemeTopColor(THEME_TOP_COLOR.dark);
    } else {
      root.classList.remove('dark');
      root.removeAttribute('data-theme');
      setThemeTopColor(THEME_TOP_COLOR.light);
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

  const toggleDarkMode = () => {
    runThemeTransition(() => {
      flushSync(() => setDarkModeState(prev => !prev));
    });
  };

  const setDarkMode = (value: boolean) => {
    runThemeTransition(() => {
      flushSync(() => setDarkModeState(value));
    });
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