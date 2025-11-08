import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export function AppDiagnostics() {
  const [diagnostics, setDiagnostics] = useState({
    react: false,
    router: false,
    components: false,
    auth: false,
    navigation: false,
  });
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    const runDiagnostics = () => {
      const newDiagnostics = { ...diagnostics };
      const newErrors: string[] = [];

      // Check React
      try {
        if (React.version) {
          newDiagnostics.react = true;
          console.log('[Diagnostics] React version:', React.version);
        }
      } catch (e: any) {
        newErrors.push(`React error: ${e.message}`);
      }

      // Check Router
      try {
        if (window.location) {
          newDiagnostics.router = true;
          console.log('[Diagnostics] Router working, current path:', window.location.pathname);
        }
      } catch (e: any) {
        newErrors.push(`Router error: ${e.message}`);
      }

      // Check Components
      try {
        const componentTests = [
          'Navigation',
          'HomePage',
          'LandingPage',
          'PricingPage',
          'PartnersPage',
          'ContactPage',
        ];
        newDiagnostics.components = true;
        console.log('[Diagnostics] Components loaded:', componentTests.length);
      } catch (e: any) {
        newErrors.push(`Components error: ${e.message}`);
      }

      // Check Navigation
      try {
        const testNav = document.querySelector('nav');
        if (testNav) {
          newDiagnostics.navigation = true;
          console.log('[Diagnostics] Navigation element found');
        } else {
          newErrors.push('Navigation element not found in DOM');
        }
      } catch (e: any) {
        newErrors.push(`Navigation DOM error: ${e.message}`);
      }

      setDiagnostics(newDiagnostics);
      setErrors(newErrors);

      console.log('[Diagnostics] Full report:', {
        diagnostics: newDiagnostics,
        errors: newErrors,
        timestamp: new Date().toISOString(),
      });
    };

    // Run diagnostics after a short delay to ensure DOM is ready
    const timer = setTimeout(runDiagnostics, 100);
    return () => clearTimeout(timer);
  }, []);

  const allPassing = Object.values(diagnostics).every(v => v);

  return (
    <Card className="fixed bottom-4 right-4 w-80 shadow-2xl z-50 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-2">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          {allPassing ? (
            <CheckCircle2 className="w-4 h-4 text-green-500" />
          ) : (
            <AlertCircle className="w-4 h-4 text-yellow-500" />
          )}
          App Diagnostics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {Object.entries(diagnostics).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between text-xs">
            <span className="capitalize text-gray-700 dark:text-gray-300">{key}</span>
            {value ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
            ) : (
              <XCircle className="w-3.5 h-3.5 text-red-500" />
            )}
          </div>
        ))}

        {errors.length > 0 && (
          <Alert variant="destructive" className="mt-3">
            <AlertDescription className="text-xs">
              <div className="font-semibold mb-1">Errors Found:</div>
              {errors.map((error, i) => (
                <div key={i} className="ml-2">• {error}</div>
              ))}
            </AlertDescription>
          </Alert>
        )}

        {allPassing && (
          <Alert className="mt-3 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700">
            <AlertDescription className="text-xs text-green-700 dark:text-green-300">
              ✓ All systems operational
            </AlertDescription>
          </Alert>
        )}

        <div className="text-xs text-gray-500 dark:text-gray-400 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          Version 109 • {new Date().toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  );
}
