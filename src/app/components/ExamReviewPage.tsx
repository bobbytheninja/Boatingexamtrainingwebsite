import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  XCircle, 
  Home, 
  AlertCircle
} from 'lucide-react';
import { ExamType, examData, Question } from '../data/examQuestions';
import { ExamMode, ExamTier } from './ExamModeSelection';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Language, getTranslation } from '../data/translations';
import { useDarkMode } from '../contexts/DarkModeContext';

interface AnswerData {
  answer: number | number[];
  isCorrect: boolean;
  pointsLost: number;
}

interface ExamReviewPageProps {
  examType: ExamType;
  mode: ExamMode;
  tier: ExamTier;
  examQuestions: Question[];
  answeredQuestions: Record<number, AnswerData>;
  onBackToHome: () => void;
  language: Language;
}

export function ExamReviewPage({ 
  examType, 
  mode, 
  tier, 
  examQuestions, 
  answeredQuestions, 
  onBackToHome,
  language 
}: ExamReviewPageProps) {
  const t = getTranslation(language);
  const { darkMode } = useDarkMode();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const currentQuestion = examQuestions[currentQuestionIndex];
  const totalQuestions = examQuestions.length;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;
  
  const isMultipleChoice = currentQuestion.correctAnswers && currentQuestion.correctAnswers.length > 1;
  const answeredData = answeredQuestions[currentQuestionIndex];
  
  // Get user's answer for current question
  const userAnswer = answeredData?.answer;
  const isCorrect = answeredData?.isCorrect ?? false;

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Last question, go back home
      onBackToHome();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  return (
    <div 
      className="min-h-screen pt-28 pb-6 px-4 transition-all duration-[400ms]"
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
              onClick={onBackToHome} 
              variant="ghost" 
              className="hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 hover:text-red-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t.backToHome}
            </Button>
            <Badge 
              variant="secondary" 
              className="px-3 py-1 flex items-center gap-1.5 shadow-sm"
            >
              {t.reviewAnswers}
            </Badge>
          </div>
        </div>

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
                {isCorrect ? (
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 mt-1" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-600 dark:text-red-400 mt-1" />
                )}
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
                  const isUserAnswer = Array.isArray(userAnswer) && userAnswer.includes(index);
                  const isCorrectAnswer = currentQuestion.correctAnswers?.includes(index);

                  return (
                    <div
                      key={index}
                      className={`flex items-center space-x-3 p-3 rounded-lg border-2 shadow-sm transition-all duration-300 ${
                        isCorrectAnswer 
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/30 shadow-green-200/50 dark:shadow-green-900/30' 
                          : isUserAnswer 
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/30 shadow-red-200/50 dark:shadow-red-900/30' 
                          : 'border-slate-300 dark:border-gray-600 bg-white dark:bg-slate-600'
                      }`}
                    >
                      <Checkbox 
                        checked={isUserAnswer || isCorrectAnswer} 
                        disabled 
                        className="pointer-events-none"
                      />
                      <Label className="flex-1 text-sm text-slate-700 dark:text-gray-200 max-h-[100px] overflow-y-auto font-medium">
                        {answer}
                      </Label>
                      {isCorrectAnswer && <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 animate-in fade-in zoom-in duration-300" />}
                      {isUserAnswer && !isCorrectAnswer && <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 animate-in fade-in zoom-in duration-300" />}
                    </div>
                  );
                })}
              </div>
            ) : (
              <RadioGroup value={typeof userAnswer === 'number' ? userAnswer.toString() : ''} disabled>
                <div className="space-y-2">
                  {currentQuestion.answers.map((answer, index) => {
                    const isUserAnswer = userAnswer === index;
                    const isCorrectAnswer = index === currentQuestion.correctAnswer;

                    return (
                      <div
                        key={index}
                        className={`flex items-center space-x-3 p-3 rounded-lg border-2 shadow-sm ${
                          isCorrectAnswer 
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/30' 
                            : isUserAnswer 
                            ? 'border-red-500 bg-red-50 dark:bg-red-900/30' 
                            : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-slate-600'
                        }`}
                      >
                        <RadioGroupItem 
                          value={index.toString()} 
                          id={`answer-${index}`}
                          checked={isUserAnswer || isCorrectAnswer}
                          disabled
                          className="pointer-events-none"
                        />
                        <Label htmlFor={`answer-${index}`} className="flex-1 text-sm dark:text-gray-200 max-h-[100px] overflow-y-auto">
                          {answer}
                        </Label>
                        {isCorrectAnswer && <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />}
                        {isUserAnswer && !isCorrectAnswer && <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />}
                      </div>
                    );
                  })}
                </div>
              </RadioGroup>
            )}

            <Alert className={`${isCorrect ? 'border-green-500 bg-green-50 dark:bg-green-900/30' : 'border-red-500 bg-red-50 dark:bg-red-900/30'} shadow-lg`}>
              <AlertCircle className={isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'} />
              <AlertDescription className={isCorrect ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}>
                {isCorrect ? (
                  <span><strong>{t.correct}</strong> - {t.noPointsLost || 'No points lost'}</span>
                ) : (
                  <span><strong>{t.incorrect}</strong> - {answeredData?.pointsLost || currentQuestion.points} {t.points.toLowerCase()} {t.pointsLostMessage || 'lost'}</span>
                )}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <div className="flex justify-between gap-4">
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
            onClick={handleNext}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg"
          >
            {currentQuestionIndex === totalQuestions - 1 ? (
              <>
                <Home className="w-4 h-4 mr-2" />
                {t.backToHome}
              </>
            ) : (
              <>
                {t.next}
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}