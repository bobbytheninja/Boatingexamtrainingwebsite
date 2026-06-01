import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { usePageTitle } from '../hooks/usePageTitle';
import { useNavigate } from 'react-router-dom';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Waves, Ship, Sailboat, Anchor as AnchorIcon, Compass, Users, BookOpen, Award, LucideIcon } from 'lucide-react';
import { ExamType } from '../data/examQuestions';
import { getTranslation } from '../data/translations';
import { Navigation } from './Navigation';
import { Footer } from './Footer';
import { useAuth } from '../contexts/AuthContext';
import { useDarkMode } from '../contexts/DarkModeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useRegion } from '../contexts/RegionContext';
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

const LANGUAGE_NAMES: Record<string, string> = {
  bg: 'Bulgarian', en: 'English', de: 'German', el: 'Greek',
  it: 'Italian', ru: 'Russian', es: 'Spanish', tr: 'Turkish',
  fr: 'French', hr: 'Croatian', ro: 'Romanian', uk: 'Ukrainian',
};

// Maps known category types to translation keys in the Translations object
const CATEGORY_TRANSLATION_KEYS: Record<string, { title: string; desc: string }> = {
  jet:        { title: 'jetSki',           desc: 'jetSkiDesc' },
  small:      { title: 'smallBoat',        desc: 'smallBoatDesc' },
  big:        { title: 'bigBoat',          desc: 'bigBoatDesc' },
  yacht:      { title: 'yacht',            desc: 'yachtDesc' },
  navigation: { title: 'navigationDevice', desc: 'navigationDeviceDesc' },
};

interface ExamCategory {
  type: string;
  title: string;
  titleBg?: string;
  description: string;
  descriptionBg?: string;
  icon: string;
  color: string;
  image: string;
  country?: string;
  language?: string;
}

