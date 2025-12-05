import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { ScrollArea } from './ui/scroll-area';
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
import { toast } from 'sonner@2.0.3';
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
  const { accessToken, user } = useAuth();
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
  const [timeRemaining, setTimeRemaining] = useState(60 * 60); // 60 minutes in seconds
  const [showAnswerFeedback, setShowAnswerFeedback] = useState(false);
  const [examStarted, setExamStarted] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);

  // Load questions based on tier
  useEffect(() => {
    const loadQuestions = async () => {
      if (tier === 'paid') {
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
            
            return {
              id: index + 1,
              question: q.questionText,
              answers: [q.answerA, q.answerB, q.answerC, q.answerD],
              correctAnswer: isMultiple ? correctAnswersArray[0] : correctAnswersArray[0], // Single answer (always set)
              correctAnswers: isMultiple ? correctAnswersArray : undefined, // Only set for multiple answers
              points: q.difficulty || 1, // Default to 1 if difficulty not set
              image: q.imageUrl,
            };
          });

          console.log(`[ExamPage] Successfully converted ${dbQuestions.length} questions`);
          console.log('[ExamPage] Sample question structure:', dbQuestions[0]);
          setExamQuestions(dbQuestions);
          setLoadingQuestions(false);
        } catch (error: any) {
          console.error('[ExamPage] Failed to load questions:', error);
          const errorMsg = error.message || 'Failed to load questions';
          
          // Provide helpful error messages
          if (errorMsg.includes('Subscription required')) {
            setQuestionLoadError('You need an active subscription for this exam type. Please purchase access or contact support.');
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
            
            return {
              id: index + 1,
              question: q.questionText,
              answers: [q.answerA, q.answerB, q.answerC, q.answerD],
              correctAnswer: isMultiple ? correctAnswersArray[0] : correctAnswersArray[0], // Single answer (always set)
              correctAnswers: isMultiple ? correctAnswersArray : undefined, // Only set for multiple answers
              points: q.difficulty || 1, // Default to 1 if difficulty not set
              image: q.imageUrl,
            };
          });

          console.log(`[ExamPage] Successfully converted ${dbQuestions.length} mock questions`);
          setExamQuestions(dbQuestions);
          setLoadingQuestions(false);
        } catch (error: any) {
          console.error('[ExamPage] Failed to load mock questions:', error);
          console.error('[ExamPage] Error details:', {
            message: error.message,
            stack: error.stack,
            examType,
          });
          
          // Show error - no fallback to demo questions
          const errorMsg = error.message || 'Failed to load questions';
          setQuestionLoadError(`Error loading questions: ${errorMsg}. Please try again or contact support.`);
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
  const MAX_POINTS_LOSS = 6;
  
  // Early safety check - must happen before using currentQuestion
  const hasValidQuestion = examQuestions && examQuestions.length > 0 && currentQuestion;
  
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

  const jumpToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
    setShowAnswerFeedback(false);
  };

  const calculateResults = () => {
    let totalPointsLost = 0;
    let correctCount = 0;

    examQuestions.forEach((question, index) => {
      const answer = answeredQuestions[index];
      if (answer) {
        totalPointsLost += answer.pointsLost;
        if (answer.isCorrect) correctCount++;
      } else {
        // Unanswered questions lose full points
        totalPointsLost += question.points;
      }
    });

    return { totalPointsLost, correctCount };
  };

  if (showResults) {
    const { totalPointsLost, correctCount } = calculateResults();
    const passed = totalPointsLost <= MAX_POINTS_LOSS;
    const percentage = Math.round((correctCount / totalQuestions) * 100);

    return (
      <>
        <Navigation 
          currentPage="exam"
          onNavigate={handleNavigate}
          isLoggedIn={!!user}
        />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pt-24 pb-8 px-4">
        <div className="container mx-auto max-w-3xl">
          <Card className="border-2 shadow-2xl dark:bg-slate-700 dark:border-slate-600">
            <CardHeader className="text-center bg-gradient-to-br from-slate-50 to-white dark:from-slate-600 dark:to-slate-700 pb-4 pt-6">
              <div className="mb-3">
                {passed ? (
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto drop-shadow-lg" />
                ) : (
                  <XCircle className="w-16 h-16 text-red-500 mx-auto drop-shadow-lg" />
                )}
              </div>
              <CardTitle className="mb-2 text-xl dark:text-gray-100">
                {t.examResults}
              </CardTitle>
              <CardDescription className="text-lg font-bold">
                {passed ? (
                  <span className="text-green-600 dark:text-green-400">{t.passed}! 🎉</span>
                ) : (
                  <span className="text-red-600 dark:text-red-400">{t.notPassed}</span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/30 dark:to-slate-700 border-2 dark:border-slate-600">
                  <CardContent className="pt-4 pb-4 text-center">
                    <p className="text-xs text-gray-600 dark:text-gray-300 mb-1">{t.yourScore}</p>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{percentage}%</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{correctCount} {t.of} {totalQuestions} {t.correctAnswers.toLowerCase()}</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/30 dark:to-slate-700 border-2 dark:border-slate-600">
                  <CardContent className="pt-4 pb-4 text-center">
                    <p className="text-xs text-gray-600 dark:text-gray-300 mb-1">{t.pointsLost}</p>
                    <p className={`text-3xl font-bold ${passed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {totalPointsLost}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t.maximum}: {MAX_POINTS_LOSS}</p>
                  </CardContent>
                </Card>
              </div>

              {mode === 'exam' && (
                <Card className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-600 dark:to-slate-700 border-2 dark:border-slate-600">
                  <CardContent className="pt-4 pb-4 text-center">
                    <p className="text-xs text-gray-600 dark:text-gray-300 mb-1">{t.timeUsed}</p>
                    <p className="text-xl font-bold text-gray-700 dark:text-gray-200">{formatTime(60 * 60 - timeRemaining)}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t.of} 60:00</p>
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
                    className="flex-1 shadow-md border-blue-500 text-blue-600 hover:bg-blue-50"
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
                    className="flex-1 shadow-md border-teal-500 text-teal-600 hover:bg-teal-50"
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
                    // Clear localStorage
                    const storageKey = `exam_progress_${examType}_${mode}_${tier}`;
                    localStorage.removeItem(storageKey);
                  }}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Take New Exam (Same Type)
                </Button>
              </div>

              {tier === 'mock' && onNeedPayment && (
                <Alert className="border-sky-500 bg-sky-50">
                  <AlertCircle className="text-sky-600" />
                  <AlertDescription className="text-sky-800">
                    {t.wantToUpgrade} {t.upgradeMessage}
                    <Button 
                      onClick={onNeedPayment} 
                      variant="link" 
                      className="text-sky-700 font-bold pl-2"
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
    const { totalPointsLost, correctCount } = calculateResults();
    
    return (
      <>
        <Navigation 
          currentPage="exam"
          onNavigate={handleNavigate}
          isLoggedIn={!!user}
        />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pt-24 pb-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t.reviewAnswers}</h2>
            <Button onClick={onBackToHome} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t.backToExams}
            </Button>
          </div>
          
          <div className="mb-6">
            <Card className="border-2 shadow-md">
              <CardContent className="pt-4 pb-4">
                <div className="flex justify-around items-center">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">{t.yourScore}</p>
                    <p className="text-2xl font-bold text-blue-600">{Math.round((correctCount / totalQuestions) * 100)}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">{t.correctAnswers}</p>
                    <p className="text-2xl font-bold text-green-600">{correctCount}/{totalQuestions}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">{t.pointsLost}</p>
                    <p className={`text-2xl font-bold ${totalPointsLost <= MAX_POINTS_LOSS ? 'text-green-600' : 'text-red-600'}`}>
                      {totalPointsLost}/{MAX_POINTS_LOSS}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-4">
            {examQuestions.map((question, index) => {
              const answer = answeredQuestions[index];
              const isMultiQuestion = question.correctAnswers && question.correctAnswers.length > 1;
              const userAnswer = answer?.answer;
              const isCorrect = answer?.isCorrect ?? false;
              
              return (
                <Card key={index} className={`border-2 ${isCorrect ? 'border-green-200 bg-green-50/30' : 'border-red-200 bg-red-50/30'}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            {t.question} {index + 1}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {question.points} {question.points === 1 ? t.point : t.points}
                          </Badge>
                          <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                            {t.selectMultipleAnswers.replace('{count}', (question.correctAnswers?.length || 1).toString())}
                          </Badge>
                        </div>
                        <CardTitle className="text-base">{question.question}</CardTitle>
                      </div>
                      {isCorrect ? (
                        <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {question.image && (
                      <div className="rounded-lg overflow-hidden shadow-lg border-2 mb-3">
                        <ImageWithFallback
                          src={question.image}
                          alt="Question illustration"
                          className="w-full h-40 object-cover"
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
                          className={`p-3 rounded-lg border-2 flex items-center gap-2 ${
                            isCorrectAnswer
                              ? 'border-green-500 bg-green-50 dark:bg-green-900/30 dark:border-green-600'
                              : isUserAnswer
                              ? 'border-red-500 bg-red-50 dark:bg-red-900/30 dark:border-red-600'
                              : 'border-gray-200 bg-white dark:bg-slate-700 dark:border-gray-600'
                          }`}
                        >
                          {isMultiQuestion ? (
                            <Checkbox checked={isUserAnswer || isCorrectAnswer} disabled />
                          ) : (
                            <div className={`size-4 shrink-0 rounded-full border-2 flex items-center justify-center ${
                              isUserAnswer || isCorrectAnswer 
                                ? 'border-gray-900 dark:border-gray-100' 
                                : 'border-gray-300 dark:border-gray-600'
                            }`}>
                              {(isUserAnswer || isCorrectAnswer) && (
                                <div className="size-2 rounded-full bg-gray-900 dark:bg-gray-100" />
                              )}
                            </div>
                          )}
                          <span className="flex-1 text-sm dark:text-gray-200">{ans}</span>
                          {isCorrectAnswer && <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />}
                          {isUserAnswer && !isCorrectAnswer && <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />}
                        </div>
                      );
                    })}
                    
                    {!isCorrect && (
                      <Alert className="border-red-200 bg-red-50 mt-3">
                        <AlertCircle className="text-red-600" />
                        <AlertDescription className="text-red-800 text-sm">
                          <strong>{t.incorrect}</strong> -{answer?.pointsLost || question.points} {t.points.toLowerCase()}
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
              className="flex-1 shadow-md"
            >
              {t.retakeExam}
            </Button>
            <Button
              onClick={onBackToHome}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg"
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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pt-20">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6 flex flex-col items-center space-y-4">
              <LoadingSpinner size="lg" />
              <h3 className="text-xl dark:text-gray-100">
                {language === 'English' ? 'Loading exam questions...' : 'Зареждане на въпроси...'}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                {language === 'English' 
                  ? 'Please wait while we prepare your exam' 
                  : 'Моля, изчакайте, докато подготвяме вашия изпит'}
              </p>
            </CardContent>
          </Card>
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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 px-4 pt-20">
        <Card className="max-w-lg w-full border-red-200 dark:border-red-800">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center justify-center">
              <XCircle className="w-16 h-16 text-red-500" />
            </div>
            <h3 className="text-xl text-center dark:text-gray-100">
              {language === 'English' ? 'Failed to Load Questions' : 'Грешка при зареждане'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              {questionLoadError}
            </p>
            
            {questionLoadError.includes('No questions') && (
              <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-700">
                <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertDescription className="text-blue-800 dark:text-blue-200 text-sm">
                  <strong className="block mb-1">💡 Need to import questions?</strong>
                  <p className="text-xs">
                    Go to the Admin Panel &gt; Diagnostics tab to check the database status and import questions.
                  </p>
                </AlertDescription>
              </Alert>
            )}
            
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
              {questionLoadError.includes('No questions') && (
                <Button 
                  onClick={() => window.location.href = '/admin'} 
                  variant="outline"
                  className="w-full border-blue-500 text-blue-600 hover:bg-blue-50"
                >
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {language === 'English' ? 'Open Admin Diagnostics' : 'Отвори диагностика'}
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pt-28 pb-6 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              onClick={() => setShowExitDialog(true)} 
              variant="ghost" 
              className="hover:bg-red-100 text-red-600 hover:text-red-700"
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
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t.exitExamTitle}</AlertDialogTitle>
              <AlertDialogDescription>
                {t.exitExamMessage}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t.continueExam}</AlertDialogCancel>
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
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t.submitExamTitle}</AlertDialogTitle>
              <AlertDialogDescription>
                {t.submitExamMessage}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t.cancelSubmit}</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => {
                  setShowSubmitDialog(false);
                  setShowResults(true);
                }}
                className="bg-cyan-600 hover:bg-cyan-700"
              >
                {t.confirmSubmit}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {t.question} {currentQuestionIndex + 1} {t.of} {totalQuestions}
            </span>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{Math.round(progress)}% {t.complete}</span>
          </div>
          <Progress value={progress} className="h-2 shadow-sm" />
        </div>

        <Card className="mb-4 border-2 shadow-xl bg-white dark:bg-slate-700 dark:border-slate-600">
          <CardHeader className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-600 dark:to-slate-700 pb-2 pt-4 px-3 md:px-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-4">
              <CardTitle className="flex-1 text-base md:text-lg dark:text-gray-100 max-h-[120px] overflow-y-auto">{currentQuestion.question}</CardTitle>
              <div className="flex flex-row md:flex-col gap-2 md:gap-1.5 md:items-end flex-shrink-0">
                <Badge variant="outline" className="shadow-sm text-xs dark:border-gray-500 dark:text-gray-200">
                  {currentQuestion.points} {currentQuestion.points === 1 ? t.point : t.points}
                </Badge>
                <Badge className="shadow-md text-xs bg-blue-600 text-white dark:bg-blue-500 dark:text-white whitespace-nowrap border-blue-700 dark:border-blue-400">
                  {t.selectMultipleAnswers.replace('{count}', (currentQuestion.correctAnswers?.length || 1).toString())}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 pt-2 px-3 md:px-6">
            {currentQuestion.image && (
              <div className="rounded-lg overflow-hidden shadow-lg border-2 bg-gray-50 dark:bg-gray-900 p-4 mb-2">
                <ImageWithFallback
                  src={currentQuestion.image}
                  alt="Question illustration"
                  className="w-full max-h-52 object-contain mx-auto"
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
                      className={`flex items-center space-x-3 p-2 md:p-3 rounded-lg border-2 transition-all shadow-sm ${
                        showCorrect 
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/30 shadow-md' 
                          : showWrong 
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/30 shadow-md' 
                          : isSelected
                          ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-500'
                          : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-blue-200 dark:hover:border-blue-500'
                      } cursor-pointer`}
                      onClick={() => !(mode === 'study' && showAnswerFeedback) && handleMultipleAnswerToggle(index)}
                    >
                      <Checkbox 
                        id={`answer-${index}`}
                        checked={isSelected}
                        onCheckedChange={() => handleMultipleAnswerToggle(index)}
                        disabled={mode === 'study' && showAnswerFeedback}
                      />
                      <Label htmlFor={`answer-${index}`} className="flex-1 cursor-pointer text-xs md:text-sm dark:text-gray-200 max-h-[100px] overflow-y-auto">
                        {answer}
                      </Label>
                      {showCorrect && <CheckCircle className="w-5 h-5 text-green-600" />}
                      {showWrong && <XCircle className="w-5 h-5 text-red-600" />}
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
                      className={`flex items-center p-3 md:p-4 rounded-lg border-2 transition-all shadow-sm ${
                        showCorrect 
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/30 shadow-md' 
                          : showWrong 
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/30 shadow-md' 
                          : isSelected
                          ? 'border-blue-500 bg-blue-100 dark:bg-blue-900/40 dark:border-blue-400 shadow-md'
                          : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-blue-300 dark:hover:border-blue-500'
                      } ${mode === 'study' && showAnswerFeedback ? 'cursor-default' : 'cursor-pointer'}`}
                    >
                      <span className="flex-1 text-xs md:text-sm dark:text-gray-200 max-h-[100px] overflow-y-auto">
                        {answer}
                      </span>
                      {showCorrect && <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 ml-3" />}
                      {showWrong && <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 ml-3" />}
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
                    <span><strong>{t.correct}</strong> {t.noPointsLost}</span>
                  ) : (
                    <span><strong>{t.incorrect}</strong> -{answeredData?.pointsLost} {t.pointsLostMessage}</span>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-between gap-2 mb-4">
          <Button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            variant="outline"
            className="shadow-md"
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
            onClick={() => setShowSubmitDialog(true)}
            variant="outline"
            className="shadow-md border-cyan-500 text-cyan-700 hover:bg-cyan-50 dark:border-cyan-600 dark:text-cyan-400 dark:hover:bg-cyan-900/30"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            {t.submitExam}
          </Button>
        </div>

        <Card className="border-2 shadow-xl dark:bg-slate-700 dark:border-slate-600">
          <CardHeader className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-600 dark:to-slate-700 pb-2 pt-3">
            <CardTitle className="text-center text-sm dark:text-gray-100">{t.questionNavigator}</CardTitle>
          </CardHeader>
          <CardContent className="pt-2 pb-3">
            <ScrollArea className="h-[190px]">
              <div className="grid grid-cols-10 gap-1 pr-2 p-1">
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
                              className={`relative w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center overflow-hidden ${
                                isCurrentQuestion
                                  ? 'bg-blue-500 text-white border-blue-500 shadow-md ring-2 ring-blue-300 dark:ring-blue-400'
                                  : answer?.isCorrect
                                  ? 'bg-green-500 border-green-600 hover:bg-green-600 text-white'
                                  : answer
                                  ? 'bg-red-500 border-red-600 hover:bg-red-600 text-white'
                                  : 'bg-white dark:bg-gray-600 border-gray-400 dark:border-gray-500 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 text-gray-700 dark:text-gray-200'
                              }`}
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
                              <span className={`relative z-10 text-xs font-bold ${isCurrentQuestion || answer ? 'text-white drop-shadow-md' : 'text-gray-800 dark:text-gray-100'}`}>
                                {index + 1}
                              </span>
                            </button>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <p className="text-xs font-medium">Q{index + 1}: {q.question.substring(0, 60)}{q.question.length > 60 ? '...' : ''}</p>
                          <p className="text-xs text-gray-500 mt-1">{q.points} {q.points === 1 ? t.point : t.points}</p>
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
            </ScrollArea>
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
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-400 bg-white dark:bg-gray-600"></div>
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
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-400 bg-white dark:bg-gray-600"></div>
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
            {language === 'English' ? 'Submit' : 'Подай'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
