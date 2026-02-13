import React, { useEffect, useState } from 'react';
import { CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';
import { toast } from 'sonner';

interface PaymentSuccessPageProps {
  onContinue: () => void;
}

export function PaymentSuccessPage({ onContinue }: PaymentSuccessPageProps) {
  const { accessToken, refreshSubscriptions } = useAuth();
  const [verifying, setVerifying] = useState(true);
  const [purchasedExams, setPurchasedExams] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      // Get session_id from URL
      const urlParams = new URLSearchParams(window.location.search);
      const sessionId = urlParams.get('session_id');

      if (!sessionId) {
        setError('No payment session found');
        setVerifying(false);
        return;
      }

      if (!accessToken) {
        setError('Authentication error');
        setVerifying(false);
        return;
      }

      try {
        const result = await api.verifyPayment(sessionId, accessToken);
        
        if (result.success) {
          setPurchasedExams(result.examTypes);
          await refreshSubscriptions();
          toast.success('Payment successful! Your exams are now unlocked.');
        } else {
          setError('Payment verification failed');
        }
      } catch (err: any) {
        console.error('Payment verification error:', err);
        setError(err.message || 'Failed to verify payment');
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [accessToken, refreshSubscriptions]);

  if (verifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 flex flex-col items-center space-y-4">
            <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
            <h3 className="text-xl dark:text-gray-100">Verifying Payment...</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              Please wait while we confirm your payment
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center px-4">
        <Card className="max-w-md w-full border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle className="text-red-600 dark:text-red-400">Payment Error</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">{error}</p>
            <Button onClick={onContinue} className="w-full">
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center px-4">
      <Card className="max-w-2xl w-full border-2 border-green-200 dark:border-green-800 shadow-2xl">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-3xl text-green-600 dark:text-green-400">
            Payment Successful!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-6 space-y-3">
            <p className="text-lg text-green-900 dark:text-green-200">
              You now have full access to:
            </p>
            <ul className="space-y-2">
              {purchasedExams.map((exam) => (
                <li key={exam} className="flex items-center gap-2 text-green-800 dark:text-green-300">
                  <CheckCircle className="w-5 h-5" />
                  <span className="capitalize">{exam} Exam</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
            <p className="text-sm text-blue-900 dark:text-blue-200">
              <strong>What's Next?</strong>
            </p>
            <ul className="text-sm text-blue-800 dark:text-blue-300 mt-2 space-y-1 ml-4">
              <li>• Your subscription is active for 30 days</li>
              <li>• Take unlimited practice exams</li>
              <li>• Track your progress in your account</li>
              <li>• Receipt has been sent to your email</li>
            </ul>
          </div>

          <div className="pt-4">
            <Button 
              onClick={onContinue}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              size="lg"
            >
              Start Practicing
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>

          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            Remember: These exams are for <strong>training purposes only</strong> and do not provide official certification.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
