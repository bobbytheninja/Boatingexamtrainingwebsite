import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { KeyRound, ArrowLeft, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useDarkMode } from '../contexts/DarkModeContext';
import { toast } from 'sonner';
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface ResetPasswordPageProps {
  onNavigate: (page: string) => void;
}

export function ResetPasswordPage({ onNavigate }: ResetPasswordPageProps) {
  const { language } = useLanguage();
  const { darkMode } = useDarkMode();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [hasValidSession, setHasValidSession] = useState(false);

  const supabase = createClient(
    `https://${projectId}.supabase.co`,
    publicAnonKey
  );

  // Security: Verify the recovery token from the URL on mount
  useEffect(() => {
    const verifyRecoveryToken = async () => {
      try {
        console.log('[ResetPassword] Verifying recovery session...');
        
        // Check if there's a hash in the URL (Supabase sends token in URL hash)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const type = hashParams.get('type');

        console.log('[ResetPassword] URL hash params:', { 
          hasAccessToken: !!accessToken, 
          type 
        });

        // Verify this is a recovery/password reset session
        if (type !== 'recovery') {
          console.error('[ResetPassword] Invalid recovery type:', type);
          setError(language === 'English' 
            ? 'Invalid password reset link. Please request a new one.' 
            : 'Невалиден линк за нулиране на парола. Моля, поискайте нов.');
          setIsVerifying(false);
          return;
        }

        // Get the current session to verify the token is valid
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
          console.error('[ResetPassword] Session error:', sessionError);
          setError(language === 'English' 
            ? 'Your password reset link has expired or is invalid. Please request a new one.' 
            : 'Вашият линк за нулиране на паролата е изтекъл или е невалиден. Моля, поискайте нов.');
          setIsVerifying(false);
          return;
        }

        console.log('[ResetPassword] Valid recovery session found for user:', session.user.email);
        setHasValidSession(true);
        setIsVerifying(false);

      } catch (error: any) {
        console.error('[ResetPassword] Token verification error:', error);
        setError(language === 'English' 
          ? 'Failed to verify reset link. Please try again.' 
          : 'Неуспешна проверка на линка. Моля, опитайте отново.');
        setIsVerifying(false);
      }
    };

    verifyRecoveryToken();
  }, [language]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Security: Double-check we have a valid session before allowing password update
    if (!hasValidSession) {
      setError(language === 'English' 
        ? 'Invalid session. Please use the password reset link from your email.' 
        : 'Невалидна сесия. Моля, използвайте линка за нулиране на паролата от имейла си.');
      return;
    }

    // Validation
    if (!newPassword || !confirmPassword) {
      setError(language === 'English' ? 'Please fill in all fields' : 'Моля, попълнете всички полета');
      return;
    }

    if (newPassword.length < 6) {
      setError(language === 'English' ? 'Password must be at least 6 characters' : 'Паролата трябва да бъде поне 6 символа');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(language === 'English' ? 'Passwords do not match' : 'Паролите не съвпадат');
      return;
    }

    setIsLoading(true);

    try {
      console.log('[ResetPassword] Updating password...');
      
      // Security: This only works if user has a valid recovery session
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        console.error('[ResetPassword] Update error:', updateError);
        throw updateError;
      }

      console.log('[ResetPassword] Password updated successfully');
      setIsSuccess(true);
      toast.success(language === 'English' 
        ? 'Password updated successfully!' 
        : 'Паролата е актуализирана успешно!');

      // Sign out to ensure clean state
      await supabase.auth.signOut();

      // Redirect to login after 3 seconds
      setTimeout(() => {
        onNavigate('login');
      }, 3000);

    } catch (error: any) {
      console.error('[ResetPassword] Password update error:', error);
      
      // Provide user-friendly error messages
      let errorMessage = error.message;
      
      if (error.message?.includes('session')) {
        errorMessage = language === 'English' 
          ? 'Your session has expired. Please request a new password reset link.' 
          : 'Вашата сесия е изтекла. Моля, поискайте нов линк за нулиране на паролата.';
      } else if (error.message?.includes('weak')) {
        errorMessage = language === 'English' 
          ? 'Password is too weak. Please use a stronger password.' 
          : 'Паролата е твърде слаба. Моля, използвайте по-силна парола.';
      } else if (!errorMessage) {
        errorMessage = language === 'English' 
          ? 'Failed to update password. Please try again.' 
          : 'Неуспешно актуализиране на паролата. Моля, опитайте отново.';
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while verifying the recovery token
  if (isVerifying) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center px-4 transition-all duration-[400ms]"
        style={{ 
          background: darkMode 
            ? 'linear-gradient(to bottom right, #0f172a, #1e293b, #0f172a)'
            : 'linear-gradient(to bottom right, #ffffff, #f0f9ff, #ffffff)',
          transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)'
        }}
      >
        <Card 
          className="w-full max-w-md shadow-2xl border-2 transition-all duration-[400ms]"
          style={{ 
            backgroundColor: darkMode ? '#334155' : '#ffffff',
            borderColor: darkMode ? '#475569' : '#e2e8f0',
            transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)'
          }}
        >
          <CardContent className="pt-12 pb-12 text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 dark:text-blue-400 mx-auto mb-4" />
            <p 
              className="transition-colors duration-[400ms]"
              style={{ 
                color: darkMode ? '#d1d5db' : '#475569',
                transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)'
              }}
            >
              {language === 'English' ? 'Verifying reset link...' : 'Проверка на линка...'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error if token is invalid
  if (!hasValidSession && error) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center px-4 transition-all duration-[400ms]"
        style={{ 
          background: darkMode 
            ? 'linear-gradient(to bottom right, #0f172a, #1e293b, #0f172a)'
            : 'linear-gradient(to bottom right, #ffffff, #f0f9ff, #ffffff)',
          transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)'
        }}
      >
        <Card 
          className="w-full max-w-md shadow-2xl border-2 transition-all duration-[400ms]"
          style={{ 
            backgroundColor: darkMode ? '#334155' : '#ffffff',
            borderColor: darkMode ? '#475569' : '#e2e8f0',
            transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)'
          }}
        >
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-2xl text-red-600 dark:text-red-400">
              {language === 'English' ? 'Invalid Reset Link' : 'Невалиден Линк'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-red-500 bg-red-50 dark:bg-red-900/30">
              <AlertCircle className="text-red-600 dark:text-red-400" />
              <AlertDescription className="text-red-800 dark:text-red-200">
                {error}
              </AlertDescription>
            </Alert>
            <Button 
              onClick={() => onNavigate('login')} 
              className="w-full"
              variant="outline"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {language === 'English' ? 'Back to Login' : 'Обратно към Вход'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show success screen
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/50 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center px-4">
        <Card className="w-full max-w-md shadow-2xl border-2">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl text-green-600 dark:text-green-400">
              {language === 'English' ? 'Password Updated!' : 'Паролата е актуализирана!'}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {language === 'English' 
                ? 'Your password has been successfully updated. You can now log in with your new password.' 
                : 'Вашата парола е успешно актуализирана. Сега можете да влезете с новата си парола.'}
            </p>
            <Button 
              onClick={() => onNavigate('login')} 
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700"
            >
              {language === 'English' ? 'Go to Login' : 'Отиди към Вход'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show password reset form
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/50 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center px-4">
      <Card className="w-full max-w-md shadow-2xl border-2">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <KeyRound className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle className="text-2xl">
              {language === 'English' ? 'Reset Password' : 'Нулиране на Парола'}
            </CardTitle>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {language === 'English' 
              ? 'Enter your new password below' 
              : 'Въведете новата си парола по-долу'}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert className="border-red-500 bg-red-50 dark:bg-red-900/30">
                <AlertCircle className="text-red-600 dark:text-red-400" />
                <AlertDescription className="text-red-800 dark:text-red-200">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="newPassword">
                {language === 'English' ? 'New Password' : 'Нова Парола'}
              </Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={language === 'English' ? 'Enter new password' : 'Въведете нова парола'}
                className="dark:bg-slate-700 dark:border-slate-600"
                disabled={isLoading}
                autoComplete="new-password"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {language === 'English' ? 'Minimum 6 characters' : 'Минимум 6 символа'}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                {language === 'English' ? 'Confirm Password' : 'Потвърди Парола'}
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={language === 'English' ? 'Confirm new password' : 'Потвърдете нова парола'}
                className="dark:bg-slate-700 dark:border-slate-600"
                disabled={isLoading}
                autoComplete="new-password"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {language === 'English' ? 'Updating...' : 'Актуализиране...'}
                </div>
              ) : (
                language === 'English' ? 'Update Password' : 'Актуализирай Парола'
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => onNavigate('login')}
              disabled={isLoading}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {language === 'English' ? 'Back to Login' : 'Обратно към Вход'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}