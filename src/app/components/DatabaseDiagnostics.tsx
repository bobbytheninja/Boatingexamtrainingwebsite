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
  const [loading, setLoading] = React.useState(false);
  const [diagnosticsData, setDiagnosticsData] = React.useState<DiagnosticsData | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [examTypes, setExamTypes] = React.useState<{ value: string; label: string }[]>([]);

  // Load exam categories on mount
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

  // Run diagnostics on mount
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
              <p className="text-sm text-gray-700 dark:text-gray-400 mt-1">
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
            <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-700">
              <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <AlertDescription className="text-red-800 dark:text-red-200">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {loading && !diagnosticsData && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <span className="ml-3 text-gray-700 dark:text-gray-400">Running diagnostics...</span>
            </div>
          )}

          {diagnosticsData && (
            <>
              {/* Summary Card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/30 dark:to-slate-700 border-2">
                  <CardContent className="pt-6 text-center">
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">Total Questions</p>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {getTotalQuestions()}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-white dark:from-green-900/30 dark:to-slate-700 border-2">
                  <CardContent className="pt-6 text-center">
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">Exam Types Ready</p>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                      {Object.values(diagnosticsData.diagnostics).filter(d => d.count >= 40).length} / {Object.keys(diagnosticsData.diagnostics).length}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/30 dark:to-slate-700 border-2">
                  <CardContent className="pt-6 text-center">
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">Last Updated</p>
                    <p className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                      {new Date(diagnosticsData.timestamp).toLocaleTimeString()}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Exam Type Details — driven by the backend response, not loadExamCategories */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg dark:text-gray-100">Exam Types Status</h3>

                {Object.entries(diagnosticsData.diagnostics).map(([examType, examData]) => {
                  // Prefer a label from the loaded categories; fall back to a formatted version of the key
                  const categoryLabel = examTypes.find(t => t.value === examType)?.label;
                  const label = categoryLabel || (
                    examType.charAt(0).toUpperCase() + examType.slice(1) + ' Exam'
                  );

                  const status = getExamTypeStatus(examType);
                  if (!status) return null;

                  const StatusIcon = status.icon;

                  return (
                    <Card
                      key={examType}
                      className={`border-2 ${
                        status.color === 'green'
                          ? 'border-green-200 bg-green-50/30 dark:border-green-700 dark:bg-green-900/10'
                          : status.color === 'amber'
                          ? 'border-amber-200 bg-amber-50/30 dark:border-amber-700 dark:bg-amber-900/10'
                          : 'border-red-200 bg-red-50/30 dark:border-red-700 dark:bg-red-900/10'
                      }`}
                    >
                      <CardContent className="pt-4 pb-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <StatusIcon
                                className={`w-5 h-5 ${
                                  status.color === 'green'
                                    ? 'text-green-600 dark:text-green-400'
                                    : status.color === 'amber'
                                    ? 'text-amber-600 dark:text-amber-400'
                                    : 'text-red-600 dark:text-red-400'
                                }`}
                              />
                              <h4 className="font-semibold dark:text-gray-100">{label}</h4>
                              <Badge
                                variant="outline"
                                className={`${
                                  status.color === 'green'
                                    ? 'border-green-500 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                    : status.color === 'amber'
                                    ? 'border-amber-500 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                                    : 'border-red-500 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                }`}
                              >
                                {status.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-400 ml-8">
                              {status.message}
                            </p>

                            {examData?.sampleQuestion && (
                              <div className="ml-8 mt-2 p-2 bg-white dark:bg-slate-600 rounded border border-gray-200 dark:border-slate-500">
                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Sample question:</p>
                                <p className="text-xs font-mono text-gray-800 dark:text-gray-200">
                                  {examData.sampleQuestion.questionText}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
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
                <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-700">
                  <FileQuestion className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <AlertDescription className="text-blue-800 dark:text-blue-200">
                    <strong className="block mb-2">No questions found in the database</strong>
                    <p className="text-sm mb-2">To import questions:</p>
                    <ol className="text-sm list-decimal list-inside space-y-1 ml-2">
                      <li>Go to the <strong>"Import Questions"</strong> tab</li>
                      <li>Select an exam type from the dropdown</li>
                      <li>Upload an Excel (.xlsx) or CSV file with your questions</li>
                      <li>Enter the admin key (default: <code className="bg-blue-100 dark:bg-blue-900/40 px-1 rounded">change-this-key</code>)</li>
                      <li>Click "Import Questions"</li>
                    </ol>
                  </AlertDescription>
                </Alert>
              )}

              {getTotalQuestions() > 0 && getTotalQuestions() < 200 && (
                <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-700">
                  <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <AlertDescription className="text-amber-800 dark:text-amber-200">
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