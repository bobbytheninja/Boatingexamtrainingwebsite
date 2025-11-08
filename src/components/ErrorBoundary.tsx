import React, { Component, ReactNode } from 'react';
import { Alert, AlertDescription } from './ui/alert';
import { AlertCircle } from 'lucide-react';
import { Button } from './ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    console.log('[YachtExam ErrorBoundary] getDerivedStateFromError called');
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('[YachtExam ErrorBoundary] Error caught:', {
      message: error.message,
      name: error.name,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-sky-50/50 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4">
          <div className="max-w-2xl w-full">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="mt-2">
                <p className="mb-2">Something went wrong loading the application.</p>
                {this.state.error && (
                  <>
                    <p className="text-sm mt-3 mb-2">
                      <strong>Error Type:</strong> {this.state.error.name}
                    </p>
                    <p className="text-sm mb-2">
                      <strong>Message:</strong> {this.state.error.message}
                    </p>
                    {this.state.error.stack && (
                      <details className="mt-3">
                        <summary className="cursor-pointer text-sm mb-2">
                          View Stack Trace
                        </summary>
                        <pre className="text-xs p-3 bg-slate-900/10 dark:bg-slate-100/10 rounded overflow-auto max-h-60">
                          {this.state.error.stack}
                        </pre>
                      </details>
                    )}
                  </>
                )}
              </AlertDescription>
            </Alert>
            <Button
              onClick={() => window.location.reload()}
              className="w-full mt-4"
            >
              Refresh Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
