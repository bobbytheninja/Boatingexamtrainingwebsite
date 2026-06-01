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
import { useDarkMode } from '../contexts/DarkModeContext';

export function SubscriptionDebug() {
  const { darkMode } = useDarkMode();
  const [email, setEmail] = useState('bobby_rocks@me.com');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const textPrimary = darkMode ? '#f3f4f6' : '#111827';

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
    <Card style={{
      background: darkMode ? '#334155' : undefined,
      borderColor: darkMode ? '#475569' : undefined,
    }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2" style={{ color: textPrimary }}>
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
              style={{
                background: darkMode ? '#1e293b' : undefined,
                borderColor: darkMode ? '#475569' : undefined,
                color: darkMode ? '#f3f4f6' : undefined,
              }}
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
            <div
              className="rounded-lg p-4"
              style={{
                background: darkMode ? 'rgba(30,58,138,0.2)' : '#eff6ff',
                border: `1px solid ${darkMode ? '#1d4ed8' : '#bfdbfe'}`,
              }}
            >
              <h3
                className="font-semibold mb-2 flex items-center gap-2"
                style={{ color: darkMode ? '#93c5fd' : '#1e40af' }}
              >
                <CheckCircle className="w-4 h-4" />
                Subscription Data for {result.email}
              </h3>

              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium" style={{ color: darkMode ? '#60a5fa' : '#1d4ed8' }}>User ID:</span>
                  <code
                    className="ml-2 px-2 py-1 rounded text-xs"
                    style={{ background: darkMode ? '#1e293b' : '#ffffff' }}
                  >
                    {result.userId}
                  </code>
                </div>

                <div>
                  <span className="font-medium" style={{ color: darkMode ? '#60a5fa' : '#1d4ed8' }}>Exam Types Count:</span>
                  <Badge className="ml-2 bg-blue-600 text-white">
                    {result.examTypesCount}
                  </Badge>
                </div>

                <div>
                  <span className="font-medium" style={{ color: darkMode ? '#60a5fa' : '#1d4ed8' }}>Exam Types:</span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {result.examTypes && result.examTypes.length > 0 ? (
                      result.examTypes.map((type: string, index: number) => (
                        <Badge
                          key={index}
                          variant="outline"
                          style={{
                            borderColor: darkMode ? '#60a5fa' : undefined,
                            color: darkMode ? '#93c5fd' : undefined,
                          }}
                        >
                          {index + 1}. {type}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-gray-500 italic">None</span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="font-medium" style={{ color: darkMode ? '#60a5fa' : '#1d4ed8' }}>Expires At:</span>
                  <span className="ml-2" style={{ color: darkMode ? '#bfdbfe' : '#1e3a8a' }}>
                    {result.expiresAt
                      ? new Date(result.expiresAt).toLocaleString()
                      : 'N/A'
                    }
                  </span>
                </div>

                <div>
                  <span className="font-medium" style={{ color: darkMode ? '#60a5fa' : '#1d4ed8' }}>Raw Data:</span>
                  <pre
                    className="mt-2 p-3 rounded text-xs overflow-x-auto"
                    style={{ background: darkMode ? '#1e293b' : '#ffffff' }}
                  >
                    {JSON.stringify(result.rawSubscription, null, 2)}
                  </pre>
                </div>
              </div>
            </div>

            {result.examTypes && result.examTypes.some((type: string) =>
              !['jet', 'small', 'big', 'yacht', 'navigation'].includes(type.toLowerCase())
            ) && (
              <div
                className="rounded-lg p-4"
                style={{
                  background: darkMode ? 'rgba(120,53,15,0.2)' : '#fffbeb',
                  border: `1px solid ${darkMode ? '#92400e' : '#fde68a'}`,
                }}
              >
                <h3
                  className="font-semibold mb-2 flex items-center gap-2"
                  style={{ color: darkMode ? '#fcd34d' : '#92400e' }}
                >
                  <AlertCircle className="w-4 h-4" />
                  Invalid Exam Types Detected
                </h3>
                <p className="text-sm" style={{ color: darkMode ? '#fde68a' : '#78350f' }}>
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
                <p className="text-xs mt-3" style={{ color: darkMode ? '#fcd34d' : '#92400e' }}>
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
