import { createBrowserClient } from '@supabase/ssr';

// Placeholder values used during build/SSR when env vars aren't available.
// The client will fail at runtime if real values aren't set, but this
// prevents the build from crashing during static page generation.
const PLACEHOLDER_URL = 'https://placeholder.supabase.co';
const PLACEHOLDER_KEY = 'placeholder-anon-key';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || PLACEHOLDER_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || PLACEHOLDER_KEY;

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
