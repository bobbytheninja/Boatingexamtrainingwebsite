import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Language, getTranslation } from '../data/translations';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface PartnerBannerProps {
  onNavigate: (page: string, partnerIndex?: number) => void;
  language: Language;
  isLoggedIn: boolean;
}

export function PartnerBanner({ onNavigate, language, isLoggedIn }: PartnerBannerProps) {
  const t = getTranslation(language);
  const [isDismissed, setIsDismissed] = useState(() => {
    // Check if banner was dismissed or auto-dismissed on login
    return localStorage.getItem('partnerBannerDismissed_v2') === 'true';
  });
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  
  // Auto-dismiss banner when user logs in
  useEffect(() => {
    if (isLoggedIn && localStorage.getItem('partnerBannerAutoDismissed') !== 'true') {
      setIsDismissed(true);
      localStorage.setItem('partnerBannerDismissed_v2', 'true');
      localStorage.setItem('partnerBannerAutoDismissed', 'true');
    }
    
    // Clear dismissal when user logs out
    if (!isLoggedIn) {
      setIsDismissed(false);
      localStorage.removeItem('partnerBannerDismissed_v2');
      localStorage.removeItem('partnerBannerAutoDismissed');
    }
  }, [isLoggedIn]);

  const bannerTexts = [
    t.partnerBannerText1,
    t.partnerBannerText2,
    t.partnerBannerText3,
  ];

  // Rotate banner text every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTextIndex((prev) => (prev + 1) % bannerTexts.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [bannerTexts.length]);

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLoggedIn) {
      setIsDismissed(true);
      localStorage.setItem('partnerBannerDismissed_v2', 'true');
    }
  };

  const handleClick = () => {
    onNavigate('partners', currentTextIndex);
  };

  if (isDismissed) {
    return null;
  }

  return (
    <div
      onClick={handleClick}
      className="absolute top-[81px] left-0 right-0 z-40 bg-gradient-to-r from-sky-900/90 via-blue-900/90 to-cyan-900/90 backdrop-blur-md text-white py-3 px-4 cursor-pointer hover:from-sky-800/95 hover:via-blue-800/95 hover:to-cyan-800/95 transition-all duration-300 shadow-lg border-b border-cyan-400/40"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick();
        }
      }}
    >
      <div className="container mx-auto flex items-center justify-center relative">
        <p className="text-center text-sm md:text-base font-medium animate-fadeIn">
          {bannerTexts[currentTextIndex]}
        </p>
        
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleDismiss}
                className={`absolute right-0 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-colors duration-200 ${
                  isLoggedIn 
                    ? 'hover:bg-white/20 cursor-pointer' 
                    : 'opacity-60 cursor-not-allowed hover:opacity-100'
                }`}
                aria-label={isLoggedIn ? "Dismiss banner" : "Login to dismiss banner"}
              >
                <X className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent 
              side="bottom" 
              className="bg-slate-900 text-white border-slate-700 shadow-xl"
            >
              <p className="text-xs font-medium">
                {isLoggedIn ? 'Click to dismiss' : 'Login to dismiss banner'}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      {/* Dots indicator */}
      <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 flex gap-1.5">
        {bannerTexts.map((_, index) => (
          <div
            key={index}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              index === currentTextIndex ? 'bg-white w-4' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
