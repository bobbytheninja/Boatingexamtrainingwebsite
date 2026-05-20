import React, { useState, useEffect } from 'react';
import { Upload, CheckCircle, AlertCircle, Loader2, Image as ImageIcon, ChevronDown } from 'lucide-react';
import { api } from '../utils/api';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { createClient } from '../utils/supabase/client';
import { useDarkMode } from '../contexts/DarkModeContext';
import { loadExamCategories } from '../utils/categoryLoader';
import * as XLSX from 'xlsx';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Button } from './ui/button';

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
  embeddedImageIndex?: number; // Index of the embedded image in the workbook
}

export function QuestionImporter() {
  const [adminKey, setAdminKey] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [selectedExamType, setSelectedExamType] = useState<string>('');
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; imageStats?: { withImages: number, withoutImages: number, percentage: string } } | null>(null);
  const [preview, setPreview] = useState<QuestionRow[]>([]);
  const [examTypes, setExamTypes] = useState<{ value: string; label: string }[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const supabase = createClient();

  // Load exam categories on mount
  useEffect(() => {
    console.log('🔧 QuestionImporter mounted, starting category load...');
    const loadCategories = async () => {
      try {
        console.log('🔧 Calling loadExamCategories...');
        const categories = await loadExamCategories();
        console.log('📊 LOADED CATEGORIES:', categories);
        setExamTypes(categories);
        setLoadingCategories(false);
        // Do NOT auto-select a category — user must choose manually
      } catch (error) {
        console.error('❌ Error loading categories:', error);
        setLoadingCategories(false);
      }
    };
    loadCategories();
  }, []);

  // Parse a full CSV text into rows, correctly handling quoted multiline fields.
  // Splitting by newline first (the old approach) breaks fields that contain literal newlines.
  const parseCSVText = (text: string): string[][] => {
    const rows: string[][] = [];
    let currentRow: string[] = [];
    let current = '';
    let inQuotes = false;
    let i = 0;

    while (i < text.length) {
      const char = text[i];

      if (char === '"') {
        if (inQuotes && text[i + 1] === '"') {
          current += '"';
          i += 2;
          continue;
        }
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        currentRow.push(current.trim());
        current = '';
      } else if (char === '\r' && text[i + 1] === '\n' && !inQuotes) {
        i++; // skip \r, let \n be handled next iteration
        currentRow.push(current.trim());
        if (currentRow.some(c => c.trim())) rows.push(currentRow);
        currentRow = [];
        current = '';
      } else if (char === '\n' && !inQuotes) {
        currentRow.push(current.trim());
        if (currentRow.some(c => c.trim())) rows.push(currentRow);
        currentRow = [];
        current = '';
      } else {
        current += char;
      }
      i++;
    }

    // Last row (no trailing newline)
    currentRow.push(current.trim());
    if (currentRow.some(c => c.trim())) rows.push(currentRow);

    return rows;
  };

  // Keep for any single-line use; full text parsing now uses parseCSVText above.
  const parseCSVLine = (line: string): string[] => {
    return parseCSVText(line)[0] || [];
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
      const rows = parseCSVText(text);

      if (rows.length === 0) {
        setResult({ success: false, message: 'CSV file is empty' });
        return;
      }

      // Skip header row if first cell mentions "question" or "number"
      const firstRow = rows[0];
      const dataRows = (firstRow[0]?.toLowerCase().includes('question') || firstRow[0]?.toLowerCase().includes('number'))
        ? rows.slice(1)
        : rows;

      const parsed: QuestionRow[] = dataRows.map((columns) => ({
        questionNumber: parseInt(columns[0]) || undefined,
        examType: selectedExamType,
        questionText: columns[1] || '',
        imageUrl: columns[2] || undefined,
        answerA: columns[3] || '',
        answerB: columns[4] || '',
        answerC: columns[5] || '',
        answerD: columns[6] || '',
        correctAnswer: (columns[7] || 'a').toLowerCase(),
        difficulty: 2,
        language: 'English',
      })).filter(q => q.questionText);

      setPreview(parsed.slice(0, 5));
    };
    reader.readAsText(file);
  };

  const parseExcel = async (file: File) => {
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { cellStyles: true, bookImages: true });
      
      // Get first sheet
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      // **EXTRACT EMBEDDED IMAGES FROM EXCEL**
      console.log('🔍 CHECKING FOR EMBEDDED IMAGES IN EXCEL...');
      const workbookImages = workbook.Sheets[firstSheetName]['!images'] || [];
      console.log(`📸 Found ${workbookImages.length} embedded images in Excel sheet`);
      
      if (workbookImages.length > 0) {
        console.log('✅ Excel contains embedded images! These will be uploaded to Supabase Storage.');
        workbookImages.slice(0, 3).forEach((img: any, i: number) => {
          console.log(`  Image ${i + 1}:`, {
            position: img.position,
            name: img.name,
            type: img.type,
            size: img.data?.length || 0
          });
        });
      } else {
        console.log('⚠️ No embedded images found. Looking for URLs in Column 3...');
      }
      
      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
      
      // **DIAGNOSTIC: Check what's in column 3**
      console.log('🔍 EXCEL DIAGNOSTIC - Checking Column 3 (Image URLs):');
      console.log('📊 Total rows in Excel:', jsonData.length);
      console.log('📊 First row:', jsonData[0]);
      
      const dataRows = jsonData[0] && typeof jsonData[0][0] === 'string' && 
                      (jsonData[0][0].toLowerCase().includes('question') || 
                       jsonData[0][0].toLowerCase().includes('number') ||
                       jsonData[0][1]?.toString().toLowerCase().includes('question'))
                      ? jsonData.slice(1) 
                      : jsonData;
      
      console.log('📊 Data rows (after header):', dataRows.length);
      
      let imageUrlCount = 0;
      dataRows.slice(0, 10).forEach((row, index) => {
        console.log(`  Row ${index + 1} - Full row:`, row);
        const col3Value = row[2]; // Column 3 (index 2) - THIS IS COLUMN C
        const hasValue = col3Value && col3Value.toString().trim() !== '';
        if (hasValue) imageUrlCount++;
        console.log(`  Row ${index + 1}, Column C (index 2):`, hasValue ? `"${col3Value}"` : '(empty or undefined)');
      });
      console.log(`✅ Found ${imageUrlCount} rows with data in Column 3 (out of first 10 rows)`);
      
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
          imageUrl: row[2]?.toString() || undefined, // Column 3: image URL (if any)
          language: 'English', // Default language
          embeddedImageIndex: undefined, // Will be set if we find an image for this row
        }));

      setPreview(parsed.slice(0, 5));
      
      // Store the workbook for later use during import
      (window as any).__excelWorkbook = workbook;
      (window as any).__excelImages = workbookImages;
      
    } catch (error) {
      console.error('Error parsing Excel:', error);
      setResult({ success: false, message: 'Failed to parse Excel file. Make sure you have xlsx library available.' });
    }
  };

  const handleImport = async () => {
    if (!selectedExamType) {
      setResult({ success: false, message: 'Please select an exam type before importing' });
      return;
    }
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
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data, { cellStyles: true, bookImages: true });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        
        const dataRows = jsonData[0] && typeof jsonData[0][0] === 'string' && 
                        jsonData[0][0].toLowerCase().includes('question') 
                        ? jsonData.slice(1) 
                        : jsonData;
        
        questions = dataRows
          .filter(row => row && row.length > 1 && row[1])
          .map((row, index) => {
            const questionNumber = parseInt(row[0]?.toString()) || (index + 1);
            const paddedNumber = String(questionNumber).padStart(3, '0');
            return {
              // Use deterministic ID based on exam type and question number (prevents duplicates!)
              id: `${selectedExamType}_${paddedNumber}`,
              questionNumber,
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
            };
          });
      } else {
        // Parse CSV file (using full-text parser that handles multiline quoted fields)
        const text = await file.text();
        const rows = parseCSVText(text);
        const firstRow = rows[0] || [];
        const dataRows = (firstRow[0]?.toLowerCase().includes('question') || firstRow[0]?.toLowerCase().includes('number'))
          ? rows.slice(1)
          : rows;

        questions = dataRows
          .filter(columns => columns[1]?.trim())
          .map((columns, index) => {
            const questionNumber = parseInt(columns[0]) || (index + 1);
            const paddedNumber = String(questionNumber).padStart(3, '0');
            return {
              id: `${selectedExamType}_${paddedNumber}`,
              questionNumber,
              examType: selectedExamType,
              questionText: columns[1] || '',
              imageUrl: columns[2] || undefined,
              answerA: columns[3] || '',
              answerB: columns[4] || '',
              answerC: columns[5] || '',
              answerD: columns[6] || '',
              correctAnswer: (columns[7] || 'a').toLowerCase(),
              difficulty: 2 as 1 | 2 | 3,
              language: 'English',
            };
          });
      }

      const response = await api.importQuestions(questions, adminKey);
      
      // Show detailed results with image statistics
      const imageStats = response.imageStats || { withImages: 0, withoutImages: 0, percentage: '0' };
      const successMessage = `Successfully imported ${response.count} questions for ${selectedExamType} exam!\n\n` +
        `🖼️ Images: ${imageStats.withImages} questions have images (${imageStats.percentage}%)\n` +
        `📝 Text only: ${imageStats.withoutImages} questions without images`;
      
      setResult({ 
        success: true, 
        message: successMessage,
        imageStats: imageStats
      });
    } catch (error: any) {
      console.error('Import error:', error);
      setResult({ success: false, message: error.message || 'Failed to import questions' });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl mb-6 text-gray-900 dark:text-gray-100">Question Importer</h2>

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
          <label className="block mb-2 text-gray-900 dark:text-gray-100">
            Exam Type {loadingCategories && '(Loading...)'} {!loadingCategories && `(${examTypes.length} types loaded)`}
          </label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100"
                disabled={loadingCategories}
              >
                <span className={selectedExamType ? '' : 'text-gray-400 dark:text-gray-500'}>
                  {examTypes.find(t => t.value === selectedExamType)?.label || 'Select exam type...'}
                </span>
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
              style={{ minWidth: '400px' }}
            >
              {examTypes.length === 0 && (
                <div className="p-4 text-gray-500">No exam types loaded</div>
              )}
              {examTypes.map(type => (
                <DropdownMenuItem
                  key={type.value}
                  onClick={() => {
                    console.log('Selected:', type.value, type.label);
                    setSelectedExamType(type.value);
                  }}
                  className={`cursor-pointer text-gray-900 dark:text-gray-100 ${
                    selectedExamType === type.value 
                      ? 'bg-gray-100 dark:bg-gray-700' 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {type.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
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
              ✓ Found {preview.length} questions. Hover over truncated text to see full content. All will be imported to <strong>{examTypes.find(t => t.value === selectedExamType)?.label}</strong> exam.
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
            className={`p-4 rounded-lg ${
              result.success
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700'
                : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700'
            }`}
          >
            <div className="flex items-start gap-3">
              {result.success ? (
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
              ) : (
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
              )}
              <div className="flex-1">
                <p className="text-green-700 dark:text-green-300 whitespace-pre-line">{result.message}</p>
                
                {/* Image Statistics Visual */}
                {result.success && result.imageStats && (
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-green-200 dark:border-green-700">
                      <div className="flex items-center gap-2 mb-1">
                        <ImageIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
                        <span className="text-xs text-gray-600 dark:text-gray-400">With Images</span>
                      </div>
                      <p className="text-2xl text-green-600 dark:text-green-400">
                        {result.imageStats.withImages}
                      </p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-green-200 dark:border-green-700">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-gray-600 dark:text-gray-400">Text Only</span>
                      </div>
                      <p className="text-2xl text-gray-600 dark:text-gray-400">
                        {result.imageStats.withoutImages}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h3 className="mb-2">File Format Instructions:</h3>
        
        {/* IMPORTANT WARNING ABOUT IMAGES */}
        <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-400 dark:border-green-600 rounded-lg">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-green-900 dark:text-green-200 mb-2">
                ✅ EMBEDDED IMAGES SUPPORTED!
              </p>
              <p className="text-sm text-green-800 dark:text-green-300 mb-2">
                <strong>You can now embed images directly in your Excel file!</strong>
              </p>
              <div className="text-xs space-y-2 text-green-800 dark:text-green-300">
                <p>📸 <strong>BEST METHOD:</strong> Insert/embed images directly into Excel:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Right-click cell → Insert → Picture</li>
                  <li>Copy-paste images from your computer</li>
                  <li>Drag and drop image files into cells</li>
                </ul>
                <p className="mt-2">🔗 <strong>ALTERNATIVE:</strong> Use image URLs in Column 3 (if images are online)</p>
                <p className="text-xs mt-2 italic bg-green-100 dark:bg-green-900/40 p-2 rounded">
                  💡 Tip: Check browser console (F12) after upload to see how many embedded images were found!
                </p>
              </div>
            </div>
          </div>
        </div>
        
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
          <button
            onClick={async () => {
              try {
                const response = await fetch('/sample-questions.csv');
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'sample-questions.csv';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
              } catch (error) {
                console.error('Failed to download sample:', error);
                alert('Failed to download sample file. Check console for details.');
              }
            }}
            className="text-sm text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 cursor-pointer bg-transparent border-none p-0"
          >
            📥 Download Sample CSV Template
          </button>
        </div>
      </div>
    </div>
  );
}