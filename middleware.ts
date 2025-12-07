import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function middleware(req: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  // Refresh session if expired
  const { data: { session } } = await supabase.auth.getSession();

  // Define protected routes
  const protectedRoutes = ['/dashboard', '/profile', '/chat'];
  const authRoutes = ['/login', '/signup'];
  const isProtectedRoute = protectedRoutes.some(route => req.nextUrl.pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => req.nextUrl.pathname.startsWith(route));

  // Redirect to login if accessing protected route without session
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL('/login', req.url);
    redirectUrl.searchParams.set('redirect', req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect to dashboard if accessing auth routes with active session
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return response;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/chat/:path*',
    '/login',
    '/signup',
  ],
};
