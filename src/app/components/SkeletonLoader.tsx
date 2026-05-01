import React from 'react';

interface SkeletonLoaderProps {
  variant?: 'card' | 'text' | 'avatar' | 'button' | 'table' | 'exam-card' | 'question';
  count?: number;
  className?: string;
}

export function SkeletonLoader({ variant = 'card', count = 1, className = '' }: SkeletonLoaderProps) {
  const items = Array.from({ length: count });

  if (variant === 'card') {
    return (
      <div className={`space-y-4 ${className}`}>
        {items.map((_, index) => (
          <div key={index} className="skeleton rounded-lg p-6 space-y-4 animate-fadeIn" style={{ animationDelay: `${index * 100}ms` }}>
            <div className="skeleton skeleton-shimmer h-6 w-3/4 rounded"></div>
            <div className="skeleton skeleton-shimmer h-4 w-full rounded"></div>
            <div className="skeleton skeleton-shimmer h-4 w-5/6 rounded"></div>
            <div className="skeleton skeleton-shimmer h-10 w-32 rounded-md mt-4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'exam-card') {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 ${className}`}>
        {items.map((_, index) => (
          <div key={index} className="skeleton rounded-lg overflow-hidden animate-fadeInUp" style={{ animationDelay: `${index * 100}ms` }}>
            <div className="skeleton skeleton-shimmer h-40 w-full"></div>
            <div className="p-6 space-y-3">
              <div className="skeleton skeleton-shimmer h-6 w-3/4 rounded"></div>
              <div className="skeleton skeleton-shimmer h-4 w-full rounded"></div>
              <div className="skeleton skeleton-shimmer h-10 w-full rounded-md mt-4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'question') {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="skeleton rounded-lg p-6 animate-fadeIn">
          <div className="skeleton skeleton-shimmer h-8 w-full rounded mb-6"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton skeleton-shimmer h-12 w-full rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <div className={`space-y-2 ${className}`}>
        {items.map((_, index) => (
          <div key={index} className="skeleton skeleton-shimmer h-4 w-full rounded animate-fadeIn" style={{ animationDelay: `${index * 50}ms` }}></div>
        ))}
      </div>
    );
  }

  if (variant === 'avatar') {
    return (
      <div className={`flex gap-3 ${className}`}>
        {items.map((_, index) => (
          <div key={index} className="skeleton skeleton-shimmer w-12 h-12 rounded-full animate-scaleIn" style={{ animationDelay: `${index * 100}ms` }}></div>
        ))}
      </div>
    );
  }

  if (variant === 'button') {
    return (
      <div className={`flex gap-3 ${className}`}>
        {items.map((_, index) => (
          <div key={index} className="skeleton skeleton-shimmer h-10 w-24 rounded-md animate-fadeIn" style={{ animationDelay: `${index * 100}ms` }}></div>
        ))}
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="skeleton skeleton-shimmer h-12 w-full rounded-lg"></div>
        {items.map((_, index) => (
          <div key={index} className="skeleton skeleton-shimmer h-16 w-full rounded-lg animate-fadeIn" style={{ animationDelay: `${index * 50}ms` }}></div>
        ))}
      </div>
    );
  }

  return null;
}

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`skeleton rounded-lg p-6 space-y-4 ${className}`}>
      <div className="skeleton skeleton-shimmer h-6 w-3/4 rounded"></div>
      <div className="skeleton skeleton-shimmer h-4 w-full rounded"></div>
      <div className="skeleton skeleton-shimmer h-4 w-5/6 rounded"></div>
      <div className="skeleton skeleton-shimmer h-10 w-32 rounded-md mt-4"></div>
    </div>
  );
}

export function SkeletonText({ lines = 3, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div 
          key={index} 
          className="skeleton skeleton-shimmer h-4 rounded animate-fadeIn" 
          style={{ 
            width: index === lines - 1 ? '60%' : '100%',
            animationDelay: `${index * 50}ms` 
          }}
        ></div>
      ))}
    </div>
  );
}

export function SkeletonAvatar({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizeClass = size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-16 h-16' : 'w-12 h-12';
  
  return (
    <div className={`skeleton skeleton-shimmer ${sizeClass} rounded-full animate-scaleIn ${className}`}></div>
  );
}
