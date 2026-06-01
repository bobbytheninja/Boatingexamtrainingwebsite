import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { ArrowLeft, Check, CreditCard } from 'lucide-react';
import { ExamType, examData } from '../data/examQuestions';
import { toast } from 'sonner';
import { ButtonSpinner } from './LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import { useDarkMode } from '../contexts/DarkModeContext';
import { api } from '../utils/api';
import { Navigation } from './Navigation';
import { Footer } from './Footer';
import { Language } from '../data/translations';
import { projectId, publicAnonKey } from '../utils/supabase/info';

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
  expiringSoon?: boolean;
}

interface PaymentPageProps {
  userEmail: string;
  onBack: () => void;
  onComplete: () => void;
  onNavigate?: (page: string) => void;
}

export function PaymentPage({ userEmail, onBack, onComplete, onNavigate }: PaymentPageProps) {
  const { accessToken, refreshSubscriptions, user } = useAuth();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [selectedExams, setSelectedExams] = useState<ExamType[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<Language>('English');
  const [region, setRegion] = useState('Bulgaria');
  const [categories, setCategories] = useState<ExamCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  const currentSubscriptions = user?.subscriptions || [];
  const subscriptionExpiresAt = user?.subscriptionExpiresAt || null;

  const loadCategories = async () => {
    setFetchError(false);
    setLoadingCategories(true);
    try {
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-d36f8f91/categories`;
      const response = await fetch(url, { headers: { 'Authorization': `Bearer ${publicAnonKey}` } });

      if (response.ok) {
        const data = await response.json();
        if (!data.categories || data.categories.length === 0) {
          const initResponse = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-d36f8f91/categories/force-init`,
            { method: 'POST' }
          );
          if (initResponse.ok) {
            const initData = await initResponse.json();
            setCategories(initData.categories || []);
          } else {
            setFetchError(true);
          }
        } else {
          setCategories(data.categories || []);
        }
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

  // Calculate expiry date for display
  const getExpiryDateString = () => {
    if (!subscriptionExpiresAt) return 'N/A';
    const date = new Date(subscriptionExpiresAt);
    return date.toLocaleDateString(currentLanguage === 'English' ? 'en-US' : 'bg-BG', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Transform server categories into display format
  const examTypes: { type: ExamType; title: string; description: string }[] = categories.map(cat => ({
    type: cat.type as ExamType,
    title: currentLanguage === 'Bulgarian' && cat.titleBg ? cat.titleBg : cat.title,
    description: currentLanguage === 'Bulgarian' && cat.descriptionBg ? cat.descriptionBg : cat.description,
  }));

  const toggleExam = (examType: ExamType) => {
    // Don't allow toggling already subscribed exams
    if (currentSubscriptions.includes(examType)) {
      return;
    }
    
    // Don't allow toggling expiring soon exams
    const category = categories.find(c => c.type === examType);
    if (category?.expiringSoon) {
      toast.error('This category is expiring soon and cannot be purchased');
      return;
    }
    
    if (selectedExams.includes(examType)) {
      setSelectedExams(selectedExams.filter(e => e !== examType));
    } else {
      setSelectedExams([...selectedExams, examType]);
    }
  };

  // Calculate total price dynamically from category prices
  const totalPrice = selectedExams.reduce((sum, examType) => {
    const category = categories.find(c => c.type === examType);
    return sum + (category?.price ?? 0);
  }, 0);

  const handlePayment = async () => {
    if (selectedExams.length === 0) {
      toast.error('Please select at least one exam category');
      return;
    }

    if (!accessToken) {
      toast.error('Authentication error. Please log in again.');
      return;
    }

    setIsProcessing(true);
    
    try {
      const { url } = await api.createCheckoutSession(selectedExams, accessToken);
      window.location.href = url;
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(`Failed to start checkout: ${error.message || 'Please try again'}`);
      setIsProcessing(false);
    }
  };

  const handleNavigateInternal = (page: string) => {
    if (page === 'payment') return;
    if (onNavigate) {
      onNavigate(page);
    }
  };

  return (
    <div className={darkMode ? 'dark' : ''}>
      <Navigation
        currentPage="payment"
        onNavigate={handleNavigateInternal}
        isLoggedIn={true}
        transparent={false}
        language={currentLanguage}
        onLanguageChange={setCurrentLanguage}
        region={region}
        onRegionChange={setRegion}
        darkMode={darkMode}
        onDarkModeToggle={toggleDarkMode}
      />
      
      <div 
        className="min-h-screen pt-32 pb-12 px-4 transition-all duration-[400ms]"
        style={{ 
          background: darkMode 
            ? 'linear-gradient(to bottom right, #0f172a, #1e293b, #0f172a)'
            : 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 25%, #f0f9ff 50%, #dbeafe 75%, #f8fafc 100%)',
          transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)'
        }}
      >
        <div className="container mx-auto max-w-6xl">
          <Button 
            onClick={onBack} 
            variant="ghost" 
            className="mb-8 transition-all duration-200 hover:scale-105"
            style={{
              color: darkMode ? '#e5e7eb' : '#0f172a',
              backgroundColor: darkMode ? 'transparent' : '#ffffff',
              border: darkMode ? 'none' : '1px solid #e2e8f0',
              boxShadow: darkMode ? 'none' : '0 1px 3px 0 rgb(0 0 0 / 0.1)'
            }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="text-center mb-16 animate-fadeIn">
            <div 
              className="inline-block mb-4 px-6 py-2 rounded-full border transition-all duration-[400ms]"
              style={{ 
                backgroundColor: darkMode ? '#1e3a5f' : '#eff6ff',
                borderColor: darkMode ? '#1e40af' : '#3b82f6',
                boxShadow: darkMode ? 'none' : '0 4px 6px -1px rgb(59 130 246 / 0.1), 0 2px 4px -2px rgb(59 130 246 / 0.1)',
                transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)'
              }}
            >
              <span 
                className="text-sm font-semibold tracking-wide uppercase transition-colors duration-[400ms]"
                style={{ 
                  color: darkMode ? '#93c5fd' : '#1e40af',
                  transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)'
                }}
              >Unlock Full Access</span>
            </div>
            <h2 className="gradient-ocean mb-6 tracking-tight" style={{ fontSize: 'clamp(2rem, 4vw, 2.5rem)', fontWeight: '800' }}>
              Premium Exam Access
            </h2>
            <p 
              className="max-w-2xl mx-auto text-lg font-light leading-relaxed transition-colors duration-[400ms]"
              style={{ 
                color: darkMode ? '#d1d5db' : '#475569',
                transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)'
              }}
            >
              Select the exam categories you want to unlock. Enjoy unlimited attempts for 30 days per category.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
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
                    className="transition-colors duration-[400ms]"
                    style={{ 
                      color: darkMode ? '#f3f4f6' : '#1e293b',
                      transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)'
                    }}
                  >Select Exam Categories</CardTitle>
                  <CardDescription 
                    className="transition-colors duration-[400ms]"
                    style={{ 
                      color: darkMode ? '#d1d5db' : '#64748b',
                      transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)'
                    }}
                  >Choose which exams you want full access to</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {loadingCategories ? (
                    <div className="flex justify-center items-center py-12">
                      <div className="text-center space-y-3">
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p className="text-sm" style={{ color: darkMode ? '#9ca3af' : '#64748b' }}>
                          Loading exam categories...
                        </p>
                      </div>
                    </div>
                  ) : fetchError ? (
                    <div className="text-center py-12">
                      <p className="mb-4" style={{ color: darkMode ? '#fca5a5' : '#b91c1c' }}>
                        Failed to load exam categories. Check your connection.
                      </p>
                      <Button onClick={loadCategories} variant="outline">Retry</Button>
                    </div>
                  ) : examTypes.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-sm" style={{ color: darkMode ? '#9ca3af' : '#64748b' }}>
                        No exam categories available. Please contact support.
                      </p>
                    </div>
                  ) : (
                    examTypes.map((exam) => {
                      const isSubscribed = currentSubscriptions.includes(exam.type);
                      const category = categories.find(c => c.type === exam.type);
                      const isExpiringSoon = category?.expiringSoon || false;
                      
                      return (
                        <div
                          key={exam.type}
                          className={`flex items-start space-x-3 p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer ${ 
                            isSubscribed
                              ? 'cursor-not-allowed opacity-75'
                              : selectedExams.includes(exam.type)
                              ? 'shadow-md scale-[1.01]'
                              : 'hover:shadow-md'
                          }`}
                          style={{
                            backgroundColor: isSubscribed
                              ? (darkMode ? 'rgba(20, 83, 45, 0.2)' : '#f0fdf4')
                              : selectedExams.includes(exam.type)
                              ? (darkMode ? 'rgba(30, 58, 138, 0.3)' : '#eff6ff')
                              : (darkMode ? '#334155' : '#ffffff'),
                            borderColor: isSubscribed
                              ? (darkMode ? '#16a34a' : '#4ade80')
                              : isExpiringSoon
                              ? (darkMode ? '#ef4444' : '#dc2626')
                              : selectedExams.includes(exam.type)
                              ? (darkMode ? '#60a5fa' : '#3b82f6')
                              : (darkMode ? '#475569' : '#e5e7eb'),
                            ...(darkMode && !isSubscribed && !selectedExams.includes(exam.type) && {
                              ':hover': {
                                backgroundColor: '#475569'
                              }
                            })
                          }}
                          onClick={() => toggleExam(exam.type)}
                        >
                          <Checkbox
                            checked={isSubscribed || selectedExams.includes(exam.type)}
                            disabled={isSubscribed || isExpiringSoon}
                            onCheckedChange={() => toggleExam(exam.type)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <h4 className="font-semibold transition-colors duration-[400ms]" style={{ color: darkMode ? '#f3f4f6' : '#0f172a' }}>{exam.title}</h4>
                              <div className="flex items-center gap-2">
                                {isSubscribed ? (
                                  <Badge 
                                    className="transition-colors duration-[400ms]"
                                    style={{
                                      backgroundColor: darkMode ? 'rgba(34, 197, 94, 0.2)' : '#dcfce7',
                                      color: darkMode ? '#86efac' : '#166534',
                                      border: darkMode ? '1px solid #16a34a' : '1px solid #86efac'
                                    }}
                                  >
                                    ✓ Active until {getExpiryDateString()}
                                  </Badge>
                                ) : isExpiringSoon ? (
                                  <Badge 
                                    variant="destructive"
                                    className="bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700"
                                  >
                                    ⚠️ Expiring Soon - Not Available
                                  </Badge>
                                ) : (
                                  <Badge 
                                    variant="secondary" 
                                    style={{
                                      backgroundColor: darkMode ? '#475569' : '#f1f5f9',
                                      color: darkMode ? '#e5e7eb' : '#475569',
                                      border: darkMode ? 'none' : '1px solid #e2e8f0'
                                    }}
                                  >
                                    €{categories.find(c => c.type === exam.type)?.price || 5}/month
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <p className="text-sm mt-1 transition-colors duration-[400ms]" style={{ color: darkMode ? '#d1d5db' : '#475569' }}>{exam.description}</p>
                            {!isSubscribed && (
                              <div className="flex gap-2 mt-2 text-xs transition-colors duration-[400ms]" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
                                <span>• 40 Questions</span>
                                <span>• Unlimited Attempts</span>
                                <span>• Study & Exam Modes</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </CardContent>
              </Card>

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
                    style={{ color: darkMode ? '#f3f4f6' : '#0f172a' }}
                  >
                    <CreditCard className="w-5 h-5" />
                    Secure Checkout
                  </CardTitle>
                  <CardDescription 
                    className="transition-colors duration-[400ms]"
                    style={{ color: darkMode ? '#d1d5db' : '#64748b' }}
                  >
                    Payment powered by Stripe. Your card details are secure.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div
                    className="rounded-lg p-4 space-y-2"
                    style={{
                      background: darkMode ? 'rgba(30, 41, 59, 0.8)' : '#eff6ff',
                      border: darkMode ? '1px solid rgba(71, 85, 105, 0.6)' : '1px solid #bfdbfe',
                    }}
                  >
                    <p className="text-sm" style={{ color: darkMode ? '#93c5fd' : '#1e3a8a' }}>
                      You will be redirected to Stripe's secure checkout page to complete your payment.
                    </p>
                    <ul className="text-xs space-y-1 ml-4" style={{ color: darkMode ? '#94a3b8' : '#1e40af' }}>
                      <li>• Your email: <strong>{userEmail}</strong></li>
                      <li>• Receipt will be sent automatically</li>
                      <li>• 30-day access per category</li>
                    </ul>
                  </div>

                  <Button
                    onClick={handlePayment}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg"
                    size="lg"
                    disabled={selectedExams.length === 0 || isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <ButtonSpinner className="mr-2" />
                        Opening Checkout...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5 mr-2" />
                        {`Proceed to Checkout - €${totalPrice}/month`}
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    By proceeding, you agree that this is for <strong>training purposes only</strong> and does not provide official certification.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <Card
                className="border-2 sticky top-6 transition-all duration-[400ms]"
                style={{
                  background: darkMode
                    ? 'linear-gradient(to bottom right, #1e3a5f, #1e3358)'
                    : 'linear-gradient(to bottom right, #eff6ff, #ffffff)',
                  borderColor: darkMode ? '#3b82f6' : '#bfdbfe',
                  boxShadow: darkMode
                    ? '0 20px 25px -5px rgb(0 0 0 / 0.4), 0 8px 10px -6px rgb(0 0 0 / 0.3)'
                    : '0 10px 15px -3px rgb(0 0 0 / 0.05), 0 4px 6px -4px rgb(0 0 0 / 0.05)',
                  transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)'
                }}
              >
                <CardHeader>
                  <CardTitle 
                    className="transition-colors duration-[400ms]"
                    style={{ color: darkMode ? '#f3f4f6' : '#0f172a' }}
                  >Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedExams.length === 0 ? (
                    <p style={{ color: darkMode ? '#9ca3af' : '#475569' }} className="text-center py-8">
                      No exams selected
                    </p>
                  ) : (
                    <>
                      <div className="space-y-3">
                        {selectedExams.map((examType) => {
                          const exam = examTypes.find(e => e.type === examType);
                          const category = categories.find(c => c.type === examType);
                          const price = category?.price || 5;
                          return (
                            <div key={examType} className="flex items-center justify-between text-sm" style={{ color: darkMode ? '#e5e7eb' : '#1e293b' }}>
                              <span>{exam?.title}</span>
                              <span className="font-medium">€{price}/mo</span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="border-t dark:border-slate-500 pt-4">
                        <div className="flex items-center justify-between mb-4">
                          <span style={{ color: darkMode ? '#e5e7eb' : '#1e293b' }}>Monthly Total</span>
                          <span className="text-2xl font-semibold text-blue-600 dark:text-blue-400">€{totalPrice}</span>
                        </div>
                      </div>

                      <div className="rounded-lg p-4 space-y-2" style={{ background: darkMode ? 'rgba(59, 130, 246, 0.2)' : '#dbeafe', border: darkMode ? '1px solid rgba(96, 165, 250, 0.4)' : '1px solid #bfdbfe' }}>
                        <p className="text-sm font-medium" style={{ color: darkMode ? '#93c5fd' : '#1e3a8a' }}>What's included:</p>
                        <ul className="text-xs space-y-1" style={{ color: darkMode ? '#bfdbfe' : '#1e40af' }}>
                          <li className="flex items-start gap-2">
                            <Check className="w-3 h-3 mt-0.5 flex-shrink-0" />
                            <span>Full access to all questions</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="w-3 h-3 mt-0.5 flex-shrink-0" />
                            <span>Unlimited exam attempts</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="w-3 h-3 mt-0.5 flex-shrink-0" />
                            <span>Study and exam modes</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="w-3 h-3 mt-0.5 flex-shrink-0" />
                            <span>Track your progress</span>
                          </li>
                        </ul>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}