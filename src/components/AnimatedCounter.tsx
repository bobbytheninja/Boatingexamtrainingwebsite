import React, { useEffect, useState, useRef } from 'react';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
  decimals?: number;
}

export function AnimatedCounter({ 
  value, 
  duration = 1000, 
  suffix = '', 
  prefix = '', 
  className = '',
  decimals = 0 
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const counterRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // Intersection Observer to trigger animation when visible
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true);
            animateCount();
          }
        });
      },
      { threshold: 0.1 }
    );

    if (counterRef.current) {
      observer.observe(counterRef.current);
    }

    return () => {
      if (counterRef.current) {
        observer.unobserve(counterRef.current);
      }
    };
  }, [hasAnimated]);

  const animateCount = () => {
    const startTime = Date.now();
    const startValue = 0;
    const endValue = value;

    const updateCount = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      
      // Easing function: easeOutQuad
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentCount = startValue + (endValue - startValue) * easeProgress;
      
      setCount(currentCount);

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      } else {
        setCount(endValue);
      }
    };

    requestAnimationFrame(updateCount);
  };

  const displayValue = decimals > 0 ? count.toFixed(decimals) : Math.floor(count);

  return (
    <span ref={counterRef} className={className}>
      {prefix}{displayValue}{suffix}
    </span>
  );
}

interface StatCardProps {
  value: number;
  label: string;
  icon?: React.ReactNode;
  suffix?: string;
  prefix?: string;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'cyan';
  className?: string;
}

export function AnimatedStatCard({ 
  value, 
  label, 
  icon, 
  suffix = '', 
  prefix = '',
  color = 'blue',
  className = '' 
}: StatCardProps) {
  const colorClasses = {
    blue: 'from-blue-500 to-cyan-500 dark:from-blue-600 dark:to-cyan-600',
    green: 'from-green-500 to-emerald-500 dark:from-green-600 dark:to-emerald-600',
    purple: 'from-purple-500 to-pink-500 dark:from-purple-600 dark:to-pink-600',
    orange: 'from-orange-500 to-amber-500 dark:from-orange-600 dark:to-amber-600',
    cyan: 'from-cyan-500 to-sky-500 dark:from-cyan-600 dark:to-sky-600',
  };

  const bgClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20',
    green: 'bg-green-50 dark:bg-green-900/20',
    purple: 'bg-purple-50 dark:bg-purple-900/20',
    orange: 'bg-orange-50 dark:bg-orange-900/20',
    cyan: 'bg-cyan-50 dark:bg-cyan-900/20',
  };

  const iconClasses = {
    blue: 'text-blue-600 dark:text-blue-400',
    green: 'text-green-600 dark:text-green-400',
    purple: 'text-purple-600 dark:text-purple-400',
    orange: 'text-orange-600 dark:text-orange-400',
    cyan: 'text-cyan-600 dark:text-cyan-400',
  };

  return (
    <div 
      className={`relative overflow-hidden rounded-xl border-2 border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group ${className}`}
    >
      {/* Gradient Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses[color]} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
      
      {/* Content */}
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-lg ${bgClasses[color]}`}>
            {icon && <div className={iconClasses[color]}>{icon}</div>}
          </div>
        </div>
        
        <div className="space-y-1">
          <AnimatedCounter 
            value={value} 
            suffix={suffix} 
            prefix={prefix}
            duration={1500}
            className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 block"
          />
          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{label}</p>
        </div>
      </div>
    </div>
  );
}
