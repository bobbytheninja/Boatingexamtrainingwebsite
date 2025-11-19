import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { toast } from 'sonner@2.0.3';
import { getTranslation } from '../data/translations';
import { Mail, Check } from 'lucide-react';
import { ButtonSpinner } from './LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import { useDarkMode } from '../contexts/DarkModeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Navigation } from './Navigation';
import { Footer } from './Footer';

interface LoginPageProps {
  onLogin: () => void;
  onNavigate: (page: string) => void;
}

export function LoginPage({ onLogin, onNavigate }: LoginPageProps) {
  const { language } = useLanguage();
  const { darkMode } = useDarkMode();
  const t = getTranslation(language);
  const { signIn, signUp, resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoggingIn(true);
    try {
      await signIn(email, password);
      toast.success(t.welcomeBack);
      onLogin();
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.message || error.toString();
      
      if (errorMessage.includes('Invalid login credentials')) {
        toast.error(language === 'English' 
          ? '⚠️ We could not find a profile matching these credentials. Please check your email and password, or create a new account using the Sign Up tab.' 
          : '⚠️ Не можахме да намерим профил с тези данни. Моля, проверете имейла и паролата си или създайте нов акаунт чрез таба Регистрация.');
      } else if (errorMessage.includes('Email not confirmed')) {
        toast.error(language === 'English' 
          ? 'Please confirm your email address before logging in.' 
          : 'Моля, потвърдете имейл адреса си преди да влезете.');
      } else {
        toast.error(language === 'English' 
          ? `Login failed: ${errorMessage}` 
          : `Грешка при влизане: ${errorMessage}`);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupEmail || !signupPassword || !signupName) return;

    setIsSigningUp(true);
    try {
      await signUp(signupEmail, signupPassword, signupName);
      toast.success(t.accountCreated);
      onLogin();
    } catch (error: any) {
      console.error('Signup error:', error);
      const errorMessage = error.message || error.toString();
      
      if (errorMessage.includes('already registered') || errorMessage.includes('User already registered')) {
        toast.error(language === 'English' 
          ? 'This email is already registered. Please use the Sign In tab or try a different email.' 
          : 'Този имейл вече е регистриран. Моля, използвайте таба за влизане или опитайте с друг имейл.');
      } else if (errorMessage.includes('Missing authorization header')) {
        toast.error(language === 'English' 
          ? 'Server configuration error. Please contact support or try again later.' 
          : 'Грешка в конфигурацията на сървъра. Моля, свържете се с поддръжката или опитайте по-късно.');
      } else {
        toast.error(language === 'English' 
          ? `Signup failed: ${errorMessage}` 
          : `Грешка при регистрация: ${errorMessage}`);
      }
    } finally {
      setIsSigningUp(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;

    setIsResettingPassword(true);
    try {
      await resetPassword(resetEmail);
      toast.success(language === 'English'
        ? 'Password reset link sent! Check your email.'
        : 'Линк за нулиране на паролата изпратен! Проверете имейла си.');
      setIsResetDialogOpen(false);
      setResetEmail('');
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast.error(language === 'English'
        ? 'Failed to send reset link. Please try again.'
        : 'Неуспешно изпращане на линка. Моля, опитайте отново.');
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleNavigate = (page: string) => {
    if (page === 'login') return;
    onNavigate(page);
  };

  return (
    <div className={darkMode ? 'dark' : ''}>
      <Navigation
        currentPage="login"
        onNavigate={handleNavigate}
        isLoggedIn={false}
        transparent={false}
      />
      
      <div className="min-h-screen pt-24 pb-20 bg-gradient-to-br from-slate-50 via-sky-50/50 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-6 animate-fadeIn">
            <h2 className="gradient-ocean mb-3 tracking-tight" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.25rem)', fontWeight: '800' }}>
              {t.welcomeAboard}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg font-light leading-relaxed">
              {t.signInToContinue}
            </p>
          </div>

          {/* Login/Signup Card */}
          <Card className="border-2 border-gray-200 dark:border-slate-600 shadow-2xl bg-white/80 dark:bg-slate-700/80 backdrop-blur-xl">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl text-center dark:text-gray-100">{t.accountAccess}</CardTitle>
              <CardDescription className="text-center dark:text-gray-300">
                {t.enterCredentials}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="signup" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">{t.signIn}</TabsTrigger>
                  <TabsTrigger value="signup" className="relative">
                    {t.signUp}
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                  </TabsTrigger>
                </TabsList>

                {/* Sign In Tab */}
                <TabsContent value="login">
                  {/* New User Notice */}
                  <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700 rounded-lg">
                    <p className="text-sm text-blue-900 dark:text-blue-200 font-medium mb-2">
                      👋 {language === 'English' ? 'First time here?' : 'Тук за първи път?'}
                    </p>
                    <p className="text-xs text-blue-800 dark:text-blue-300">
                      {language === 'English' 
                        ? 'If you don\'t have an account yet, click the "Sign Up" tab above to create one. You need to sign up before you can log in.'
                        : 'Ако все още нямате акаунт, кликнете на "Регистрация" по-горе, за да създадете акаунт. Трябва да се регистрирате, преди да можете да влезете.'}
                    </p>
                  </div>
                  
                  <form onSubmit={handleLogin} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                        {t.email}
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-11 border-2 border-gray-200 dark:border-gray-600 focus:border-sky-500 dark:focus:border-sky-400 transition-colors dark:bg-slate-800 dark:text-gray-100"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                        {t.password}
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="h-11 border-2 border-gray-200 dark:border-gray-600 focus:border-sky-500 dark:focus:border-sky-400 transition-colors dark:bg-slate-800 dark:text-gray-100"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full h-12 bg-gradient-to-r from-sky-500 via-sky-600 to-cyan-600 hover:from-sky-600 hover:via-sky-700 hover:to-cyan-700 shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] font-semibold" 
                      size="lg"
                      disabled={isLoggingIn}
                    >
                      {isLoggingIn ? (
                        <>
                          <ButtonSpinner className="mr-2" />
                          {language === 'English' ? 'Signing in...' : 'Влизане...'}
                        </>
                      ) : (
                        t.signIn
                      )}
                    </Button>
                    
                    {/* Forgot Password */}
                    <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="link" className="w-full text-sm text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300">
                          {language === 'English' ? 'Forgot password?' : 'Забравена парола?'}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>{language === 'English' ? 'Reset Password' : 'Нулиране на Парола'}</DialogTitle>
                          <DialogDescription>
                            {language === 'English' 
                              ? 'Enter your email address and we\'ll send you a link to reset your password.'
                              : 'Въведете вашия имейл адрес и ще ви изпратим линк за нулиране на паролата.'}
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handlePasswordReset} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="reset-email">{t.email}</Label>
                            <Input
                              id="reset-email"
                              type="email"
                              placeholder="your.email@example.com"
                              value={resetEmail}
                              onChange={(e) => setResetEmail(e.target.value)}
                              required
                              className="h-10"
                            />
                          </div>
                          <Button 
                            type="submit" 
                            className="w-full bg-gradient-to-r from-sky-500 to-cyan-600"
                            disabled={isResettingPassword}
                          >
                            {isResettingPassword ? (
                              <>
                                <ButtonSpinner className="mr-2" />
                                {language === 'English' ? 'Sending...' : 'Изпращане...'}
                              </>
                            ) : (
                              language === 'English' ? 'Send Reset Link' : 'Изпрати Линк'
                            )}
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </form>
                </TabsContent>

                {/* Sign Up Tab */}
                <TabsContent value="signup">
                  {/* First Time User Encouragement */}
                  <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-700 rounded-lg">
                    <p className="text-sm text-green-900 dark:text-green-200 font-medium mb-2">
                      ✨ {language === 'English' ? 'Create Your Account' : 'Създайте Акаунт'}
                    </p>
                    <p className="text-xs text-green-800 dark:text-green-300">
                      {language === 'English' 
                        ? 'New here? Start by creating an account. You\'ll be automatically logged in after signing up!'
                        : 'Нов тук? Започнете като създадете акаунт. Ще бъдете автоматично влезли след регистрация!'}
                    </p>
                  </div>
                  
                  <form onSubmit={handleSignup} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name" className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                        {t.fullName}
                      </Label>
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="John Smith"
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        required
                        className="h-11 border-2 border-gray-200 dark:border-gray-600 focus:border-sky-500 dark:focus:border-sky-400 transition-colors dark:bg-slate-800 dark:text-gray-100"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                        {t.email}
                      </Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        required
                        className="h-11 border-2 border-gray-200 dark:border-gray-600 focus:border-sky-500 dark:focus:border-sky-400 transition-colors dark:bg-slate-800 dark:text-gray-100"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                        {t.password}
                      </Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        required
                        className="h-11 border-2 border-gray-200 dark:border-gray-600 focus:border-sky-500 dark:focus:border-sky-400 transition-colors dark:bg-slate-800 dark:text-gray-100"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full h-12 bg-gradient-to-r from-sky-500 via-sky-600 to-cyan-600 hover:from-sky-600 hover:via-sky-700 hover:to-cyan-700 shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] font-semibold" 
                      size="lg"
                      disabled={isSigningUp}
                    >
                      {isSigningUp ? (
                        <>
                          <ButtonSpinner className="mr-2" />
                          {language === 'English' ? 'Creating account...' : 'Създаване на акаунт...'}
                        </>
                      ) : (
                        t.createAccount
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}