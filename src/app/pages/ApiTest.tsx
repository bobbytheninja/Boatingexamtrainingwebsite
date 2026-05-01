import React, { useState } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export function ApiTest() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-d36f8f91`;

  const tests = [
    {
      name: 'Health Check (No Auth)',
      run: async () => {
        const response = await fetch(`${API_BASE}/health`);
        const data = await response.json();
        return { status: response.status, data };
      }
    },
    {
      name: 'Health Check (With Auth)',
      run: async () => {
        const response = await fetch(`${API_BASE}/health`, {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        });
        const data = await response.json();
        return { status: response.status, data };
      }
    },
    {
      name: 'Question Count (jet)',
      run: async () => {
        const response = await fetch(`${API_BASE}/questions/jet/count`, {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        });
        const data = await response.json();
        return { status: response.status, data };
      }
    },
    {
      name: 'Import Test Question',
      run: async () => {
        const testQuestion = [{
          id: 'test_001',
          questionNumber: 1,
          examType: 'jet',
          questionText: 'Test question?',
          answerA: 'A',
          answerB: 'B',
          answerC: 'C',
          answerD: 'D',
          correctAnswer: 'a',
          difficulty: 2,
          language: 'English'
        }];

        const response = await fetch(`${API_BASE}/questions/import`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            questions: testQuestion,
            adminKey: 'change-this-key'
          })
        });
        
        const data = await response.json();
        return { status: response.status, data };
      }
    }
  ];

  const runAllTests = async () => {
    setLoading(true);
    setResults([]);
    
    for (const test of tests) {
      try {
        console.log(`Running: ${test.name}`);
        const result = await test.run();
        setResults(prev => [...prev, {
          name: test.name,
          success: result.status < 400,
          ...result
        }]);
      } catch (error: any) {
        setResults(prev => [...prev, {
          name: test.name,
          success: false,
          error: error.message
        }]);
      }
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl mb-6 text-gray-900 dark:text-white">Backend API Test</h1>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            <strong>API Base URL:</strong> {API_BASE}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong>Project ID:</strong> {projectId}
          </p>
        </div>

        <button
          onClick={runAllTests}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 mb-6"
        >
          {loading ? 'Running Tests...' : 'Run All Tests'}
        </button>

        <div className="space-y-4">
          {results.map((result, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-2 ${
                result.success
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
                  : 'bg-red-50 dark:bg-red-900/20 border-red-500'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {result.name}
                </h3>
                <span
                  className={`px-3 py-1 rounded text-sm ${
                    result.success
                      ? 'bg-green-500 text-white'
                      : 'bg-red-500 text-white'
                  }`}
                >
                  {result.success ? '✓ PASS' : '✗ FAIL'}
                </span>
              </div>
              
              <div className="text-sm">
                {result.status && (
                  <p className="text-gray-700 dark:text-gray-300 mb-2">
                    Status: <span className="font-mono">{result.status}</span>
                  </p>
                )}
                
                {result.data && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-blue-600 dark:text-blue-400">
                      View Response
                    </summary>
                    <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs overflow-x-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </details>
                )}
                
                {result.error && (
                  <p className="text-red-600 dark:text-red-400 font-mono text-xs mt-2">
                    Error: {result.error}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
