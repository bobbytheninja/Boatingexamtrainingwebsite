import React from 'react';
import { Loader2 } from 'lucide-react';
import { useDarkMode } from '../contexts/DarkModeContext';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export function LoadingSpinner({ size = 'md', text, className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <Loader2 className={`${sizeClasses[size]} animate-spin text-sky-600 dark:text-cyan-400`} />
      {text && (
        <p className="text-sm text-slate-600 dark:text-gray-400 animate-pulse font-medium">
          {text}
        </p>
      )}
    </div>
  );
}

// Simpler spinner for use inside buttons (no wrapper div to avoid ref issues)
export function ButtonSpinner({ className = '' }: { className?: string }) {
  return <Loader2 className={`w-4 h-4 animate-spin ${className}`} />;
}

export function FullPageLoader({ text }: { text?: string }) {
  const { darkMode } = useDarkMode();
  
  return (
    <div 
      className="min-h-screen flex items-center justify-center transition-all duration-[400ms]"
      style={{ 
        background: darkMode 
          ? 'linear-gradient(to bottom right, #0f172a, #1e293b, #0f172a)'
          : 'linear-gradient(to bottom right, #ffffff, #f0f9ff, #ffffff)',
        transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)'
      }}
    >
      <LoadingSpinner size="lg" text={text} />
    </div>
  );
}