import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Check, BookOpen, FileText, GraduationCap, Lightbulb, Flag, Volume2, Anchor } from 'lucide-react';
import { ExamType, examData } from '../data/examQuestions';
import { getTranslation } from '../data/translations';
import { Navigation } from './Navigation';
import { Footer } from './Footer';
import { useDarkMode } from '../contexts/DarkModeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export type ExamMode = 'study' | 'exam' | 'learn';

// Learn mode topics. Each drills one category of exam content on its own.
// Not built yet — the cards render disabled under a "coming soon" heading.
const LEARN_TOPICS = [
  { key: 'lights',  en: 'Lights',  bg: 'Светлини' },
  { key: 'flags',   en: 'Flags',   bg: 'Флагове' },
  { key: 'sounds',  en: 'Sounds',  bg: 'Звуци' },
  { key: 'buoys',   en: 'Buoys',   bg: 'Буйове' },
] as const;
export type ExamTier = 'mock' | 'paid';

export function ExamModeSelection() {
  const { examType: examTypeParam } = useParams<{ examType: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { darkMode } = useDarkMode();
  const { language } = useLanguage();
  const t = getTranslation(language);
  // Callers can preselect a mode (the account page links straight to Learn)
  const initialMode = (location.state as { mode?: ExamMode } | null)?.mode;
  const [selectedMode, setSelectedMode] = useState<ExamMode>(initialMode ?? 'exam');
  const [examCategory, setExamCategory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const examType = examTypeParam as ExamType;

  // Load exam category from server
  useEffect(() => {
    const loadCategory = async () => {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-d36f8f91/categories`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          const categories = data.categories || [];
          
          // Find the category that matches examType
          const category = categories.find((cat: any) => cat.type === examType);
          
          if (category) {
            setExamCategory(category);
          } else {
            // Fallback to hardcoded examData if category not found in server
            if (examData[examType]) {
              setExamCategory({
                type: examType,
                name: examData[examType].title,
                description: examData[examType].description,
              });
            } else {
              console.error('Exam category not found:', examType);
              navigate('/');
            }
          }
        } else {
          // Fallback to hardcoded examData
          if (examData[examType]) {
            setExamCategory({
              type: examType,
              name: examData[examType].title,
              description: examData[examType].description,
            });
          }
        }
      } catch (error) {
        console.error('Error loading category:', error);
        // Fallback to hardcoded examData
        if (examData[examType]) {
          setExamCategory({
            type: examType,
            name: examData[examType].title,
            description: examData[examType].description,
          });
        }
      } finally {
        setLoading(false);
      }
    };

    if (examType) {
      loadCategory();
    } else {
      navigate('/');
    }
  }, [examType, navigate]);

  if (loading) {
    return (
      <div className={darkMode ? 'dark' : ''}>
        <Navigation
          currentPage="exam"
          onNavigate={() => {}}
          isLoggedIn={!!user}
          transparent={false}
        />
        <div 
          className="min-h-screen pt-32 flex items-center justify-center"
          style={{ 
            background: darkMode 
              ? 'linear-gradient(to bottom right, #0f172a, #1e293b, #0f172a)'
              : 'linear-gradient(to bottom right, #ffffff, #f0f9ff, #ffffff)'
          }}
        >
          <div className="text-center">
            <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-slate-600 dark:text-slate-400">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!examCategory) {
    return null;
  }

  const handleStart = (mode: ExamMode, tier: ExamTier) => {
    // Only require login for paid tier
    if (tier === 'paid' && !user) {
      toast.error(language === 'English' 
        ? 'Please log in to access full exams. Free practice exams are available without login!' 
        : 'Моля, влезте в профила си за достъп до пълните изпити. Безплатните практически изпити са достъпни без влизане!');
      navigate('/login');
      return;
    }
    navigate(`/exam/${examType}`, { state: { mode, tier } });
  };

  const handleNavigate = (page: string) => {
    if (page === 'exam-mode') return;
    navigate(page === 'home' ? '/' : `/${page}`);
  };

  return (
    <div className={darkMode ? 'dark' : ''}>
      <Navigation
        currentPage="exam"
        onNavigate={handleNavigate}
        isLoggedIn={!!user}
        transparent={false}
      />
      
      <div 
        className="min-h-screen pt-32 pb-12 px-4 transition-all duration-[400ms]"
        style={{ 
          background: darkMode 
            ? 'linear-gradient(to bottom right, #0f172a, #1e293b, #0f172a)'
            : 'linear-gradient(to bottom right, #ffffff, #f0f9ff, #ffffff)',
          transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)'
        }}
      >
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="bg-gradient-to-r from-blue-900 to-blue-700 dark:from-blue-400 dark:to-blue-300 bg-clip-text text-transparent mb-2">
              {examCategory.name}
            </h2>
            {examCategory.description && (
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                {examCategory.description}
              </p>
            )}
          </div>

          <div className="space-y-10">
            {/* Mode Toggle Section */}
            <div>
              {/* Toggle buttons */}
              <div className="flex justify-center mb-8">
                <div 
                  className="inline-flex rounded-lg border-2 p-1 shadow-lg transition-all duration-[600ms] relative overflow-hidden"
                  style={{ 
                    borderColor: darkMode ? '#0369a1' : '#7dd3fc',
                    backgroundColor: darkMode ? '#1e293b' : '#f0f9ff',
                    transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)'
                  }}
                >
                  {/* Animated background swoosh */}
                  <div 
                    className="absolute inset-0 opacity-30 transition-all duration-[600ms] ease-in-out"
                    style={{
                      background: 'linear-gradient(90deg, #1e3a8a 0%, #1e40af 20%, #0ea5e9 40%, #14b8a6 60%, #10b981 75%, #d4a017 100%)',
                      backgroundSize: '200% 100%',
                      backgroundPosition:
                        selectedMode === 'exam' ? '0% center'
                        : selectedMode === 'study' ? '50% center'
                        : '100% center'
                    }}
                  />
                  
                  <button
                    onClick={() => setSelectedMode('exam')}
                    className="relative z-10 flex items-center gap-2 px-6 py-3 rounded-md transition-all"
                    style={{
                      background: selectedMode === 'exam'
                        ? 'linear-gradient(to right, #1d4ed8, #1e3a8a)'
                        : 'transparent',
                      boxShadow: selectedMode === 'exam' ? '0 4px 6px -1px rgba(0,0,0,0.3)' : 'none',
                      color: selectedMode === 'exam' ? '#ffffff' : (darkMode ? '#d1d5db' : '#334155'),
                    }}
                  >
                    <FileText className="w-5 h-5" />
                    <span className="font-semibold">{t.examMode}</span>
                  </button>

                  {/* Divider */}
                  <div
                    className="w-px h-8 self-center mx-1 transition-colors duration-[400ms]"
                    style={{
                      backgroundColor: darkMode ? '#475569' : '#cbd5e1'
                    }}
                  />

                  <button
                    onClick={() => setSelectedMode('study')}
                    className="relative z-10 flex items-center gap-2 px-6 py-3 rounded-md transition-all"
                    style={{
                      background: selectedMode === 'study'
                        ? 'linear-gradient(to right, #10b981, #0d9488)'
                        : 'transparent',
                      boxShadow: selectedMode === 'study' ? '0 4px 6px -1px rgba(0,0,0,0.3)' : 'none',
                      color: selectedMode === 'study' ? '#ffffff' : (darkMode ? '#d1d5db' : '#334155'),
                    }}
                  >
                    <BookOpen className="w-5 h-5" />
                    <span className="font-semibold">{t.studyMode}</span>
                  </button>

                  {/* Divider */}
                  <div
                    className="w-px h-8 self-center mx-1 transition-colors duration-[400ms]"
                    style={{
                      backgroundColor: darkMode ? '#475569' : '#cbd5e1'
                    }}
                  />

                  <button
                    onClick={() => setSelectedMode('learn')}
                    className="relative z-10 flex items-center gap-2 px-6 py-3 rounded-md transition-all"
                    style={{
                      background: selectedMode === 'learn'
                        ? 'linear-gradient(to right, #d4a017, #a97a0f)'
                        : 'transparent',
                      boxShadow: selectedMode === 'learn' ? '0 4px 6px -1px rgba(0,0,0,0.3)' : 'none',
                      color: selectedMode === 'learn' ? '#ffffff' : (darkMode ? '#d1d5db' : '#334155'),
                    }}
                  >
                    <GraduationCap className="w-5 h-5" />
                    <span className="font-semibold">{language === 'English' ? 'Learn' : 'Учи'}</span>
                  </button>
                </div>
              </div>

              {/* Dynamic badges below toggle */}
              <div className="flex gap-6 justify-center items-center flex-wrap mb-4">
                {selectedMode === 'learn' ? (
                  <>
                    <Badge variant="secondary" className="px-4 py-2">{language === 'English' ? 'No Timer' : 'Без Таймер'}</Badge>
                    <Badge variant="secondary" className="px-4 py-2">{language === 'English' ? 'One Topic at a Time' : 'Тема по тема'}</Badge>
                  </>
                ) : selectedMode === 'study' ? (
                  <>
                    <Badge variant="secondary" className="px-4 py-2">{language === 'English' ? 'No Timer' : 'Без Таймер'}</Badge>
                    <Badge variant="secondary" className="px-4 py-2">{language === 'English' ? 'Learn as You Submit' : 'Учете докато решавате'}</Badge>
                    <Badge variant="secondary" className="px-4 py-2">{language === 'English' ? 'Review at the End' : 'Преглед в края'}</Badge>
                  </>
                ) : (
                  <>
                    <Badge variant="secondary" className="px-4 py-2">{language === 'English' ? 'Timer : 60 minutes' : 'Таймер : 60 минути'}</Badge>
                    <Badge variant="secondary" className="px-4 py-2">{language === 'English' ? 'Receive Results at the End' : 'Получете резултати в края'}</Badge>
                    <Badge variant="secondary" className="px-4 py-2">{language === 'English' ? 'Review at the End' : 'Преглед в края'}</Badge>
                  </>
                )}
              </div>
            </div>

            {selectedMode === 'learn' ? (
              <div className="max-w-2xl mx-auto">
                <p
                  className="text-center font-semibold tracking-wide uppercase text-sm mb-4"
                  style={{ color: darkMode ? '#d4a017' : '#a97a0f' }}
                >
                  {language === 'English' ? 'Coming soon' : 'Очаквайте скоро'}
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {LEARN_TOPICS.map(topic => {
                    const Icon = topic.key === 'lights' ? Lightbulb
                      : topic.key === 'flags' ? Flag
                      : topic.key === 'sounds' ? Volume2
                      : Anchor;
                    return (
                      <div
                        key={topic.key}
                        aria-disabled="true"
                        className="flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-8 cursor-not-allowed select-none"
                        style={{
                          borderColor: darkMode ? '#7a5c12' : '#e6cf92',
                          backgroundColor: darkMode ? 'rgba(212,160,23,0.06)' : 'rgba(212,160,23,0.05)',
                          color: darkMode ? '#d4a017' : '#a97a0f',
                          opacity: 0.85,
                        }}
                      >
                        <Icon className="w-8 h-8" />
                        <span className="font-semibold text-base">
                          {language === 'English' ? topic.en : topic.bg}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
            <div>
              <div className="max-w-2xl mx-auto space-y-6">
                {/* Full Access Card - stacked on top */}
                <Card 
                  className="relative overflow-hidden border-2 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                  style={{ 
                    borderColor: darkMode ? '#0369a1' : '#7dd3fc',
                    background: darkMode 
                      ? 'linear-gradient(to bottom right, #334155, #475569)'
                      : 'linear-gradient(to bottom right, #f0f9ff, #ffffff)'
                  }}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br rounded-full blur-2xl from-sky-400/20 to-transparent"></div>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle 
                        className="transition-colors duration-[400ms]"
                        style={{ color: darkMode ? '#f3f4f6' : '#0f172a' }}
                      >
                        {t.fullAccessTitle}
                      </CardTitle>
                      {examCategory?.isFree ? (
                        <Badge className="shadow-md bg-gradient-to-r from-green-500 to-emerald-600">
                          {language === 'English' ? 'Currently Free' : 'Безплатно'}
                        </Badge>
                      ) : (
                        <Badge className="shadow-md bg-gradient-to-r from-amber-400 to-sky-500">PAID</Badge>
                      )}
                    </div>
                    <CardDescription 
                      className="transition-colors duration-[400ms]"
                      style={{ color: darkMode ? '#d1d5db' : '#475569' }}
                    >
                      {t.fullAccessDescription}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-2 text-sm mb-4">
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span>{t.fortyQuestions}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span>{t.unlimitedAttempts}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span>{t.trackProgress}</span>
                      </li>
                    </ul>
                    <div className="space-y-3 relative">
                      <Button
                        onClick={() => handleStart(selectedMode, 'paid')}
                        className={`w-full h-12 shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] font-semibold ${
                          selectedMode === 'study'
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700'
                            : 'bg-gradient-to-r from-blue-700 to-blue-900 hover:from-blue-800 hover:to-blue-950'
                        }`}
                        size="lg"
                      >
                        {t.startFull} - {selectedMode === 'study' ? t.studyMode : t.examMode}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Free Practice Card - stacked below */}
                <Card 
                  className="relative overflow-hidden border-2 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                  style={{ 
                    borderColor: darkMode ? '#0369a1' : '#7dd3fc',
                    background: darkMode 
                      ? 'linear-gradient(to bottom right, #334155, #475569)'
                      : 'linear-gradient(to bottom right, #f0f9ff, #ffffff)'
                  }}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br rounded-full blur-2xl from-sky-400/20 to-transparent"></div>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle 
                        className="transition-colors duration-[400ms]"
                        style={{ color: darkMode ? '#f3f4f6' : '#0f172a' }}
                      >
                        {t.freePractice}
                      </CardTitle>
                      <Badge className="bg-gradient-to-r from-sky-500 to-cyan-600 shadow-md">{t.free.toUpperCase()}</Badge>
                    </div>
                    <CardDescription 
                      className="transition-colors duration-[400ms]"
                      style={{ color: darkMode ? '#d1d5db' : '#475569' }}
                    >
                      {t.freePracticeDesc}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-2 text-sm mb-4">
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span>{t.tenQuestions}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span>{t.bothStudyExamModes}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span>{t.noCardRequired}</span>
                      </li>
                    </ul>
                    <div className="space-y-3 relative">
                      <Button
                        onClick={() => handleStart(selectedMode, 'mock')}
                        className={`w-full h-12 shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] font-semibold ${
                          selectedMode === 'study'
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700'
                            : 'bg-gradient-to-r from-blue-700 to-blue-900 hover:from-blue-800 hover:to-blue-950'
                        }`}
                        size="lg"
                      >
                        {t.startFree} - {selectedMode === 'study' ? t.studyMode : t.examMode}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            )}

          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}