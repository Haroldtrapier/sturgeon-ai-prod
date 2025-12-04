import { createClient } from '@supabase/supabase-js';

// Use placeholder values for build-time, but warn in browser if not configured
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// Warn if running in browser with placeholder credentials
if (typeof window !== 'undefined' && supabaseUrl === 'https://placeholder.supabase.co') {
  console.warn('⚠️ Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
