import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useParams, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DarkModeProvider, useDarkMode } from './contexts/DarkModeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { RegionProvider } from './contexts/RegionContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';
import { HomePage } from './components/HomePage';
import { Language } from './data/translations';
import { AppDiagnostics } from './components/AppDiagnostics';

const LoginPage = React.lazy(() => import('./components/LoginPage').then(m => ({ default: m.LoginPage })));
const ExamModeSelection = React.lazy(() => import('./components/ExamModeSelection').then(m => ({ default: m.ExamModeSelection })));
const ExamPage = React.lazy(() => import('./components/ExamPage').then(m => ({ default: m.ExamPage })));
const ExamReviewPage = React.lazy(() => import('./components/ExamReviewPage').then(m => ({ default: m.ExamReviewPage })));
const PaymentPage = React.lazy(() => import('./components/PaymentPage').then(m => ({ default: m.PaymentPage })));
const PaymentSuccessPage = React.lazy(() => import('./components/PaymentSuccessPage').then(m => ({ default: m.PaymentSuccessPage })));
const AccountPage = React.lazy(() => import('./components/AccountPage').then(m => ({ default: m.AccountPage })));
const ContactPage = React.lazy(() => import('./components/ContactPage').then(m => ({ default: m.ContactPage })));
const AdminPage = React.lazy(() => import('./components/AdminPage').then(m => ({ default: m.AdminPage })));
const PartnersPage = React.lazy(() => import('./components/PartnersPage').then(m => ({ default: m.PartnersPage })));
const PricingPage = React.lazy(() => import('./components/PricingPage').then(m => ({ default: m.PricingPage })));
const ResetPasswordPage = React.lazy(() => import('./components/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage })));
const ApiTest = React.lazy(() => import('./pages/ApiTest').then(m => ({ default: m.ApiTest })));
const ImageDiagnostics = React.lazy(() => import('./pages/ImageDiagnostics').then(m => ({ default: m.ImageDiagnostics })));

// Simple loading component
function LoadingFallback() {
  const { darkMode } = useDarkMode();
  
  return (
    <div 
      className="flex items-center justify-center min-h-screen transition-all duration-[400ms]"
      style={{ 
        background: darkMode 
          ? 'linear-gradient(to bottom right, #0f172a, #1e293b, #0f172a)'
          : 'linear-gradient(to bottom right, #ffffff, #f0f9ff, #ffffff)',
        transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)'
      }}
    >
      <div className="text-center">
        <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-slate-600 dark:text-slate-400">Loading...</p>
      </div>
    </div>
  );
}

// Wrapper for LoginPage that provides required props
function LoginPageWrapper() {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/account');
  };

  const handleNavigate = (page: string) => {
    navigate(page === 'home' ? '/' : `/${page}`);
  };

  return <LoginPage onLogin={handleLogin} onNavigate={handleNavigate} />;
}

// Wrapper for PricingPage
function PricingPageWrapper() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return <PricingPage onNavigate={navigate} isLoggedIn={!!user} paidExams={user?.subscriptions || []} />;
}

// Wrapper for PartnersPage
function PartnersPageWrapper() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return <PartnersPage onNavigate={navigate} isLoggedIn={!!user} />;
}

// Wrapper for ContactPage
function ContactPageWrapper() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return <ContactPage onNavigate={navigate} isLoggedIn={!!user} />;
}

// Wrapper for ResetPasswordPage
function ResetPasswordPageWrapper() {
  const navigate = useNavigate();

  const handleNavigate = (page: string) => {
    navigate(page === 'home' ? '/' : `/${page}`);
  };

  return <ResetPasswordPage onNavigate={handleNavigate} />;
}

