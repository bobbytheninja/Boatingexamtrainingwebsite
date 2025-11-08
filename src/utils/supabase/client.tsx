import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

let supabaseInstance: ReturnType<typeof createSupabaseClient> | null = null;

export function createClient() {
  if (!supabaseInstance) {
    try {
      if (!projectId || !publicAnonKey) {
        console.error('Missing Supabase configuration');
        throw new Error('Supabase not configured');
      }
      
      const supabaseUrl = `https://${projectId}.supabase.co`;
      supabaseInstance = createSupabaseClient(supabaseUrl, publicAnonKey);
    } catch (error) {
      console.error('Failed to create Supabase client:', error);
      throw error;
    }
  }
  return supabaseInstance;
}