export function HomePage() {
  usePageTitle('Black Sea Bulgaria — Maritime Exam Training Online');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { darkMode } = useDarkMode();
  const { language } = useLanguage();
  const { region } = useRegion();
  const t = getTranslation(language);
  const isLoggedIn = !!user;
  const [categories, setCategories] = useState<ExamCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const descRefs = useRef<Record<string, HTMLElement | null>>({});
  const [isOverflowing, setIsOverflowing] = useState<Record<string, boolean>>({});

  const toggleExpand = (type: string) => {
    setExpandedCards(prev => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type); else next.add(type);
      return next;
    });
  };

  // Collapse all cards when language changes so overflow can be remeasured
  useEffect(() => { setExpandedCards(new Set()); }, [language]);

  // Measure actual DOM overflow instead of using a character-count heuristic
  useLayoutEffect(() => {
    setIsOverflowing(prev => {
      const next: Record<string, boolean> = {};
      for (const [type, el] of Object.entries(descRefs.current)) {
        next[type] = expandedCards.has(type) ? true : (el ? el.scrollHeight > el.clientHeight : false);
      }
      const keys = Object.keys(next);
      const same = keys.length === Object.keys(prev).length && keys.every(k => prev[k] === next[k]);
      return same ? prev : next;
    });
  }, [categories, region, language, expandedCards]);

  const loadCategories = async () => {
    setFetchError(false);
    setLoadingCategories(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d36f8f91/categories`,
        { headers: { 'Authorization': `Bearer ${publicAnonKey}` } }
      );
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      } else {
        setFetchError(true);
      }
    } catch {
      setFetchError(true);
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => { loadCategories(); }, []);

  // Transform server categories into display format, filtered by selected region
  const examTypes = categories
    .filter((cat) => !cat.country || cat.country === region)
    .map((cat) => ({
      type: cat.type as ExamType,
      title: cat.title,
      titleBg: cat.titleBg,
      description: cat.description,
      descriptionBg: cat.descriptionBg,
      icon: ICON_MAP[cat.icon] || Waves,
      color: cat.color,
      image: cat.image,
      country: cat.country,
      language: cat.language,
    }));

  const handleNavigate = (page: string) => {
    if (page === 'home') return;
    navigate(`/${page}`);
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
          <p className="absolute bottom-2 right-3 text-xs" style={{ color: '#94a3b8' }}>
            Photo:{' '}
            <a
              href="https://commons.wikimedia.org/wiki/File:Bavaria_Cruiser_45.jpg"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:opacity-80"
            >
              Justin Leighton
            </a>
            , CC BY-SA 3.0
          </p>
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
              <div className="flex items-center justify-center mb-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors duration-[400ms] ${darkMode ? 'bg-sky-900/50 text-sky-300 border border-sky-700' : 'bg-sky-100 text-sky-700 border border-sky-200'}`}>
                  For: {region}
                </span>
              </div>
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
              ) : fetchError ? (
                <div className="col-span-full text-center py-20">
                  <p className="mb-4" style={{ color: darkMode ? '#fca5a5' : '#b91c1c' }}>
                    Failed to load exam categories. Check your connection.
                  </p>
                  <Button onClick={loadCategories} variant="outline">Retry</Button>
                </div>
              ) : examTypes.length === 0 ? (
                <div className="col-span-full text-center py-20">
                  <p style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>No exam categories available.</p>
                </div>
              ) : examTypes.map((exam, index) => {
                const Icon = exam.icon;
                // Bulgarian: use titleBg/descriptionBg from DB; English: use title/description from DB;
                // other languages: use translations.ts stubs with DB fallback
                const displayTitle = (() => {
                  if (language === 'Bulgarian' && exam.titleBg) return exam.titleBg;
                  if (language === 'English') return exam.title;
                  const keys = CATEGORY_TRANSLATION_KEYS[exam.type];
                  return keys ? ((t as any)[keys.title] ?? exam.title) : exam.title;
                })();
                const displayDesc = (() => {
                  if (language === 'Bulgarian' && exam.descriptionBg) return exam.descriptionBg;
                  if (language === 'English') return exam.description;
                  const keys = CATEGORY_TRANSLATION_KEYS[exam.type];
                  return keys ? ((t as any)[keys.desc] ?? exam.description) : exam.description;
                })();
                const isExpanded = expandedCards.has(exam.type);
                const isClipped = isOverflowing[exam.type] ?? false;
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
                        alt={displayTitle}
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
                        {displayTitle}
                      </CardTitle>
                      <div>
                        <p
                          ref={(el) => { descRefs.current[exam.type] = el; }}
                          className={`text-xs md:text-sm text-muted-foreground text-gray-600 dark:text-gray-300 leading-relaxed transition-colors duration-[400ms] ${!isExpanded ? 'line-clamp-3' : ''}`}
                          style={{
                            color: darkMode ? '#d1d5db' : '#4b5563',
                            transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)'
                          }}
                        >
                          {displayDesc}
                        </p>
                        {isClipped && (
                          <button
                            onClick={() => toggleExpand(exam.type)}
                            className="text-xs font-medium mt-1 transition-colors duration-200"
                            style={{ color: darkMode ? '#38bdf8' : '#0284c7' }}
                          >
                            {isExpanded ? 'Show less ▲' : 'Show more ▼'}
                          </button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 pb-3 px-3 md:px-6">
                      {(exam.country || exam.language) && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {exam.country && (
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-colors duration-[400ms] ${darkMode ? 'bg-slate-600 text-slate-200' : 'bg-gray-100 text-gray-600'}`}>
                              📍 {exam.country}
                            </span>
                          )}
                          {exam.language && (
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-colors duration-[400ms] ${darkMode ? 'bg-slate-600 text-slate-200' : 'bg-gray-100 text-gray-600'}`}>
                              🌐 {LANGUAGE_NAMES[exam.language] ?? exam.language}
                            </span>
                          )}
                        </div>
                      )}
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