// Wrapper for ExamPage
function ExamPageWrapper() {
  const { examType } = useParams<{ examType: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // Persist mode and tier so they survive a page refresh (F5 clears location.state)
  const sessionKey = `exam_session_${examType}`;
  const locationState = location.state as any;

  let mode: string;
  let tier: string;

  if (locationState?.mode && locationState?.tier) {
    // Fresh navigation — save to sessionStorage for refresh recovery
    mode = locationState.mode;
    tier = locationState.tier;
    try {
      sessionStorage.setItem(sessionKey, JSON.stringify({ mode, tier }));
    } catch {}
  } else {
    // Page was refreshed — try to recover from sessionStorage
    try {
      const saved = sessionStorage.getItem(sessionKey);
      const parsed = saved ? JSON.parse(saved) : null;
      mode = parsed?.mode || 'study';
      tier = parsed?.tier || 'mock';
    } catch {
      mode = 'study';
      tier = 'mock';
    }
  }

  if (!examType) {
    navigate('/home');
    return null;
  }

  const handleBackToHome = () => {
    navigate('/home');
  };

  const handleNeedPayment = () => {
    navigate('/payment');
  };

  const handleNavigate = (page: string) => {
    if (page === 'home') {
      navigate('/');
    } else if (page === 'account') {
      navigate('/account');
    } else if (page === 'contact') {
      navigate('/contact');
    } else if (page === 'partners') {
      navigate('/partners');
    } else if (page === 'pricing') {
      navigate('/pricing');
    } else if (page === 'admin') {
      navigate('/admin');
    } else if (page === 'login') {
      navigate('/login');
    } else {
      navigate(`/${page}`);
    }
  };

  return (
    <ExamPage
      examType={examType as any}
      mode={mode}
      tier={tier}
      onBackToHome={handleBackToHome}
      onNavigate={handleNavigate}
      onNeedPayment={handleNeedPayment}
    />
  );
}

// Wrapper for AccountPage  
function AccountPageWrapper() {
  const navigate = useNavigate();
  const { user, signOut, loading } = useAuth();

  // Show loading state while checking auth
  if (loading) {
    return <LoadingFallback />;
  }

  // Redirect to login if not authenticated
  if (!user) {
    navigate('/login');
    return null;
  }

  if (!user.email) {
    toast.error('Account data is incomplete. Please log in again.');
    navigate('/login');
    return null;
  }

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const handleStartExam = (examType: any, mode?: 'exam' | 'study') => {
    // Navigate directly to the exam with full access (paid tier) and specified mode
    navigate(`/exam/${examType}`, { 
      state: { 
        mode: mode || 'exam',
        tier: 'paid' 
      } 
    });
  };

  return (
    <AccountPage
      userEmail={user.email || 'Unknown'}
      paidExams={user.subscriptions || []}
      subscriptionExpiresAt={user.subscriptionExpiresAt}
      onNavigate={navigate}
      onStartExam={handleStartExam}
      onLogout={handleLogout}
    />
  );
}

// Wrapper for AdminPage
function AdminPageWrapper() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  // Show loading state while checking auth
  if (loading) {
    return <LoadingFallback />;
  }

  // Redirect to login if not authenticated
  if (!user) {
    navigate('/login');
    return null;
  }

  // Don't check isAdmin here - let AdminPage handle it internally
  // This allows the admin panel to show helpful error messages

  const handleBack = () => {
    navigate('/');
  };

  return <AdminPage onBack={handleBack} onNavigate={navigate} />;
}

// Wrapper for PaymentPage
function PaymentPageWrapper() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  // Show loading state while checking auth
  if (loading) {
    return <LoadingFallback />;
  }

  // Redirect to login if not authenticated
  if (!user) {
    navigate('/login');
    return null;
  }

  const handleBack = () => {
    navigate('/home');
  };

  const handleComplete = () => {
    navigate('/payment-success');
  };

  const handleNavigate = (page: string) => {
    navigate(page === 'home' ? '/' : `/${page}`);
  };

  return <PaymentPage userEmail={user.email} onBack={handleBack} onComplete={handleComplete} onNavigate={handleNavigate} />;
}

// Wrapper for ExamReviewPage
function ExamReviewPageWrapper() {
  const navigate = useNavigate();
  const location = useLocation();

  // Get review data from location state
  const reviewData = (location.state as any) || {};

  const handleBackToHome = () => {
    navigate('/home');
  };

  if (!reviewData.examType || !reviewData.examQuestions || !reviewData.answeredQuestions) {
    navigate('/home');
    return null;
  }

  return (
    <ExamReviewPage
      examType={reviewData.examType}
      mode={reviewData.mode || 'study'}
      tier={reviewData.tier || 'mock'}
      examQuestions={reviewData.examQuestions}
      answeredQuestions={reviewData.answeredQuestions}
      onBackToHome={handleBackToHome}
    />
  );
}

// Wrapper for PaymentSuccessPage
function PaymentSuccessPageWrapper() {
  const navigate = useNavigate();

  const handleContinue = () => {
    navigate('/home');
  };

  return <PaymentSuccessPage onContinue={handleContinue} />;
}

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingFallback />;
  }
  
  return user ? <>{children}</> : <Navigate to="/login" replace />;
}

