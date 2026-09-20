/**
 * Shared cache for the exam category list.
 *
 * Seven components fetch /categories independently, each waiting on its own
 * round trip before it can render anything — so moving between the home page,
 * a category and the account page paid the same ~600ms more than once.
 *
 * The list is small (a few KB) and changes rarely, which makes it a good fit
 * for stale-while-revalidate: hand back whatever we already have so the page
 * paints immediately, then refresh in the background and tell anyone listening
 * if it actually changed. Concurrent callers share one request rather than
 * racing each other.
 */

import { projectId, publicAnonKey } from './supabase/info';

export interface ExamCategoryRecord {
  type: string;
  title: string;
  titleBg?: string;
  description?: string;
  descriptionBg?: string;
  icon?: string;
  color?: string;
  image?: string;
  country?: string;
  language?: string;
  price?: number;
  isFree?: boolean;
  [key: string]: unknown;
}

const STORAGE_KEY = 'exam_categories_cache_v1';
const URL = `https://${projectId}.supabase.co/functions/v1/make-server-d36f8f91/categories`;

let memory: ExamCategoryRecord[] | null = null;
let inFlight: Promise<ExamCategoryRecord[]> | null = null;
const listeners = new Set<(categories: ExamCategoryRecord[]) => void>();

function readStorage(): ExamCategoryRecord[] | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
  } catch {
    return null;
  }
}

function writeStorage(categories: ExamCategoryRecord[]): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
  } catch {
    // Private mode or a full quota — the in-memory copy still works.
  }
}

/** Whatever is already known, without waiting. Null when nothing is cached yet. */
export function peekCategories(): ExamCategoryRecord[] | null {
  if (memory) return memory;
  memory = readStorage();
  return memory;
}

/** Fetches once for all concurrent callers and updates the cache. */
export function fetchCategories(): Promise<ExamCategoryRecord[]> {
  if (inFlight) return inFlight;

  inFlight = fetch(URL, { headers: { Authorization: `Bearer ${publicAnonKey}` } })
    .then(res => {
      if (!res.ok) throw new Error(`Categories request failed: ${res.status}`);
      return res.json();
    })
    .then(data => {
      const categories: ExamCategoryRecord[] = data.categories || [];
      const changed = JSON.stringify(categories) !== JSON.stringify(memory);
      memory = categories;
      writeStorage(categories);
      // Only wake subscribers when the data actually moved, so a background
      // refresh that confirms what is on screen causes no re-render.
      if (changed) listeners.forEach(fn => fn(categories));
      return categories;
    })
    .finally(() => {
      inFlight = null;
    });

  return inFlight;
}

export function subscribeCategories(fn: (categories: ExamCategoryRecord[]) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/**
 * Warm the cache before anything needs it — called at app start so the list is
 * usually in hand by the time the first page asks.
 */
export function prefetchCategories(): void {
  if (!peekCategories()) fetchCategories().catch(() => {});
}
