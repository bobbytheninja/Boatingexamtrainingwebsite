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
  
  // **FIX: Fetch in batches to avoid URL-too-long error**
  const BATCH_SIZE = 50;
  const questions: Question[] = [];
  
  console.log(`[getRandomQuestions] Fetching ${selectedIds.length} questions in batches of ${BATCH_SIZE}...`);
  
  for (let i = 0; i < selectedIds.length; i += BATCH_SIZE) {
    const batchIds = selectedIds.slice(i, Math.min(i + BATCH_SIZE, selectedIds.length));
    const batchQuestions = await getQuestions(batchIds);
    questions.push(...batchQuestions);
  }
  
  return questions;
}

export async function getFirstQuestions(
  examType: string, 
  count: number = 10
): Promise<Question[]> {
  try {
    console.log(`[getFirstQuestions] Starting - examType: ${examType}, count: ${count}`);
    
    const allIds = await getQuestionIds(examType);
    console.log(`[getFirstQuestions] Got ${allIds.length} question IDs for ${examType}`);
    
    if (allIds.length === 0) {
      console.log(`[getFirstQuestions] No questions found for ${examType}`);
      return [];
    }

    // **FIX: Don't fetch all questions at once - causes URL-too-long error**
    // Instead, fetch in batches and stop once we have enough
    const BATCH_SIZE = 50; // Fetch 50 at a time to avoid URL length issues
    const questionsWithNumbers: Question[] = [];
    
    console.log(`[getFirstQuestions] Fetching questions in batches of ${BATCH_SIZE}...`);
    
    for (let i = 0; i < allIds.length; i += BATCH_SIZE) {
      const batchIds = allIds.slice(i, Math.min(i + BATCH_SIZE, allIds.length));
      console.log(`[getFirstQuestions] Fetching batch ${Math.floor(i / BATCH_SIZE) + 1} (${batchIds.length} questions)...`);
      
      const batchQuestions = await getQuestions(batchIds);
      questionsWithNumbers.push(...batchQuestions);
      
      // Once we have enough questions to ensure we can find the first N, we can stop
      // But we need to keep fetching until we're confident we have the lowest questionNumbers
      // So let's fetch at least 2x the count we need, or keep going if we haven't seen a pattern
      if (questionsWithNumbers.length >= Math.min(count * 3, 150)) {
        console.log(`[getFirstQuestions] Fetched ${questionsWithNumbers.length} questions, sorting to find first ${count}...`);
        break;
      }
    }
    
    console.log(`[getFirstQuestions] Fetched ${questionsWithNumbers.length} total questions`);
    
    const sorted = questionsWithNumbers.sort((a, b) => {
      const numA = a.questionNumber || 999999;
      const numB = b.questionNumber || 999999;
      return numA - numB;
    });
    
    const result = sorted.slice(0, Math.min(count, sorted.length));
    console.log(`[getFirstQuestions] Returning ${result.length} sorted questions`);
    
    return result;
  } catch (error: any) {
    console.error(`[getFirstQuestions] Error:`, error);
    console.error(`[getFirstQuestions] Error details:`, {
      message: error.message,
      stack: error.stack,
      examType,
      count
    });
    throw new Error(`Failed to get first questions for ${examType}: ${error.message}`);
  }
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
  
  // Validate questions before proceeding
  if (!questions || !Array.isArray(questions) || questions.length === 0) {
    throw new Error('No questions provided for import');
  }
  
  // Check that all questions have required fields
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    if (!q.id || !q.examType || !q.questionText || !q.correctAnswer) {
      throw new Error(`Invalid question at index ${i}: missing required fields. Question: ${JSON.stringify(q)}`);
    }
  }
  
  // **COUNT QUESTIONS WITH IMAGES**
  const questionsWithImages = questions.filter(q => q.imageUrl && q.imageUrl.trim() !== '');
  const imageCount = questionsWithImages.length;
  const imagePercentage = ((imageCount / questions.length) * 100).toFixed(1);
  
  console.log(`[Questions] 🖼️ IMAGE STATS: ${imageCount}/${questions.length} questions have images (${imagePercentage}%)`);
  if (imageCount > 0) {
    console.log(`[Questions] Sample image URLs:`);
    questionsWithImages.slice(0, 3).forEach((q, i) => {
      console.log(`  ${i + 1}. Question ${q.id}: ${q.imageUrl}`);
    });
  } else {
    console.log(`[Questions] ⚠️ WARNING: No images found in this import! Check Excel column 3.`);
  }
  
  // **DELETE OLD QUESTIONS FOR THIS EXAM TYPE BEFORE IMPORTING**
  // Get all unique exam types from the import
  const examTypesInImport = [...new Set(questions.map(q => q.examType))];
  
  for (const examType of examTypesInImport) {
    console.log(`[Questions] 🗑️ Deleting all existing questions for exam type: ${examType}...`);
    const existingIds = await getQuestionIds(examType);
    
    if (existingIds.length > 0) {
      console.log(`[Questions] Found ${existingIds.length} existing questions to delete`);
      
      // Delete in batches
      const DELETE_BATCH_SIZE = 100;
      for (let i = 0; i < existingIds.length; i += DELETE_BATCH_SIZE) {
        const batchIds = existingIds.slice(i, Math.min(i + DELETE_BATCH_SIZE, existingIds.length));
        const keys = batchIds.map(id => `question:${id}`);
        await kv.mdel(keys);
        console.log(`[Questions] Deleted batch ${Math.floor(i / DELETE_BATCH_SIZE) + 1}/${Math.ceil(existingIds.length / DELETE_BATCH_SIZE)}`);
      }
      
      // Delete the index
      await kv.del(`questions_index:${examType}`);
      console.log(`[Questions] ✅ Deleted all ${existingIds.length} questions for ${examType}`);
    } else {
      console.log(`[Questions] No existing questions found for ${examType}`);
    }
  }
  
  // **FIX: Deduplicate questions by ID to prevent "ON CONFLICT" errors**
  const uniqueQuestionsMap = new Map<string, Question>();
  for (const question of questions) {
    // Keep the last occurrence of each ID (you could also keep the first)
    uniqueQuestionsMap.set(question.id, question);
  }
  
  const uniqueQuestions = Array.from(uniqueQuestionsMap.values());
  const duplicateCount = questions.length - uniqueQuestions.length;
  
  if (duplicateCount > 0) {
    console.log(`[Questions] ⚠️ Removed ${duplicateCount} duplicate questions. Processing ${uniqueQuestions.length} unique questions.`);
  }
  
  const byExamType: Record<string, Question[]> = {};
  
  for (const question of uniqueQuestions) {
    if (!byExamType[question.examType]) {
      byExamType[question.examType] = [];
    }
    byExamType[question.examType].push(question);
  }

  const BATCH_SIZE = 100;
  
  for (let i = 0; i < uniqueQuestions.length; i += BATCH_SIZE) {
    const batch = uniqueQuestions.slice(i, Math.min(i + BATCH_SIZE, uniqueQuestions.length));
    const keys = batch.map(q => `question:${q.id}`);
    
    console.log(`[Questions] Saving batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(uniqueQuestions.length / BATCH_SIZE)} (${batch.length} questions)...`);
    
    try {
      await kv.mset(keys, batch);
      console.log(`[Questions] Batch ${Math.floor(i / BATCH_SIZE) + 1} saved successfully`);
    } catch (error: any) {
      console.error(`[Questions] Error saving batch at index ${i}:`, error);
      console.error(`[Questions] Error details:`, {
        message: error?.message || 'Unknown error',
        stack: error?.stack || 'No stack trace',
        batchSize: batch.length,
        firstQuestionId: batch[0]?.id,
      });
      throw new Error(`Failed to save questions batch ${Math.floor(i / BATCH_SIZE) + 1}: ${error?.message || error}`);
    }
  }
  
  console.log(`[Questions] All questions saved. Updating indices...`);

  for (const [examType, questionsOfType] of Object.entries(byExamType)) {
    try {
      const currentIndex = await getQuestionIds(examType);
      const newIds = questionsOfType.map(q => q.id).filter(id => !currentIndex.includes(id));
      
      if (newIds.length > 0) {
        console.log(`[Questions] Adding ${newIds.length} new question IDs to ${examType} index...`);
        await kv.set(`questions_index:${examType}`, [...currentIndex, ...newIds]);
        console.log(`[Questions] Index for ${examType} updated successfully`);
      } else {
        console.log(`[Questions] No new questions to add to ${examType} index (all already exist)`);
      }
    } catch (error: any) {
      console.error(`[Questions] Error updating index for ${examType}:`, error);
      throw new Error(`Failed to update index for ${examType}: ${error?.message || error}`);
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