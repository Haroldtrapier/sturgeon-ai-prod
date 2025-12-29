import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function middleware(req: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  // Get env vars from process.env (available at edge runtime)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If env vars are missing, skip auth check (fail open)
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase env vars missing in middleware');
    return response;
  }

  try {
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
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

    // Securely validate the user session using getUser() which verifies the JWT
    // Note: getSession() is NOT secure as it reads from cookies without verification
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    // User is authenticated if we have a valid user object and no error
    const isAuthenticated = !!user && !userError;

    // Define protected routes
    const protectedRoutes = ['/dashboard', '/profile', '/chat'];
    const authRoutes = ['/login', '/signup'];
    const isProtectedRoute = protectedRoutes.some(route => req.nextUrl.pathname.startsWith(route));
    const isAuthRoute = authRoutes.some(route => req.nextUrl.pathname.startsWith(route));

    // Redirect to login if accessing protected route without valid authentication
    if (isProtectedRoute && !isAuthenticated) {
      const redirectUrl = new URL('/login', req.url);
      redirectUrl.searchParams.set('redirect', req.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Redirect to dashboard if accessing auth routes with valid authentication
    if (isAuthRoute && isAuthenticated) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    return response;
  } catch (error) {
    console.error('Middleware error:', error);
    // On error, allow request through (fail open)
    return response;
  }
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
