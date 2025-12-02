import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Add authentication and authorization logic here
  
  // Protected routes
  const protectedPaths = [
    '/dashboard',
    '/proposals',
    '/contractmatch',
    '/documents',
    '/capability',
    '/certifications',
    '/wins',
    '/opportunities',
    '/alerts',
    '/marketplaces',
    '/billing',
    '/settings',
  ];

  const path = request.nextUrl.pathname;
  const isProtectedPath = protectedPaths.some(p => path.startsWith(p));

  if (isProtectedPath) {
    // Check if user is authenticated
    // For now, just allow access
    // In a real app, check session/token here
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
