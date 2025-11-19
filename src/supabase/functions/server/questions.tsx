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
  
  // Fetch in batches to avoid "Request Header Too Large" error
  const batchSize = 20;
  const questions: Question[] = [];
  
  for (let i = 0; i < selectedIds.length; i += batchSize) {
    const batchIds = selectedIds.slice(i, Math.min(i + batchSize, selectedIds.length));
    const batchQuestions = await getQuestions(batchIds);
    questions.push(...batchQuestions);
  }
  
  return questions;
}

// Get the first N questions for an exam (sorted by questionNumber)
export async function getFirstQuestions(
  examType: string, 
  count: number = 10
): Promise<Question[]> {
  const allIds = await getQuestionIds(examType);
  
  if (allIds.length === 0) {
    return [];
  }

  // Instead of fetching all questions at once (which causes "Request Header Too Large"),
  // we'll fetch questions in small batches and collect only what we need
  const batchSize = 20; // Fetch 20 at a time to be safe
  const questionsWithNumbers: Question[] = [];
  
  // Process in batches
  for (let i = 0; i < allIds.length && questionsWithNumbers.length < allIds.length; i += batchSize) {
    const batchIds = allIds.slice(i, Math.min(i + batchSize, allIds.length));
    const batchQuestions = await getQuestions(batchIds);
    questionsWithNumbers.push(...batchQuestions);
  }
  
  // Sort by questionNumber (ascending)
  const sorted = questionsWithNumbers.sort((a, b) => {
    const numA = a.questionNumber || 999999;
    const numB = b.questionNumber || 999999;
    return numA - numB;
  });
  
  // Return the first N questions
  return sorted.slice(0, Math.min(count, sorted.length));
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
  console.log(`[Questions] Starting import of ${questions.length} questions...`);
  
  // Group questions by exam type
  const byExamType: Record<string, Question[]> = {};
  
  for (const question of questions) {
    if (!byExamType[question.examType]) {
      byExamType[question.examType] = [];
    }
    byExamType[question.examType].push(question);
  }

  // Save questions in batches to avoid hitting database limits
  const BATCH_SIZE = 50; // Process 50 questions at a time
  
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

  // Update indices for each exam type
  for (const [examType, questionsOfType] of Object.entries(byExamType)) {
    const currentIndex = await getQuestionIds(examType);
    const newIds = questionsOfType.map(q => q.id).filter(id => !currentIndex.includes(id));
    
    // Only add IDs that don't exist yet (prevents duplicate entries in index)
    if (newIds.length > 0) {
      console.log(`[Questions] Adding ${newIds.length} new question IDs to ${examType} index...`);
      await kv.set(`questions_index:${examType}`, [...currentIndex, ...newIds]);
    } else {
      console.log(`[Questions] No new questions to add to ${examType} index (all already exist)`);
    }
  }
  
  console.log(`[Questions] Import complete! Total questions: ${questions.length}`);
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
