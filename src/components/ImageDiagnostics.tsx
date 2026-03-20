import React, { useState, useEffect } from 'react';
import { Search, CheckCircle, XCircle, AlertCircle, Image as ImageIcon, Loader2 } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { loadExamCategories } from '../utils/categoryLoader';

export function ImageDiagnostics() {
  const [examType, setExamType] = useState('yacht');
  const [questionNumber, setQuestionNumber] = useState('1');
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [examTypes, setExamTypes] = useState<{ value: string; label: string }[]>([]);

  // Load exam categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      const categories = await loadExamCategories();
      setExamTypes(categories);
      
      // Set default to first category if yacht doesn't exist
      if (!categories.find(c => c.value === 'yacht') && categories.length > 0) {
        setExamType(categories[0].value);
      }
    };
    loadCategories();
  }, []);

  const checkImage = async () => {
    setChecking(true);
    setResult(null);

    try {
      const qNum = parseInt(questionNumber);
      if (isNaN(qNum) || qNum < 1 || qNum > 999) {
        setResult({
          success: false,
          message: 'Invalid question number. Please enter a number between 1 and 999.',
        });
        setChecking(false);
        return;
      }

      console.log(`[ImageDiagnostics] Checking question #${qNum} for ${examType}...`);

      // Call the backend diagnostics endpoint
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d36f8f91/diagnostics/check-question`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            examType,
            questionNumber: qNum,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to check question');
      }

      const data = await response.json();
      console.log('[ImageDiagnostics] Result:', data);

      setResult(data);

    } catch (error: any) {
      console.error('[ImageDiagnostics] Error:', error);
      setResult({
        success: false,
        found: false,
        message: error.message || 'An error occurred while checking the image.',
        error: error.toString(),
      });
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl mb-6 flex items-center gap-2 text-gray-900 dark:text-gray-100">
        <ImageIcon className="w-6 h-6 text-blue-500" />
        Image Diagnostics
      </h2>

      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-2">Exam Type</label>
            <select
              value={examType}
              onChange={(e) => setExamType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              {examTypes.map(type => (
                <option key={type.value} value={type.value} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2">Question Number</label>
            <input
              type="number"
              min="1"
              max="999"
              value={questionNumber}
              onChange={(e) => setQuestionNumber(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
              placeholder="Enter question number (e.g., 1, 5, 239)"
            />
          </div>
        </div>

        <button
          onClick={checkImage}
          disabled={checking}
          className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {checking ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Checking...
            </>
          ) : (
            <>
              <Search className="w-5 h-5" />
              Check Question & Image
            </>
          )}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {!result.found ? (
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700">
              <div className="flex items-start gap-3">
                <XCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-red-900 dark:text-red-200 mb-1">
                    Question Not Found
                  </h3>
                  <p className="text-red-700 dark:text-red-300">{result.message}</p>
                  {result.suggestion && (
                    <p className="text-red-600 dark:text-red-400 mt-2 text-sm">
                      💡 {result.suggestion}
                    </p>
                  )}
                  {result.totalQuestionsInExam !== undefined && (
                    <p className="text-red-600 dark:text-red-400 mt-2 text-sm">
                      Total questions in this exam: <strong>{result.totalQuestionsInExam}</strong>
                    </p>
                  )}
                  {result.error && (
                    <pre className="mt-2 text-xs bg-red-100 dark:bg-red-900/40 p-2 rounded overflow-x-auto">
                      {result.error}
                    </pre>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Status Summary */}
              <div className={`p-4 rounded-lg border-2 ${
                result.imageStatus.status === 'image_ok' ? 'bg-green-50 dark:bg-green-900/20 border-green-500' :
                result.imageStatus.hasImageUrl ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500' :
                'bg-gray-50 dark:bg-gray-900/20 border-gray-500'
              }`}>
                <div className="flex items-start gap-3">
                  {result.imageStatus.status === 'image_ok' ? (
                    <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">
                      {result.imageStatus.message}
                    </h3>
                    <p className="text-sm opacity-90">
                      Question ID: <code className="bg-black/10 dark:bg-white/10 px-2 py-0.5 rounded">{result.questionId}</code>
                    </p>
                  </div>
                </div>
              </div>

              {/* Question Details */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-semibold mb-3">📋 Question Details</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400 text-sm">Question Text:</span>
                    <p className="mt-1 p-3 bg-gray-50 dark:bg-gray-900 rounded border dark:border-gray-700">
                      {result.question.questionText}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-700">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Answer A:</span>
                      <p className="text-sm mt-1">{result.question.answerA}</p>
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-700">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Answer B:</span>
                      <p className="text-sm mt-1">{result.question.answerB}</p>
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-700">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Answer C:</span>
                      <p className="text-sm mt-1">{result.question.answerC}</p>
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-700">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Answer D:</span>
                      <p className="text-sm mt-1">{result.question.answerD}</p>
                    </div>
                  </div>

                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-700">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Correct Answer:</span>
                    <p className="text-sm mt-1 font-semibold text-green-700 dark:text-green-400">
                      {result.question.correctAnswer.toUpperCase()}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Difficulty / Points:</span>
                      <p className="font-semibold">{result.question.difficulty}</p>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Has Image:</span>
                      <p className={`font-semibold ${result.imageStatus.hasImageUrl ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {result.imageStatus.hasImageUrl ? '✅ Yes' : '❌ No'}
                      </p>
                    </div>
                  </div>

                  {result.question.imageUrl && (
                    <div className="pt-2 border-t dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-400 text-sm block mb-1">Image URL:</span>
                      <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs block overflow-x-auto">
                        {result.question.imageUrl}
                      </code>
                    </div>
                  )}
                </div>
              </div>

              {/* Image Preview */}
              {result.question.imageUrl && (
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h3 className="font-semibold mb-3">🖼️ Image Preview</h3>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                    <img
                      src={result.question.imageUrl}
                      alt={`Question ${result.question.questionNumber}`}
                      className="max-w-full h-auto mx-auto rounded shadow-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        const parent = (e.target as HTMLImageElement).parentElement;
                        if (parent) {
                          parent.innerHTML = '<div class="text-red-600 dark:text-red-400 text-center p-4 border border-red-300 dark:border-red-700 rounded">⚠️ Image failed to load. The URL exists but the file is not accessible.</div>';
                        }
                      }}
                      onLoad={() => console.log('✅ Image loaded successfully!')}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
        <h3 className="font-semibold mb-2">💡 How to Use:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Select the exam type and enter the question number you want to check</li>
          <li>Click "Check Question & Image" to see complete question data</li>
          <li>Review the full question text, answers, correct answer, and image status</li>
          <li>If the image preview shows an error, re-upload the image for that question</li>
        </ol>
      </div>
    </div>
  );
}