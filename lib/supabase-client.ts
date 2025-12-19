import { createBrowserClient } from '@supabase/ssr';
import { SupabaseClient } from '@supabase/supabase-js';

// Singleton instance to prevent multiple GoTrueClient warnings
let supabaseClientInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseClientInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        'Missing Supabase environment variables. Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel.'
      );
    }

    // Use createBrowserClient from @supabase/ssr for proper cookie handling
    supabaseClientInstance = createBrowserClient(
      supabaseUrl,
      supabaseAnonKey
    );
  }

  return supabaseClientInstance;
}

// Export singleton instance for convenience
export const supabase = getSupabaseClient();
