import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { toast } from 'sonner';
import { Language, getTranslation } from '../data/translations';
import { Mail, Check } from 'lucide-react';
import { ButtonSpinner } from './LoadingSpinner';

interface LoginPageProps {
  onLogin: (email: string) => void;
  language: Language;
}

export function LoginPage({ onLogin, language }: LoginPageProps) {
  const t = getTranslation(language);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast.success(t.welcomeBack);
      onLogin(email);
    }
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (signupEmail) {
      // Simulate email verification
      setIsVerificationSent(true);
      toast.success(language === 'English' 
        ? 'Verification email sent! Please check your inbox.' 
        : 'Имейл за потвърждение изпратен! Моля, проверете входящата си поща.');
      
      // Auto-login after 2 seconds (simulating email verification)
      setTimeout(() => {
        toast.success(t.accountCreated);
        onLogin(signupEmail);
        setIsVerificationSent(false);
      }, 2000);
    }
  };

  const handlePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    setIsResettingPassword(true);
    
    // Simulate password reset email
    setTimeout(() => {
      toast.success(language === 'English'
        ? 'Password reset link sent! Check your email.'
        : 'Линк за нулиране на паролата изпратен! Проверете имейла си.');
      setIsResettingPassword(false);
      setIsResetDialogOpen(false);
      setResetEmail('');
    }, 1500);
  };

  return (
    <div className="min-h-screen pt-24 pb-20 bg-gradient-to-br from-slate-50 via-sky-50/50 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-10 animate-fadeIn">
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
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">{t.signIn}</TabsTrigger>
                  <TabsTrigger value="signup">{t.signUp}</TabsTrigger>
                </TabsList>

                {/* Sign In Tab */}
                <TabsContent value="login">
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
                    >
                      {t.signIn}
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
                      disabled={isVerificationSent}
                    >
                      {isVerificationSent ? (
                        <span className="flex items-center gap-2">
                          <Mail className="w-4 h-4 animate-pulse" />
                          {language === 'English' ? 'Verifying...' : 'Потвърждаване...'}
                        </span>
                      ) : (
                        t.createAccount
                      )}
                    </Button>
                    
                    {/* Email Verification Notice */}
                    {isVerificationSent && (
                      <div className="flex items-start gap-2 p-3 bg-sky-50 dark:bg-sky-900/30 border border-sky-200 dark:border-sky-700 rounded-lg animate-fadeIn">
                        <Check className="w-5 h-5 text-sky-600 dark:text-sky-400 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-sky-700 dark:text-sky-300">
                          {language === 'English' 
                            ? 'Verification email sent! Logging you in...'
                            : 'Имейл за потвърждение изпратен! Влизаме ви...'}
                        </p>
                      </div>
                    )}
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Demo Notice */}
          <div className="text-center mt-8">
            <Card className="border-2 border-sky-200 dark:border-sky-800 bg-gradient-to-r from-sky-50 to-cyan-50 dark:from-sky-900/30 dark:to-cyan-900/30 shadow-md">
              <CardContent className="pt-6">
                <p className="text-sky-700 dark:text-sky-300 text-sm font-medium">
                  {t.demoMode}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
