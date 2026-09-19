import { projectId, publicAnonKey } from './supabase/info';

export interface ExamCategory {
  type: string;
  title: string; // Changed from 'name' to 'title'
  titleBg?: string;
  description?: string;
  descriptionBg?: string;
  icon?: string;
  color?: string;
  price?: number;
  image?: string;
  order?: number;
}

// Hardcoded fallback categories
const FALLBACK_CATEGORIES = [
  { value: 'jet', label: 'Jet Ski', short: 'JS' },
  { value: 'small', label: 'Small Boat', short: 'SB' },
  { value: 'big', label: 'Big Boat', short: 'BB' },
  { value: 'yacht', label: 'Yacht (up to 50 tons)', short: 'Y50' },
  { value: 'navigation', label: 'Navigation Device', short: 'NAV' },
];

/**
 * Load exam categories from the server
 * Returns categories in the format: { value: string, label: string, short?: string }[]
 */
export async function loadExamCategories(): Promise<{ value: string; label: string; short?: string }[]> {
  try {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-d36f8f91/categories`,
      { headers: { 'Authorization': `Bearer ${publicAnonKey}` } }
    );
    if (response.ok) {
      const data = await response.json();
      const categories = data.categories || [];
      if (categories.length > 0) {
        return categories.map((cat: ExamCategory) => ({
          value: cat.type,
          label: cat.title,
          short: cat.type.substring(0, 3).toUpperCase(),
        }));
      }
    }
    return FALLBACK_CATEGORIES;
  } catch {
    return FALLBACK_CATEGORIES;
  }
}