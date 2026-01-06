import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextApiRequest, NextApiResponse } from 'next';
import { serialize } from 'cookie';

export function createServerSupabaseClient({
  req,
  res,
}: {
  req: NextApiRequest;
  res: NextApiResponse;
}) {
  // Use server-side env vars with proper fallbacks
  // IMPORTANT: Use anon key for auth operations, NOT service role key
  // Service role key bypasses RLS and doesn't set proper client sessions
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Validate environment variables
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please configure SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel.'
    );
  }

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return req.cookies[name];
        },
        set(name: string, value: string, options: CookieOptions) {
          const cookieStr = serialize(name, value, {
            path: options.path ?? '/',
            maxAge: options.maxAge,
            domain: options.domain,
            secure: options.secure ?? process.env.NODE_ENV === 'production',
            httpOnly: options.httpOnly ?? true,
            sameSite: (options.sameSite as 'strict' | 'lax' | 'none') ?? 'lax',
          });
          // Append to existing cookies instead of overwriting
          const existingCookies = res.getHeader('Set-Cookie');
          if (existingCookies) {
            const cookies = Array.isArray(existingCookies) ? existingCookies : [existingCookies as string];
            res.setHeader('Set-Cookie', [...cookies, cookieStr]);
          } else {
            res.setHeader('Set-Cookie', cookieStr);
          }
        },
        remove(name: string, options: CookieOptions) {
          const cookieStr = serialize(name, '', {
            path: options.path ?? '/',
            maxAge: 0,
          });
          const existingCookies = res.getHeader('Set-Cookie');
          if (existingCookies) {
            const cookies = Array.isArray(existingCookies) ? existingCookies : [existingCookies as string];
            res.setHeader('Set-Cookie', [...cookies, cookieStr]);
          } else {
            res.setHeader('Set-Cookie', cookieStr);
          }
        },
      },
    }
  );
}
