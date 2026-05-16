import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { User, Calendar, CreditCard, Package, ArrowLeft, Trash2 } from 'lucide-react';
import { ExamType, examData } from '../data/examQuestions';
import { getTranslation } from '../data/translations';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { useAuth } from '../contexts/AuthContext';
import { useDarkMode } from '../contexts/DarkModeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { toast } from 'sonner';
import { ButtonSpinner } from './LoadingSpinner';
import { Navigation } from './Navigation';
import { Footer } from './Footer';
import { projectId } from '../utils/supabase/info';

interface AccountPageProps {
  userEmail: string;
  paidExams: ExamType[];
  subscriptionExpiresAt?: number | null;
  onNavigate: (page: string) => void;
  onStartExam: (examType: ExamType, mode?: 'exam' | 'study') => void;
  onLogout: () => void;
}

interface CategoryData {
  type: string;
  title: string;
  titleBg: string;
  [key: string]: any;
}

export function AccountPage({ userEmail, paidExams, subscriptionExpiresAt, onNavigate, onStartExam, onLogout }: AccountPageProps) {
  const { language } = useLanguage();
  const t = getTranslation(language);
  const { deleteAccount } = useAuth();
  const { darkMode } = useDarkMode();
  const [isDeleting, setIsDeleting] = useState(false);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  
  // Fetch categories from backend
  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-d36f8f91/categories`);
        if (response.ok) {
          const data = await response.json();
          setCategories(data.categories || []);
        }
      } catch (error) {
        console.error('[AccountPage] Error fetching categories:', error);
      } finally {
        setLoadingCategories(false);
      }
    };
    
    fetchCategories();
  }, []);
  
  // Debug logging
  React.useEffect(() => {
    console.log('');
    console.log('═══════════════════════════════════════════════════');
    console.log('[AccountPage] 🔍 SUBSCRIPTION DEBUG');
    console.log('═══════════════════════════════════════════════════');
    console.log('[AccountPage] User Email:', userEmail);
    console.log('[AccountPage] Paid Exams Array:', paidExams);
    console.log('[AccountPage] Paid Exams Count:', paidExams.length);
    console.log('[AccountPage] Paid Exams (detailed):', JSON.stringify(paidExams, null, 2));
    console.log('[AccountPage] Subscription Expires At:', subscriptionExpiresAt);
    console.log('[AccountPage] Language:', language);
    console.log('[AccountPage] Dark Mode:', darkMode);
    console.log('═══════════════════════════════════════════════════');
    console.log('');
  }, [userEmail, paidExams, subscriptionExpiresAt, language, darkMode]);

  // Calculate expiry dates from the subscriptionExpiresAt timestamp
  const getExpiryDate = () => {
    if (!subscriptionExpiresAt) {
      return 'N/A';
    }
    const date = new Date(subscriptionExpiresAt);
    return date.toLocaleDateString(language === 'English' ? 'en-US' : 'bg-BG', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getDaysRemaining = () => {
    if (!subscriptionExpiresAt) {
      return 0;
    }
    const now = Date.now();
    const diffInMs = subscriptionExpiresAt - now;
    const daysRemaining = Math.ceil(diffInMs / (24 * 60 * 60 * 1000));
    return Math.max(0, daysRemaining);
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteAccount();
      toast.success(language === 'English' 
        ? 'Your account has been permanently deleted.' 
        : 'Акаунтът ви е изтрит перманентно.');
    } catch (error: any) {
      console.error('Delete account error:', error);
      toast.error(language === 'English' 
        ? `Failed to delete account: ${error.message}` 
        : `Грешка при изтриване на акаунт: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleNavigate = (page: string) => {
    if (page === 'account') return;
    if (page === 'home') {
      onNavigate('/');
    } else if (page === 'contact') {
      onNavigate('/contact');
    } else if (page === 'partners') {
      onNavigate('/partners');
    } else if (page === 'pricing') {
      onNavigate('/pricing');
    } else if (page === 'admin') {
      onNavigate('/admin');
    }
  };

  return (
    <>
      <Navigation
        currentPage="account"
        onNavigate={handleNavigate}
        isLoggedIn={true}
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
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-6xl">
          {/* Back Button */}
          <Button
            onClick={() => onNavigate('home')}
            variant="ghost"
            className="mb-8 font-medium transition-all duration-200"
            style={{
              color: darkMode ? '#d1d5db' : '#374151',
              backgroundColor: 'transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = darkMode ? '#334155' : '#f0f9ff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t.backToHome}
          </Button>

          <div className="mb-12 animate-fadeIn">
            <h2 className="gradient-ocean mb-2 tracking-tight" style={{ fontSize: 'clamp(2rem, 4vw, 2.5rem)', fontWeight: '800' }}>
              {t.myAccount}
            </h2>
            <p 
              className="text-lg font-light transition-colors duration-[400ms]"
              style={{ 
                color: darkMode ? '#d1d5db' : '#334155',
                transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)' 
              }}
            >{t.manageAccount}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Account Information */}
            <div className="lg:col-span-1 space-y-6">
              <Card 
                className="border-2 shadow-xl transition-all duration-[400ms]"
                style={{ 
                  backgroundColor: darkMode ? '#334155' : '#ffffff',
                  borderColor: darkMode ? '#475569' : '#e2e8f0',
                  transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)' 
                }}
              >
                <CardHeader>
                  <CardTitle 
                    className="flex items-center gap-2 transition-colors duration-[400ms]"
                    style={{ 
                      color: darkMode ? '#f3f4f6' : '#1e293b',
                      transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)' 
                    }}
                  >
                    <User className="w-5 h-5" />
                    {t.accountDetails}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm mb-1 transition-colors duration-[400ms]" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>{t.email}</p>
                    <p className="font-medium transition-colors duration-[400ms]" style={{ color: darkMode ? '#f3f4f6' : '#0f172a' }}>{userEmail}</p>
                  </div>
                  <div>
                    <p className="text-sm mb-1 transition-colors duration-[400ms]" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>{t.memberSince}</p>
                    <p className="font-medium transition-colors duration-[400ms]" style={{ color: darkMode ? '#f3f4f6' : '#0f172a' }}>{language === 'English' ? 'November 2024' : 'Ноември 2024'}</p>
                  </div>
                  <div>
                    <p className="text-sm mb-1 transition-colors duration-[400ms]" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>{t.accountStatus}</p>
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/50 dark:text-green-300">{t.active}</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card 
                className="border-2 shadow-xl transition-all duration-[400ms]"
                style={{ 
                  background: darkMode 
                    ? 'linear-gradient(to bottom right, #1e3a5f, #334155)'
                    : 'linear-gradient(to bottom right, #dbeafe, #ffffff)',
                  borderColor: darkMode ? '#1e40af' : '#bfdbfe',
                  transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)' 
                }}
              >
                <CardContent className="pt-6 space-y-4">
                  <Button
                    onClick={onLogout}
                    variant="outline"
                    className="w-full border-2 font-semibold transition-all duration-200"
                    style={{
                      borderColor: darkMode ? '#4b5563' : '#d1d5db',
                      backgroundColor: darkMode ? 'transparent' : '#f9fafb',
                      color: darkMode ? '#e5e7eb' : '#1f2937'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = darkMode ? '#475569' : '#e5e7eb';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = darkMode ? 'transparent' : '#f9fafb';
                    }}
                  >
                    {t.logout}
                  </Button>
                </CardContent>
              </Card>

              {/* Danger Zone */}
              <Card 
                className="border-2 shadow-xl transition-all duration-[400ms]"
                style={{ 
                  background: darkMode 
                    ? 'linear-gradient(to bottom right, rgba(127, 29, 29, 0.2), #334155)'
                    : 'linear-gradient(to bottom right, #fee2e2, #ffffff)',
                  borderColor: darkMode ? '#991b1b' : '#fecaca',
                  transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)' 
                }}
              >
                <CardHeader>
                  <CardTitle className="text-red-700 dark:text-red-400 flex items-center gap-2">
                    <Trash2 className="w-5 h-5" />
                    {language === 'English' ? 'Danger Zone' : 'Опасна Зона'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm transition-colors duration-[400ms]" style={{ color: darkMode ? '#d1d5db' : '#374151' }}>
                    {language === 'English' 
                      ? 'Once you delete your account, there is no going back. All your data including subscriptions, exam results, and progress will be permanently deleted.' 
                      : 'След като изтриете акаунта си, няма връщане назад. Всички ваши данни включително абонаменти, резултати от изпити и прогрес е бъдат перманентно изтрити.'}
                  </p>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        className="w-full bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 font-semibold"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        {language === 'English' ? 'Delete My Account' : 'Изтрий Акаунта Ми'}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="dark:bg-slate-800">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-red-600 dark:text-red-400">
                          {language === 'English' ? '⚠️ Are you absolutely sure?' : '⚠️ Сигурни ли сте абсолютно?'}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="dark:text-gray-300">
                          {language === 'English' 
                            ? 'This action cannot be undone. Your account and all associated data will be permanently deleted from our servers. This includes:' 
                            : 'Това действие не може да бъде отменено. Вашият акаунт и всички свързани данни ще бъдат перманентно изтрити от нашите сървъри. Това включва:'}
                        </AlertDialogDescription>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300 mt-2">
                          <li>{language === 'English' ? 'All active subscriptions' : 'Всички активни абонаменти'}</li>
                          <li>{language === 'English' ? 'Exam results and history' : 'Резултати от изпити и история'}</li>
                          <li>{language === 'English' ? 'Progress tracking data' : 'Данни за проследяване на прогрес'}</li>
                          <li>{language === 'English' ? 'Account preferences' : 'Настройки на акаунт'}</li>
                        </ul>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="dark:bg-slate-700 dark:text-gray-200 dark:hover:bg-slate-600">
                          {language === 'English' ? 'Cancel' : 'Отказ'}
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteAccount}
                          disabled={isDeleting}
                          className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
                        >
                          {isDeleting ? (
                            <>
                              <ButtonSpinner className="mr-2" />
                              {language === 'English' ? 'Deleting...' : 'Изтриване...'}
                            </>
                          ) : (
                            language === 'English' ? 'Yes, Delete My Account' : 'Да, Изтрий Акаунта Ми'
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>
            </div>

            {/* Active Subscriptions */}
            <div className="lg:col-span-2">
              <Card 
                className="border-2 shadow-xl transition-all duration-[400ms]"
                style={{ 
                  backgroundColor: darkMode ? '#334155' : '#ffffff',
                  borderColor: darkMode ? '#475569' : '#e2e8f0',
                  transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)' 
                }}
              >
                <CardHeader>
                  <CardTitle 
                    className="flex items-center gap-2 transition-colors duration-[400ms]"
                    style={{ 
                      color: darkMode ? '#f3f4f6' : '#1e293b',
                      transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)' 
                    }}
                  >
                    <CreditCard className="w-5 h-5" />
                    {t.activeSubscriptions}
                  </CardTitle>
                  <CardDescription 
                    className="transition-colors duration-[400ms]"
                    style={{ 
                      color: darkMode ? '#d1d5db' : '#64748b',
                      transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)' 
                    }}
                  >{t.currentExamAccess}</CardDescription>
                </CardHeader>
                <CardContent>
                  {paidExams.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="inline-flex p-4 bg-gray-100 dark:bg-slate-600 rounded-full mb-4">
                        <Package className="w-8 h-8 text-gray-400 dark:text-gray-300" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2 transition-colors duration-[400ms]" style={{ color: darkMode ? '#f3f4f6' : '#0f172a' }}>{t.noActiveSubscriptions}</h3>
                      <p className="mb-6 transition-colors duration-[400ms]" style={{ color: darkMode ? '#d1d5db' : '#475569' }}>{t.noActiveSubscriptionsDesc}</p>
                      <Button
                        onClick={() => onNavigate('/payment')}
                        className="bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600 hover:from-sky-600 hover:via-sky-700 hover:to-blue-700 shadow-lg font-semibold"
                      >
                        {t.browsePlans}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {paidExams.map((examType) => {
                        // Try to get exam data from dynamic categories first, fallback to static examData
                        const categoryData = categories.find(cat => cat.type === examType);
                        const exam = categoryData || examData[examType];

                        // FLEXIBLE SYSTEM: Always show the subscription, even if category data is missing
                        // Use fallback display with exam type if no data found
                        const examTitle = (() => {
                          if (language === 'English') {
                            return categoryData?.title || exam?.title || `${examType.charAt(0).toUpperCase() + examType.slice(1)} Exam`;
                          } else {
                            return categoryData?.titleBg || exam?.title || `Изпит ${examType}`;
                          }
                        })();

                        // Log warning but DON'T skip rendering - subscription should always be visible
                        if (!exam && !categoryData) {
                          console.warn(`[AccountPage] ⚠️ Category data missing for "${examType}", using fallback display`);
                        }

                        // Get price from category data, fallback to €5.00
                        const examPrice = categoryData?.price || 5;

                        const daysRemaining = getDaysRemaining();
                        const expiryDate = getExpiryDate();
                        const isExpiringSoon = daysRemaining <= 7;

                        return (
                          <Card 
                            key={examType} 
                            className="border-2 hover:border-sky-300 dark:hover:border-sky-600 hover:shadow-lg transition-all duration-[400ms] group"
                            style={{ 
                              backgroundColor: darkMode ? '#1e293b' : '#ffffff',
                              borderColor: darkMode ? '#475569' : '#e2e8f0',
                              transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)' 
                            }}
                          >
                            <CardContent className="pt-6">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-3">
                                    <h4 className="font-bold text-lg transition-colors duration-[400ms]" style={{ color: darkMode ? '#f3f4f6' : '#0f172a' }}>{examTitle}</h4>
                                    <Badge 
                                      className={`${
                                        isExpiringSoon 
                                          ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300' 
                                          : 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
                                      }`}
                                    >
                                      {isExpiringSoon ? t.expiringSoon : t.active}
                                    </Badge>
                                  </div>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2 transition-colors duration-[400ms]" style={{ color: darkMode ? '#d1d5db' : '#475569' }}>
                                      <Calendar className="w-4 h-4" />
                                      <span>{t.validUntil}: <strong style={{ color: darkMode ? '#f3f4f6' : '#1e293b' }}>{expiryDate}</strong></span>
                                    </div>
                                    <div className="flex items-center gap-2 transition-colors duration-[400ms]" style={{ color: darkMode ? '#d1d5db' : '#475569' }}>
                                      <span>{daysRemaining} {t.daysRemaining}</span>
                                    </div>
                                  </div>
                                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-600">
                                    <div className="flex items-center justify-between text-sm">
                                      <span style={{ color: darkMode ? '#d1d5db' : '#475569' }}>{t.monthlySubscription}</span>
                                      <span className="font-semibold" style={{ color: darkMode ? '#f3f4f6' : '#1e293b' }}>€{examPrice.toFixed(2)}{t.perMonth}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                  <Button
                                    onClick={() => onStartExam(examType, 'exam')}
                                    variant="outline"
                                    className="border-2 border-blue-500 bg-orange-50/60 text-orange-700 hover:bg-orange-100/80 dark:border-blue-400 dark:bg-orange-900/20 dark:text-orange-400 dark:hover:bg-orange-900/40 font-semibold whitespace-nowrap"
                                  >
                                    {t.startExam}
                                  </Button>
                                  <Button
                                    onClick={() => onStartExam(examType, 'study')}
                                    variant="outline"
                                    className="border-2 border-blue-500 text-blue-700 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/30 font-semibold whitespace-nowrap"
                                  >
                                    {t.startStudy}
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}

                      <Card className="border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30">
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold mb-1 transition-colors duration-[400ms]" style={{ color: darkMode ? '#f3f4f6' : '#0f172a' }}>{t.wantMoreExams}</h4>
                              <p className="text-sm transition-colors duration-[400ms]" style={{ color: darkMode ? '#d1d5db' : '#475569' }}>{t.additionalCategories}</p>
                            </div>
                            <Button
                              onClick={() => onNavigate('/payment')}
                              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md font-semibold whitespace-nowrap"
                            >
                              {t.addMore}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Usage Statistics (Optional) */}
              {paidExams.length > 0 && (
                <Card className="border-2 border-gray-200 dark:border-slate-600 shadow-xl mt-6 dark:bg-slate-700">
                  <CardHeader>
                    <CardTitle className="dark:text-gray-100">{t.yourProgress}</CardTitle>
                    <CardDescription className="dark:text-gray-300">{t.trackPerformance}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
                        <div className="text-3xl font-bold text-blue-700 dark:text-blue-400 mb-1">{paidExams.length}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">{t.activeExams}</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 dark:bg-green-900/30 rounded-xl">
                        <div className="text-3xl font-bold text-green-700 dark:text-green-400 mb-1">-</div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">{t.examsCompleted}</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/30 rounded-xl">
                        <div className="text-3xl font-bold text-purple-700 dark:text-purple-400 mb-1">-</div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">{t.averageScore}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </>
  );
}