import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Check } from 'lucide-react';
import { getTranslation } from '../data/translations';
import { Navigation } from './Navigation';
import { Footer } from './Footer';
import { useDarkMode } from '../contexts/DarkModeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { projectId } from '../utils/supabase/info';
import { LoadingSpinner } from './LoadingSpinner';

interface ExamCategory {
  type: string;
  title: string;
  titleBg: string;
  description: string;
  descriptionBg: string;
  icon: string;
  color: string;
  image: string;
  price?: number;
  order?: number;
}

interface PricingPageProps {
  onNavigate: (page: string) => void;
  isLoggedIn: boolean;
}

export function PricingPage({ onNavigate, isLoggedIn }: PricingPageProps) {
  const { language } = useLanguage();
  const t = getTranslation(language);
  const { darkMode } = useDarkMode();
  const [examCategories, setExamCategories] = useState<ExamCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [overallPrice, setOverallPrice] = useState<number>(5);
  
  const handleGetStarted = () => {
    if (isLoggedIn) {
      onNavigate('/payment');
    } else {
      onNavigate('/login');
    }
  };

  const handleNavigate = (page: string) => {
    if (page === 'pricing') return;
    if (page === 'home') {
      onNavigate(isLoggedIn ? '/home' : '/');
    } else if (page === 'login') {
      onNavigate('/login');
    } else if (page === 'account') {
      onNavigate('/account');
    } else {
      onNavigate(`/${page}`);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('');
        console.log('💰💰💰 [PricingPage] FETCHING DATA');
        
        // Fetch categories
        const categoriesResponse = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-d36f8f91/categories`);
        
        if (categoriesResponse.ok) {
          const data = await categoriesResponse.json();
          console.log('💰 [PricingPage] Categories fetched:', data.categories?.length);
          setExamCategories(data.categories || []);
        } else {
          console.warn('❌ [PricingPage] Failed to fetch categories, using empty array');
        }

        // Fetch pricing settings
        console.log('💰 [PricingPage] Fetching pricing settings...');
        const pricingResponse = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-d36f8f91/pricing-settings`);
        
        console.log('💰 [PricingPage] Pricing response status:', pricingResponse.status);
        
        if (pricingResponse.ok) {
          const pricingData = await pricingResponse.json();
          console.log('💰 [PricingPage] Pricing data received:', JSON.stringify(pricingData));
          console.log('💰 [PricingPage] Overall price from data:', pricingData.settings?.overallPrice);
          const price = pricingData.settings?.overallPrice || 5;
          console.log('💰 [PricingPage] Setting overall price to:', price);
          setOverallPrice(price);
        } else {
          console.warn('❌ [PricingPage] Failed to fetch pricing settings, using default: 5');
          setOverallPrice(5);
        }
        
        console.log('💰💰💰 [PricingPage] DATA FETCH COMPLETE');
        console.log('');
      } catch (error) {
        console.error('❌ [PricingPage] Error fetching data:', error);
        console.warn('❌ [PricingPage] Using defaults due to error');
        // Keep default values on error
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className={darkMode ? 'dark' : ''}>
      <Navigation
        currentPage="pricing"
        onNavigate={handleNavigate}
        isLoggedIn={isLoggedIn}
        transparent={false}
      />
      
      <div 
        className="min-h-screen pt-32 pb-20 transition-all duration-[400ms]"
        style={{ 
          background: darkMode 
            ? 'linear-gradient(to bottom right, #0f172a, #1e293b, #0f172a)'
            : 'linear-gradient(to bottom right, #ffffff, #f0f9ff, #ffffff)',
          transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)'
        }}
      >
        <div className="container mx-auto px-4 md:px-6 lg:px-8">

        <div className="text-center mb-10 animate-fadeIn">
          <div 
            className="inline-block mb-3 px-4 py-1.5 rounded-full border transition-all duration-[400ms]"
            style={{ 
              backgroundColor: darkMode ? '#1e3a5f' : '#e0f2fe',
              borderColor: darkMode ? '#0c4a6e' : '#7dd3fc',
              transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)'
            }}
          >
            <span 
              className="text-xs font-semibold tracking-wide uppercase transition-colors duration-[400ms]"
              style={{ 
                color: darkMode ? '#7dd3fc' : '#0369a1',
                transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)' 
              }}
            >{t.pricing}</span>
          </div>
          <h2 
            className="gradient-ocean mb-4 tracking-tight transition-colors duration-[400ms]" 
            style={{ 
              fontSize: 'clamp(1.5rem, 4vw, 2rem)', 
              fontWeight: '800',
              transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)'
            }}
          >
            {t.pricingTitle}
          </h2>
          <p 
            className="max-w-xl mx-auto text-sm md:text-base font-light leading-relaxed transition-colors duration-[400ms]"
            style={{ 
              color: darkMode ? '#d1d5db' : '#475569',
              transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)' 
            }}
          >
            {t.pricingSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
          {/* Free Plan */}
          <Card 
            className="relative overflow-hidden border-2 shadow-md hover:shadow-xl transition-all duration-[400ms] hover:-translate-y-1 group"
            style={{ 
              backgroundColor: darkMode ? '#334155' : '#ffffff',
              borderColor: darkMode ? '#475569' : '#e2e8f0',
              transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)' 
            }}
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-green-400/20 to-transparent rounded-full blur-xl group-hover:w-24 group-hover:h-24 transition-all duration-500"></div>
            <CardHeader className="relative pb-4">
              <Badge className="w-fit bg-gradient-to-r from-green-600 to-green-700 mb-2 text-xs px-2 py-0.5">{t.free}</Badge>
              <CardTitle 
                className="text-lg font-bold mb-0.5 transition-colors duration-[400ms]"
                style={{ 
                  color: darkMode ? '#f3f4f6' : '#1e293b',
                  transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)' 
                }}
              >{t.practiceMode}</CardTitle>
              <CardDescription 
                className="text-xs transition-colors duration-[400ms]"
                style={{ 
                  color: darkMode ? '#d1d5db' : '#64748b',
                  transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)' 
                }}
              >{t.practiceModeDesc}</CardDescription>
              <div className="mt-3">
                <div className="flex items-baseline gap-1.5">
                  <span 
                    className="text-3xl font-bold transition-colors duration-[400ms]"
                    style={{ 
                      color: darkMode ? '#f3f4f6' : '#1e293b',
                      transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)' 
                    }}
                  >€0</span>
                  <span 
                    className="text-xs transition-colors duration-[400ms]"
                    style={{ 
                      color: darkMode ? '#9ca3af' : '#64748b',
                      transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)' 
                    }}
                  >{t.perMonth}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative space-y-3">
              <ul className="space-y-2">
                <li className="flex items-start gap-1.5">
                  <div className="mt-0.5 p-0.5 bg-green-100 rounded-full flex-shrink-0">
                    <Check className="w-2.5 h-2.5 text-green-600" />
                  </div>
                  <span 
                    className="text-xs transition-colors duration-[400ms]"
                    style={{ 
                      color: darkMode ? '#d1d5db' : '#475569',
                      transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)' 
                    }}
                  >{t.questionsPerExam}</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <div className="mt-0.5 p-0.5 bg-green-100 rounded-full flex-shrink-0">
                    <Check className="w-2.5 h-2.5 text-green-600" />
                  </div>
                  <span 
                    className="text-xs transition-colors duration-[400ms]"
                    style={{ 
                      color: darkMode ? '#d1d5db' : '#475569',
                      transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)' 
                    }}
                  >{t.allCategories}</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <div className="mt-0.5 p-0.5 bg-green-100 rounded-full flex-shrink-0">
                    <Check className="w-2.5 h-2.5 text-green-600" />
                  </div>
                  <span 
                    className="text-xs transition-colors duration-[400ms]"
                    style={{ 
                      color: darkMode ? '#d1d5db' : '#475569',
                      transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)' 
                    }}
                  >{t.studyExamModes}</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <div className="mt-0.5 p-0.5 bg-green-100 rounded-full flex-shrink-0">
                    <Check className="w-2.5 h-2.5 text-green-600" />
                  </div>
                  <span 
                    className="text-xs transition-colors duration-[400ms]"
                    style={{ 
                      color: darkMode ? '#d1d5db' : '#475569',
                      transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)' 
                    }}
                  >{t.noCardRequired}</span>
                </li>
              </ul>
              <div 
                className="w-full h-9 flex items-center justify-center border-2 font-semibold text-sm rounded-lg transition-all duration-[400ms]"
                style={{ 
                  backgroundColor: darkMode ? 'rgba(34, 197, 94, 0.1)' : '#f0fdf4',
                  borderColor: darkMode ? '#16a34a' : '#22c55e',
                  color: darkMode ? '#4ade80' : '#15803d',
                  transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)'
                }}
              >
                {t.getStartedFree}
              </div>
            </CardContent>
          </Card>

          {/* Premium Plan */}
          <Card 
            className="relative overflow-hidden border-2 shadow-lg transform scale-[1.02] transition-all duration-[400ms]"
            style={{ 
              background: darkMode 
                ? 'linear-gradient(to bottom right, #334155, #1e293b)'
                : 'linear-gradient(to bottom right, #ffffff, #f0f9ff)',
              borderColor: darkMode ? '#0ea5e9' : '#38bdf8',
              transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)' 
            }}
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600"></div>
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-sky-400/30 to-transparent rounded-full blur-xl"></div>
            <CardHeader className="relative pb-4">
              <Badge className="w-fit bg-gradient-to-r from-sky-500 to-blue-600 mb-2 text-xs px-2 py-0.5">{t.mostPopular}</Badge>
              <CardTitle 
                className="text-lg font-bold mb-0.5 transition-colors duration-[400ms]"
                style={{ 
                  color: darkMode ? '#f3f4f6' : '#1e293b',
                  transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)' 
                }}
              >{t.fullAccess}</CardTitle>
              <CardDescription 
                className="text-xs transition-colors duration-[400ms]"
                style={{ 
                  color: darkMode ? '#d1d5db' : '#64748b',
                  transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)' 
                }}
              >{t.fullAccessDesc}</CardDescription>
              <div className="mt-3">
                <div className="flex items-baseline gap-1.5">
                  <span 
                    className="text-3xl font-bold transition-colors duration-[400ms]"
                    style={{ 
                      color: darkMode ? '#f3f4f6' : '#1e293b',
                      transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)' 
                    }}
                  >€{overallPrice}</span>
                  <span 
                    className="text-xs transition-colors duration-[400ms]"
                    style={{ 
                      color: darkMode ? '#9ca3af' : '#64748b',
                      transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)' 
                    }}
                  >{t.perMonthPerCategory}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative space-y-3">
              <ul className="space-y-2">
                <li className="flex items-start gap-1.5">
                  <div className="mt-0.5 p-0.5 bg-sky-100 rounded-full flex-shrink-0">
                    <Check className="w-2.5 h-2.5 text-sky-600" />
                  </div>
                  <span 
                    className="text-xs font-medium transition-colors duration-[400ms]"
                    style={{ 
                      color: darkMode ? '#d1d5db' : '#475569',
                      transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)' 
                    }}
                  >{t.allQuestions}</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <div className="mt-0.5 p-0.5 bg-sky-100 rounded-full flex-shrink-0">
                    <Check className="w-2.5 h-2.5 text-sky-600" />
                  </div>
                  <span 
                    className="text-xs font-medium transition-colors duration-[400ms]"
                    style={{ 
                      color: darkMode ? '#d1d5db' : '#475569',
                      transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)' 
                    }}
                  >{t.unlimitedAttempts}</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <div className="mt-0.5 p-0.5 bg-sky-100 rounded-full flex-shrink-0">
                    <Check className="w-2.5 h-2.5 text-sky-600" />
                  </div>
                  <span 
                    className="text-xs font-medium transition-colors duration-[400ms]"
                    style={{ 
                      color: darkMode ? '#d1d5db' : '#475569',
                      transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)' 
                    }}
                  >{t.bothModes}</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <div className="mt-0.5 p-0.5 bg-sky-100 rounded-full flex-shrink-0">
                    <Check className="w-2.5 h-2.5 text-sky-600" />
                  </div>
                  <span 
                    className="text-xs font-medium transition-colors duration-[400ms]"
                    style={{ 
                      color: darkMode ? '#d1d5db' : '#475569',
                      transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)' 
                    }}
                  >{t.progressTracking}</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <div className="mt-0.5 p-0.5 bg-sky-100 rounded-full flex-shrink-0">
                    <Check className="w-2.5 h-2.5 text-sky-600" />
                  </div>
                  <span 
                    className="text-xs font-medium transition-colors duration-[400ms]"
                    style={{ 
                      color: darkMode ? '#d1d5db' : '#475569',
                      transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)' 
                    }}
                  >{t.timedExams}</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <div className="mt-0.5 p-0.5 bg-sky-100 rounded-full flex-shrink-0">
                    <Check className="w-2.5 h-2.5 text-sky-600" />
                  </div>
                  <span 
                    className="text-xs font-medium transition-colors duration-[400ms]"
                    style={{ 
                      color: darkMode ? '#d1d5db' : '#475569',
                      transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)' 
                    }}
                  >{t.cancelAnytime}</span>
                </li>
              </ul>
              <Button
                onClick={handleGetStarted}
                className="w-full h-9 bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600 hover:from-sky-600 hover:via-sky-700 hover:to-blue-700 shadow-md hover:shadow-lg transition-all transform hover:scale-[1.02] font-semibold text-sm"
              >
                {t.getFullAccess}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features Comparison */}
        <div className="mt-10 text-center">
          <p 
            className="text-xs max-w-2xl mx-auto transition-colors duration-[400ms]"
            style={{ 
              color: darkMode ? '#9ca3af' : '#64748b',
              transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)' 
            }}
          >
            {t.disclaimerText}
          </p>
        </div>
      </div>
      </div>
      
      <Footer />
    </div>
  );
}