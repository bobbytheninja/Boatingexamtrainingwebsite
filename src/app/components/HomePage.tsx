import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Waves, Ship, Sailboat, Anchor as AnchorIcon, Compass, Users, BookOpen, Award, LucideIcon } from 'lucide-react';
import { ExamType } from '../data/examQuestions';
import { getTranslation } from '../data/translations';
import { Navigation } from './Navigation';
import { Footer } from './Footer';
import { useAuth } from '../contexts/AuthContext';
import { useDarkMode } from '../contexts/DarkModeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { AnimatedStatCard } from './AnimatedCounter';
import { projectId, publicAnonKey } from '../utils/supabase/info';

// Icon mapping - maps icon names from database to actual icon components
const ICON_MAP: Record<string, LucideIcon> = {
  'Waves': Waves,
  'Ship': Ship,
  'Anchor': AnchorIcon,
  'Sailboat': Sailboat,
  'Compass': Compass,
};

interface ExamCategory {
  type: string;
  title: string;
  titleBg: string;
  description: string;
  descriptionBg: string;
  icon: string;
  color: string;
  image: string;
}

export function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { darkMode } = useDarkMode();
  const { language } = useLanguage();
  const t = getTranslation(language);
  const isLoggedIn = !!user;
  const [categories, setCategories] = useState<ExamCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Load categories from server
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const url = `https://${projectId}.supabase.co/functions/v1/make-server-d36f8f91/categories`;
        console.log('[HomePage] Loading categories from server...');
        console.log('[HomePage] Fetch URL:', url);
        
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        });
        
        console.log('[HomePage] Response status:', response.status);
        console.log('[HomePage] Response ok:', response.ok);
        
        if (response.ok) {
          const data = await response.json();
          console.log('[HomePage] Raw response data:', data);
          console.log('[HomePage] Categories array:', data.categories);
          console.log('[HomePage] Categories length:', data.categories?.length);
          setCategories(data.categories || []);
        } else {
          const errorText = await response.text();
          console.error('[HomePage] Failed to load categories. Status:', response.status, 'Error:', errorText);
        }
      } catch (error) {
        console.error('[HomePage] Error loading categories:', error);
      } finally {
        setLoadingCategories(false);
        console.log('[HomePage] Loading complete');
      }
    };

    loadCategories();
  }, []);

  // Transform server categories into display format, fallback to static examData
  const examTypes = categories.length > 0
    ? categories.map(cat => ({
        type: cat?.type as ExamType,
        title: (language === 'Bulgarian' && cat?.titleBg) ? cat.titleBg : (cat?.title || ''),
        description: (language === 'Bulgarian' && cat?.descriptionBg) ? cat.descriptionBg : (cat?.description || ''),
        icon: (cat?.icon && ICON_MAP[cat.icon]) || Waves,
        color: cat?.color || '#0ea5e9',
        image: cat?.image || '',
      }))
    : [
        // Fallback to static data when backend categories not available
        {
          type: 'jet' as ExamType,
          title: 'Jet Ski License',
          description: 'Test your knowledge for operating personal watercraft',
          icon: Waves,
          color: '#06b6d4',
          image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
        },
        {
          type: 'small' as ExamType,
          title: 'Small Boat License',
          description: 'Basic boating skills and safety knowledge',
          icon: Sailboat,
          color: '#0ea5e9',
          image: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800',
        },
        {
          type: 'big' as ExamType,
          title: 'Big Boat License',
          description: 'Advanced boat handling and navigation',
          icon: Ship,
          color: '#3b82f6',
          image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800',
        },
        {
          type: 'yacht' as ExamType,
          title: 'Yacht License (Up to 50 Tons)',
          description: 'Professional yacht operation and maritime law',
          icon: AnchorIcon,
          color: '#6366f1',
          image: 'https://images.unsplash.com/photo-1540946485063-a40da27545f8?w=800',
        },
        {
          type: 'navigation' as ExamType,
          title: 'Navigation Device Exam',
          description: 'Electronic navigation systems and equipment',
          icon: Compass,
          color: '#8b5cf6',
          image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
        },
      ];

  const handleNavigate = (page: string) => {
    try {
      console.log('[HomePage] Navigation requested:', page);
      if (page === 'home') return;
      navigate(`/${page}`);
    } catch (error) {
      console.error('[HomePage] Navigation error:', error);
    }
  };

  const handleCardClick = (examType: ExamType) => {
    // Allow all users to access exam mode selection (free exams don't require login)
    navigate(`/exam-mode/${examType}`);
  };

  return (
    <>
      <Navigation
        currentPage="home"
        onNavigate={handleNavigate}
        isLoggedIn={isLoggedIn}
        transparent={true}
      />
      
      {/* Main container - Force background with inline style + Tailwind classes */}
      <div 
        className="min-h-screen bg-white dark:bg-slate-800 transition-all duration-[400ms]"
        style={{ 
          backgroundColor: darkMode ? '#1e293b' : '#ffffff',
          transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)'
        }}
      >
        {/* Hero Image - Navigation bar overlays this */}
        <div className="relative h-[77vh] md:h-[81vh] overflow-hidden">
          <ImageWithFallback
            src="https://upload.wikimedia.org/wikipedia/commons/e/ef/Bavaria_Cruiser_45.jpg"
            alt="Bavaria Cruiser 45 yacht"
            className="w-full h-full object-cover"
            style={{ objectPosition: 'center 70%' }}
          />
          <div 
            className="absolute bottom-0 left-0 right-0 h-[20%] duration-[400ms]"
            style={{ 
              background: darkMode 
                ? 'linear-gradient(to bottom, transparent, #1e293b)' 
                : 'linear-gradient(to bottom, transparent, #ffffff)',
              transition: 'background 400ms cubic-bezier(0.65, 0, 0.35, 1)'
            }}
          ></div>
        </div>

        {/* Exam Types Section */}
        <div 
          className="relative -mt-10 pb-20 bg-white dark:bg-slate-800 transition-all duration-[400ms]"
          style={{ 
            backgroundColor: darkMode ? '#1e293b' : '#ffffff',
            transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)'
          }}
        >
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="text-center mb-12 max-w-3xl mx-auto pt-16">
              <h2 
                className="text-gray-900 dark:text-gray-100 mb-2 tracking-wide transition-colors duration-[400ms]" 
                style={{ 
                  fontSize: 'clamp(1.75rem, 4vw, 2.25rem)', 
                  fontWeight: '400',
                  color: darkMode ? '#f3f4f6' : '#111827',
                  transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)'
                }}
              >
                {t.examCategories}
              </h2>
              <p 
                className="text-gray-600 dark:text-gray-300 text-lg font-light leading-relaxed transition-colors duration-[400ms]"
                style={{ 
                  color: darkMode ? '#d1d5db' : '#4b5563',
                  transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)'
                }}
              >
                {t.examCategoriesSubtitle}
              </p>
            </div>

            {/* Exam Type Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-7xl mx-auto">
              {loadingCategories ? (
                <div className="col-span-full flex justify-center items-center py-20">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading exam categories...</p>
                  </div>
                </div>
              ) : examTypes.length === 0 ? (
                <div className="col-span-full text-center py-20">
                  <p className="text-gray-600 dark:text-gray-400">No exam categories available.</p>
                </div>
              ) : examTypes.map((exam, index) => {
                const Icon = exam.icon;
                return (
                  <Card 
                    key={exam.type} 
                    className="group overflow-hidden hover:shadow-2xl border border-gray-200/50 dark:border-gray-700/50 bg-white dark:bg-slate-700 backdrop-blur-sm hover:-translate-y-2 transition-all duration-[400ms]"
                    style={{ 
                      animationDelay: `${index * 100}ms`,
                      backgroundColor: darkMode ? '#334155' : '#ffffff',
                      borderColor: darkMode ? 'rgba(55, 65, 81, 0.5)' : 'rgba(229, 231, 235, 0.5)',
                      transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)'
                    }}
                  >
                    <div className="relative h-32 md:h-40 overflow-hidden">
                      <ImageWithFallback
                        src={exam.image}
                        alt={exam.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                      <div className="absolute inset-0 bg-gradient-to-br from-sky-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="relative h-full flex items-end p-3 md:p-4">
                        <div className={`absolute top-3 right-3 md:top-4 md:right-4 ${exam.color} p-2 md:p-2.5 rounded-xl shadow-2xl group-hover:scale-110 transition-transform duration-300`}>
                          <Icon className="w-4 h-4 md:w-5 md:h-5 text-white" />
                        </div>
                      </div>
                    </div>
                    <CardHeader className="pb-1 pt-2 px-3 md:px-6">
                      <CardTitle 
                        className="text-base md:text-lg font-bold text-gray-900 dark:text-gray-100 group-hover:text-sky-700 dark:group-hover:text-sky-400 transition-colors duration-[400ms]"
                        style={{ 
                          color: darkMode ? '#f3f4f6' : '#111827',
                          transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)'
                        }}
                      >
                        {exam.title}
                      </CardTitle>
                      <CardDescription 
                        className="text-xs md:text-sm text-gray-600 dark:text-gray-300 leading-relaxed transition-colors duration-[400ms]"
                        style={{ 
                          color: darkMode ? '#d1d5db' : '#4b5563',
                          transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)'
                        }}
                      >
                        {exam.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0 pb-3 px-3 md:px-6">
                      <Button
                        onClick={() => handleCardClick(exam.type)}
                        className="w-full h-9 md:h-10 bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600 hover:from-sky-600 hover:via-sky-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] font-semibold text-sm md:text-base"
                      >
                        {isLoggedIn ? t.getStarted : 'Begin Training'}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}