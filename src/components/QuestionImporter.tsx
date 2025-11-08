import React, { useState } from 'react';
import { Upload, CheckCircle, AlertCircle, Loader2, Image as ImageIcon } from 'lucide-react';
import { api } from '../utils/api';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { createClient } from '../utils/supabase/client';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';

interface QuestionRow {
  questionNumber?: number;
  examType: string;
  questionText: string;
  answerA: string;
  answerB: string;
  answerC: string;
  answerD: string;
  correctAnswer: string;
  difficulty: number;
  imageUrl?: string;
  language?: string;
}

const EXAM_TYPES = [
  { value: 'jet', label: 'Jet Ski' },
  { value: 'small', label: 'Small Boat' },
  { value: 'big', label: 'Big Boat' },
  { value: 'yacht', label: 'Yacht (up to 50 tons)' },
  { value: 'navigation', label: 'Navigation Device' },
];

export function QuestionImporter() {
  const [adminKey, setAdminKey] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [selectedExamType, setSelectedExamType] = useState<string>('jet');
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [preview, setPreview] = useState<QuestionRow[]>([]);
  const supabase = createClient();

  // Helper function to parse a CSV line correctly (handles commas in quotes)
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];
      
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
      
      // Check if it's Excel or CSV
      const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
      if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        await parseExcel(selectedFile);
      } else {
        parseCSV(selectedFile);
      }
    }
  };

  const parseCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split(/\r?\n/).filter(line => line.trim());
      
      if (lines.length === 0) {
        setResult({ success: false, message: 'CSV file is empty' });
        return;
      }
      
      // Skip header row if exists
      const dataLines = lines[0].toLowerCase().includes('question') || lines[0].toLowerCase().includes('number') ? lines.slice(1) : lines;
      
      const parsed: QuestionRow[] = dataLines.map((line) => {
        const columns = parseCSVLine(line);

        return {
          questionNumber: parseInt(columns[0]) || undefined, // Column 1: question number
          examType: selectedExamType,
          questionText: columns[1] || '', // Column 2: question
          imageUrl: columns[2] || undefined, // Column 3: image
          answerA: columns[3] || '', // Column 4: answer A
          answerB: columns[4] || '', // Column 5: answer B
          answerC: columns[5] || '', // Column 6: answer C
          answerD: columns[6] || '', // Column 7: answer D
          correctAnswer: (columns[7] || 'a').toLowerCase(), // Column 8: correct answer
          difficulty: 2, // Default difficulty
          language: 'English', // Default language
        };
      }).filter(q => q.questionText); // Filter out empty rows

      setPreview(parsed.slice(0, 5)); // Show first 5 for preview
    };
    reader.readAsText(file);
  };

  const parseExcel = async (file: File) => {
    try {
      // Dynamically import xlsx library
      const XLSX = await import('xlsx');
      
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      
      // Get first sheet
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
      
      // Skip header row if exists (check both "question" and "number")
      const dataRows = jsonData[0] && typeof jsonData[0][0] === 'string' && 
                      (jsonData[0][0].toLowerCase().includes('question') || 
                       jsonData[0][0].toLowerCase().includes('number') ||
                       jsonData[0][1]?.toString().toLowerCase().includes('question'))
                      ? jsonData.slice(1) 
                      : jsonData;
      
      const parsed: QuestionRow[] = dataRows
        .filter(row => row && row.length > 1 && row[1]) // Must have at least question text
        .map((row, index) => ({
          questionNumber: parseInt(row[0]?.toString()) || undefined, // Column 1: question number
          examType: selectedExamType,
          questionText: row[1]?.toString() || '', // Column 2: question
          answerA: row[3]?.toString() || '', // Column 4: answer A
          answerB: row[4]?.toString() || '', // Column 5: answer B
          answerC: row[5]?.toString() || '', // Column 6: answer C
          answerD: row[6]?.toString() || '', // Column 7: answer D
          correctAnswer: (row[7]?.toString() || 'a').toLowerCase(), // Column 8: correct answer
          difficulty: 2, // Default difficulty
          imageUrl: row[2]?.toString() || undefined, // Column 3: image
          language: 'English', // Default language
        }));

      setPreview(parsed.slice(0, 5));
    } catch (error) {
      console.error('Error parsing Excel:', error);
      setResult({ success: false, message: 'Failed to parse Excel file. Make sure you have xlsx library available.' });
    }
  };

  const handleImport = async () => {
    if (!file || !adminKey) {
      setResult({ success: false, message: 'Please provide admin key and select a file' });
      return;
    }

    setImporting(true);
    setResult(null);

    try {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      let questions: any[] = [];

      if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        // Parse Excel file
        const XLSX = await import('xlsx');
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        
        const dataRows = jsonData[0] && typeof jsonData[0][0] === 'string' && 
                        jsonData[0][0].toLowerCase().includes('question') 
                        ? jsonData.slice(1) 
                        : jsonData;
        
        questions = dataRows
          .filter(row => row && row.length > 1 && row[1])
          .map((row, index) => ({
            id: `${selectedExamType}_${Date.now()}_${index}`,
            questionNumber: parseInt(row[0]?.toString()) || undefined, // Column 1: question number
            examType: selectedExamType,
            questionText: row[1]?.toString() || '', // Column 2: question
            answerA: row[3]?.toString() || '', // Column 4: answer A
            answerB: row[4]?.toString() || '', // Column 5: answer B
            answerC: row[5]?.toString() || '', // Column 6: answer C
            answerD: row[6]?.toString() || '', // Column 7: answer D
            correctAnswer: (row[7]?.toString() || 'a').toLowerCase(), // Column 8: correct answer
            difficulty: 2 as 1 | 2 | 3, // Default difficulty
            imageUrl: row[2]?.toString() || undefined, // Column 3: image
            language: 'English',
          }));
      } else {
        // Parse CSV file
        const text = await file.text();
        const lines = text.split(/\r?\n/).filter(line => line.trim());
        const dataLines = lines[0].toLowerCase().includes('question') ? lines.slice(1) : lines;
        
        questions = dataLines.map((line, index) => {
          const columns = parseCSVLine(line);

          return {
            id: `${selectedExamType}_${Date.now()}_${index}`,
            questionNumber: parseInt(columns[0]) || undefined, // Column 1: question number
            examType: selectedExamType,
            questionText: columns[1] || '', // Column 2: question
            imageUrl: columns[2] || undefined, // Column 3: image
            answerA: columns[3] || '', // Column 4: answer A
            answerB: columns[4] || '', // Column 5: answer B
            answerC: columns[5] || '', // Column 6: answer C
            answerD: columns[6] || '', // Column 7: answer D
            correctAnswer: (columns[7] || 'a').toLowerCase(), // Column 8: correct answer
            difficulty: 2 as 1 | 2 | 3, // Default difficulty
            language: 'English',
          };
        }).filter(q => q.questionText); // Filter out empty rows
      }

      const response = await api.importQuestions(questions, adminKey);
      setResult({ success: true, message: `Successfully imported ${response.count} questions for ${selectedExamType} exam!` });
    } catch (error: any) {
      console.error('Import error:', error);
      setResult({ success: false, message: error.message || 'Failed to import questions' });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl mb-6">Question Importer</h2>

      <div className="space-y-6">
        {/* Admin Key Input */}
        <div>
          <label className="block mb-2 flex items-center justify-between">
            <span>Admin Key</span>
            {adminKey && (
              <span className={`text-xs px-2 py-1 rounded ${
                adminKey === 'change-this-key' 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' 
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
              }`}>
                {adminKey === 'change-this-key' ? '✓ Default key' : 'Custom key'}
              </span>
            )}
          </label>
          <input
            type="password"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-700"
            placeholder="Enter admin key (default: change-this-key)"
          />
          <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
            <p className="text-xs text-blue-900 dark:text-blue-200">
              <strong>💡 Forgot your key?</strong> The default admin key is: <code className="bg-blue-100 dark:bg-blue-900/40 px-2 py-1 rounded font-mono">change-this-key</code>
            </p>
            <p className="text-xs text-blue-800 dark:text-blue-300 mt-1">
              Check the <strong>API Keys</strong> tab in the Admin Panel for more details or to set a custom key.
            </p>
          </div>
        </div>

        {/* Exam Type Selection */}
        <div>
          <label className="block mb-2">
            Exam Type
          </label>
          <select
            value={selectedExamType}
            onChange={(e) => setSelectedExamType(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-700"
          >
            {EXAM_TYPES.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          <p className="text-sm text-gray-500 mt-1">
            All questions in the file will be imported for this exam type
          </p>
        </div>

        {/* File Upload */}
        <div>
          <label className="block mb-2">
            Excel or CSV File
          </label>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer text-teal-500 hover:text-teal-600"
            >
              {file ? file.name : 'Click to upload Excel (.xlsx, .xls) or CSV file'}
            </label>
            <p className="text-sm text-gray-500 mt-2">
              Expected columns: question number, question, image (optional), answer A, answer B, answer C, answer D, correct answer (a/b/c/d)
            </p>
          </div>
        </div>

        {/* Preview */}
        {preview.length > 0 && (
          <div>
            <h3 className="mb-2">Preview (first 5 questions)</h3>
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto">
              <TooltipProvider>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left p-2">#</th>
                      <th className="text-left p-2">Question</th>
                      <th className="text-left p-2">Image</th>
                      <th className="text-left p-2">Answer A</th>
                      <th className="text-left p-2">Answer B</th>
                      <th className="text-left p-2">Answer C</th>
                      <th className="text-left p-2">Answer D</th>
                      <th className="text-left p-2">Correct</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((q, i) => (
                      <tr key={i} className="border-b border-gray-200 dark:border-gray-700">
                        <td className="p-2 font-semibold text-gray-700 dark:text-gray-300">{q.questionNumber || '-'}</td>
                        <td className="p-2 max-w-xs">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="truncate cursor-help">{q.questionText}</div>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-md">
                              <p>{q.questionText}</p>
                            </TooltipContent>
                          </Tooltip>
                        </td>
                        <td className="p-2">
                          {q.imageUrl ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <ImageIcon className="w-4 h-4 text-green-500 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs break-all">{q.imageUrl}</p>
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="p-2 max-w-[100px]">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="truncate cursor-help">{q.answerA}</div>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-md">
                              <p>{q.answerA}</p>
                            </TooltipContent>
                          </Tooltip>
                        </td>
                        <td className="p-2 max-w-[100px]">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="truncate cursor-help">{q.answerB}</div>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-md">
                              <p>{q.answerB}</p>
                            </TooltipContent>
                          </Tooltip>
                        </td>
                        <td className="p-2 max-w-[100px]">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="truncate cursor-help">{q.answerC}</div>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-md">
                              <p>{q.answerC}</p>
                            </TooltipContent>
                          </Tooltip>
                        </td>
                        <td className="p-2 max-w-[100px]">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="truncate cursor-help">{q.answerD}</div>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-md">
                              <p>{q.answerD}</p>
                            </TooltipContent>
                          </Tooltip>
                        </td>
                        <td className="p-2 uppercase font-semibold text-teal-600 dark:text-teal-400">{q.correctAnswer}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TooltipProvider>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              ✓ Found {preview.length} questions. Hover over truncated text to see full content. All will be imported to <strong>{EXAM_TYPES.find(t => t.value === selectedExamType)?.label}</strong> exam.
            </p>
          </div>
        )}

        {/* Import Button */}
        <button
          onClick={handleImport}
          disabled={!file || !adminKey || importing}
          className="w-full py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {importing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Importing...
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              Import Questions
            </>
          )}
        </button>

        {/* Result Message */}
        {result && (
          <div
            className={`p-4 rounded-lg flex items-center gap-3 ${
              result.success
                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
            }`}
          >
            {result.success ? (
              <CheckCircle className="w-6 h-6" />
            ) : (
              <AlertCircle className="w-6 h-6" />
            )}
            <span>{result.message}</span>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h3 className="mb-2">File Format Instructions:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li><strong>Column 1:</strong> Question Number (e.g., 1, 2, 3...)</li>
          <li><strong>Column 2:</strong> Question Text</li>
          <li><strong>Column 3:</strong> Image URL (optional, can be empty)</li>
          <li><strong>Column 4:</strong> Possible Answer A</li>
          <li><strong>Column 5:</strong> Possible Answer B</li>
          <li><strong>Column 6:</strong> Possible Answer C</li>
          <li><strong>Column 7:</strong> Possible Answer D</li>
          <li><strong>Column 8:</strong> Correct Answer (must be a, b, c, or d)</li>
        </ul>
        <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded border border-blue-200 dark:border-blue-700">
          <p className="text-xs font-mono mb-2">Example Excel/CSV row:</p>
          <code className="text-xs block break-all">
            1 | What is the maximum speed for a jet ski in harbor? | | 15 knots | 20 knots | 25 knots | 30 knots | a
          </code>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
            (Note: Column 3 is empty because this question has no image)
          </p>
        </div>
        <p className="mt-3 text-xs text-blue-800 dark:text-blue-300">
          <strong>Note:</strong> Make sure your file is saved with UTF-8 encoding if you have special characters.
        </p>
        <p className="mt-2 text-xs text-blue-800 dark:text-blue-300">
          <strong>Excel Support:</strong> You can now upload Excel files (.xlsx, .xls). Images should be provided as URLs in column 3, or you can leave that column empty if no image is needed.
        </p>
        <p className="mt-2 text-xs text-blue-800 dark:text-blue-300">
          <strong>Important:</strong> Select the exam type from the dropdown above before importing. All questions in the file will be assigned to that exam type.
        </p>
        <div className="mt-3">
          <a
            href="/sample-questions.csv"
            download="sample-questions.csv"
            className="text-sm text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
          >
            📥 Download Sample CSV Template
          </a>
        </div>
      </div>
    </div>
  );
}
