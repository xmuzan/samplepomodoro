
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { User } from '@/types';

// Define which routes are protected
const protectedRoutes = ['/tasks', '/profile', '/shop', '/report', '/boss', '/admin'];

export function middleware(request: NextRequest) {
  const currentUserCookie = request.cookies.get('currentUser')?.value;
  const { pathname } = request.nextUrl;

  let userIsAuthenticated = false;
  let userIsAdmin = false;

  if (currentUserCookie) {
    try {
      const session: { user: User, expiry: number } = JSON.parse(currentUserCookie);
      // Check if session is expired AND user status is active
      if (session && session.user && session.expiry > Date.now() && session.user.status === 'active') {
        userIsAuthenticated = true;
        userIsAdmin = session.user.isAdmin || false;
      }
    } catch (e) {
      // Invalid cookie, treat as unauthenticated
      userIsAuthenticated = false;
    }
  }

  const isAccessingProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  // If trying to access a protected route without authentication, redirect to login
  if (isAccessingProtectedRoute && !userIsAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // If trying to access the admin page without being an admin, redirect to tasks
  if(pathname.startsWith('/admin') && !userIsAdmin) {
    return NextResponse.redirect(new URL('/tasks', request.url));
  }

  // If authenticated user tries to access login page, redirect to tasks
  if (pathname === '/login' && userIsAuthenticated) {
    return NextResponse.redirect(new URL('/tasks', request.url));
  }
  
  // If the root path is accessed, redirect to tasks if logged in, otherwise to login
  if (pathname === '/') {
      if (userIsAuthenticated) {
         return NextResponse.redirect(new URL('/tasks', request.url));
      }
      return NextResponse.redirect(new URL('/login', request.url));
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
     * - any file with an extension (e.g. .png, .mp4)
     */
    '/((?!api|_next/static|_next/image|.*\\..*).*)',
  ],
}
