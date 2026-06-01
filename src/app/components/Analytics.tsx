import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { LoadingSpinner } from './LoadingSpinner';
import { useDarkMode } from '../contexts/DarkModeContext';
import { BarChart, TrendingUp, Users } from 'lucide-react';
import { projectId } from '../utils/supabase/info';

interface AnalyticsProps {
  accessToken: string;
}

interface Subscriber {
  userId: string;
  email: string;
  name: string;
  expiresAt: number | null;
  expiryDate: string;
  daysRemaining: number | null;
}

interface ExamAnalytics {
  type: string;
  title: string;
  titleBg: string;
  activeSubscribers: number;
  expiringSoon: boolean;
  price: number;
}

export function Analytics({ accessToken }: AnalyticsProps) {
  const { darkMode } = useDarkMode();
  const [overview, setOverview] = useState<ExamAnalytics[]>([]);
  const [selectedExam, setSelectedExam] = useState<string | null>(null);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [loadingSubscribers, setLoadingSubscribers] = useState(false);
  const [totalSubscriptions, setTotalSubscriptions] = useState(0);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const card = darkMode ? '#1e293b' : undefined;
  const cardInner = darkMode ? '#334155' : undefined;
  const textPrimary = darkMode ? '#f9fafb' : '#111827';
  const textSecondary = darkMode ? '#9ca3af' : '#4b5563';
  const borderColor = darkMode ? '#374151' : '#e5e7eb';

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-d36f8f91/analytics/overview`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setOverview(data.overview || []);
          setTotalSubscriptions(data.totalActiveSubscriptions || 0);
        } else {
          setFetchError(`Analytics fetch failed (HTTP ${response.status}) — check browser console for details`);
          console.error('Failed to fetch analytics overview:', response.status, response.statusText);
        }
      } catch (error) {
        setFetchError(`Analytics fetch error — check browser console for details`);
        console.error('Error fetching analytics overview:', error);
      } finally {
        setLoadingOverview(false);
      }
    };

    fetchOverview();
  }, [accessToken]);

  const fetchSubscribers = async (examType: string) => {
    setLoadingSubscribers(true);
    setSelectedExam(examType);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d36f8f91/analytics/subscribers/${encodeURIComponent(examType)}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSubscribers(data.subscribers || []);
      } else {
        console.error('Failed to fetch subscribers:', response.status);
        setSubscribers([]);
      }
    } catch (error) {
      console.error('Error fetching subscribers:', error);
      setSubscribers([]);
    } finally {
      setLoadingSubscribers(false);
    }
  };

  if (loadingOverview) {
    return (
      <Card style={{ background: card }}>
        <CardContent className="pt-12 pb-12 flex flex-col items-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-sm" style={{ color: textSecondary }}>Loading analytics...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error banner */}
      {fetchError && (
        <div style={{
          color: darkMode ? '#fca5a5' : '#b91c1c',
          background: darkMode ? '#450a0a' : '#fee2e2',
          border: `1px solid ${darkMode ? '#7f1d1d' : '#fecaca'}`,
          borderRadius: 8,
          padding: '12px 16px',
        }}>
          {fetchError}
        </div>
      )}

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card style={{ background: card }}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: textSecondary }}>Total Categories</p>
                <p className="text-3xl font-bold" style={{ color: textPrimary }}>{overview.length}</p>
              </div>
              <BarChart className="w-10 h-10 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card style={{ background: card }}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: textSecondary }}>Active Subscriptions</p>
                <p className="text-3xl font-bold" style={{ color: textPrimary }}>{totalSubscriptions}</p>
              </div>
              <Users className="w-10 h-10 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card style={{ background: card }}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: textSecondary }}>Average per Category</p>
                <p className="text-3xl font-bold" style={{ color: textPrimary }}>
                  {overview.length > 0 ? (totalSubscriptions / overview.length).toFixed(1) : '0'}
                </p>
              </div>
              <TrendingUp className="w-10 h-10 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Exam Categories Overview */}
      <Card style={{ background: card }}>
        <CardHeader>
          <CardTitle style={{ color: textPrimary }}>Exam Categories - Active Subscribers</CardTitle>
          <CardDescription style={{ color: textSecondary }}>
            Click on a category to view detailed subscriber information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {overview.map((exam) => (
              <Card
                key={exam.type}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedExam === exam.type ? 'ring-2 ring-blue-500' : ''
                }`}
                style={{ background: cardInner }}
                onClick={() => fetchSubscribers(exam.type)}
              >
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-lg" style={{ color: textPrimary }}>{exam.title}</h3>
                      {exam.expiringSoon && (
                        <Badge variant="destructive" className="text-xs">Expiring Soon</Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-blue-500">
                          {exam.activeSubscribers}
                        </p>
                        <p className="text-xs" style={{ color: textSecondary }}>Active subscribers</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold" style={{ color: textPrimary }}>€{exam.price}</p>
                        <p className="text-xs" style={{ color: textSecondary }}>per month</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {!fetchError && overview.length === 0 && (
            <div className="text-center py-12">
              <BarChart className="w-16 h-16 mx-auto mb-4" style={{ color: textSecondary }} />
              <p style={{ color: textSecondary }}>No exam categories found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subscriber Details */}
      {selectedExam && (
        <Card style={{ background: card }}>
          <CardHeader>
            <CardTitle style={{ color: textPrimary }}>
              Subscribers for: {overview.find(e => e.type === selectedExam)?.title}
            </CardTitle>
            <CardDescription style={{ color: textSecondary }}>
              {subscribers.length} active subscriber{subscribers.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingSubscribers ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : subscribers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${borderColor}` }}>
                      <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: darkMode ? '#d1d5db' : '#374151' }}>
                        Name
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: darkMode ? '#d1d5db' : '#374151' }}>
                        Email
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: darkMode ? '#d1d5db' : '#374151' }}>
                        Expires On
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: darkMode ? '#d1d5db' : '#374151' }}>
                        Days Remaining
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscribers.map((sub) => (
                      <tr
                        key={sub.userId}
                        style={{ borderBottom: `1px solid ${borderColor}` }}
                      >
                        <td className="py-3 px-4 text-sm" style={{ color: textPrimary }}>
                          {sub.name}
                        </td>
                        <td className="py-3 px-4 text-sm" style={{ color: textSecondary }}>
                          {sub.email}
                        </td>
                        <td className="py-3 px-4 text-sm" style={{ color: textSecondary }}>
                          {sub.expiryDate}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <Badge
                            variant={sub.daysRemaining && sub.daysRemaining <= 7 ? 'destructive' : 'default'}
                            style={
                              sub.daysRemaining && sub.daysRemaining <= 7
                                ? { background: darkMode ? 'rgba(124,45,18,0.5)' : '#ffedd5', color: darkMode ? '#fdba74' : '#9a3412' }
                                : { background: darkMode ? 'rgba(20,83,45,0.5)' : '#dcfce7', color: darkMode ? '#86efac' : '#15803d' }
                            }
                          >
                            {sub.daysRemaining !== null ? `${sub.daysRemaining} days` : 'N/A'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="w-16 h-16 mx-auto mb-4" style={{ color: textSecondary }} />
                <p style={{ color: textSecondary }}>No active subscribers for this exam</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
