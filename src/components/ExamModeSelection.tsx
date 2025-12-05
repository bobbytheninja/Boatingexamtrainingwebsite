import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Check, BookOpen, FileText, ArrowLeft } from 'lucide-react';
import { ExamType, examData } from '../data/examQuestions';
import { getTranslation } from '../data/translations';
import { Navigation } from './Navigation';
import { Footer } from './Footer';
import { useDarkMode } from '../contexts/DarkModeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner@2.0.3';

export type ExamMode = 'study' | 'exam';
export type ExamTier = 'mock' | 'paid';

export function ExamModeSelection() {
  const { examType: examTypeParam } = useParams<{ examType: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { darkMode } = useDarkMode();
  const { language } = useLanguage();
  const t = getTranslation(language);
  
  const examType = examTypeParam as ExamType;
  if (!examType || !examData[examType]) {
    navigate('/home');
    return null;
  }
  const exam = examData[examType];
  const [selectedMode, setSelectedMode] = useState<ExamMode>('study');

  const handleBack = () => {
    navigate('/home');
  };

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
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-5xl">
          <Button onClick={handleBack} variant="ghost" className="mb-6 hover:bg-blue-100 dark:hover:bg-slate-700 dark:text-gray-200">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t.backToHome}
          </Button>

          <div className="text-center mb-12">
            <h2 className="bg-gradient-to-r from-blue-900 to-blue-700 dark:from-blue-400 dark:to-blue-300 bg-clip-text text-transparent mb-2">
              {exam.title}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg">{exam.description}</p>
            <div className="mt-6 flex gap-6 justify-center items-center">
              <Badge variant="secondary" className="px-4 py-2">40 {t.question}s</Badge>
              <Badge variant="secondary" className="px-4 py-2">60 {language === 'English' ? 'Minutes' : 'Минути'}</Badge>
              <Badge variant="secondary" className="px-4 py-2">{language === 'English' ? 'Max 6 Points Lost' : 'Макс 6 Загубени Точки'}</Badge>
            </div>
          </div>

          <div className="space-y-10">
            {/* Mode Toggle Section */}
            <div>
              <h3 className="mb-6 text-center text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">{t.selectModeTitle}</h3>
              <div className="flex justify-center mb-8">
                <div className="inline-flex rounded-lg border-2 border-sky-300 dark:border-sky-600 bg-sky-100/50 dark:bg-slate-800 p-1 shadow-lg">
                  <button
                    onClick={() => setSelectedMode('study')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-md transition-all ${
                      selectedMode === 'study'
                        ? 'bg-gradient-to-r from-sky-500 to-cyan-600 text-white shadow-md'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-sky-200/50 dark:hover:bg-slate-700'
                    }`}
                  >
                    <BookOpen className="w-5 h-5" />
                    <span className="font-semibold">{t.studyMode}</span>
                  </button>
                  <button
                    onClick={() => setSelectedMode('exam')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-md transition-all ${
                      selectedMode === 'exam'
                        ? 'bg-gradient-to-r from-sky-500 to-cyan-600 text-white shadow-md'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-sky-200/50 dark:hover:bg-slate-700'
                    }`}
                  >
                    <FileText className="w-5 h-5" />
                    <span className="font-semibold">{t.examMode}</span>
                  </button>
                </div>
              </div>
              <div className="max-w-2xl mx-auto">
                <Card className="border-2 shadow-xl transition-all border-sky-400 bg-gradient-to-br from-sky-50 to-white dark:from-slate-700 dark:to-slate-600">
                  <CardHeader className="text-center">
                    <CardTitle className="flex items-center justify-center gap-2 text-xl">
                      {selectedMode === 'study' ? (
                        <>
                          <BookOpen className="w-6 h-6 text-sky-600" />
                          <span>{t.studyMode}</span>
                        </>
                      ) : (
                        <>
                          <FileText className="w-6 h-6 text-sky-600" />
                          <span>{t.examMode}</span>
                        </>
                      )}
                    </CardTitle>
                    <CardDescription className="text-base">
                      {selectedMode === 'study' 
                        ? t.studyModeDesc
                        : t.examModeDesc}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      {selectedMode === 'study' ? (
                        <>
                          <li className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{t.instantFeedback}</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{t.learnAsPractice}</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{t.perfectForBeginners}</span>
                          </li>
                        </>
                      ) : (
                        <>
                          <li className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{t.realisticExamSim}</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{t.sixtyMinTimer}</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{t.resultsAtCompletion}</span>
                          </li>
                        </>
                      )}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div>
              <h3 className="mb-6 text-center text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                {t.selectExamType}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="relative overflow-hidden border-2 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-sky-300 dark:border-sky-600 bg-gradient-to-br from-sky-50 to-white dark:from-slate-700 dark:to-slate-600">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br rounded-full blur-2xl from-sky-400/20 to-transparent"></div>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="dark:text-gray-100">{t.freePractice}</CardTitle>
                      <Badge className="bg-gradient-to-r from-sky-500 to-cyan-600 shadow-md">{t.free.toUpperCase()}</Badge>
                    </div>
                    <CardDescription className="text-gray-700 dark:text-gray-300">
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
                        className="w-full h-12 bg-gradient-to-r from-sky-500 via-cyan-600 to-blue-600 hover:from-sky-600 hover:via-cyan-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] font-semibold"
                        size="lg"
                      >
                        {t.startFree} - {selectedMode === 'study' ? t.studyMode : t.examMode}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="relative overflow-hidden border-2 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-sky-300 dark:border-sky-600 bg-gradient-to-br from-sky-50 to-white dark:from-slate-700 dark:to-slate-600">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br rounded-full blur-2xl from-sky-400/20 to-transparent"></div>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="dark:text-gray-100">{t.fullAccessTitle}</CardTitle>
                      <Badge className="shadow-md bg-gradient-to-r from-amber-400 to-sky-500">€5{t.perMonth}</Badge>
                    </div>
                    <CardDescription className="text-gray-700 dark:text-gray-300">
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
                        className="w-full h-12 shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] font-semibold bg-gradient-to-r from-amber-400 via-yellow-500 to-sky-500 hover:from-amber-500 hover:via-yellow-600 hover:to-sky-600"
                        size="lg"
                      >
                        {t.startFull} - {selectedMode === 'study' ? t.studyMode : t.examMode}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 shadow-lg">
              <CardContent className="pt-6">
                <p className="text-sm text-amber-900 text-center">
                  {t.fullAccessNote}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}