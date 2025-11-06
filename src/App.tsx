import { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { HomePage } from './components/HomePage';
import { PricingPage } from './components/PricingPage';
import { ContactPage } from './components/ContactPage';
import { LoginPage } from './components/LoginPage';
import { AccountPage } from './components/AccountPage';
import { PaymentPage } from './components/PaymentPage';
import { ExamModeSelection, ExamMode, ExamTier } from './components/ExamModeSelection';
import { ExamPage } from './components/ExamPage';
import { Footer } from './components/Footer';
import { ExamType } from './data/examQuestions';
import { Toaster } from './components/ui/sonner';
import { Language } from './data/translations';

type Page = 'home' | 'pricing' | 'contact' | 'login' | 'account' | 'payment' | 'mode-selection' | 'exam';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [paidExams, setPaidExams] = useState<ExamType[]>([]);
  const [selectedExam, setSelectedExam] = useState<ExamType | null>(null);
  const [examMode, setExamMode] = useState<ExamMode | null>(null);
  const [examTier, setExamTier] = useState<ExamTier | null>(null);
  const [language, setLanguage] = useState<Language>('English');
  const [region, setRegion] = useState<string>('Bulgaria');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  
  // Apply dark mode class to html element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);
  
  // Register PWA service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((error) => {
        console.log('Service Worker registration failed:', error);
      });
    }
  }, []);

  const handleLogin = (email: string) => {
    setUserEmail(email);
    setCurrentPage('account');
  };

  const handleLogout = () => {
    setUserEmail(null);
    setPaidExams([]);
    setCurrentPage('home');
  };

  const handleNavigate = (page: string) => {
    if (page === 'account' && !userEmail) {
      setCurrentPage('login');
      return;
    }
    setCurrentPage(page as Page);
    
    // Reset exam state when navigating away from exam pages
    if (!['mode-selection', 'exam'].includes(page)) {
      setSelectedExam(null);
      setExamMode(null);
      setExamTier(null);
    }
  };

  const handleSelectExam = (examType: ExamType) => {
    setSelectedExam(examType);
    setCurrentPage('mode-selection');
  };

  const handleStartExam = (mode: ExamMode, tier: ExamTier) => {
    // Require login for paid exams
    if (tier === 'paid' && !userEmail) {
      setCurrentPage('login');
      return;
    }
    
    // Check if user has paid for this exam if trying to access paid version
    if (tier === 'paid' && !paidExams.includes(selectedExam!)) {
      setCurrentPage('payment');
      return;
    }
    
    setExamMode(mode);
    setExamTier(tier);
    setCurrentPage('exam');
  };

  const handleNeedPayment = () => {
    setCurrentPage('payment');
  };

  const handlePaymentComplete = (purchasedExams: ExamType[]) => {
    setPaidExams([...new Set([...paidExams, ...purchasedExams])]);
    setCurrentPage('account');
  };

  const handleBackFromPayment = () => {
    setCurrentPage('mode-selection');
  };

  const handleBackToHome = () => {
    setCurrentPage('home');
    setSelectedExam(null);
    setExamMode(null);
    setExamTier(null);
  };

  const handleStartExamFromAccount = (examType: ExamType) => {
    // Start the paid exam directly for the selected exam type
    setSelectedExam(examType);
    setExamMode('exam');
    setExamTier('paid');
    setCurrentPage('exam');
  };

  // Determine if navigation should be transparent (always transparent on home page)
  const isTransparentNav = currentPage === 'home';

  return (
    <div className="min-h-screen">
      {/* Show navigation on all pages */}
      <Navigation
        currentPage={currentPage}
        onNavigate={handleNavigate}
        isLoggedIn={!!userEmail}
        transparent={isTransparentNav}
        language={language}
        onLanguageChange={setLanguage}
        region={region}
        onRegionChange={setRegion}
        darkMode={darkMode}
        onDarkModeToggle={() => setDarkMode(!darkMode)}
      />
      
      {currentPage === 'home' && (
        <HomePage onSelectExam={handleSelectExam} language={language} />
      )}
      
      {currentPage === 'pricing' && (
        <PricingPage onNavigate={handleNavigate} isLoggedIn={!!userEmail} language={language} />
      )}
      
      {currentPage === 'contact' && (
        <ContactPage onNavigate={handleNavigate} language={language} />
      )}
      
      {currentPage === 'login' && (
        <LoginPage onLogin={handleLogin} language={language} />
      )}
      
      {currentPage === 'account' && userEmail && (
        <AccountPage
          userEmail={userEmail}
          paidExams={paidExams}
          onNavigate={handleNavigate}
          onStartExam={handleStartExamFromAccount}
          onLogout={handleLogout}
          language={language}
        />
      )}
      
      {currentPage === 'payment' && userEmail && (
        <PaymentPage
          userEmail={userEmail}
          onBack={handleBackFromPayment}
          onComplete={handlePaymentComplete}
        />
      )}
      
      {currentPage === 'mode-selection' && selectedExam && (
        <ExamModeSelection
          examType={selectedExam}
          onStart={handleStartExam}
          onBack={handleBackToHome}
          language={language}
        />
      )}
      
      {currentPage === 'exam' && selectedExam && examMode && examTier && (
        <ExamPage
          examType={selectedExam}
          mode={examMode}
          tier={examTier}
          onBackToHome={handleBackToHome}
          onNeedPayment={handleNeedPayment}
          language={language}
        />
      )}
      
      {/* Footer - hide on exam page for cleaner experience */}
      {currentPage !== 'exam' && <Footer language={language} />}
      
      <Toaster />
    </div>
  );
}
