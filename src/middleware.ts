import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const session = request.cookies.get('session-user');
  const { pathname } = request.nextUrl;

  // Paths requiring authentication
  const isProtectedPath =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/members') ||
    pathname.startsWith('/books') ||
    pathname.startsWith('/sirkulasi') ||
    pathname.startsWith('/operasional') ||
    pathname.startsWith('/opname') ||
    pathname.startsWith('/settings');

  if (isProtectedPath) {
    if (!session) {
      // Redirect to login if not authenticated
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
  }

  if (pathname === '/login' || pathname === '/') {
    if (session) {
      // If already logged in, redirect to dashboard
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
    if (pathname === '/') {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
