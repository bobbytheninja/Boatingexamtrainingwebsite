import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import {
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Database,
  FileQuestion,
  Loader2
} from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner';
import { loadExamCategories } from '../utils/categoryLoader';
import { useDarkMode } from '../contexts/DarkModeContext';

interface ExamDiagnostics {
  count: number;
  indexExists: boolean;
  sampleQuestionId: string | null;
  sampleQuestion: {
    id: string;
    questionText: string;
    examType: string;
  } | null;
}

interface DiagnosticsData {
  diagnostics: {
    [examType: string]: ExamDiagnostics;
  };
  timestamp: string;
}

export function DatabaseDiagnostics() {
  const { darkMode } = useDarkMode();
  const [loading, setLoading] = React.useState(false);
  const [diagnosticsData, setDiagnosticsData] = React.useState<DiagnosticsData | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [examTypes, setExamTypes] = React.useState<{ value: string; label: string }[]>([]);

  const textPrimary = darkMode ? '#f3f4f6' : '#111827';
  const textSecondary = darkMode ? '#9ca3af' : '#4b5563';
  const textMuted = darkMode ? '#6b7280' : '#6b7280';

  React.useEffect(() => {
    const loadCategories = async () => {
      const categories = await loadExamCategories();
      setExamTypes(categories);
    };
    loadCategories();
  }, []);

  const runDiagnostics = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d36f8f91/diagnostics/questions`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      setDiagnosticsData(data);
      toast.success('Diagnostics completed successfully!');
    } catch (err: any) {
      console.error('Diagnostics error:', err);
      setError(err.message || 'Failed to run diagnostics');
      toast.error('Failed to run diagnostics');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    runDiagnostics();
  }, []);

  const getTotalQuestions = () => {
    if (!diagnosticsData) return 0;
    return Object.values(diagnosticsData.diagnostics).reduce(
      (sum, exam) => sum + exam.count,
      0
    );
  };

  const getExamTypeStatus = (examType: string) => {
    if (!diagnosticsData) return null;
    const data = diagnosticsData.diagnostics[examType];

    if (!data) return { status: 'unknown', color: 'gray', icon: AlertCircle };

    if (data.count === 0) {
      return {
        status: 'No questions',
        color: 'red',
        icon: XCircle,
        message: 'No questions found. Import questions for this exam type.'
      };
    }

    if (data.count < 40) {
      return {
        status: `Only ${data.count} questions`,
        color: 'amber',
        icon: AlertCircle,
        message: `Need at least 40 questions for a full exam. Currently have ${data.count}.`
      };
    }

    return {
      status: `${data.count} questions`,
      color: 'green',
      icon: CheckCircle,
      message: `Ready! ${data.count} questions available.`
    };
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-6 h-6 text-blue-500" />
                Database Diagnostics
              </CardTitle>
              <p className="text-sm mt-1" style={{ color: textSecondary }}>
                Check the status of questions in your database
              </p>
            </div>
            <Button
              onClick={runDiagnostics}
              disabled={loading}
              variant="outline"
              className="border-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert style={{
              background: darkMode ? 'rgba(127,29,29,0.2)' : '#fef2f2',
              border: `1px solid ${darkMode ? '#991b1b' : '#fecaca'}`,
            }}>
              <XCircle className="h-4 w-4" style={{ color: darkMode ? '#f87171' : '#dc2626' }} />
              <AlertDescription style={{ color: darkMode ? '#fca5a5' : '#991b1b' }}>
                {error}
              </AlertDescription>
            </Alert>
          )}

          {loading && !diagnosticsData && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <span className="ml-3" style={{ color: textSecondary }}>Running diagnostics...</span>
            </div>
          )}

          {diagnosticsData && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-2" style={{ background: darkMode ? 'linear-gradient(to bottom right, #1e3a5f, #1e293b)' : 'linear-gradient(to bottom right, #eff6ff, #ffffff)' }}>
                  <CardContent className="pt-6 text-center">
                    <p className="text-sm mb-1" style={{ color: darkMode ? '#94a3b8' : '#374151' }}>Total Questions</p>
                    <p className="text-3xl font-bold" style={{ color: darkMode ? '#60a5fa' : '#2563eb' }}>
                      {getTotalQuestions()}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-2" style={{ background: darkMode ? 'linear-gradient(to bottom right, #14532d, #1e293b)' : 'linear-gradient(to bottom right, #f0fdf4, #ffffff)' }}>
                  <CardContent className="pt-6 text-center">
                    <p className="text-sm mb-1" style={{ color: darkMode ? '#94a3b8' : '#374151' }}>Exam Types Ready</p>
                    <p className="text-3xl font-bold" style={{ color: darkMode ? '#4ade80' : '#16a34a' }}>
                      {Object.values(diagnosticsData.diagnostics).filter(d => d.count >= 40).length} / {Object.keys(diagnosticsData.diagnostics).length}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-2" style={{ background: darkMode ? 'linear-gradient(to bottom right, #2d1b4e, #1e293b)' : 'linear-gradient(to bottom right, #faf5ff, #ffffff)' }}>
                  <CardContent className="pt-6 text-center">
                    <p className="text-sm mb-1" style={{ color: darkMode ? '#94a3b8' : '#374151' }}>Last Updated</p>
                    <p className="text-sm font-semibold" style={{ color: darkMode ? '#c084fc' : '#7c3aed' }}>
                      {new Date(diagnosticsData.timestamp).toLocaleTimeString()}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Exam Type Details */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg" style={{ color: textPrimary }}>Exam Types Status</h3>

                {Object.entries(diagnosticsData.diagnostics).map(([examType, examData]) => {
                  const categoryLabel = examTypes.find(t => t.value === examType)?.label;
                  const label = categoryLabel || (
                    examType.charAt(0).toUpperCase() + examType.slice(1) + ' Exam'
                  );

                  const status = getExamTypeStatus(examType);
                  if (!status) return null;

                  const StatusIcon = status.icon;

                  const cardBorder = status.color === 'green'
                    ? (darkMode ? '#166534' : '#bbf7d0')
                    : status.color === 'amber'
                    ? (darkMode ? '#92400e' : '#fde68a')
                    : (darkMode ? '#991b1b' : '#fecaca');

                  const cardBg = status.color === 'green'
                    ? (darkMode ? 'rgba(20,83,45,0.2)' : 'rgba(240,253,244,0.5)')
                    : status.color === 'amber'
                    ? (darkMode ? 'rgba(120,53,15,0.2)' : 'rgba(255,251,235,0.5)')
                    : (darkMode ? 'rgba(127,29,29,0.2)' : 'rgba(254,242,242,0.5)');

                  const iconColor = status.color === 'green'
                    ? (darkMode ? '#4ade80' : '#16a34a')
                    : status.color === 'amber'
                    ? (darkMode ? '#fbbf24' : '#d97706')
                    : (darkMode ? '#f87171' : '#dc2626');

                  const badgeBg = status.color === 'green'
                    ? (darkMode ? 'rgba(20,83,45,0.4)' : '#dcfce7')
                    : status.color === 'amber'
                    ? (darkMode ? 'rgba(120,53,15,0.4)' : '#fef9c3')
                    : (darkMode ? 'rgba(127,29,29,0.4)' : '#fee2e2');

                  const badgeText = status.color === 'green'
                    ? (darkMode ? '#86efac' : '#15803d')
                    : status.color === 'amber'
                    ? (darkMode ? '#fcd34d' : '#92400e')
                    : (darkMode ? '#fca5a5' : '#b91c1c');

                  return (
                    <Card
                      key={examType}
                      className="border-2"
                      style={{ borderColor: cardBorder, background: cardBg }}
                    >
                      <CardContent className="pt-4 pb-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <StatusIcon className="w-5 h-5" style={{ color: iconColor }} />
                              <h4 className="font-semibold" style={{ color: textPrimary }}>{label}</h4>
                              <Badge
                                variant="outline"
                                style={{
                                  background: badgeBg,
                                  color: badgeText,
                                  borderColor: badgeText,
                                }}
                              >
                                {status.status}
                              </Badge>
                            </div>
                            <p className="text-sm ml-8" style={{ color: textSecondary }}>
                              {status.message}
                            </p>

                            {examData?.sampleQuestion && (
                              <div
                                className="ml-8 mt-2 p-2 rounded"
                                style={{
                                  background: darkMode ? '#1e293b' : '#ffffff',
                                  border: `1px solid ${darkMode ? '#334155' : '#e5e7eb'}`,
                                }}
                              >
                                <p className="text-xs mb-1" style={{ color: textSecondary }}>Sample question:</p>
                                <p className="text-xs font-mono" style={{ color: darkMode ? '#e2e8f0' : '#1f2937' }}>
                                  {examData.sampleQuestion.questionText}
                                </p>
                                <p className="text-xs mt-1" style={{ color: textMuted }}>
                                  ID: {examData.sampleQuestionId}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Help Section */}
              {getTotalQuestions() === 0 && (
                <Alert style={{
                  background: darkMode ? 'rgba(30,58,138,0.2)' : '#eff6ff',
                  border: `1px solid ${darkMode ? '#1d4ed8' : '#bfdbfe'}`,
                }}>
                  <FileQuestion className="h-4 w-4" style={{ color: darkMode ? '#60a5fa' : '#2563eb' }} />
                  <AlertDescription style={{ color: darkMode ? '#93c5fd' : '#1e40af' }}>
                    <strong className="block mb-2">No questions found in the database</strong>
                    <p className="text-sm mb-2">To import questions:</p>
                    <ol className="text-sm list-decimal list-inside space-y-1 ml-2">
                      <li>Go to the <strong>"Import Questions"</strong> tab</li>
                      <li>Select an exam type from the dropdown</li>
                      <li>Upload an Excel (.xlsx) or CSV file with your questions</li>
                      <li>Enter the admin key (default: <code style={{ background: darkMode ? 'rgba(30,58,138,0.3)' : '#dbeafe', padding: '0 4px', borderRadius: 3 }}>change-this-key</code>)</li>
                      <li>Click "Import Questions"</li>
                    </ol>
                  </AlertDescription>
                </Alert>
              )}

              {getTotalQuestions() > 0 && getTotalQuestions() < 200 && (
                <Alert style={{
                  background: darkMode ? 'rgba(120,53,15,0.2)' : '#fffbeb',
                  border: `1px solid ${darkMode ? '#92400e' : '#fde68a'}`,
                }}>
                  <AlertCircle className="h-4 w-4" style={{ color: darkMode ? '#fbbf24' : '#d97706' }} />
                  <AlertDescription style={{ color: darkMode ? '#fcd34d' : '#92400e' }}>
                    <strong className="block mb-1">Recommended: 120 questions per exam type</strong>
                    <p className="text-sm">
                      You currently have {getTotalQuestions()} total questions. For the best experience,
                      each exam type should have at least 120 questions to ensure variety in practice exams.
                    </p>
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
