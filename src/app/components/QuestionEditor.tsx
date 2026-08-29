import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { ChevronLeft, Save, Search, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useDarkMode } from '../contexts/DarkModeContext';
import { projectId } from '../utils/supabase/info';
import { toast } from 'sonner';
import { ButtonSpinner, LoadingSpinner } from './LoadingSpinner';

interface Question {
  questionNumber: number;
  questionText: string;
  answerA: string;
  answerB: string;
  answerC: string;
  answerD: string;
  correctAnswer: string;
  examType: string;
  imageUrl?: string;
}

interface QuestionEditorProps {
  accessToken: string;
}

const ANSWER_LABELS = ['A', 'B', 'C', 'D'] as const;

export function QuestionEditor({ accessToken }: QuestionEditorProps) {
  const { darkMode } = useDarkMode();

  const [categories, setCategories] = useState<{ type: string; name: string }[]>([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [draftQuestion, setDraftQuestion] = useState<Question | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<{ ok: boolean; msg: string } | null>(null);

  // Load categories
  useEffect(() => {
    fetch(`https://${projectId}.supabase.co/functions/v1/make-server-d36f8f91/categories`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.categories?.length) setCategories(data.categories);
      })
      .catch(() => {});
  }, [accessToken]);

  const loadQuestions = useCallback(async (examType: string) => {
    setLoadingQuestions(true);
    setLoadError('');
    setQuestions([]);
    setEditingQuestion(null);
    setDraftQuestion(null);
    setSaveResult(null);
    try {
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d36f8f91/questions/${examType}/all`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `Error ${res.status}`);
      setQuestions(data.questions || []);
    } catch (err: any) {
      setLoadError(err.message);
    } finally {
      setLoadingQuestions(false);
    }
  }, [accessToken]);

  const handleSelectExam = (examType: string) => {
    setSelectedExam(examType);
    if (examType) loadQuestions(examType);
  };

  const openEditor = (q: Question) => {
    setEditingQuestion(q);
    setDraftQuestion({ ...q });
    setSaveResult(null);
  };

  const closeEditor = () => {
    setEditingQuestion(null);
    setDraftQuestion(null);
    setSaveResult(null);
  };

  const handleSave = async () => {
    if (!draftQuestion) return;
    setSaving(true);
    setSaveResult(null);
    try {
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d36f8f91/questions/${draftQuestion.examType}/${draftQuestion.questionNumber}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            questionText: draftQuestion.questionText,
            answerA: draftQuestion.answerA,
            answerB: draftQuestion.answerB,
            answerC: draftQuestion.answerC,
            answerD: draftQuestion.answerD,
            correctAnswer: draftQuestion.correctAnswer,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `Error ${res.status}`);

      // Update the local list
      setQuestions(prev => prev.map(q =>
        q.questionNumber === draftQuestion.questionNumber ? { ...q, ...data.question } : q
      ));
      setEditingQuestion({ ...draftQuestion });
      setSaveResult({ ok: true, msg: 'Question saved successfully.' });
      toast.success(`Question ${draftQuestion.questionNumber} saved`);
    } catch (err: any) {
      setSaveResult({ ok: false, msg: err.message });
      toast.error(`Save failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const card = (children: React.ReactNode) => (
    <Card style={{ background: darkMode ? '#1e293b' : '#ffffff', borderColor: darkMode ? '#334155' : '#e2e8f0' }}>
      {children}
    </Card>
  );

  const inputStyle = { background: darkMode ? '#0f172a' : '#ffffff', borderColor: darkMode ? '#475569' : '#d1d5db', color: darkMode ? '#f3f4f6' : '#111827' };
  const labelStyle = { color: darkMode ? '#e2e8f0' : '#374151' };
  const textStyle = { color: darkMode ? '#f3f4f6' : '#111827' };
  const mutedStyle = { color: darkMode ? '#94a3b8' : '#6b7280' };

  // Filtered questions
  const filtered = questions.filter(q => {
    if (!searchQuery.trim()) return true;
    const s = searchQuery.toLowerCase();
    return (
      String(q.questionNumber).includes(s) ||
      q.questionText.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6">
      {/* Exam selector */}
      {card(
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
            <div className="flex-1">
              <Label style={labelStyle} className="mb-1.5 block text-sm font-medium">Exam Category</Label>
              <select
                value={selectedExam}
                onChange={e => handleSelectExam(e.target.value)}
                className="w-full rounded-md border px-3 py-2 text-sm transition-colors"
                style={inputStyle}
              >
                <option value="">— Select an exam —</option>
                {categories.map(cat => (
                  <option key={cat.type} value={cat.type}>{cat.name}</option>
                ))}
              </select>
            </div>
            {selectedExam && questions.length > 0 && (
              <p className="text-sm pb-2" style={mutedStyle}>{questions.length} questions loaded</p>
            )}
          </div>
        </CardContent>
      )}

      {/* Loading / error */}
      {loadingQuestions && (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      )}
      {loadError && (
        <Alert style={{ background: darkMode ? 'rgba(127,29,29,0.2)' : '#fef2f2', borderColor: darkMode ? '#991b1b' : '#ef4444' }}>
          <AlertCircle className="h-4 w-4" style={{ color: darkMode ? '#f87171' : '#dc2626' }} />
          <AlertDescription style={{ color: darkMode ? '#fca5a5' : '#7f1d1d' }}>{loadError}</AlertDescription>
        </Alert>
      )}

      {/* Editor panel */}
      {editingQuestion && draftQuestion && (
        <Card style={{ background: darkMode ? '#1e293b' : '#ffffff', borderColor: darkMode ? '#0ea5e9' : '#38bdf8', borderWidth: 2 }}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2" style={textStyle}>
                <button onClick={closeEditor} className="p-1 rounded hover:opacity-70">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                Editing Question #{draftQuestion.questionNumber}
              </CardTitle>
              <button onClick={closeEditor} className="p-1 rounded hover:opacity-70" style={mutedStyle}>
                <X className="w-4 h-4" />
              </button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Question text */}
            <div>
              <Label style={labelStyle} className="mb-1.5 block text-sm font-medium">Question Text</Label>
              <textarea
                value={draftQuestion.questionText}
                onChange={e => setDraftQuestion(prev => prev ? { ...prev, questionText: e.target.value } : prev)}
                rows={3}
                className="w-full rounded-md border px-3 py-2 text-sm resize-y"
                style={inputStyle}
              />
            </div>

            {/* Answers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ANSWER_LABELS.map(letter => {
                const key = `answer${letter}` as keyof Question;
                const isCorrect = draftQuestion.correctAnswer === letter;
                return (
                  <div key={letter}>
                    <Label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium" style={labelStyle}>
                      <span
                        className="inline-flex items-center justify-center w-5 h-5 rounded text-xs font-bold"
                        style={{
                          background: isCorrect ? '#16a34a' : (darkMode ? '#334155' : '#e5e7eb'),
                          color: isCorrect ? '#ffffff' : (darkMode ? '#e2e8f0' : '#374151'),
                        }}
                      >{letter}</span>
                      Answer {letter}
                      {isCorrect && <span className="text-xs text-green-500 ml-1">✓ correct</span>}
                    </Label>
                    <Input
                      value={draftQuestion[key] as string}
                      onChange={e => setDraftQuestion(prev => prev ? { ...prev, [key]: e.target.value } : prev)}
                      style={inputStyle}
                      className="text-sm"
                    />
                  </div>
                );
              })}
            </div>

            {/* Correct answer picker */}
            <div>
              <Label style={labelStyle} className="mb-1.5 block text-sm font-medium">Correct Answer</Label>
              <div className="flex gap-2">
                {ANSWER_LABELS.map(letter => (
                  <button
                    key={letter}
                    onClick={() => setDraftQuestion(prev => prev ? { ...prev, correctAnswer: letter } : prev)}
                    className="flex-1 py-2 rounded-md text-sm font-bold border-2 transition-all"
                    style={{
                      borderColor: draftQuestion.correctAnswer === letter ? '#16a34a' : (darkMode ? '#475569' : '#e5e7eb'),
                      background: draftQuestion.correctAnswer === letter ? '#16a34a' : (darkMode ? '#1e293b' : '#ffffff'),
                      color: draftQuestion.correctAnswer === letter ? '#ffffff' : (darkMode ? '#e2e8f0' : '#374151'),
                    }}
                  >{letter}</button>
                ))}
              </div>
            </div>

            {/* Save button + result */}
            {saveResult && (
              <Alert style={{
                background: saveResult.ok ? (darkMode ? 'rgba(22,101,52,0.2)' : '#f0fdf4') : (darkMode ? 'rgba(127,29,29,0.2)' : '#fef2f2'),
                borderColor: saveResult.ok ? (darkMode ? '#166534' : '#22c55e') : (darkMode ? '#991b1b' : '#ef4444'),
              }}>
                {saveResult.ok
                  ? <CheckCircle className="h-4 w-4" style={{ color: darkMode ? '#4ade80' : '#16a34a' }} />
                  : <AlertCircle className="h-4 w-4" style={{ color: darkMode ? '#f87171' : '#dc2626' }} />}
                <AlertDescription style={{ color: saveResult.ok ? (darkMode ? '#86efac' : '#166534') : (darkMode ? '#fca5a5' : '#7f1d1d') }}>
                  {saveResult.msg}
                </AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-sky-600 hover:bg-sky-700 text-white"
            >
              {saving ? <><ButtonSpinner /> Saving…</> : <><Save className="w-4 h-4 mr-2" /> Save Question</>}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Question list */}
      {!loadingQuestions && questions.length > 0 && (
        <Card style={{ background: darkMode ? '#1e293b' : '#ffffff', borderColor: darkMode ? '#334155' : '#e2e8f0' }}>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <CardTitle className="text-base" style={textStyle}>All Questions</CardTitle>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5" style={mutedStyle} />
                <Input
                  placeholder="Search by number or text…"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-8 text-sm"
                  style={inputStyle}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y" style={{ borderColor: darkMode ? '#334155' : '#f1f5f9' }}>
              {filtered.length === 0 ? (
                <p className="text-center py-8 text-sm" style={mutedStyle}>No questions match your search.</p>
              ) : (
                filtered.map(q => {
                  const isActive = editingQuestion?.questionNumber === q.questionNumber;
                  return (
                    <button
                      key={q.questionNumber}
                      onClick={() => isActive ? closeEditor() : openEditor(q)}
                      className="w-full text-left px-4 py-3 flex items-start gap-3 transition-colors duration-150 hover:bg-opacity-60"
                      style={{
                        background: isActive
                          ? (darkMode ? 'rgba(14,165,233,0.15)' : '#e0f2fe')
                          : 'transparent',
                      }}
                    >
                      {/* Question number badge */}
                      <span
                        className="shrink-0 inline-flex items-center justify-center w-9 h-7 rounded text-xs font-bold mt-0.5"
                        style={{
                          background: isActive ? '#0ea5e9' : (darkMode ? '#334155' : '#e5e7eb'),
                          color: isActive ? '#ffffff' : (darkMode ? '#e2e8f0' : '#374151'),
                        }}
                      >#{q.questionNumber}</span>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm leading-snug line-clamp-2" style={textStyle}>{q.questionText}</p>
                        <div className="flex flex-wrap gap-x-3 mt-1">
                          {ANSWER_LABELS.map(letter => (
                            <span key={letter} className="text-xs" style={{
                              color: q.correctAnswer === letter ? '#16a34a' : (darkMode ? '#64748b' : '#9ca3af'),
                              fontWeight: q.correctAnswer === letter ? 700 : 400,
                            }}>
                              {letter}: {q[`answer${letter}` as keyof Question] as string}
                              {q.correctAnswer === letter && ' ✓'}
                            </span>
                          ))}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {!loadingQuestions && selectedExam && questions.length === 0 && !loadError && (
        <p className="text-center py-8 text-sm" style={mutedStyle}>No questions found for this exam.</p>
      )}
    </div>
  );
}