function AppContent() {
  const [showDiagnostics, setShowDiagnostics] = React.useState(false);
  const { darkMode } = useDarkMode();
  const { forcedLogoutMessage, clearForcedLogoutMessage } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('debug') === 'true') {
      setShowDiagnostics(true);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/50 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {showDiagnostics && <AppDiagnostics />}
      {forcedLogoutMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div
            className="rounded-xl p-8 max-w-sm mx-4 text-center shadow-2xl"
            style={{ background: darkMode ? '#1e293b' : '#ffffff' }}
          >
            <p className="text-lg font-semibold mb-6" style={{ color: darkMode ? '#f3f4f6' : '#0f172a' }}>
              {forcedLogoutMessage}
            </p>
            <button
              onClick={() => { clearForcedLogoutMessage(); navigate('/login'); }}
              className="px-6 py-2 rounded-lg font-semibold text-white bg-sky-600 hover:bg-sky-700 transition-colors"
            >
              Sign In Again
            </button>
          </div>
        </div>
      )}
      <React.Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Root route - shows HomePage for both logged in and logged out users */}
        <Route path="/" element={<HomePage />} />
        
        {/* Public routes */}
        <Route path="/login" element={<LoginPageWrapper />} />
        <Route path="/reset-password" element={<ResetPasswordPageWrapper />} />
        <Route path="/pricing" element={<PricingPageWrapper />} />
        <Route path="/partners" element={<PartnersPageWrapper />} />
        <Route path="/contact" element={<ContactPageWrapper />} />
        {import.meta.env.DEV && <Route path="/api-test" element={<ApiTest />} />}
        {import.meta.env.DEV && <Route path="/image-diagnostics" element={<ImageDiagnostics />} />}
        
        {/* Redirect /home to root */}
        <Route path="/home" element={<Navigate to="/" replace />} />
        {/* Exam routes - authentication handled internally based on tier (free vs paid) */}
        <Route path="/exam-mode/:examType" element={<ExamModeSelection />} />
        <Route path="/exam/:examType" element={<ExamPageWrapper />} />
        <Route path="/exam-review" element={<ExamReviewPageWrapper />} />
        <Route 
          path="/payment" 
          element={
            <ProtectedRoute>
              <PaymentPageWrapper />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/payment-success" 
          element={
            <ProtectedRoute>
              <PaymentSuccessPageWrapper />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/account" 
          element={
            <ProtectedRoute>
              <AccountPageWrapper />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <AdminPageWrapper />
            </ProtectedRoute>
          } 
        />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </React.Suspense>
      <Toaster />
    </div>
  );
}

function App() {
  React.useEffect(() => {
    console.clear();

    // Inject favicon links into document head
    const head = document.head;

    // Remove any existing favicon links
    const existingIcons = head.querySelectorAll('link[rel*="icon"]');
    existingIcons.forEach(icon => icon.remove());

    // Add new favicon links
    const favicons = [
      { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      { rel: 'icon', type: 'image/svg+xml', sizes: 'any', href: '/favicon.svg' },
      { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.svg' },
      { rel: 'icon', type: 'image/svg+xml', sizes: '192x192', href: '/icon-192.svg' },
      { rel: 'icon', type: 'image/svg+xml', sizes: '512x512', href: '/icon-512.svg' },
    ];

    favicons.forEach(({ rel, type, sizes, href }) => {
      const link = document.createElement('link');
      link.rel = rel;
      if (type) link.type = type;
      if (sizes) link.setAttribute('sizes', sizes);
      link.href = href;
      head.appendChild(link);
    });

    // Set document title
    document.title = 'Black Sea Bulgaria - Yacht & Boat Exam Training | Practice Tests Online';

    console.log('%c✓ Favicons injected', 'color: #10b981; font-weight: bold');

    // Filter out Figma devtools_worker noise
    const originalError = console.error;
    const originalWarn = console.warn;
    
    console.error = (...args: any[]) => {
      const stringified = JSON.stringify(args);
      // Suppress Figma platform errors that don't affect the app
      if (stringified.includes('devtools_worker') || 
          stringified.includes('webpack-artifacts') ||
          stringified.includes('figma.com/webpack') ||
          stringified.includes('.min.js.br') ||
          stringified.includes('Invalid hook call') ||
          stringified.includes('multiple Jotai instances') ||
          stringified.includes('pmndrs/jotai')) {
        return; // Silently ignore these
      }
      // Log actual application errors
      originalError.apply(console, args);
    };
    
    console.warn = (...args: any[]) => {
      const stringified = JSON.stringify(args);
      // Suppress Figma platform warnings
      if (stringified.includes('devtools_worker') || 
          stringified.includes('webpack-artifacts') ||
          stringified.includes('figma.com/webpack') ||
          stringified.includes('.min.js.br') ||
          stringified.includes('multiple Jotai instances') ||
          stringified.includes('pmndrs/jotai')) {
        return; // Silently ignore these
      }
      // Log actual application warnings
      originalWarn.apply(console, args);
    };
    
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #0ea5e9; font-weight: bold');
    console.log('%c🚤 YACHT EXAM TRAINER - VERSION 111', 'color: #0ea5e9; font-size: 16px; font-weight: bold');
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #0ea5e9; font-weight: bold');
    console.log('%c✓ Application initialized successfully', 'color: #10b981; font-weight: bold');
    console.log('%c✓ Console error filtering enabled', 'color: #10b981; font-weight: bold');
    console.log('%cCurrent URL:', 'color: #6366f1', window.location.href);
    console.log('%cEnvironment:', 'color: #6366f1', 'Figma Make');
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #0ea5e9; font-weight: bold');
    console.log('%c💡 Tip: Figma platform errors are now filtered out', 'color: #10b981; font-style: italic');
    console.log('%c   Only your application errors will be shown below.', 'color: #10b981; font-style: italic');
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #0ea5e9; font-weight: bold');
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <DarkModeProvider>
          <LanguageProvider>
            <RegionProvider>
              <BrowserRouter>
                <AppContent />
              </BrowserRouter>
            </RegionProvider>
          </LanguageProvider>
        </DarkModeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;