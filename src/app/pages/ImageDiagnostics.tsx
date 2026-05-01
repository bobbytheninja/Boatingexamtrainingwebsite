import React, { useState, useEffect } from 'react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import * as api from '../utils/api';

export function ImageDiagnostics() {
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sampleQuestions, setSampleQuestions] = useState<any>({});

  useEffect(() => {
    loadDiagnostics();
  }, []);

  const loadDiagnostics = async () => {
    try {
      setLoading(true);
      const result = await api.getDiagnostics();
      setDiagnostics(result.diagnostics);

      // Load first 3 questions from each exam type to check for images
      const examTypes = ['jet', 'small', 'big', 'yacht', 'navigation'];
      const samples: any = {};

      for (const examType of examTypes) {
        try {
          const response = await fetch(
            `${api.API_BASE_URL}/questions/${examType}/mock`,
            { headers: { 'Content-Type': 'application/json' } }
          );
          
          if (response.ok) {
            const data = await response.json();
            samples[examType] = data.questions.slice(0, 3);
          }
        } catch (error) {
          console.error(`Error loading ${examType} samples:`, error);
        }
      }

      setSampleQuestions(samples);
    } catch (error) {
      console.error('Error loading diagnostics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading diagnostics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
        <h1 className="text-3xl mb-2">🖼️ Image Diagnostics</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Check if images are properly stored in the database and displaying correctly.
        </p>

        {diagnostics && (
          <div className="space-y-6">
            {Object.entries(diagnostics).map(([examType, data]: [string, any]) => (
              <div key={examType} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h2 className="text-2xl mb-4 capitalize">{examType} Exam</h2>
                
                {/* Database Info */}
                <div className="bg-gray-50 dark:bg-gray-900 rounded p-4 mb-4">
                  <h3 className="font-semibold mb-2">Database Info:</h3>
                  <p><strong>Total Questions:</strong> {data.count}</p>
                  <p><strong>Sample Question:</strong> {data.sampleQuestion?.id || 'N/A'}</p>
                  <p><strong>Has Image URL:</strong> {data.sampleQuestion?.hasImage ? '✅ Yes' : '❌ No'}</p>
                  {data.sampleQuestion?.imageUrl && data.sampleQuestion.imageUrl !== 'No image' && (
                    <p className="break-all"><strong>Image URL:</strong> {data.sampleQuestion.imageUrl}</p>
                  )}
                </div>

                {/* Sample Questions with Images */}
                {sampleQuestions[examType] && sampleQuestions[examType].length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">First 3 Questions (checking for images):</h3>
                    <div className="space-y-4">
                      {sampleQuestions[examType].map((q: any, index: number) => (
                        <div key={q.id} className="border border-gray-200 dark:border-gray-700 rounded p-3">
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            <strong>Question {q.questionNumber || index + 1}:</strong> {q.id}
                          </p>
                          <p className="mb-2">{q.questionText?.substring(0, 100)}...</p>
                          
                          {q.imageUrl ? (
                            <div>
                              <p className="text-sm text-green-600 dark:text-green-400 mb-2">
                                ✅ Image URL found: {q.imageUrl}
                              </p>
                              <div className="bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden">
                                <ImageWithFallback
                                  src={q.imageUrl}
                                  alt={`Question ${q.questionNumber}`}
                                  className="w-full h-48 object-cover"
                                />
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-500">
                              ❌ No image URL
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="font-semibold mb-2">📝 How to Fix Missing Images:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Check your Excel file - Column 3 should contain image URLs</li>
            <li>Image URLs must be complete URLs (e.g., https://example.com/image.jpg)</li>
            <li>If column 3 is empty, no image will be saved</li>
            <li>Re-import your Excel file if you need to add images</li>
          </ol>
        </div>

        <button
          onClick={loadDiagnostics}
          className="mt-4 px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600"
        >
          🔄 Refresh Diagnostics
        </button>
      </div>
    </div>
  );
}
