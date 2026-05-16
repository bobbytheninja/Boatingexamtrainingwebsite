import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Search, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { ButtonSpinner } from './LoadingSpinner';
import { projectId } from '../utils/supabase/info';

export function SubscriptionDebug() {
  const [email, setEmail] = useState('bobby_rocks@me.com');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleCheck = async () => {
    setLoading(true);
    setResult(null);

    try {
      const { createClient } = await import('../utils/supabase/client');
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error('No active session');
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d36f8f91/admin/debug-subscription/${encodeURIComponent(email)}`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch subscription data');
      }

      const data = await response.json();
      setResult(data);
      toast.success('Subscription data loaded!');
    } catch (error: any) {
      console.error('Error checking subscription:', error);
      toast.error(`Failed to check subscription: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="dark:bg-slate-700 dark:border-slate-600">
      <CardHeader>
        <CardTitle className="dark:text-gray-100 flex items-center gap-2">
          <Search className="w-5 h-5" />
          Subscription Debug Tool
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">User Email</Label>
          <div className="flex gap-2">
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="dark:bg-slate-600 dark:border-slate-500"
            />
            <Button
              onClick={handleCheck}
              disabled={loading || !email}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? <ButtonSpinner /> : <Search className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {result && (
          <div className="space-y-4 mt-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Subscription Data for {result.email}
              </h3>

              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium text-blue-800 dark:text-blue-400">User ID:</span>
                  <code className="ml-2 bg-white dark:bg-slate-800 px-2 py-1 rounded text-xs">
                    {result.userId}
                  </code>
                </div>

                <div>
                  <span className="font-medium text-blue-800 dark:text-blue-400">Exam Types Count:</span>
                  <Badge className="ml-2 bg-blue-600 text-white">
                    {result.examTypesCount}
                  </Badge>
                </div>

                <div>
                  <span className="font-medium text-blue-800 dark:text-blue-400">Exam Types:</span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {result.examTypes && result.examTypes.length > 0 ? (
                      result.examTypes.map((type: string, index: number) => (
                        <Badge key={index} variant="outline" className="dark:border-blue-400 dark:text-blue-300">
                          {index + 1}. {type}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-gray-500 italic">None</span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="font-medium text-blue-800 dark:text-blue-400">Expires At:</span>
                  <span className="ml-2 text-blue-900 dark:text-blue-200">
                    {result.expiresAt
                      ? new Date(result.expiresAt).toLocaleString()
                      : 'N/A'
                    }
                  </span>
                </div>

                <div>
                  <span className="font-medium text-blue-800 dark:text-blue-400">Raw Data:</span>
                  <pre className="mt-2 bg-white dark:bg-slate-800 p-3 rounded text-xs overflow-x-auto">
                    {JSON.stringify(result.rawSubscription, null, 2)}
                  </pre>
                </div>
              </div>
            </div>

            {result.examTypes && result.examTypes.some((type: string) =>
              !['jet', 'small', 'big', 'yacht', 'navigation'].includes(type.toLowerCase())
            ) && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4">
                <h3 className="font-semibold text-amber-900 dark:text-amber-300 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Invalid Exam Types Detected
                </h3>
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  The following exam types are not valid and may display incorrectly:
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {result.examTypes
                    .filter((type: string) => !['jet', 'small', 'big', 'yacht', 'navigation'].includes(type.toLowerCase()))
                    .map((type: string, index: number) => (
                      <Badge key={index} variant="destructive">
                        {type}
                      </Badge>
                    ))
                  }
                </div>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-3">
                  Valid exam types are: jet, small, big, yacht, navigation
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
