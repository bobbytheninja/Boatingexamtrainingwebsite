import * as kv from "./kv_store.ts";

export interface Question {
  id: string;
  questionNumber?: number;
  examType: string;
  questionText: string;
  answerA: string;
  answerB: string;
  answerC: string;
  answerD: string;
  correctAnswer: string;
  difficulty: 1 | 2 | 3;
  imageUrl?: string;
  language?: string;
}

export async function getQuestionIds(examType: string): Promise<string[]> {
  const index = await kv.get(`questions_index:${examType}`);
  return index || [];
}

export async function getQuestion(questionId: string): Promise<Question | null> {
  return await kv.get(`question:${questionId}`);
}

export async function getQuestions(questionIds: string[]): Promise<Question[]> {
  const keys = questionIds.map(id => `question:${id}`);
  const questions = await kv.mget(keys);
  return questions.filter(q => q !== null) as Question[];
}

export async function getRandomQuestions(
  examType: string, 
  count: number = 40
): Promise<Question[]> {
  const allIds = await getQuestionIds(examType);
  
  if (allIds.length === 0) {
    return [];
  }

  const shuffled = [...allIds].sort(() => Math.random() - 0.5);
  const selectedIds = shuffled.slice(0, Math.min(count, shuffled.length));
  
  const batchSize = 20;
  const questions: Question[] = [];
  
  for (let i = 0; i < selectedIds.length; i += batchSize) {
    const batchIds = selectedIds.slice(i, Math.min(i + batchSize, selectedIds.length));
    const batchQuestions = await getQuestions(batchIds);
    questions.push(...batchQuestions);
  }
  
  return questions;
}

export async function getFirstQuestions(
  examType: string, 
  count: number = 10
): Promise<Question[]> {
  const allIds = await getQuestionIds(examType);
  
  if (allIds.length === 0) {
    return [];
  }

  const batchSize = 20;
  const questionsWithNumbers: Question[] = [];
  
  for (let i = 0; i < allIds.length && questionsWithNumbers.length < allIds.length; i += batchSize) {
    const batchIds = allIds.slice(i, Math.min(i + batchSize, allIds.length));
    const batchQuestions = await getQuestions(batchIds);
    questionsWithNumbers.push(...batchQuestions);
  }
  
  const sorted = questionsWithNumbers.sort((a, b) => {
    const numA = a.questionNumber || 999999;
    const numB = b.questionNumber || 999999;
    return numA - numB;
  });
  
  return sorted.slice(0, Math.min(count, sorted.length));
}

export async function saveQuestion(question: Question): Promise<void> {
  await kv.set(`question:${question.id}`, question);
  
  const currentIndex = await getQuestionIds(question.examType);
  if (!currentIndex.includes(question.id)) {
    await kv.set(`questions_index:${question.examType}`, [...currentIndex, question.id]);
  }
}

export async function saveQuestions(questions: Question[]): Promise<void> {
  console.log(`[Questions] Starting import of ${questions.length} questions...`);
  
  const byExamType: Record<string, Question[]> = {};
  
  for (const question of questions) {
    if (!byExamType[question.examType]) {
      byExamType[question.examType] = [];
    }
    byExamType[question.examType].push(question);
  }

  const BATCH_SIZE = 50;
  
  for (let i = 0; i < questions.length; i += BATCH_SIZE) {
    const batch = questions.slice(i, Math.min(i + BATCH_SIZE, questions.length));
    const keys = batch.map(q => `question:${q.id}`);
    
    console.log(`[Questions] Saving batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(questions.length / BATCH_SIZE)} (${batch.length} questions)...`);
    
    try {
      await kv.mset(keys, batch);
    } catch (error) {
      console.error(`[Questions] Error saving batch at index ${i}:`, error);
      throw new Error(`Failed to save questions batch ${Math.floor(i / BATCH_SIZE) + 1}: ${error.message}`);
    }
  }
  
  console.log(`[Questions] All questions saved. Updating indices...`);

  for (const [examType, questionsOfType] of Object.entries(byExamType)) {
    const currentIndex = await getQuestionIds(examType);
    const newIds = questionsOfType.map(q => q.id).filter(id => !currentIndex.includes(id));
    
    if (newIds.length > 0) {
      console.log(`[Questions] Adding ${newIds.length} new question IDs to ${examType} index...`);
      await kv.set(`questions_index:${examType}`, [...currentIndex, ...newIds]);
    } else {
      console.log(`[Questions] No new questions to add to ${examType} index (all already exist)`);
    }
  }
  
  console.log(`[Questions] Import complete! Total questions: ${questions.length}`);
}

export async function getQuestionCount(examType: string): Promise<number> {
  const ids = await getQuestionIds(examType);
  return ids.length;
}

export async function deleteQuestion(questionId: string): Promise<void> {
  const question = await getQuestion(questionId);
  
  if (question) {
    const currentIndex = await getQuestionIds(question.examType);
    const newIndex = currentIndex.filter(id => id !== questionId);
    await kv.set(`questions_index:${question.examType}`, newIndex);
  }
  
  await kv.del(`question:${questionId}`);
}
