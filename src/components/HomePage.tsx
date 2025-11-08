import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Waves, Ship, Sailboat, Anchor as AnchorIcon, Compass } from 'lucide-react';
import { ExamType } from '../data/examQuestions';
import { Language, getTranslation } from '../data/translations';
import { Navigation } from './Navigation';
import { Footer } from './Footer';
import { useAuth } from '../contexts/AuthContext';
import { useDarkMode } from '../contexts/DarkModeContext';

export function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [language, setLanguage] = useState<Language>('English');
  const [region, setRegion] = useState('Bulgaria');
  const t = getTranslation(language);
  const isLoggedIn = !!user;
  
  const examTypes = [
    {
      type: 'jet' as ExamType,
      title: t.jetSki,
      description: t.jetSkiDesc,
      icon: Waves,
      color: 'bg-gradient-to-br from-cyan-500 to-sky-600',
      image: 'https://images.unsplash.com/photo-1721798974342-7b2b859493a0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqZXQlMjBza2klMjBvY2VhbnxlbnwxfHx8fDE3NjIzMjEyOTB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      type: 'small' as ExamType,
      title: t.smallBoat,
      description: t.smallBoatDesc,
      icon: Ship,
      color: 'bg-gradient-to-br from-sky-500 to-blue-600',
      image: 'https://images.unsplash.com/photo-1759809278956-70c6a72eecdd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFsbCUyMGJvYXQlMjBzYWlsaW5nfGVufDF8fHx8MTc2MjM1NDIzMnww&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      type: 'big' as ExamType,
      title: t.bigBoat,
      description: t.bigBoatDesc,
      icon: AnchorIcon,
      color: 'bg-gradient-to-br from-blue-600 to-indigo-700',
      image: 'https://images.unsplash.com/photo-1604930270269-67876a4cbe4a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXJnZSUyMHNoaXAlMjBkZWNrfGVufDF8fHx8MTc2MjM1NDIzNHww&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      type: 'yacht' as ExamType,
      title: t.yacht,
      description: t.yachtDesc,
      icon: Sailboat,
      color: 'bg-gradient-to-br from-indigo-600 to-purple-700',
      image: 'https://images.unsplash.com/photo-1598737285721-29346a5c9278?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjB5YWNodCUyMG9jZWFufGVufDF8fHx8MTc2MjMwMjQ5N3ww&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      type: 'navigation' as ExamType,
      title: t.navigationDevice,
      description: t.navigationDeviceDesc,
      icon: Compass,
      color: 'bg-gradient-to-br from-teal-500 to-cyan-600',
      image: 'https://images.unsplash.com/photo-1723988433925-035f8625b5c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYXZpZ2F0aW9uJTIwY29tcGFzcyUyMG1hcmluZXxlbnwxfHx8fDE3NjIzNTQyMzl8MA&ixlib=rb-4.1.0&q=80&w=1080',
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
    <div className={darkMode ? 'dark' : ''}>
      <Navigation
        currentPage="home"
        onNavigate={handleNavigate}
        isLoggedIn={isLoggedIn}
        transparent={true}
        language={language}
        onLanguageChange={setLanguage}
        region={region}
        onRegionChange={setRegion}
        darkMode={darkMode}
        onDarkModeToggle={toggleDarkMode}
      />
      
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        {/* Hero Image - Navigation bar overlays this */}
        <div className="relative h-[77vh] md:h-[81vh] overflow-hidden">
          <ImageWithFallback
            src="https://upload.wikimedia.org/wikipedia/commons/e/ef/Bavaria_Cruiser_45.jpg"
            alt="Bavaria Cruiser 45 yacht"
            className="w-full h-full object-cover"
            style={{ objectPosition: 'center 70%' }}
          />
          <div className="absolute bottom-0 left-0 right-0 h-[20%] bg-gradient-to-b from-transparent to-gray-50 dark:to-slate-800"></div>
        </div>

        {/* Exam Types Section */}
        <div className="relative -mt-10 pb-20 bg-gradient-to-b from-transparent via-white dark:via-slate-800 to-slate-50 dark:to-slate-900">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="text-center mb-12 max-w-3xl mx-auto pt-16">
              <h2 className="text-gray-900 dark:text-gray-100 mb-2 tracking-wide" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.25rem)', fontWeight: '400' }}>
                {t.examCategories}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-lg font-light leading-relaxed">
                {t.examCategoriesSubtitle}
              </p>
            </div>

            {/* Exam Type Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-7xl mx-auto">
              {examTypes.map((exam, index) => {
                const Icon = exam.icon;
                return (
                  <Card 
                    key={exam.type} 
                    className="group overflow-hidden hover:shadow-2xl transition-all duration-500 border border-gray-200/50 dark:border-gray-700/50 bg-white dark:bg-slate-700 backdrop-blur-sm hover:-translate-y-2"
                    style={{ animationDelay: `${index * 100}ms` }}
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
                      <CardTitle className="text-base md:text-lg font-bold text-gray-900 dark:text-gray-100 group-hover:text-sky-700 dark:group-hover:text-sky-400 transition-colors">{exam.title}</CardTitle>
                      <CardDescription className="text-xs md:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{exam.description}</CardDescription>
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
    </div>
  );
}
