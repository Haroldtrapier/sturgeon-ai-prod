import { createServerClient } from '@supabase/ssr';
import { NextApiRequest, NextApiResponse } from 'next';
import type { SupabaseClient } from '@supabase/supabase-js';

interface CookieOptions {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'Lax' | 'Strict' | 'None';
  maxAge?: number;
  path?: string;
}

function formatCookieString(name: string, value: string, options: CookieOptions): string {
  const parts = [`${name}=${value}`, `Path=${options.path || '/'}`];
  
  if (options.httpOnly) {
    parts.push('HttpOnly');
  }
  
  if (options.secure) {
    parts.push('Secure');
  }
  
  parts.push(`SameSite=${options.sameSite || 'Lax'}`);
  
  if (options.maxAge !== undefined) {
    parts.push(`Max-Age=${options.maxAge}`);
  }
  
  return parts.join('; ');
}

export function createServerSupabaseClient({
  req,
  res,
}: {
  req: NextApiRequest;
  res: NextApiResponse;
}): SupabaseClient {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies[name];
        },
        set(name: string, value: string, options: CookieOptions) {
          res.setHeader('Set-Cookie', formatCookieString(name, value, options));
        },
        remove(name: string, options: CookieOptions) {
          res.setHeader('Set-Cookie', formatCookieString(name, '', { ...options, maxAge: 0 }));
        },
      },
    }
  );
}
