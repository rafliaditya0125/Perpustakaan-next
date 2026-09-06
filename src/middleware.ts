import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const session = request.cookies.get('session-user');
  const mfaPending = request.cookies.get('mfa-pending');
  const { pathname } = request.nextUrl;

  const isPetugasProtectedPath = pathname.startsWith('/petugas/') && pathname !== '/petugas/login' && pathname !== '/petugas/login/mfa';
  const isAnggotaProtectedPath = pathname.startsWith('/anggota');

  if (isPetugasProtectedPath || isAnggotaProtectedPath) {
    if (!session) {
      const url = request.nextUrl.clone();
      url.pathname = pathname.startsWith('/petugas/') ? '/petugas/login' : '/login';
      return NextResponse.redirect(url);
    }
  }

  // Petugas MFA route protection
  if (pathname === '/petugas/login/mfa') {
    if (session) {
      const url = request.nextUrl.clone();
      url.pathname = '/petugas/dashboard';
      return NextResponse.redirect(url);
    }
    if (!mfaPending) {
      const url = request.nextUrl.clone();
      url.pathname = '/petugas/login';
      return NextResponse.redirect(url);
    }
  }

  // Anggota MFA route protection
  if (pathname === '/login/mfa') {
    if (session) {
      const url = request.nextUrl.clone();
      url.pathname = '/anggota';
      return NextResponse.redirect(url);
    }
    if (!mfaPending) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
  }

  if (pathname === '/login' && session) {
    try {
      const userData = JSON.parse(Buffer.from(session.value, 'base64').toString('ascii'));
      const url = request.nextUrl.clone();
      url.pathname = userData.peran === 'anggota' ? '/anggota' : '/petugas/dashboard';
      return NextResponse.redirect(url);
    } catch {
      // ignore parse error and allow /login
    }
  }

  if (pathname === '/petugas/login' && session) {
    try {
      const userData = JSON.parse(Buffer.from(session.value, 'base64').toString('ascii'));
      const url = request.nextUrl.clone();
      url.pathname = userData.peran === 'anggota' ? '/anggota' : '/petugas/dashboard';
      return NextResponse.redirect(url);
    } catch {
      // ignore parse error and allow petugas login
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
