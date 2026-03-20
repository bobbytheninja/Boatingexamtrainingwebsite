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
  console.log('🚀 [CategoryLoader] Starting loadExamCategories...');
  console.log('🔑 [CategoryLoader] projectId:', projectId);
  console.log('🔑 [CategoryLoader] publicAnonKey:', publicAnonKey ? 'Present' : 'Missing');
  
  try {
    const url = `https://${projectId}.supabase.co/functions/v1/make-server-d36f8f91/categories`;
    console.log('🌐 [CategoryLoader] Fetching from:', url);
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      },
    });

    console.log('📡 [CategoryLoader] Response status:', response.status, response.statusText);

    if (response.ok) {
      const data = await response.json();
      console.log('📦 [CategoryLoader] Response data:', data);
      const categories = data.categories || [];
      
      if (categories.length > 0) {
        // Transform server categories to dropdown format
        const transformed = categories.map((cat: ExamCategory) => ({
          value: cat.type,
          label: cat.title, // Changed from cat.name to cat.title
          short: cat.type.substring(0, 3).toUpperCase(), // Generate short name from type
        }));
        console.log('✅ [CategoryLoader] Returning transformed categories:', transformed);
        return transformed;
      }
    }
    
    // Fallback to hardcoded categories
    console.log('⚠️ [CategoryLoader] Using fallback categories');
    return FALLBACK_CATEGORIES;
  } catch (error) {
    console.error('❌ [CategoryLoader] Error loading categories:', error);
    return FALLBACK_CATEGORIES;
  }
}