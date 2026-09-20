import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Check, BookOpen, FileText, GraduationCap, Lightbulb, Flag, Volume2, Anchor, Map, Circle, Shuffle, Compass, Gauge, CloudSun, MapPin, Siren, Mic, RadioTower, Radio, FileCheck, Cog } from 'lucide-react';
import { ExamType, examData } from '../data/examQuestions';
import { getTranslation } from '../data/translations';
import { Navigation } from './Navigation';
import { Footer } from './Footer';
import { useDarkMode } from '../contexts/DarkModeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';
import { LEARN_TOPICS, countByTopic, type LearnTopic } from '../utils/questionTopics';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export type ExamMode = 'study' | 'exam' | 'learn';

const TOPIC_ICONS: Record<LearnTopic, typeof Lightbulb> = {
  shapes: Circle,
  lights: Lightbulb,
  sounds: Volume2,
  flags: Flag,
  buoys: Anchor,
  charts: Map,
  colregs: Shuffle,
  navigation: Compass,
  instruments: Gauge,
  engine: Cog,
  weather: CloudSun,
  localwaters: MapPin,
  distress: Siren,
  radioprocedure: Mic,
  channels: RadioTower,
  radioequipment: Radio,
  licensing: FileCheck,
  general: BookOpen,
};
export type ExamTier = 'mock' | 'paid';

export function ExamModeSelection() {
  const { examType: examTypeParam } = useParams<{ examType: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, accessToken } = useAuth();
  const { darkMode } = useDarkMode();
  const { language } = useLanguage();
  const t = getTranslation(language);
  // Callers can preselect a mode (the account page links straight to Learn)
  const initialMode = (location.state as { mode?: ExamMode } | null)?.mode;
  const [selectedMode, setSelectedMode] = useState<ExamMode>(initialMode ?? 'exam');
  const [examCategory, setExamCategory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [topicCounts, setTopicCounts] = useState<Record<LearnTopic, number> | null>(null);
  const [countsLoading, setCountsLoading] = useState(false);
  const [countsError, setCountsError] = useState(false);
  
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

  // Work out which topics actually have questions in this exam. Needs the full
  // question set, so it only runs for signed-in users.
  //
  // The attempt is tracked in a ref rather than by checking state: deriving the
  // guard from topicCounts/countsLoading meant a failed request left both back
  // at their initial values, so the effect re-ran and refetched forever.
  const countsRequested = useRef<string | null>(null);

  useEffect(() => {
    if (selectedMode !== 'learn' || !examType || !accessToken) return;
    if (countsRequested.current === examType) return;
    countsRequested.current = examType;

    let cancelled = false;
    setCountsLoading(true);
    setCountsError(false);
    api.getAllQuestions(examType, accessToken)
      .then(res => {
        if (!cancelled) setTopicCounts(countByTopic(res.questions || []));
      })
      .catch(() => {
        if (!cancelled) setCountsError(true);
      })
      .finally(() => {
        if (!cancelled) setCountsLoading(false);
      });

    return () => { cancelled = true; };
  }, [selectedMode, examType, accessToken]);

  // Every question falls into some topic (General Theory is a catch-all), so a
  // zero across the board means the exam has no questions loaded at all rather
  // than merely lacking a category.
  const learnUnavailable =
    topicCounts !== null && Object.values(topicCounts).every(n => n === 0);

  const handleStartTopic = (topic: LearnTopic) => {
    if (!user) {
      toast.error(language === 'English'
        ? 'Please log in to use Learn mode.'
        : 'Моля, влезте в профила си, за да използвате режим Учи.');
      navigate('/login');
      return;
    }
    navigate(`/exam/${examType}`, { state: { mode: 'learn', tier: 'paid', topic } });
  };

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
        accent={selectedMode}
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
                {learnUnavailable ? (
                  <div
                    className="rounded-lg border-2 border-dashed px-6 py-10 text-center"
                    style={{
                      borderColor: darkMode ? '#3f4652' : '#e2e8f0',
                      background: darkMode ? 'rgba(51,65,85,0.3)' : '#f8fafc',
                    }}
                  >
                    <GraduationCap className="w-10 h-10 mx-auto mb-3" style={{ color: darkMode ? '#64748b' : '#94a3b8' }} />
                    <p className="font-semibold mb-2" style={{ color: darkMode ? '#e2e8f0' : '#1e293b' }}>
                      {t.learnUnavailable}
                    </p>
                    <p className="text-sm max-w-md mx-auto" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                      {t.learnRequestHint}
                    </p>
                    <Button
                      onClick={() => navigate('/')}
                      variant="outline"
                      className="mt-5"
                      style={{
                        borderColor: darkMode ? '#475569' : '#cbd5e1',
                        color: darkMode ? '#e2e8f0' : '#334155',
                        background: 'transparent',
                      }}
                    >
                      {t.backToExams}
                    </Button>
                  </div>
                ) : (
                <>
                <p className="text-center text-sm mb-5" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                  {language === 'English'
                    ? 'Pick a topic to practise on its own. No timer, no pass mark.'
                    : 'Изберете тема за упражнение. Без таймер и без праг за преминаване.'}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {(topicCounts
                      ? LEARN_TOPICS.filter(t => topicCounts[t.key] > 0)
                      : LEARN_TOPICS
                    ).map(topic => {
                    const Icon = TOPIC_ICONS[topic.key];
                    const count = topicCounts ? topicCounts[topic.key] : null;
                    // Only enable a topic we know has questions. While counts are
                    // loading, or if they failed, tiles stay disabled rather than
                    // letting someone start a run with nothing in it.
                    const available = count !== null
                      ? count > 0
                      : (!accessToken && !countsLoading && !countsError);
                    const label = topic.names[language] ?? topic.names.English;

                    return (
                      <button
                        key={topic.key}
                        onClick={() => available && handleStartTopic(topic.key)}
                        disabled={!available}
                        className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 p-6 select-none transition-all duration-200 ${
                          available
                            ? 'cursor-pointer hover:-translate-y-0.5 learn-tile'
                            : 'cursor-not-allowed border-dashed'
                        }`}
                        style={{
                          borderColor: available
                            ? (darkMode ? '#d4a017' : '#e0b83a')
                            : (darkMode ? '#3f4652' : '#e2e8f0'),
                          backgroundColor: available
                            ? (darkMode ? 'rgba(212,160,23,0.12)' : 'rgba(212,160,23,0.08)')
                            : (darkMode ? 'rgba(51,65,85,0.35)' : '#f8fafc'),
                          color: available
                            ? (darkMode ? '#e0b83a' : '#a97a0f')
                            : (darkMode ? '#6b7280' : '#94a3b8'),
                          opacity: available ? 1 : 0.7,
                        }}
                      >
                        <Icon className="w-7 h-7" />
                        <span className="font-semibold text-sm text-center leading-tight">{label}</span>
                        <span className="text-xs font-medium">
                          {count !== null
                            ? (count > 0
                                ? `${count} ${language === 'English' ? 'questions' : 'въпроса'}`
                                : t.noQuestionsInCategory)
                            : countsLoading
                            ? (language === 'English' ? 'Checking…' : 'Проверка…')
                            : countsError
                            ? (language === 'English' ? 'Unavailable' : 'Недостъпно')
                            : (language === 'English' ? 'Practise' : 'Упражнение')}
                        </span>
                      </button>
                    );
                  })}
                </div>
                </>
                )}
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