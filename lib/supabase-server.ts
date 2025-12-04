import { createServerClient } from '@supabase/ssr';
import { NextApiRequest, NextApiResponse } from 'next';

export function createServerSupabaseClient({
  req,
  res,
}: {
  req: NextApiRequest;
  res: NextApiResponse;
}) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies[name];
        },
        set(name: string, value: string, options: any) {
          res.setHeader('Set-Cookie', `${name}=${value}; Path=/; ${options.httpOnly ? 'HttpOnly;' : ''} ${options.secure ? 'Secure;' : ''} SameSite=${options.sameSite || 'Lax'}`);
        },
        remove(name: string, options: any) {
          res.setHeader('Set-Cookie', `${name}=; Path=/; Max-Age=0`);
        },
      },
    }
  );
}
