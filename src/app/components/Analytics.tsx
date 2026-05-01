import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { LoadingSpinner } from './LoadingSpinner';
import { useDarkMode } from '../contexts/DarkModeContext';
import { BarChart, TrendingUp, Users, Calendar } from 'lucide-react';
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

  // Fetch overview on mount
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
          console.error('Failed to fetch analytics overview');
        }
      } catch (error) {
        console.error('Error fetching analytics overview:', error);
      } finally {
        setLoadingOverview(false);
      }
    };

    fetchOverview();
  }, [accessToken]);

  // Fetch subscribers for selected exam
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
        console.error('Failed to fetch subscribers');
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
      <Card>
        <CardContent className="pt-12 pb-12 flex flex-col items-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">Loading analytics...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="dark:bg-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Categories</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{overview.length}</p>
              </div>
              <BarChart className="w-10 h-10 text-blue-500 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Subscriptions</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalSubscriptions}</p>
              </div>
              <Users className="w-10 h-10 text-green-500 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Average per Category</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {overview.length > 0 ? (totalSubscriptions / overview.length).toFixed(1) : '0'}
                </p>
              </div>
              <TrendingUp className="w-10 h-10 text-purple-500 dark:text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Exam Categories Overview */}
      <Card className="dark:bg-slate-800">
        <CardHeader>
          <CardTitle className="dark:text-white">Exam Categories - Active Subscribers</CardTitle>
          <CardDescription className="dark:text-gray-400">
            Click on a category to view detailed subscriber information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {overview.map((exam) => (
              <Card
                key={exam.type}
                className={`cursor-pointer transition-all hover:shadow-lg dark:bg-slate-700 ${
                  selectedExam === exam.type ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => fetchSubscribers(exam.type)}
              >
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-lg dark:text-white">{exam.title}</h3>
                      {exam.expiringSoon && (
                        <Badge variant="destructive" className="text-xs">Expiring Soon</Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {exam.activeSubscribers}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Active subscribers</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">€{exam.price}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">per month</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {overview.length === 0 && (
            <div className="text-center py-12">
              <BarChart className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No exam categories found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subscriber Details */}
      {selectedExam && (
        <Card className="dark:bg-slate-800">
          <CardHeader>
            <CardTitle className="dark:text-white">
              Subscribers for: {overview.find(e => e.type === selectedExam)?.title}
            </CardTitle>
            <CardDescription className="dark:text-gray-400">
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
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Name
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Email
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Expires On
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Days Remaining
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscribers.map((sub) => (
                      <tr
                        key={sub.userId}
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-slate-700/50"
                      >
                        <td className="py-3 px-4 text-sm text-gray-900 dark:text-gray-100">
                          {sub.name}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                          {sub.email}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                          {sub.expiryDate}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <Badge
                            variant={sub.daysRemaining && sub.daysRemaining <= 7 ? 'destructive' : 'default'}
                            className={
                              sub.daysRemaining && sub.daysRemaining <= 7
                                ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300'
                                : 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
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
                <Users className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No active subscribers for this exam</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
