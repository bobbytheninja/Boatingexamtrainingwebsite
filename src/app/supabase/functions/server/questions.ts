// Questions management module for the yacht exam training server
import * as kv from "./kv_store.tsx";

export interface Question {
  questionNumber: number;
  questionText: string;
  answerA: string;
  answerB: string;
  answerC: string;
  answerD: string;
  correctAnswer: string;
  difficulty: number;
  imageUrl?: string;
  examType: string;
}

// Get a single question by ID
export async function getQuestion(questionId: string): Promise<Question | null> {
  const question = await kv.get(`question:${questionId}`);
  return question || null;
}

// Get all question IDs for an exam type
export async function getQuestionIds(examType: string): Promise<string[]> {
  const index = await kv.get(`questions_index:${examType}`);
  return index?.questionIds || [];
}

// Get question count for an exam type
export async function getQuestionCount(examType: string): Promise<number> {
  const questionIds = await getQuestionIds(examType);
  return questionIds.length;
}

// Get random questions for an exam
export async function getRandomQuestions(examType: string, count: number): Promise<Question[]> {
  const questionIds = await getQuestionIds(examType);
  
  if (questionIds.length === 0) {
    return [];
  }

  // Shuffle and take the requested number
  const shuffled = [...questionIds].sort(() => Math.random() - 0.5);
  const selectedIds = shuffled.slice(0, Math.min(count, questionIds.length));

  // Fetch all selected questions
  const questions: Question[] = [];
  for (const id of selectedIds) {
    const question = await kv.get(`question:${id}`);
    if (question) {
      questions.push(question);
    }
  }

  return questions;
}

// Get first N questions for an exam (for mock/test mode)
export async function getFirstQuestions(examType: string, count: number): Promise<Question[]> {
  const questionIds = await getQuestionIds(examType);
  
  if (questionIds.length === 0) {
    return [];
  }

  // Take first N questions
  const selectedIds = questionIds.slice(0, Math.min(count, questionIds.length));

  // Fetch all selected questions
  const questions: Question[] = [];
  for (const id of selectedIds) {
    const question = await kv.get(`question:${id}`);
    if (question) {
      questions.push(question);
    }
  }

  return questions;
}

// Save questions (replace all mode - deletes existing questions first)
export async function saveQuestions(questions: Question[]): Promise<void> {
  if (questions.length === 0) {
    return;
  }

  // Group questions by exam type
  const questionsByExamType: { [key: string]: Question[] } = {};
  
  for (const question of questions) {
    const examType = question.examType;
    if (!questionsByExamType[examType]) {
      questionsByExamType[examType] = [];
    }
    questionsByExamType[examType].push(question);
  }

  // Process each exam type
  for (const [examType, examQuestions] of Object.entries(questionsByExamType)) {
    console.log(`[Questions] Processing ${examQuestions.length} questions for ${examType} exam...`);
    
    // DELETE ALL EXISTING QUESTIONS FOR THIS EXAM TYPE
    console.log(`[Questions] Deleting existing questions for ${examType}...`);
    const existingIds = await getQuestionIds(examType);
    for (const id of existingIds) {
      await kv.del(`question:${id}`);
    }
    console.log(`[Questions] Deleted ${existingIds.length} existing questions for ${examType}`);

    // Save new questions
    const newQuestionIds: string[] = [];
    
    for (const question of examQuestions) {
      const paddedNumber = String(question.questionNumber).padStart(3, '0');
      const questionId = `${examType}_${paddedNumber}`;
      
      await kv.set(`question:${questionId}`, {
        ...question,
        examType,
      });
      
      newQuestionIds.push(questionId);
    }

    // Sort question IDs to ensure first questions are always the same
    newQuestionIds.sort();

    // Update index
    await kv.set(`questions_index:${examType}`, {
      questionIds: newQuestionIds,
      count: newQuestionIds.length,
      updatedAt: Date.now(),
    });

    console.log(`[Questions] ✅ Saved ${newQuestionIds.length} questions for ${examType} exam`);
  }
}

// Delete a single question
export async function deleteQuestion(questionId: string): Promise<void> {
  await kv.del(`question:${questionId}`);
}
