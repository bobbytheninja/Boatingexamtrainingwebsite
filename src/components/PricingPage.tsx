import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Check, ArrowLeft } from 'lucide-react';
import { Language, getTranslation } from '../data/translations';

interface PricingPageProps {
  onNavigate: (page: string) => void;
  isLoggedIn: boolean;
  language: Language;
}

export function PricingPage({ onNavigate, isLoggedIn, language }: PricingPageProps) {
  const t = getTranslation(language);
  
  const handleGetStarted = () => {
    if (isLoggedIn) {
      onNavigate('payment');
    } else {
      onNavigate('login');
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20 bg-gradient-to-br from-slate-50 via-blue-50/50 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        {/* Back Button */}
        <Button
          onClick={() => onNavigate('home')}
          variant="ghost"
          className="mb-6 hover:bg-sky-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 text-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
          {t.backToHome}
        </Button>

        <div className="text-center mb-10 animate-fadeIn">
          <div className="inline-block mb-3 px-4 py-1.5 bg-sky-100 dark:bg-sky-900 rounded-full border border-sky-200 dark:border-sky-700">
            <span className="text-sky-700 dark:text-sky-300 text-xs font-semibold tracking-wide uppercase">{t.pricing}</span>
          </div>
          <h2 className="gradient-ocean mb-4 tracking-tight" style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: '800' }}>
            {t.pricingTitle}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-xl mx-auto text-sm md:text-base font-light leading-relaxed">
            {t.pricingSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
          {/* Free Plan */}
          <Card className="relative overflow-hidden border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-slate-700 shadow-md">
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-green-400/20 to-transparent rounded-full blur-xl"></div>
            <CardHeader className="relative pb-4">
              <Badge className="w-fit bg-gradient-to-r from-green-600 to-green-700 mb-2 text-xs px-2 py-0.5">{t.free}</Badge>
              <CardTitle className="text-lg font-bold mb-0.5 dark:text-gray-100">{t.practiceMode}</CardTitle>
              <CardDescription className="text-xs dark:text-gray-300">{t.practiceModeDesc}</CardDescription>
              <div className="mt-3">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">€0</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{t.perMonth}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative space-y-3">
              <ul className="space-y-2">
                <li className="flex items-start gap-1.5">
                  <div className="mt-0.5 p-0.5 bg-green-100 rounded-full flex-shrink-0">
                    <Check className="w-2.5 h-2.5 text-green-600" />
                  </div>
                  <span className="text-xs text-gray-700 dark:text-gray-300">{t.questionsPerExam}</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <div className="mt-0.5 p-0.5 bg-green-100 rounded-full flex-shrink-0">
                    <Check className="w-2.5 h-2.5 text-green-600" />
                  </div>
                  <span className="text-xs text-gray-700 dark:text-gray-300">{t.allCategories}</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <div className="mt-0.5 p-0.5 bg-green-100 rounded-full flex-shrink-0">
                    <Check className="w-2.5 h-2.5 text-green-600" />
                  </div>
                  <span className="text-xs text-gray-700 dark:text-gray-300">{t.studyExamModes}</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <div className="mt-0.5 p-0.5 bg-green-100 rounded-full flex-shrink-0">
                    <Check className="w-2.5 h-2.5 text-green-600" />
                  </div>
                  <span className="text-xs text-gray-700 dark:text-gray-300">{t.noCardRequired}</span>
                </li>
              </ul>
              <Button
                onClick={() => onNavigate(isLoggedIn ? 'home' : 'login')}
                className="w-full h-9 border-2 border-green-600 text-green-700 hover:bg-green-50 font-semibold text-sm"
                variant="outline"
              >
                {t.getStartedFree}
              </Button>
            </CardContent>
          </Card>

          {/* Premium Plan */}
          <Card className="relative overflow-hidden border-2 border-sky-400 dark:border-sky-600 bg-gradient-to-br from-sky-50 to-white dark:from-slate-700 dark:to-slate-600 shadow-lg transform scale-[1.02]">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600"></div>
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-sky-400/30 to-transparent rounded-full blur-xl"></div>
            <CardHeader className="relative pb-4">
              <Badge className="w-fit bg-gradient-to-r from-sky-500 to-blue-600 mb-2 text-xs px-2 py-0.5">{t.mostPopular}</Badge>
              <CardTitle className="text-lg font-bold mb-0.5 dark:text-gray-100">{t.fullAccess}</CardTitle>
              <CardDescription className="text-xs dark:text-gray-300">{t.fullAccessDesc}</CardDescription>
              <div className="mt-3">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">€5</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{t.perMonthPerCategory}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative space-y-3">
              <ul className="space-y-2">
                <li className="flex items-start gap-1.5">
                  <div className="mt-0.5 p-0.5 bg-sky-100 rounded-full flex-shrink-0">
                    <Check className="w-2.5 h-2.5 text-sky-600" />
                  </div>
                  <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">{t.allQuestions}</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <div className="mt-0.5 p-0.5 bg-sky-100 rounded-full flex-shrink-0">
                    <Check className="w-2.5 h-2.5 text-sky-600" />
                  </div>
                  <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">{t.unlimitedAttempts}</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <div className="mt-0.5 p-0.5 bg-sky-100 rounded-full flex-shrink-0">
                    <Check className="w-2.5 h-2.5 text-sky-600" />
                  </div>
                  <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">{t.bothModes}</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <div className="mt-0.5 p-0.5 bg-sky-100 rounded-full flex-shrink-0">
                    <Check className="w-2.5 h-2.5 text-sky-600" />
                  </div>
                  <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">{t.progressTracking}</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <div className="mt-0.5 p-0.5 bg-sky-100 rounded-full flex-shrink-0">
                    <Check className="w-2.5 h-2.5 text-sky-600" />
                  </div>
                  <span className="text-xs text-gray-700 font-medium">{t.timedExams}</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <div className="mt-0.5 p-0.5 bg-sky-100 rounded-full flex-shrink-0">
                    <Check className="w-2.5 h-2.5 text-sky-600" />
                  </div>
                  <span className="text-xs text-gray-700 font-medium">{t.cancelAnytime}</span>
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
          <p className="text-gray-500 text-xs max-w-2xl mx-auto">
            {t.disclaimerText}
          </p>
        </div>
      </div>
    </div>
  );
}
