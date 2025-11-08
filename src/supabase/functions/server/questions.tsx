import * as kv from "./kv_store.tsx";

export interface Question {
  id: string;
  questionNumber?: number;
  examType: string;
  questionText: string;
  answerA: string;
  answerB: string;
  answerC: string;
  answerD: string;
  correctAnswer: string; // 'a', 'b', 'c', 'd', or multiple like 'a,b'
  difficulty: 1 | 2 | 3;
  imageUrl?: string;
  language?: string;
}

// Get all question IDs for an exam type
export async function getQuestionIds(examType: string): Promise<string[]> {
  const index = await kv.get(`questions_index:${examType}`);
  return index || [];
}

// Get a specific question
export async function getQuestion(questionId: string): Promise<Question | null> {
  return await kv.get(`question:${questionId}`);
}

// Get multiple questions at once
export async function getQuestions(questionIds: string[]): Promise<Question[]> {
  const keys = questionIds.map(id => `question:${id}`);
  const questions = await kv.mget(keys);
  return questions.filter(q => q !== null) as Question[];
}

// Get random questions for an exam
export async function getRandomQuestions(
  examType: string, 
  count: number = 40
): Promise<Question[]> {
  const allIds = await getQuestionIds(examType);
  
  if (allIds.length === 0) {
    return [];
  }

  // Shuffle and take the requested number
  const shuffled = [...allIds].sort(() => Math.random() - 0.5);
  const selectedIds = shuffled.slice(0, Math.min(count, shuffled.length));
  
  return await getQuestions(selectedIds);
}

// Save a question (for admin/import purposes)
export async function saveQuestion(question: Question): Promise<void> {
  await kv.set(`question:${question.id}`, question);
  
  // Update index
  const currentIndex = await getQuestionIds(question.examType);
  if (!currentIndex.includes(question.id)) {
    await kv.set(`questions_index:${question.examType}`, [...currentIndex, question.id]);
  }
}

// Save multiple questions at once (bulk import)
export async function saveQuestions(questions: Question[]): Promise<void> {
  // Group questions by exam type
  const byExamType: Record<string, Question[]> = {};
  
  for (const question of questions) {
    if (!byExamType[question.examType]) {
      byExamType[question.examType] = [];
    }
    byExamType[question.examType].push(question);
  }

  // Save all questions
  const keys = questions.map(q => `question:${q.id}`);
  await kv.mset(keys, questions);

  // Update indices for each exam type
  for (const [examType, questionsOfType] of Object.entries(byExamType)) {
    const currentIndex = await getQuestionIds(examType);
    const newIds = questionsOfType.map(q => q.id).filter(id => !currentIndex.includes(id));
    
    if (newIds.length > 0) {
      await kv.set(`questions_index:${examType}`, [...currentIndex, ...newIds]);
    }
  }
}

// Get question count for an exam type
export async function getQuestionCount(examType: string): Promise<number> {
  const ids = await getQuestionIds(examType);
  return ids.length;
}

// Delete a question
export async function deleteQuestion(questionId: string): Promise<void> {
  const question = await getQuestion(questionId);
  
  if (question) {
    // Remove from index
    const currentIndex = await getQuestionIds(question.examType);
    const newIndex = currentIndex.filter(id => id !== questionId);
    await kv.set(`questions_index:${question.examType}`, newIndex);
  }
  
  // Delete the question
  await kv.del(`question:${questionId}`);
}
