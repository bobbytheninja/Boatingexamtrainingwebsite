import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  XCircle, 
  Home, 
  Clock, 
  AlertCircle,
  BookOpen,
  RefreshCw
} from 'lucide-react';
import { ExamType, examData, Question } from '../data/examQuestions';
import { ExamMode, ExamTier } from './ExamModeSelection';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { getTranslation } from '../data/translations';
import { useAuth } from '../contexts/AuthContext';
import { useDarkMode } from '../contexts/DarkModeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { api } from '../utils/api';
import { LoadingSpinner } from './LoadingSpinner';
import { SkeletonLoader } from './SkeletonLoader';
import { toast } from 'sonner';
import { Navigation } from './Navigation';
import { Footer } from './Footer';

interface ExamPageProps {
  examType: ExamType;
  mode: ExamMode;
  tier: ExamTier;
  onBackToHome: () => void;
  onNavigate?: (page: string) => void;
  onNeedPayment?: () => void;
}

interface AnswerData {
  answer: number | number[]; // Support both single and multiple answers
  isCorrect: boolean;
  pointsLost: number;
}

export function ExamPage({ examType, mode, tier, onBackToHome, onNavigate, onNeedPayment }: ExamPageProps) {
  const { language } = useLanguage();
  const t = getTranslation(language);
  const { accessToken, user, triggerForcedLogout } = useAuth();
  const { darkMode } = useDarkMode();
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true); // Always start with loading state
  const [questionLoadError, setQuestionLoadError] = useState<string | null>(null);
  
  // Create a navigation handler that supports all pages
  const handleNavigate = (page: string) => {
    console.log('[ExamPage] Navigation requested to:', page);
    if (onNavigate) {
      console.log('[ExamPage] Using onNavigate prop');
      onNavigate(page);
    } else if (page === 'home') {
      console.log('[ExamPage] Fallback to onBackToHome');
      onBackToHome();
    } else {
      console.warn('[ExamPage] Navigation handler not available for page:', page);
    }
  };
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]); // For multiple choice
  const [answeredQuestions, setAnsweredQuestions] = useState<Record<number, AnswerData>>({});
  const [showResults, setShowResults] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'correct' | 'wrong'>('all');
  const [timeRemaining, setTimeRemaining] = useState(60 * 60); // 60 minutes in seconds
  const [showAnswerFeedback, setShowAnswerFeedback] = useState(false);
  const [examStarted, setExamStarted] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);

  // Session-level question cache — keyed to this user's ID so a different
  // account logging into the same tab never reads another user's cached data.
  const questionsCacheKey = `qcache_${user?.id ?? 'anon'}_${tier}_${examType}`;
  const getCachedQuestions = (): Question[] | null => {
    try {
      const raw = sessionStorage.getItem(questionsCacheKey);
      return raw ? (JSON.parse(raw) as Question[]) : null;
    } catch { return null; }
  };
  const setCachedQuestions = (qs: Question[]) => {
    try { sessionStorage.setItem(questionsCacheKey, JSON.stringify(qs)); } catch {}
  };

  // Prefetch the next question's image so advancing feels instant
  useEffect(() => {
    const next = examQuestions[currentQuestionIndex + 1];
    if (next?.image) {
      const img = new window.Image();
      img.src = next.image;
    }
  }, [currentQuestionIndex, examQuestions]);

  // Load questions based on tier
  useEffect(() => {
    const loadQuestions = async () => {
      // Prevent duplicate loads
      if (examQuestions.length > 0) {
        return;
      }

      // Serve from session cache so remounts are instant
      const cached = getCachedQuestions();
      if (cached && cached.length > 0) {
        setExamQuestions(cached);
        setLoadingQuestions(false);
        return;
      }

      setLoadingQuestions(true);
      setQuestionLoadError(null);

      if (tier === 'paid') {
        console.log('[ExamPage] 💳 Loading PAID exam (40 questions)...');
        // Fetch from database for paid tier
        if (!accessToken) {
          console.error('[ExamPage] No access token available');
          setQuestionLoadError('Authentication required');
          setLoadingQuestions(false);
          return;
        }

        try {
          console.log(`[ExamPage] Loading questions for exam type: ${examType}`);
          const response = await api.getQuestions(examType, accessToken);
          
          console.log(`[ExamPage] Received ${response.questions?.length || 0} questions from API`);
          
          if (!response.questions || response.questions.length === 0) {
            setQuestionLoadError(`No questions available for ${examType} exam. Please check the Admin Panel > Diagnostics tab to verify questions were imported.`);
            setLoadingQuestions(false);
            return;
          }
          
          // Convert database questions to Question format
          const dbQuestions: Question[] = response.questions.map((q: any, index: number) => {
            // Parse correct answers - can be single (e.g., "a") or multiple (e.g., "a,c")
            const correctAnswersArray = q.correctAnswer.includes(',') 
              ? q.correctAnswer.split(',').map((a: string) => a.trim().toLowerCase().charCodeAt(0) - 97)
              : [q.correctAnswer.trim().toLowerCase().charCodeAt(0) - 97];
            
            const isMultiple = correctAnswersArray.length > 1;
            
            const rawAnswers = [q.answerA, q.answerB, q.answerC, q.answerD].filter(
              (a: any) => a != null && String(a).trim() !== ''
            );

            return {
              id: index + 1,
              question: q.questionText,
              answers: rawAnswers,
              correctAnswer: isMultiple ? correctAnswersArray[0] : correctAnswersArray[0],
              correctAnswers: isMultiple ? correctAnswersArray : undefined,
              points: q.difficulty || 1,
              image: q.imageUrl,
            };
          });

          setCachedQuestions(dbQuestions);
          setExamQuestions(dbQuestions);
          setLoadingQuestions(false);
        } catch (error: any) {
          console.error('[ExamPage] Failed to load questions:', error);
          const errorMsg = error.message || 'Failed to load questions';

          if (errorMsg.toLowerCase().includes('session invalidated') || errorMsg.toLowerCase().includes('another device')) {
            await triggerForcedLogout('You were signed in on another device. You have been logged out here.');
            return;
          }

          if (errorMsg.includes('Subscription required')) {
            setQuestionLoadError('subscription: You need an active subscription for this exam type. Please purchase access.');
          } else if (errorMsg.includes('Subscription expired') || errorMsg.includes('subscription expired')) {
            setQuestionLoadError('subscription: Your subscription for this exam has expired. Please renew your access.');
          } else if (errorMsg.includes('No questions available')) {
            setQuestionLoadError(`No questions found for ${examType} exam. The admin needs to import questions. Check Admin Panel > Diagnostics.`);
          } else {
            setQuestionLoadError(`Error loading questions: ${errorMsg}. Please try again or contact support.`);
          }

          setLoadingQuestions(false);
          toast.error('Failed to load exam questions. Please try again.');
        }
      } else {
        // Fetch mock questions (first 10) from database for free tier
        console.log('[ExamPage] 🆓 Loading MOCK exam (10 questions)...');
        try {
          console.log(`[ExamPage] Loading mock questions for exam type: ${examType}`);
          const response = await api.getMockQuestions(examType);

          console.log(`[ExamPage] Received ${response.questions?.length || 0} mock questions from API`);

          if (!response.questions || response.questions.length === 0) {
            // Show error - no fallback to demo questions
            setQuestionLoadError(`No questions available for ${examType} exam. Please check the Admin Panel > Diagnostics tab to verify questions were imported.`);
            setLoadingQuestions(false);
            return;
          }

          // Convert database questions to Question format
          const dbQuestions: Question[] = response.questions.map((q: any, index: number) => {
            // Parse correct answers - can be single (e.g., "a") or multiple (e.g., "a,c")
            const correctAnswersArray = q.correctAnswer.includes(',')
              ? q.correctAnswer.split(',').map((a: string) => a.trim().toLowerCase().charCodeAt(0) - 97)
              : [q.correctAnswer.trim().toLowerCase().charCodeAt(0) - 97];

            const isMultiple = correctAnswersArray.length > 1;

            const rawAnswers = [q.answerA, q.answerB, q.answerC, q.answerD].filter(
              (a: any) => a != null && String(a).trim() !== ''
            );

            return {
              id: index + 1,
              question: q.questionText,
              answers: rawAnswers,
              correctAnswer: isMultiple ? correctAnswersArray[0] : correctAnswersArray[0], // Single answer (always set)
              correctAnswers: isMultiple ? correctAnswersArray : undefined, // Only set for multiple answers
              points: q.difficulty || 1, // Default to 1 if difficulty not set
              image: q.imageUrl,
            };
          });

          setCachedQuestions(dbQuestions);
          setExamQuestions(dbQuestions);
          setLoadingQuestions(false);
        } catch (error: any) {
          console.error('[ExamPage] Failed to load mock questions:', error);
          const errorMsg = error.message || 'Failed to load questions';

          if (errorMsg.toLowerCase().includes('session invalidated') || errorMsg.toLowerCase().includes('another device')) {
            await triggerForcedLogout('You were signed in on another device. You have been logged out here.');
            return;
          }

          if (errorMsg.includes('No questions available')) {
            setQuestionLoadError(`No questions found for ${examType} exam. The admin needs to import questions first. Please check the Admin Panel to upload question files.`);
          } else {
            setQuestionLoadError(`Error loading questions: ${errorMsg}. Please try again or contact support.`);
          }

          setLoadingQuestions(false);
          toast.error('Failed to load exam questions. Please try again.');
        }
      }
    };

    loadQuestions();
  }, [examType, tier, accessToken]);

  const currentQuestion = examQuestions[currentQuestionIndex];
  const totalQuestions = examQuestions.length;
  const progress = totalQuestions > 0 ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0;
  const MAX_WRONG_ANSWERS = 2;
  
  // Early safety check - must happen before using currentQuestion
  // Include loadingQuestions so we don't flash "not found" while re-fetching for a new exam
  const hasValidQuestion = (examQuestions && examQuestions.length > 0 && currentQuestion) || loadingQuestions;
  
  const isMultipleChoice = currentQuestion?.correctAnswers && currentQuestion.correctAnswers.length > 1;

  // Timer effect
  useEffect(() => {
    if (!examStarted || showResults || mode === 'study') return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setShowResults(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [examStarted, showResults, mode]);

  // Start exam on mount and load from localStorage
  useEffect(() => {
    setExamStarted(true);
    
    // Load progress from localStorage
    const storageKey = `exam_progress_${examType}_${mode}_${tier}`;
    const savedProgress = localStorage.getItem(storageKey);
    if (savedProgress) {
      try {
        const parsed = JSON.parse(savedProgress);
        setCurrentQuestionIndex(parsed.currentQuestionIndex || 0);
        setAnsweredQuestions(parsed.answeredQuestions || {});
        setTimeRemaining(parsed.timeRemaining || 60 * 60);
      } catch (e) {
        console.error('Failed to load progress:', e);
      }
    }
  }, [examType, mode, tier]);
  
  // Sync selected answer when question changes
  useEffect(() => {
    if (!currentQuestion) return; // Safety check
    
    const answer = answeredQuestions[currentQuestionIndex];
    const isCurrentMultiple = currentQuestion.correctAnswers && currentQuestion.correctAnswers.length > 1;
    
    if (isCurrentMultiple) {
      setSelectedAnswers(Array.isArray(answer?.answer) ? answer.answer : []);
      setSelectedAnswer(null);
    } else {
      setSelectedAnswer(typeof answer?.answer === 'number' ? answer.answer : null);
      setSelectedAnswers([]);
    }
  }, [currentQuestionIndex, currentQuestion, answeredQuestions]);
  
  // Save progress to localStorage (only if user has answered at least one question)
  useEffect(() => {
    const hasAnsweredQuestions = Object.keys(answeredQuestions).length > 0;
    if (!showResults && examStarted && hasAnsweredQuestions) {
      const storageKey = `exam_progress_${examType}_${mode}_${tier}`;
      const progressData = {
        currentQuestionIndex,
        answeredQuestions,
        timeRemaining,
      };
      localStorage.setItem(storageKey, JSON.stringify(progressData));
    }
  }, [currentQuestionIndex, answeredQuestions, timeRemaining, showResults, examStarted, examType, mode, tier]);

  // Prevent page unload/reload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!showResults) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [showResults]);

  // Keyboard navigation
  useEffect(() => {
    if (showResults || showReview) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
            setShowAnswerFeedback(false);
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (showAnswerFeedback && mode === 'study') {
            // Continue after feedback
            if (currentQuestionIndex < totalQuestions - 1) {
              setCurrentQuestionIndex(currentQuestionIndex + 1);
              setShowAnswerFeedback(false);
            } else {
              setShowResults(true);
            }
          } else if (currentQuestionIndex < totalQuestions - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setShowAnswerFeedback(false);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setShowExitDialog(true);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentQuestionIndex, showAnswerFeedback, showResults, showReview, mode, totalQuestions]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (answer: number) => {
    setSelectedAnswer(answer);
    // Don't submit immediately - wait for Next button
  };
  
  const handleMultipleAnswerToggle = (answer: number) => {
    setSelectedAnswers(prev => {
      if (prev.includes(answer)) {
        return prev.filter(a => a !== answer);
      } else {
        return [...prev, answer];
      }
    });
  };

  const handleNext = () => {
    const hasAnswer = isMultipleChoice ? selectedAnswers.length > 0 : selectedAnswer !== null;
    
    // In mock tier, allow skipping without answering
    if (tier === 'mock' && !hasAnswer) {
      // Just move to next question without submitting
      if (currentQuestionIndex < totalQuestions - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setShowAnswerFeedback(false);
      } else {
        setShowResults(true);
      }
      return;
    }

    if (!hasAnswer) return;

    // Submit the answer when clicking Next
    let isCorrect = false;
    let userAnswer: number | number[];
    
    if (isMultipleChoice) {
      userAnswer = selectedAnswers;
      const correctAnswers = currentQuestion.correctAnswers!;
      // Check if arrays match (same elements, regardless of order)
      isCorrect = correctAnswers.length === selectedAnswers.length &&
                  correctAnswers.every(ans => selectedAnswers.includes(ans));
    } else {
      userAnswer = selectedAnswer!;
      isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    }
    
    const pointsLost = isCorrect ? 0 : currentQuestion.points;
    
    setAnsweredQuestions({
      ...answeredQuestions,
      [currentQuestionIndex]: { answer: userAnswer, isCorrect, pointsLost },
    });

    // In study mode, show immediate feedback
    if (mode === 'study') {
      setShowAnswerFeedback(true);
      // Auto-advance after showing feedback (or user can click Next again)
      return;
    }

    // In exam mode or after showing feedback in study mode, move to next question
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowAnswerFeedback(false);
    } else {
      setShowResults(true);
    }
  };

  const handleContinueAfterFeedback = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowAnswerFeedback(false);
    } else {
      setShowResults(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setShowAnswerFeedback(false);
    }
  };

  const handleSkipNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowAnswerFeedback(false);
    }
  };

  const jumpToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
    setShowAnswerFeedback(false);
  };

  const calculateResults = () => {
    let wrongCount = 0;
    let correctCount = 0;
    const submittedCount = Object.keys(answeredQuestions).length;

    examQuestions.forEach((question, index) => {
      const answer = answeredQuestions[index];
      if (answer) {
        if (answer.isCorrect) correctCount++;
        else wrongCount++;
      } else {
        wrongCount++;
      }
    });

    return { wrongCount, correctCount, submittedCount };
  };

  if (showResults) {
    const { wrongCount, correctCount, submittedCount } = calculateResults();
    const passed = wrongCount < MAX_WRONG_ANSWERS;
    const percentage = Math.round((correctCount / totalQuestions) * 100);

    return (
      <>
        <Navigation 
          currentPage="exam"
          onNavigate={handleNavigate}
          isLoggedIn={!!user}
        />
        <div 
          className="min-h-screen pt-32 pb-8 px-4 transition-all duration-[400ms]"
          style={{ 
            background: darkMode 
              ? 'linear-gradient(to bottom right, #0f172a, #1e293b, #0f172a)'
              : 'linear-gradient(to bottom right, #ffffff, #f0f9ff, #ffffff)',
            transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)'
          }}
        >
        <div className="container mx-auto max-w-3xl">
          <Card 
            className="border-2 shadow-2xl transition-all duration-[400ms]"
            style={{ 
              backgroundColor: darkMode ? '#334155' : '#ffffff',
              borderColor: darkMode ? '#475569' : '#e2e8f0',
              transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)'
            }}
          >
            <CardHeader 
              className="text-center pb-4 pt-6 transition-all duration-[400ms]"
              style={{ 
                background: darkMode 
                  ? 'linear-gradient(to bottom right, #475569, #334155)'
                  : 'linear-gradient(to bottom right, #f8fafc, #ffffff)',
                transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)'
              }}
            >
              <div className="mb-3">
                {passed ? (
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto drop-shadow-lg" />
                ) : (
                  <XCircle className="w-16 h-16 text-red-500 mx-auto drop-shadow-lg" />
                )}
              </div>
              <CardTitle className="mb-2 text-xl" style={{ color: darkMode ? '#f3f4f6' : '#0f172a' }}>
                {t.examResults}
              </CardTitle>
              <CardDescription className="text-lg font-bold">
                {passed ? (
                  <span style={{ color: darkMode ? '#4ade80' : '#16a34a' }}>{t.passed}! 🎉</span>
                ) : (
                  <span style={{ color: darkMode ? '#f87171' : '#dc2626' }}>{t.notPassed}</span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card
                  className="border-2"
                  style={{
                    background: darkMode ? 'linear-gradient(to bottom right, #1e3a5f, #1e293b)' : 'linear-gradient(to bottom right, #eff6ff, #ffffff)',
                    borderColor: darkMode ? '#475569' : '#bfdbfe',
                  }}
                >
                  <CardContent className="pt-4 pb-4 text-center">
                    <p className="text-xs mb-1" style={{ color: darkMode ? '#94a3b8' : '#4b5563' }}>{t.yourScore}</p>
                    <p className="text-3xl font-bold" style={{ color: darkMode ? '#60a5fa' : '#2563eb' }}>{percentage}%</p>
                    <p className="text-xs mt-1" style={{ color: darkMode ? '#64748b' : '#6b7280' }}>{correctCount} {t.of} {totalQuestions} {t.correctAnswers.toLowerCase()}</p>
                  </CardContent>
                </Card>
                <Card
                  className="border-2"
                  style={{
                    background: darkMode ? 'linear-gradient(to bottom right, #2d1b4e, #1e293b)' : 'linear-gradient(to bottom right, #f5f3ff, #ffffff)',
                    borderColor: darkMode ? '#475569' : '#ddd6fe',
                  }}
                >
                  <CardContent className="pt-4 pb-4 text-center">
                    <p className="text-xs mb-1" style={{ color: darkMode ? '#94a3b8' : '#4b5563' }}>{t.questionsWrong}</p>
                    <p className="text-3xl font-bold" style={{ color: passed ? (darkMode ? '#4ade80' : '#16a34a') : (darkMode ? '#f87171' : '#dc2626') }}>
                      {wrongCount}
                    </p>
                    <p className="text-xs mt-1" style={{ color: darkMode ? '#64748b' : '#6b7280' }}>{t.maximum}: {MAX_WRONG_ANSWERS}</p>
                  </CardContent>
                </Card>
                <Card
                  className="border-2"
                  style={{
                    background: darkMode ? 'linear-gradient(to bottom right, #064e3b, #1e293b)' : 'linear-gradient(to bottom right, #f0fdf4, #ffffff)',
                    borderColor: darkMode ? '#475569' : '#bbf7d0',
                  }}
                >
                  <CardContent className="pt-4 pb-4 text-center">
                    <p className="text-xs mb-1" style={{ color: darkMode ? '#94a3b8' : '#4b5563' }}>Questions Submitted</p>
                    <p className="text-3xl font-bold" style={{ color: darkMode ? '#4ade80' : '#16a34a' }}>{submittedCount}</p>
                    <p className="text-xs mt-1" style={{ color: darkMode ? '#64748b' : '#6b7280' }}>{t.of} {totalQuestions} total</p>
                  </CardContent>
                </Card>
              </div>

              {mode === 'exam' && (
                <Card
                  className="border-2"
                  style={{
                    background: darkMode ? 'linear-gradient(to bottom right, #1e293b, #334155)' : 'linear-gradient(to bottom right, #f8fafc, #ffffff)',
                    borderColor: darkMode ? '#475569' : '#cbd5e1',
                  }}
                >
                  <CardContent className="pt-4 pb-4 text-center">
                    <p className="text-xs mb-1" style={{ color: darkMode ? '#94a3b8' : '#4b5563' }}>{t.timeUsed}</p>
                    <p className="text-xl font-bold" style={{ color: darkMode ? '#e2e8f0' : '#374151' }}>{formatTime(60 * 60 - timeRemaining)}</p>
                    <p className="text-xs mt-1" style={{ color: darkMode ? '#64748b' : '#6b7280' }}>{t.of} 60:00</p>
                  </CardContent>
                </Card>
              )}

              <div className="flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={() => {
                      setShowReview(true);
                      setShowResults(false);
                    }}
                    variant="outline"
                    className="flex-1 shadow-md hover:opacity-70 transition-opacity"
                    style={{
                      borderColor: darkMode ? '#60a5fa' : '#3b82f6',
                      color: darkMode ? '#93c5fd' : '#2563eb',
                      backgroundColor: darkMode ? 'rgba(51,65,85,0.5)' : 'transparent',
                    }}
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    {t.reviewAnswers}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowResults(false);
                      setShowReview(false);
                      setCurrentQuestionIndex(0);
                      setSelectedAnswer(null);
                      setSelectedAnswers([]);
                      setAnsweredQuestions({});
                      setTimeRemaining(60 * 60);
                      setShowAnswerFeedback(false);
                      setExamStarted(true);
                      // Clear localStorage
                      const storageKey = `exam_progress_${examType}_${mode}_${tier}`;
                      localStorage.removeItem(storageKey);
                    }}
                    variant="outline"
                    className="flex-1 shadow-md hover:opacity-70 transition-opacity"
                    style={{
                      borderColor: darkMode ? '#2dd4bf' : '#14b8a6',
                      color: darkMode ? '#5eead4' : '#0f766e',
                      backgroundColor: darkMode ? 'rgba(51,65,85,0.5)' : 'transparent',
                    }}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    {t.retakeExam}
                  </Button>
                </div>
                <Button
                  onClick={() => {
                    // Reset and start a new exam of the same type
                    setShowResults(false);
                    setShowReview(false);
                    setCurrentQuestionIndex(0);
                    setSelectedAnswer(null);
                    setSelectedAnswers([]);
                    setAnsweredQuestions({});
                    setTimeRemaining(60 * 60);
                    setShowAnswerFeedback(false);
                    setExamStarted(false);
                    setReviewFilter('all');
                    setExamQuestions([]); // Clear so loadQuestions fetches a fresh random set
                    // Clear localStorage
                    const storageKey = `exam_progress_${examType}_${mode}_${tier}`;
                    localStorage.removeItem(storageKey);
                  }}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-800 dark:to-slate-700 dark:hover:from-slate-700 dark:hover:to-slate-600 shadow-lg"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Take New Exam (Same Type)
                </Button>
              </div>

              {tier === 'mock' && onNeedPayment && (
                <Alert
                  className="border-sky-500"
                  style={{
                    backgroundColor: darkMode ? 'rgba(14, 116, 144, 0.15)' : '#f0f9ff',
                    borderColor: darkMode ? '#0e7490' : '#38bdf8',
                  }}
                >
                  <AlertCircle style={{ color: darkMode ? '#38bdf8' : '#0284c7' }} />
                  <AlertDescription style={{ color: darkMode ? '#7dd3fc' : '#075985' }}>
                    {t.wantToUpgrade} Practice more questions for just a small fee per category.
                    <Button
                      onClick={onNeedPayment}
                      variant="link"
                      className="font-bold pl-2"
                      style={{ color: darkMode ? '#38bdf8' : '#0369a1' }}
                    >
                      {t.upgradeNowLink}
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
      </>
    );
  }
  
  if (showReview) {
    const { wrongCount, correctCount, submittedCount } = calculateResults();
    
    return (
      <>
        <Navigation 
          currentPage="exam"
          onNavigate={handleNavigate}
          isLoggedIn={!!user}
        />
        <div 
          className="min-h-screen pt-32 pb-8 px-4 transition-all duration-[400ms]"
          style={{ 
            background: darkMode 
              ? 'linear-gradient(to bottom right, #0f172a, #1e293b, #0f172a)'
              : 'linear-gradient(to bottom right, #ffffff, #f0f9ff, #ffffff)',
            transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)'
          }}
        >
        <div className="container mx-auto max-w-4xl">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
            <h2
              className="text-2xl font-bold transition-colors duration-[400ms]"
              style={{
                color: darkMode ? '#f3f4f6' : '#111827',
                transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)'
              }}
            >{t.reviewAnswers}</h2>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Review filter buttons */}
              {(['all', 'correct', 'wrong'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setReviewFilter(f)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 8,
                    border: `2px solid ${
                      reviewFilter === f
                        ? f === 'wrong' ? '#dc2626' : f === 'correct' ? '#16a34a' : (darkMode ? '#60a5fa' : '#2563eb')
                        : darkMode ? '#475569' : '#e5e7eb'
                    }`,
                    backgroundColor: reviewFilter === f
                      ? f === 'wrong' ? (darkMode ? '#450a0a' : '#fee2e2')
                        : f === 'correct' ? (darkMode ? '#052e16' : '#dcfce7')
                        : (darkMode ? '#1e3a8a' : '#dbeafe')
                      : darkMode ? '#334155' : '#ffffff',
                    color: reviewFilter === f
                      ? f === 'wrong' ? (darkMode ? '#fca5a5' : '#991b1b')
                        : f === 'correct' ? (darkMode ? '#86efac' : '#166534')
                        : (darkMode ? '#93c5fd' : '#1e40af')
                      : darkMode ? '#cbd5e1' : '#374151',
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {f === 'all' ? `All (${examQuestions.length})` : f === 'correct' ? `✓ Correct (${Object.values(answeredQuestions).filter(a => a.isCorrect).length})` : `✗ Wrong (${Object.values(answeredQuestions).filter(a => !a.isCorrect).length})`}
                </button>
              ))}
              <Button
                onClick={onBackToHome}
                variant="outline"
                className="transition-all duration-300"
                style={{
                  backgroundColor: darkMode ? '#334155' : '#ffffff',
                  borderColor: darkMode ? '#64748b' : '#e5e7eb',
                  color: darkMode ? '#e2e8f0' : '#1f2937'
                }}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t.backToExams}
              </Button>
            </div>
          </div>
          
          <div className="mb-6">
            <Card 
              className="border-2 shadow-md transition-all duration-300"
              style={{
                backgroundColor: darkMode ? '#1e293b' : '#ffffff',
                borderColor: darkMode ? '#475569' : '#e5e7eb'
              }}
            >
              <CardContent className="pt-4 pb-4">
                <div className="flex justify-around items-center">
                  <div className="text-center">
                    <p className="text-sm mb-1" style={{ color: darkMode ? '#94a3b8' : '#6b7280' }}>{t.yourScore}</p>
                    <p className="text-2xl font-bold" style={{ color: darkMode ? '#60a5fa' : '#2563eb' }}>{Math.round((correctCount / totalQuestions) * 100)}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm mb-1" style={{ color: darkMode ? '#94a3b8' : '#6b7280' }}>{t.correctAnswers}</p>
                    <p className="text-2xl font-bold" style={{ color: darkMode ? '#4ade80' : '#16a34a' }}>{correctCount}/{totalQuestions}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm mb-1" style={{ color: darkMode ? '#94a3b8' : '#6b7280' }}>{t.questionsWrong}</p>
                    <p className={`text-2xl font-bold`} style={{ color: wrongCount < MAX_WRONG_ANSWERS ? (darkMode ? '#4ade80' : '#16a34a') : (darkMode ? '#f87171' : '#dc2626') }}>
                      {wrongCount}/{MAX_WRONG_ANSWERS}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm mb-1" style={{ color: darkMode ? '#94a3b8' : '#6b7280' }}>Submitted</p>
                    <p className="text-2xl font-bold" style={{ color: darkMode ? '#2dd4bf' : '#0f766e' }}>{submittedCount}/{totalQuestions}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-4">
            {examQuestions.map((question, index) => {
              const answer = answeredQuestions[index];
              const isCorrect = answer?.isCorrect ?? false;
              // Apply filter
              if (reviewFilter === 'correct' && !isCorrect) return null;
              if (reviewFilter === 'wrong' && isCorrect) return null;
              const isMultiQuestion = question.correctAnswers && question.correctAnswers.length > 1;
              const userAnswer = answer?.answer;
              
              return (
                <Card 
                  key={index} 
                  className="border-2 transition-all duration-300"
                  style={{
                    backgroundColor: darkMode 
                      ? '#1e293b'
                      : (isCorrect ? '#f0fdf4' : '#fef2f2'),
                    borderColor: darkMode
                      ? (isCorrect ? '#16a34a' : '#dc2626')
                      : (isCorrect ? '#bbf7d0' : '#fecaca')
                  }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge 
                            variant="outline" 
                            className="text-xs transition-all duration-300"
                            style={{
                              backgroundColor: darkMode ? '#334155' : '#ffffff',
                              borderColor: darkMode ? '#64748b' : '#cbd5e1',
                              color: darkMode ? '#e2e8f0' : '#1e293b'
                            }}
                          >
                            {t.question} {index + 1}
                          </Badge>
                          <Badge
                            variant="secondary"
                            className="text-xs transition-all duration-300"
                            style={{
                              backgroundColor: darkMode ? '#1e3a8a' : '#dbeafe',
                              color: darkMode ? '#93c5fd' : '#1e40af'
                            }}
                          >
                            {t.selectMultipleAnswers.replace('{count}', (question.correctAnswers?.length || 1).toString())}
                          </Badge>
                        </div>
                        <CardTitle 
                          className="text-base transition-colors duration-300"
                          style={{ color: darkMode ? '#f1f5f9' : '#1e293b' }}
                        >
                          {question.question}
                        </CardTitle>
                      </div>
                      {isCorrect ? (
                        <CheckCircle className="w-6 h-6 flex-shrink-0" style={{ color: darkMode ? '#4ade80' : '#16a34a' }} />
                      ) : (
                        <XCircle className="w-6 h-6 flex-shrink-0" style={{ color: darkMode ? '#f87171' : '#dc2626' }} />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {question.image && (
                      <div 
                        className="rounded-lg overflow-hidden shadow-lg border-2 p-4 mb-3 transition-all duration-300"
                        style={{
                          borderColor: darkMode ? '#374151' : '#e2e8f0',
                          backgroundColor: darkMode ? '#111827' : '#f8fafc'
                        }}
                      >
                        <ImageWithFallback
                          src={question.image}
                          alt="Question illustration"
                          className="w-full min-h-[136px] max-h-[272px] object-contain mx-auto"
                        />
                      </div>
                    )}
                    
                    {question.answers.map((ans, ansIndex) => {
                      const isUserAnswer = isMultiQuestion 
                        ? Array.isArray(userAnswer) && userAnswer.includes(ansIndex)
                        : userAnswer === ansIndex;
                      const isCorrectAnswer = isMultiQuestion
                        ? question.correctAnswers?.includes(ansIndex)
                        : ansIndex === question.correctAnswer;
                      
                      return (
                        <div
                          key={ansIndex}
                          className="p-3 rounded-lg border-2 flex items-center gap-2 transition-all duration-300"
                          style={{
                            borderColor: isCorrectAnswer
                              ? (darkMode ? '#16a34a' : '#22c55e')
                              : isUserAnswer
                              ? (darkMode ? '#dc2626' : '#ef4444')
                              : (darkMode ? '#4b5563' : '#e2e8f0'),
                            backgroundColor: isCorrectAnswer
                              ? (darkMode ? 'rgba(22, 163, 74, 0.15)' : '#f0fdf4')
                              : isUserAnswer
                              ? (darkMode ? 'rgba(220, 38, 38, 0.15)' : '#fef2f2')
                              : (darkMode ? '#334155' : '#f8fafc')
                          }}
                        >
                          {isMultiQuestion ? (
                            <Checkbox checked={isUserAnswer || isCorrectAnswer} disabled />
                          ) : (
                            <div 
                              className="size-4 shrink-0 rounded-full border-2 flex items-center justify-center"
                              style={{
                                borderColor: (isUserAnswer || isCorrectAnswer)
                                  ? (darkMode ? '#f1f5f9' : '#1e293b')
                                  : (darkMode ? '#4b5563' : '#cbd5e1')
                              }}
                            >
                              {(isUserAnswer || isCorrectAnswer) && (
                                <div 
                                  className="size-2 rounded-full"
                                  style={{ backgroundColor: darkMode ? '#f1f5f9' : '#1e293b' }}
                                />
                              )}
                            </div>
                          )}
                          <span 
                            className="flex-1 text-sm transition-colors duration-300"
                            style={{ color: darkMode ? '#e5e7eb' : '#334155' }}
                          >
                            {ans}
                          </span>
                          {isCorrectAnswer && <CheckCircle className="w-4 h-4" style={{ color: darkMode ? '#4ade80' : '#16a34a' }} />}
                          {isUserAnswer && !isCorrectAnswer && <XCircle className="w-4 h-4" style={{ color: darkMode ? '#f87171' : '#dc2626' }} />}
                        </div>
                      );
                    })}
                    
                    {!isCorrect && (
                      <Alert className="border-red-200 bg-red-50 mt-3">
                        <AlertCircle className="text-red-600" />
                        <AlertDescription className="text-red-800 text-sm">
                          <strong>{t.incorrect}</strong>
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          <div className="mt-6 flex gap-3">
            <Button
              onClick={() => {
                setShowResults(false);
                setShowReview(false);
                setCurrentQuestionIndex(0);
                setSelectedAnswer(null);
                setSelectedAnswers([]);
                setAnsweredQuestions({});
                setTimeRemaining(60 * 60);
                setShowAnswerFeedback(false);
                setExamStarted(true);
                const storageKey = `exam_progress_${examType}_${mode}_${tier}`;
                localStorage.removeItem(storageKey);
              }}
              variant="outline"
              className="flex-1 shadow-md transition-all duration-300"
              style={{
                backgroundColor: darkMode ? '#334155' : '#ffffff',
                borderColor: darkMode ? '#64748b' : '#e5e7eb',
                color: darkMode ? '#e2e8f0' : '#1f2937'
              }}
            >
              {t.retakeExam}
            </Button>
            <Button
              onClick={onBackToHome}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-800 dark:to-slate-700 dark:hover:from-slate-700 dark:hover:to-slate-600 shadow-lg"
            >
              <Home className="w-4 h-4 mr-2" />
              {t.backToHome}
            </Button>
          </div>
        </div>
      </div>
      <Footer />
      </>
    );
  }

  // Show loading state while fetching paid questions
  if (loadingQuestions) {
    return (
      <>
        <Navigation 
          currentPage="exam"
          onNavigate={handleNavigate}
          isLoggedIn={!!user}
        />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pt-20 pb-12 px-4">
          <div className="container mx-auto max-w-4xl">
            <SkeletonLoader variant="question" className="animate-fadeIn" />
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Show error if questions failed to load
  if (questionLoadError) {
    return (
      <>
        <Navigation 
          currentPage="exam"
          onNavigate={handleNavigate}
          isLoggedIn={!!user}
        />
        <div 
          className="min-h-screen flex items-center justify-center bg-gradient-to-br px-4 pt-20 transition-all duration-300"
          style={{
            backgroundImage: darkMode 
              ? 'linear-gradient(to bottom right, #0f172a, #1e293b, #0f172a)'
              : 'linear-gradient(to bottom right, #f8fafc, #dbeafe, #f8fafc)'
          }}
        >
        <Card 
          className="max-w-lg w-full transition-all duration-300"
          style={{
            borderColor: darkMode ? '#991b1b' : '#fca5a5',
            backgroundColor: darkMode ? '#1e293b' : '#ffffff'
          }}
        >
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center justify-center">
              <XCircle 
                className="w-16 h-16 transition-colors duration-300" 
                style={{ color: darkMode ? '#f87171' : '#dc2626' }}
              />
            </div>
            <h3 
              className="text-xl font-bold text-center transition-colors duration-300"
              style={{ color: darkMode ? '#f1f5f9' : '#111827' }}
            >
              {language === 'English' ? 'Failed to Load Questions' : 'Грешка при зареждане'}
            </h3>
            <p 
              className="text-base font-semibold text-center p-4 rounded-lg border-2 transition-all duration-300"
              style={{
                color: darkMode ? '#e5e7eb' : '#1f2937',
                backgroundColor: darkMode ? '#334155' : '#f1f5f9',
                borderColor: darkMode ? '#4b5563' : '#cbd5e1'
              }}
            >
              {questionLoadError.replace(/^subscription:\s*/i, '')}
            </p>
            
            <div className="flex flex-col gap-2">
              {questionLoadError.includes('subscription') && (
                <Button 
                  onClick={() => handleNavigate('payment')} 
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                >
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {language === 'English' ? 'Buy Access' : 'Купи достъп'}
                </Button>
              )}
              <Button onClick={onBackToHome} className="w-full">
                <Home className="w-4 h-4 mr-2" />
                {t.backToHome}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
      </>
    );
  }

  // Safety check - show error if no valid question
  if (!hasValidQuestion) {
    return (
      <>
        <Navigation 
          currentPage="exam"
          onNavigate={handleNavigate}
          isLoggedIn={!!user}
        />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pt-20">
          <Card className="max-w-md">
            <CardContent className="pt-6">
              <p className="text-center text-gray-600 dark:text-gray-400">
                {language === 'English' ? 'Question not found. Please return to home.' : 'Въпросът не е намерен. Моля, върнете се към началото.'}
              </p>
              <Button onClick={onBackToHome} className="w-full mt-4">
                <Home className="w-4 h-4 mr-2" />
                {t.backToHome}
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </>
    );
  }

  // Now safe to access answeredData
  const answeredData = answeredQuestions[currentQuestionIndex];

  return (
    <>
      <Navigation 
        currentPage="exam"
        onNavigate={handleNavigate}
        isLoggedIn={!!user}
      />
      <div 
        className="min-h-screen pt-32 pb-6 px-4 transition-all duration-[400ms]"
        style={{ 
          background: darkMode 
            ? 'linear-gradient(to bottom right, #0f172a, #1e293b, #0f172a)'
            : 'linear-gradient(to bottom right, #ffffff, #f0f9ff, #ffffff)',
          transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)'
        }}
      >
      <div className="container mx-auto max-w-5xl">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setShowExitDialog(true)}
              variant="outline"
              className="hover:opacity-70 transition-opacity duration-200"
              style={{
                borderColor: darkMode ? '#f87171' : '#ef4444',
                color: darkMode ? '#fca5a5' : '#dc2626',
                backgroundColor: darkMode ? 'rgba(51,65,85,0.5)' : 'transparent',
              }}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t.exitExam}
            </Button>
            <Badge 
              variant="secondary" 
              className="px-3 py-1 flex items-center gap-1.5 shadow-sm"
            >
              <BookOpen className="w-3 h-3" />
              {mode === 'study' ? t.studyMode : t.examMode}
            </Badge>
            {mode === 'exam' && (
              <Badge 
                variant={timeRemaining < 600 ? 'destructive' : 'secondary'}
                className="flex items-center gap-1.5 shadow-sm text-base px-4 py-1.5"
              >
                <Clock className="w-4 h-4" />
                {formatTime(timeRemaining)}
              </Badge>
            )}
          </div>
          
          {/* Keyboard Shortcuts Hint */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge 
                  variant="outline" 
                  className="px-2 py-1 text-xs cursor-help border-cyan-300 dark:border-cyan-700 bg-cyan-50/50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300"
                >
                  ⌨️ Shortcuts
                </Badge>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <div className="text-xs space-y-1">
                  <p><kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">←</kbd> Previous question</p>
                  <p><kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">→</kbd> Next question</p>
                  <p><kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">Esc</kbd> Exit exam</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        {/* Exit Confirmation Dialog */}
        <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
          <AlertDialogContent
            className="transition-colors duration-300"
            style={{
              backgroundColor: darkMode ? '#1e293b' : '#ffffff',
              borderColor: darkMode ? '#475569' : '#e5e7eb',
              color: darkMode ? '#e2e8f0' : '#1f2937'
            }}
          >
            <AlertDialogHeader>
              <AlertDialogTitle style={{ color: darkMode ? '#f1f5f9' : '#111827' }}>
                {t.exitExamTitle}
              </AlertDialogTitle>
              <AlertDialogDescription style={{ color: darkMode ? '#cbd5e1' : '#6b7280' }}>
                {t.exitExamMessage}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                style={{
                  backgroundColor: darkMode ? '#334155' : '#f3f4f6',
                  color: darkMode ? '#e2e8f0' : '#374151',
                  borderColor: darkMode ? '#475569' : '#d1d5db'
                }}
              >
                {t.continueExam}
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={onBackToHome}
                className="bg-red-600 hover:bg-red-700"
              >
                {t.exitAndLoseProgress}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Submit Confirmation Dialog */}
        <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
          <AlertDialogContent
            className="transition-colors duration-300"
            style={{
              backgroundColor: darkMode ? '#1e293b' : '#ffffff',
              borderColor: darkMode ? '#475569' : '#e5e7eb',
              color: darkMode ? '#e2e8f0' : '#1f2937'
            }}
          >
            <AlertDialogHeader>
              <AlertDialogTitle style={{ color: darkMode ? '#f1f5f9' : '#111827' }}>
                {t.submitExamTitle}
              </AlertDialogTitle>
              <AlertDialogDescription style={{ color: darkMode ? '#cbd5e1' : '#6b7280' }}>
                {t.submitExamMessage}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                style={{
                  backgroundColor: darkMode ? '#334155' : '#f3f4f6',
                  color: darkMode ? '#e2e8f0' : '#374151',
                  borderColor: darkMode ? '#475569' : '#d1d5db'
                }}
              >
                {t.cancelSubmit}
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => {
                  setShowSubmitDialog(false);
                  setShowResults(true);
                }}
                style={{
                  backgroundColor: '#0891b2',
                  color: '#ffffff'
                }}
                className="hover:opacity-90 transition-opacity"
              >
                {t.confirmSubmit}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium transition-colors duration-[400ms]" style={{ color: darkMode ? '#cbd5e1' : '#334155' }}>
              {t.question} {currentQuestionIndex + 1} {t.of} {totalQuestions}
            </span>
            <span className="text-sm font-medium transition-colors duration-[400ms]" style={{ color: darkMode ? '#cbd5e1' : '#334155' }}>{Math.round(progress)}% {t.complete}</span>
          </div>
          <Progress value={progress} className="h-2 shadow-sm" />
        </div>

        <Card 
          className="mb-4 border-2 shadow-xl transition-all duration-[400ms]" 
          style={{ 
            backgroundColor: darkMode ? '#1e293b' : '#ffffff', 
            borderColor: darkMode ? '#475569' : '#e2e8f0',
            transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)'
          }}
        >
          <CardHeader 
            className="pb-2 pt-4 px-3 md:px-6 transition-all duration-[400ms]" 
            style={{ 
              background: darkMode 
                ? 'linear-gradient(to bottom right, #334155, #1e293b)' 
                : 'linear-gradient(to bottom right, #f8fafc, #ffffff)',
              transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)'
            }}
          >
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-4">
              <CardTitle aria-live="polite" className="flex-1 text-base md:text-lg max-h-[120px] overflow-y-auto transition-colors duration-[400ms]" style={{ color: darkMode ? '#e2e8f0' : '#1e293b' }}>{currentQuestion.question}</CardTitle>
              <div className="flex flex-row md:flex-col gap-2 md:gap-1.5 md:items-end flex-shrink-0">
                <Badge className="shadow-md text-xs whitespace-nowrap transition-all duration-[400ms]" style={{ backgroundColor: darkMode ? '#1e40af' : '#2563eb', color: '#ffffff', borderColor: darkMode ? '#1e3a8a' : '#1d4ed8' }}>
                  {t.selectMultipleAnswers.replace('{count}', (currentQuestion.correctAnswers?.length || 1).toString())}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 pt-2 px-3 md:px-6 transition-all duration-[400ms]" style={{ backgroundColor: darkMode ? '#1e293b' : '#ffffff' }}>
            {currentQuestion.image && (
              <div className="rounded-lg overflow-hidden shadow-lg border-2 border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-900 p-4 mb-2">
                <ImageWithFallback
                  src={currentQuestion.image}
                  alt="Question illustration"
                  className="w-full min-h-[136px] max-h-[272px] object-contain mx-auto"
                  fetchPriority="high"
                  loading="eager"
                />
              </div>
            )}

            {isMultipleChoice ? (
              <div className="space-y-2">
                {currentQuestion.answers.map((answer, index) => {
                  const isSelected = selectedAnswers.includes(index);
                  const isCorrectAnswer = currentQuestion.correctAnswers?.includes(index);
                  const showCorrect = mode === 'study' && showAnswerFeedback && isCorrectAnswer;
                  const showWrong = mode === 'study' && showAnswerFeedback && isSelected && !isCorrectAnswer;

                  return (
                    <div
                      key={index}
                      className="flex items-center space-x-3 p-2 md:p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer"
                      style={{ 
                        backgroundColor: showCorrect 
                          ? (darkMode ? '#064e3b' : '#f0fdf4')
                          : showWrong 
                          ? (darkMode ? '#7f1d1d' : '#fef2f2')
                          : isSelected 
                          ? (darkMode ? '#1e3a8a' : '#eff6ff')
                          : (darkMode ? '#334155' : '#f8fafc'),
                        borderColor: showCorrect 
                          ? '#22c55e' 
                          : showWrong 
                          ? '#ef4444' 
                          : isSelected 
                          ? '#3b82f6' 
                          : (darkMode ? '#475569' : '#cbd5e1')
                      }}
                      onClick={() => !(mode === 'study' && showAnswerFeedback) && handleMultipleAnswerToggle(index)}
                    >
                      <Checkbox 
                        id={`answer-${index}`}
                        checked={isSelected}
                        onCheckedChange={() => handleMultipleAnswerToggle(index)}
                        disabled={mode === 'study' && showAnswerFeedback}
                      />
                      <Label htmlFor={`answer-${index}`} className="flex-1 cursor-pointer text-xs md:text-sm max-h-[100px] overflow-y-auto font-medium transition-colors duration-200" style={{ color: darkMode ? '#e2e8f0' : '#334155' }}>
                        {answer}
                      </Label>
                      {showCorrect && <CheckCircle className="w-5 h-5" style={{ color: '#16a34a' }} />}
                      {showWrong && <XCircle className="w-5 h-5" style={{ color: '#dc2626' }} />}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-2">
                {currentQuestion.answers.map((answer, index) => {
                  const isSelected = selectedAnswer === index;
                  const isCorrectAnswer = index === currentQuestion.correctAnswer;
                  const showCorrect = mode === 'study' && showAnswerFeedback && isCorrectAnswer;
                  const showWrong = mode === 'study' && showAnswerFeedback && isSelected && !isCorrectAnswer;

                  return (
                    <div
                      key={index}
                      onClick={() => !(mode === 'study' && showAnswerFeedback) && handleAnswerSelect(index)}
                      className={`flex items-center p-3 md:p-4 rounded-lg border-2 transition-all duration-200 ${mode === 'study' && showAnswerFeedback ? 'cursor-default' : 'cursor-pointer'}`}
                      style={{ 
                        backgroundColor: showCorrect 
                          ? (darkMode ? '#064e3b' : '#f0fdf4')
                          : showWrong 
                          ? (darkMode ? '#7f1d1d' : '#fef2f2')
                          : isSelected 
                          ? (darkMode ? '#1e3a8a' : '#eff6ff')
                          : (darkMode ? '#334155' : '#f8fafc'),
                        borderColor: showCorrect 
                          ? '#22c55e' 
                          : showWrong 
                          ? '#ef4444' 
                          : isSelected 
                          ? '#3b82f6' 
                          : (darkMode ? '#475569' : '#cbd5e1')
                      }}
                    >
                      <span className="flex-1 text-xs md:text-sm max-h-[100px] overflow-y-auto font-medium transition-colors duration-200" style={{ color: darkMode ? '#e2e8f0' : '#334155' }}>
                        {answer}
                      </span>
                      {showCorrect && <CheckCircle className="w-5 h-5 flex-shrink-0 ml-3" style={{ color: '#16a34a' }} />}
                      {showWrong && <XCircle className="w-5 h-5 flex-shrink-0 ml-3" style={{ color: '#dc2626' }} />}
                    </div>
                  );
                })}
              </div>
            )}

            {mode === 'study' && showAnswerFeedback && (
              <Alert className={`${answeredData?.isCorrect ? 'border-green-500 bg-green-50 dark:bg-green-900/30' : 'border-red-500 bg-red-50 dark:bg-red-900/30'} shadow-lg`}>
                <AlertCircle className={answeredData?.isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'} />
                <AlertDescription className={answeredData?.isCorrect ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}>
                  {answeredData?.isCorrect ? (
                    <span><strong>{t.correct}</strong></span>
                  ) : (
                    <span><strong>{t.incorrect}</strong></span>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-2 mb-4">
          <div className="flex justify-between gap-2">
            <Button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              variant="outline"
              className="shadow-md border-2 transition-all duration-[400ms] font-semibold hover:opacity-80"
              style={{
                borderColor: darkMode ? '#475569' : '#cbd5e1',
                color: darkMode ? '#cbd5e1' : '#334155',
                backgroundColor: darkMode ? '#334155' : '#f8fafc'
              }}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t.previous}
            </Button>
            <Button
              id="next-button"
              onClick={mode === 'study' && showAnswerFeedback ? handleContinueAfterFeedback : handleNext}
              disabled={tier !== 'mock' && (isMultipleChoice ? selectedAnswers.length === 0 : selectedAnswer === null)}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg"
            >
              {mode === 'study' && showAnswerFeedback
                ? (currentQuestionIndex === totalQuestions - 1 ? t.finish : t.continue)
                : (isMultipleChoice ? selectedAnswers.length > 0 : selectedAnswer !== null)
                ? (currentQuestionIndex === totalQuestions - 1 ? t.finishExam : t.submitAndNext)
                : (currentQuestionIndex === totalQuestions - 1 ? t.finish : t.next)}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              onClick={handleSkipNext}
              disabled={currentQuestionIndex === totalQuestions - 1}
              variant="outline"
              title="Skip to next question without submitting"
              className="h-9 px-3 shadow-md hover:opacity-70 transition-opacity"
              style={{
                borderColor: darkMode ? '#475569' : '#cbd5e1',
                color: darkMode ? '#94a3b8' : '#6b7280',
                backgroundColor: darkMode ? '#334155' : '#f8fafc',
              }}
            >
              {'>'}
            </Button>
            {/* Desktop: Submit in the same row */}
            <Button
              onClick={() => setShowSubmitDialog(true)}
              variant="outline"
              className="hidden sm:flex shadow-md hover:opacity-70 transition-opacity"
              style={{
                borderColor: darkMode ? '#0891b2' : '#0891b2',
                color: darkMode ? '#67e8f9' : '#0e7490',
                backgroundColor: darkMode ? 'rgba(51,65,85,0.5)' : 'transparent',
              }}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {t.submitExam}
            </Button>
          </div>
          {/* Mobile: Submit on its own full-width row */}
          <Button
            onClick={() => setShowSubmitDialog(true)}
            variant="outline"
            className="sm:hidden w-full shadow-md hover:opacity-70 transition-opacity"
            style={{
              borderColor: darkMode ? '#0891b2' : '#0891b2',
              color: darkMode ? '#67e8f9' : '#0e7490',
              backgroundColor: darkMode ? 'rgba(51,65,85,0.5)' : 'transparent',
            }}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            {t.submitExam}
          </Button>
        </div>

        <Card 
          className="border-2 shadow-xl transition-all duration-[400ms]"
          style={{ 
            backgroundColor: darkMode ? '#1e293b' : '#ffffff',
            borderColor: darkMode ? '#475569' : '#e2e8f0',
            transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)'
          }}
        >
          <CardHeader 
            className="pb-2 pt-3 transition-all duration-[400ms]"
            style={{ 
              background: darkMode 
                ? 'linear-gradient(to bottom right, #334155, #1e293b)' 
                : 'linear-gradient(to bottom right, #f8fafc, #ffffff)',
              transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)'
            }}
          >
            <CardTitle 
              className="text-center text-sm transition-colors duration-[400ms]"
              style={{ 
                color: darkMode ? '#e2e8f0' : '#1e293b',
                transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)'
              }}
            >{t.questionNavigator}</CardTitle>
          </CardHeader>
          <CardContent 
            className="pt-2 pb-3 transition-all duration-[400ms]"
            style={{ 
              backgroundColor: darkMode ? '#1e293b' : '#ffffff',
              transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)'
            }}
          >
            <div>
              <div className="grid grid-cols-10 gap-1 p-1">
                {examQuestions.map((q, index) => {
                  const answer = answeredQuestions[index];
                  const isCurrentQuestion = index === currentQuestionIndex;
                  
                  return (
                    <TooltipProvider key={index}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="relative flex items-center justify-center p-1">
                            <button
                              onClick={() => jumpToQuestion(index)}
                              className="relative w-10 h-10 rounded-full border-2 transition-all duration-200 flex items-center justify-center overflow-hidden"
                              style={{
                                backgroundColor: isCurrentQuestion
                                  ? '#3b82f6'
                                  : answer && mode === 'study' && answer.isCorrect
                                  ? '#22c55e'
                                  : answer && mode === 'study'
                                  ? '#ef4444'
                                  : answer
                                  ? (darkMode ? '#475569' : '#94a3b8')
                                  : (darkMode ? '#334155' : '#ffffff'),
                                borderColor: isCurrentQuestion
                                  ? '#3b82f6'
                                  : answer && mode === 'study' && answer.isCorrect
                                  ? '#16a34a'
                                  : answer && mode === 'study'
                                  ? '#dc2626'
                                  : answer
                                  ? (darkMode ? '#64748b' : '#64748b')
                                  : (darkMode ? '#475569' : '#9ca3af'),
                                color: isCurrentQuestion || answer ? '#ffffff' : (darkMode ? '#e2e8f0' : '#334155'),
                                boxShadow: isCurrentQuestion ? '0 4px 6px -1px rgba(59, 130, 246, 0.3), 0 0 0 3px rgba(59, 130, 246, 0.2)' : 'none'
                              }}
                            >
                              {q.image && (
                                <div className="absolute inset-0 opacity-30">
                                  <ImageWithFallback
                                    src={q.image}
                                    alt=""
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                              <span 
                                className="relative z-10 text-xs font-bold transition-colors duration-200" 
                                style={{ 
                                  color: isCurrentQuestion || answer ? '#ffffff' : (darkMode ? '#e2e8f0' : '#334155'),
                                  textShadow: isCurrentQuestion || answer ? '0 1px 2px rgba(0,0,0,0.3)' : 'none'
                                }}
                              >
                                {index + 1}
                              </span>
                            </button>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <p className="text-xs font-medium">Q{index + 1}: {q.question.substring(0, 60)}{q.question.length > 60 ? '...' : ''}</p>
                          {answer && (
                            <p className={`text-xs mt-1 font-medium ${answer.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                              {answer.isCorrect ? `✓ ${t.correct}` : `✗ ${t.incorrect}`}
                            </p>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center justify-center gap-3 mt-2 pt-2 border-t dark:border-t-slate-500 flex-wrap">
              {mode === 'study' ? (
                <>
                  <div className="flex items-center gap-1">
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-green-600 bg-green-500"></div>
                    <span className="text-[10px] text-gray-600 dark:text-gray-300">{t.answeredCorrectly}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-red-600 bg-red-500"></div>
                    <span className="text-[10px] text-gray-600 dark:text-gray-300">{t.answeredIncorrectly}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-400 dark:border-gray-400 bg-slate-100 dark:bg-gray-600"></div>
                    <span className="text-[10px] text-gray-600 dark:text-gray-300">{t.unanswered}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-blue-500 bg-blue-500"></div>
                    <span className="text-[10px] text-gray-600 dark:text-gray-300">{t.current}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-1">
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-green-600 bg-green-500"></div>
                    <span className="text-[10px] text-gray-600 dark:text-gray-300">{t.answered}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-400 dark:border-gray-400 bg-slate-100 dark:bg-gray-600"></div>
                    <span className="text-[10px] text-gray-600 dark:text-gray-300">{t.unanswered}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-blue-500 bg-blue-500"></div>
                    <span className="text-[10px] text-gray-600 dark:text-gray-300">{t.current}</span>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    <Footer />
    
    {/* Exit Exam Dialog */}
    <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
      <AlertDialogContent className="dark:bg-slate-800">
        <AlertDialogHeader>
          <AlertDialogTitle className="dark:text-gray-100">{t.exitExamTitle || (language === 'English' ? 'Exit Exam?' : 'Излизане от изпита?')}</AlertDialogTitle>
          <AlertDialogDescription className="dark:text-gray-300">
            {t.exitExamMessage || (language === 'English' 
              ? 'Your progress will be lost if you exit now. Are you sure you want to leave?' 
              : 'Вашият прогрес ще бъде загубен ако излезете сега. Сигурни ли сте, че искате да напуснете?')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="dark:bg-slate-700 dark:text-gray-200 dark:hover:bg-slate-600">
            {language === 'English' ? 'Cancel' : 'Отказ'}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              const storageKey = `exam_progress_${examType}_${mode}_${tier}`;
              localStorage.removeItem(storageKey);
              onBackToHome();
            }}
            className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
          >
            {language === 'English' ? 'Exit' : 'Излез'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    {/* Submit Exam Dialog */}
    <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
      <AlertDialogContent className="dark:bg-slate-800">
        <AlertDialogHeader>
          <AlertDialogTitle className="dark:text-gray-100">{t.submitExamTitle || (language === 'English' ? 'Submit Exam?' : 'Подаване на изпита?')}</AlertDialogTitle>
          <AlertDialogDescription className="dark:text-gray-300">
            {t.submitExamMessage || (language === 'English' 
              ? 'Once you submit, you cannot change your answers. Are you ready to submit your exam?' 
              : 'След като подадете, не можете да промените отговорите си. Готови ли сте да подадете изпита?')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="dark:bg-slate-700 dark:text-gray-200 dark:hover:bg-slate-600">
            {language === 'English' ? 'Cancel' : 'Отказ'}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              setShowSubmitDialog(false);
              setShowResults(true);
              // Clear exam progress from localStorage when submitted
              const storageKey = `exam_progress_${examType}_${mode}_${tier}`;
              localStorage.removeItem(storageKey);
            }}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
          >
            {language === 'English' ? 'Submit' : 'П��дай'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
