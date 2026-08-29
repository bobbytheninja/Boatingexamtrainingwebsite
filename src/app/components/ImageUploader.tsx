import React, { useState, useEffect } from 'react';
import { Upload, CheckCircle, AlertCircle, Loader2, Image as ImageIcon, X, ChevronDown, ChevronUp } from 'lucide-react';
import { createClient } from '../utils/supabase/client';
import { api } from '../utils/api';
import { loadExamCategories } from '../utils/categoryLoader';

interface ImagePreview {
  file: File;
  questionNumber: number;
  preview: string;
}

export function ImageUploader() {
  const [adminKey, setAdminKey] = useState('');
  const [selectedExamType, setSelectedExamType] = useState<string>('');
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [examTypes, setExamTypes] = useState<{ value: string; label: string }[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [removeQuestionNumbers, setRemoveQuestionNumbers] = useState('');
  const [removing, setRemoving] = useState(false);
  const [removeResult, setRemoveResult] = useState<{ success: boolean; message: string } | null>(null);

  // Load exam categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      const categories = await loadExamCategories();
      setExamTypes(categories);
      setLoadingCategories(false);
      
      // Do NOT auto-select — user must choose manually
    };
    loadCategories();
  }, []);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showPreviews, setShowPreviews] = useState(true);
  const supabase = createClient();

  // Warn user when navigating away during upload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (uploading) {
        e.preventDefault();
        e.returnValue = 'Upload in progress. Are you sure you want to leave? Upload will be cancelled.';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [uploading]);

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    const newImages: ImagePreview[] = [];
    
    files.forEach(file => {
      // Extract question number from filename
      // Supports: 1.jpg, question-5.png, q23.jpg, 042.png, etc.
      const filename = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
      const numberMatch = filename.match(/\d+/);
      
      if (numberMatch) {
        const questionNumber = parseInt(numberMatch[0]);
        const preview = URL.createObjectURL(file);
        
        newImages.push({
          file,
          questionNumber,
          preview
        });
      } else {
        console.warn(`Skipping ${file.name} - no question number found in filename`);
      }
    });
    
    // Sort by question number
    newImages.sort((a, b) => a.questionNumber - b.questionNumber);
    
    setImages(prev => [...prev, ...newImages]);
    setResult(null);
  };

  const removeImage = (index: number) => {
    setImages(prev => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  };

  const handleUpload = async () => {
    if (!selectedExamType) {
      setResult({ success: false, message: 'Please select an exam type before uploading' });
      return;
    }

    if (!adminKey) {
      setResult({ success: false, message: 'Please provide admin key' });
      return;
    }

    if (images.length === 0) {
      setResult({ success: false, message: 'Please select at least one image' });
      return;
    }

    setUploading(true);
    setResult(null);
    setUploadProgress({ current: 0, total: images.length });

    try {
      console.log(`[ImageUploader] Starting upload of ${images.length} images for ${selectedExamType}...`);

      // Upload images in parallel batches for much faster upload
      const uploadResults: { questionNumber: number; url: string }[] = [];
      const BATCH_SIZE = 5; // Upload 5 images at a time
      
      for (let i = 0; i < images.length; i += BATCH_SIZE) {
        const batch = images.slice(i, Math.min(i + BATCH_SIZE, images.length));
        
        // Upload batch in parallel
        const batchPromises = batch.map(async (img) => {
          console.log(`[${i + 1}-${Math.min(i + BATCH_SIZE, images.length)}/${images.length}] Uploading question ${img.questionNumber}...`);

          // Convert file to base64
          const reader = new FileReader();
          const base64Promise = new Promise<string>((resolve, reject) => {
            reader.onload = () => {
              const base64 = (reader.result as string).split(',')[1]; // Remove data:image/...;base64, prefix
              resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(img.file);
          });

          const base64Data = await base64Promise;
          const fileExt = img.file.name.split('.').pop();
          
          // Upload via backend API
          const response = await api.uploadImage(
            selectedExamType,
            img.questionNumber,
            base64Data,
            fileExt || 'jpg',
            img.file.type,
            adminKey
          );

          console.log(`  ✅ Uploaded question ${img.questionNumber}: ${response.url}`);
          
          return {
            questionNumber: img.questionNumber,
            url: response.url
          };
        });

        // Wait for batch to complete
        const batchResults = await Promise.all(batchPromises);
        uploadResults.push(...batchResults);
        
        // Update progress after each batch
        setUploadProgress({ 
          current: Math.min(i + BATCH_SIZE, images.length), 
          total: images.length 
        });
      }

      console.log('[ImageUploader] All images uploaded successfully!');

      setResult({
        success: true,
        message: `Successfully uploaded ${uploadResults.length} images and linked them to questions for ${examTypes.find(t => t.value === selectedExamType)?.label} exam!`
      });

      // Clear images after successful upload
      images.forEach(img => URL.revokeObjectURL(img.preview));
      setImages([]);

    } catch (error: any) {
      console.error('Upload error:', error);
      setResult({ success: false, message: error.message || 'Failed to upload images' });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImages = async () => {
    if (!selectedExamType || !adminKey || !removeQuestionNumbers.trim()) return;
    const numbers = removeQuestionNumbers
      .split(/[\s,]+/)
      .map(n => parseInt(n.trim()))
      .filter(n => !isNaN(n) && n > 0);
    if (numbers.length === 0) {
      setRemoveResult({ success: false, message: 'Enter valid question number(s)' });
      return;
    }
    setRemoving(true);
    setRemoveResult(null);
    try {
      const { projectId } = await import('../utils/supabase/info');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d36f8f91/questions/update-images`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            examType: selectedExamType,
            adminKey,
            imageLinks: numbers.map(n => ({ questionNumber: n, url: null })),
          }),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed');
      setRemoveResult({ success: true, message: `Removed image from ${data.updated} question(s).` });
      setRemoveQuestionNumbers('');
    } catch (err: any) {
      setRemoveResult({ success: false, message: err.message || 'Error removing images' });
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl mb-6 text-gray-900 dark:text-gray-100">📸 Image Uploader</h2>

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
        </div>

        {/* Exam Type Selection */}
        <div>
          <label className="block mb-2">
            Exam Type
          </label>
          <select
            value={selectedExamType}
            onChange={(e) => setSelectedExamType(e.target.value)}
            disabled={loadingCategories}
            className={`w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-700 ${selectedExamType ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'}`}
          >
            <option value="" disabled>Select exam type...</option>
            {examTypes.map(type => (
              <option key={type.value} value={type.value} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                {type.label}
              </option>
            ))}
          </select>
          <p className="text-sm text-gray-500 mt-1">
            Images will be linked to questions in this exam type
          </p>
        </div>

        {/* File Upload */}
        <div>
          <label className="block mb-2">
            Upload Images
          </label>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFilesChange}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="cursor-pointer text-teal-500 hover:text-teal-600"
            >
              Click to upload images (or select multiple files)
            </label>
            <p className="text-sm text-gray-500 mt-2">
              Supports JPG, PNG, GIF, WebP
            </p>
          </div>
        </div>

        {/* Image Previews */}
        {images.length > 0 && (
          <div>
            <button
              onClick={() => setShowPreviews(!showPreviews)}
              className="w-full flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors mb-3"
            >
              <h3 className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Selected Images ({images.length})
              </h3>
              {showPreviews ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            
            {showPreviews && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                {images.map((img, index) => (
                  <div key={index} className="relative group border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <img
                      src={img.preview}
                      alt={`Question ${img.questionNumber}`}
                      className="w-full h-32 object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => removeImage(index)}
                        className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                        disabled={uploading}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="p-2 bg-gray-50 dark:bg-gray-900 text-center">
                      <p className="text-sm font-semibold">
                        Question #{img.questionNumber}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {img.file.name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={!adminKey || images.length === 0 || uploading}
          className="w-full py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {uploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Uploading {uploadProgress.current}/{uploadProgress.total} images...
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              Upload {images.length} Image{images.length !== 1 ? 's' : ''} to {examTypes.find(t => t.value === selectedExamType)?.label}
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
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0" />
              )}
              <p className={result.success ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}>
                {result.message}
              </p>
            </div>
          </div>
        )}

        {/* Remove Image Section */}
        <div className="border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h3 className="text-base font-semibold text-red-700 dark:text-red-400 mb-3 flex items-center gap-2">
            <X className="w-4 h-4" /> Remove Image from Question(s)
          </h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={removeQuestionNumbers}
              onChange={(e) => setRemoveQuestionNumbers(e.target.value)}
              placeholder="e.g. 56  or  12, 34, 56"
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
            />
            <button
              onClick={handleRemoveImages}
              disabled={removing || !adminKey || !selectedExamType || !removeQuestionNumbers.trim()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm whitespace-nowrap"
            >
              {removing ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
              Remove
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">Enter one or more question numbers separated by commas or spaces. Requires exam type and admin key above.</p>
          {removeResult && (
            <div className={`mt-2 p-2 rounded text-sm flex items-center gap-2 ${removeResult.success ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'}`}>
              {removeResult.success ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              {removeResult.message}
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h3 className="mb-2">📋 How to Use:</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>
            <strong>Name your image files by question number:</strong>
            <ul className="list-disc list-inside ml-6 mt-1 space-y-1 text-xs text-gray-600 dark:text-gray-400">
              <li><code>1.jpg</code> → Links to Question #1</li>
              <li><code>5.png</code> → Links to Question #5</li>
              <li><code>23.jpg</code> → Links to Question #23</li>
              <li><code>q042.png</code> → Links to Question #42</li>
            </ul>
          </li>
          <li><strong>Select the exam type</strong> (Jet Ski, Small Boat, etc.)</li>
          <li><strong>Click "Click to upload images"</strong> and select multiple image files</li>
          <li><strong>Review the previews</strong> to make sure question numbers are correct</li>
          <li><strong>Click "Upload"</strong> to link images to your questions</li>
        </ol>
        
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded">
          <p className="text-sm text-yellow-900 dark:text-yellow-200">
            <strong>⚠️ Important:</strong> Make sure you've already imported questions for this exam type BEFORE uploading images. The images will be linked to existing questions by question number.
          </p>
        </div>

        <div className="mt-4 p-3 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-700 rounded">
          <p className="text-sm text-teal-900 dark:text-teal-200">
            <strong>💡 Tip:</strong> You can upload images for the same exam type multiple times. New uploads will replace old images for the same question numbers.
          </p>
        </div>
      </div>
    </div>
  );
}