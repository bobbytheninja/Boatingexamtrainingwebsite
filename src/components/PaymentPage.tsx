import React, { useState } from 'react';
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

  // Get the user's current subscriptions and expiration date
  const currentSubscriptions = user?.subscriptions || [];
  const subscriptionExpiresAt = user?.subscriptionExpiresAt || null;

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

  const examTypes: { type: ExamType; title: string; description: string }[] = [
    { type: 'jet', title: examData.jet.title, description: examData.jet.description },
    { type: 'small', title: examData.small.title, description: examData.small.description },
    { type: 'big', title: examData.big.title, description: examData.big.description },
    { type: 'yacht', title: examData.yacht.title, description: examData.yacht.description },
    { type: 'navigation', title: examData.navigation.title, description: examData.navigation.description },
  ];

  const toggleExam = (examType: ExamType) => {
    // Don't allow toggling already subscribed exams
    if (currentSubscriptions.includes(examType)) {
      return;
    }
    
    if (selectedExams.includes(examType)) {
      setSelectedExams(selectedExams.filter(e => e !== examType));
    } else {
      setSelectedExams([...selectedExams, examType]);
    }
  };

  const totalPrice = selectedExams.length * 5;

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
      // Create Stripe Checkout Session
      const { url } = await api.createCheckoutSession(selectedExams, accessToken);
      
      // Redirect to Stripe Checkout
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
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <Button onClick={onBack} variant="ghost" className="mb-8 hover:bg-blue-100 dark:hover:bg-slate-700 dark:text-gray-200 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="text-center mb-16 animate-fadeIn">
            <div className="inline-block mb-4 px-6 py-2 bg-blue-100 dark:bg-blue-900 rounded-full border border-blue-200 dark:border-blue-700">
              <span className="text-blue-700 dark:text-blue-300 text-sm font-semibold tracking-wide uppercase">Unlock Full Access</span>
            </div>
            <h2 className="gradient-ocean mb-6 tracking-tight" style={{ fontSize: 'clamp(2rem, 4vw, 2.5rem)', fontWeight: '800' }}>
              Premium Exam Access
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-lg font-light leading-relaxed">
              Select the exam categories you want to unlock. Each category is €5 per month with unlimited attempts.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-2 shadow-xl dark:bg-slate-700 dark:border-slate-600">
                <CardHeader>
                  <CardTitle className="dark:text-gray-100">Select Exam Categories</CardTitle>
                  <CardDescription className="dark:text-gray-300">Choose which exams you want full access to</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {examTypes.map((exam) => {
                    const isSubscribed = currentSubscriptions.includes(exam.type);
                    
                    return (
                      <div
                        key={exam.type}
                        className={`flex items-start space-x-3 p-4 rounded-lg border-2 transition-all ${
                          isSubscribed
                            ? 'border-green-400 bg-green-50 dark:bg-green-900/20 dark:border-green-600 cursor-not-allowed opacity-75'
                            : selectedExams.includes(exam.type)
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-400 cursor-pointer'
                            : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer'
                        }`}
                        onClick={() => toggleExam(exam.type)}
                      >
                        <Checkbox
                          checked={isSubscribed || selectedExams.includes(exam.type)}
                          disabled={isSubscribed}
                          onCheckedChange={() => toggleExam(exam.type)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <h4 className="dark:text-gray-100">{exam.title}</h4>
                            <div className="flex items-center gap-2">
                              {isSubscribed ? (
                                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/50 dark:text-green-300">
                                  ✓ Active until {getExpiryDateString()}
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="dark:bg-slate-600 dark:text-gray-200">€5/month</Badge>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{exam.description}</p>
                          {!isSubscribed && (
                            <div className="flex gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
                              <span>• 40 Questions</span>
                              <span>• Unlimited Attempts</span>
                              <span>• Study & Exam Modes</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              <Card className="border-2 shadow-xl dark:bg-slate-700 dark:border-slate-600">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <CreditCard className="w-5 h-5" />
                    Secure Checkout
                  </CardTitle>
                  <CardDescription className="dark:text-gray-300">
                    Payment powered by Stripe. Your card details are secure.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 space-y-2">
                    <p className="text-sm text-blue-900 dark:text-blue-200">
                      You will be redirected to Stripe's secure checkout page to complete your payment.
                    </p>
                    <ul className="text-xs text-blue-800 dark:text-blue-300 space-y-1 ml-4">
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
              <Card className="border-2 border-blue-200 dark:border-blue-600 shadow-xl sticky top-6 bg-gradient-to-br from-blue-50 to-white dark:from-slate-700 dark:to-slate-600">
                <CardHeader>
                  <CardTitle className="dark:text-gray-100">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedExams.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                      No exams selected
                    </p>
                  ) : (
                    <>
                      <div className="space-y-3">
                        {selectedExams.map((examType) => {
                          const exam = examTypes.find(e => e.type === examType);
                          return (
                            <div key={examType} className="flex items-center justify-between text-sm dark:text-gray-200">
                              <span>{exam?.title}</span>
                              <span className="font-medium">€5/mo</span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="border-t dark:border-slate-500 pt-4">
                        <div className="flex items-center justify-between mb-4">
                          <span className="dark:text-gray-200">Monthly Total</span>
                          <span className="text-2xl font-semibold text-blue-600 dark:text-blue-400">€{totalPrice}</span>
                        </div>
                      </div>

                      <div className="bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4 space-y-2">
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-200">What's included:</p>
                        <ul className="text-xs text-blue-800 dark:text-blue-300 space-y-1">
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