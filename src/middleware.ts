import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { httpArcjet, authArcjet, protectWithArcjet } from '@/lib/arcjet';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Evaluasi keamanan Arcjet
  const isAuthRoute =
    pathname === '/login' ||
    pathname === '/petugas/login' ||
    pathname.startsWith('/login/') ||
    pathname.startsWith('/petugas/login/');
  const arcjetClient = isAuthRoute ? authArcjet : httpArcjet;

  const arcjetDecision = await protectWithArcjet(arcjetClient, request);
  if (!arcjetDecision.allowed) {
    if (
      request.headers.get('accept')?.includes('application/json') ||
      pathname.startsWith('/api/')
    ) {
      return NextResponse.json(
        { error: arcjetDecision.message || 'Akses ditolak.' },
        { status: arcjetDecision.status }
      );
    }

    return new NextResponse(
      `<!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="utf-8" />
        <title>Akses Dibatasi - E-Perpustakaan</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
          .card { background: #1e293b; border: 1px solid #334155; padding: 32px; border-radius: 20px; max-width: 480px; text-align: center; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
          h1 { color: #f43f5e; font-size: 20px; margin-bottom: 12px; }
          p { color: #94a3b8; font-size: 14px; line-height: 1.6; margin-bottom: 24px; }
          .btn { display: inline-block; background: #4f46e5; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 12px; font-weight: 600; font-size: 13px; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>Pemberitahuan Keamanan</h1>
          <p>${arcjetDecision.message || 'Permintaan Anda dibatasi oleh sistem keamanan Arcjet.'}</p>
          <a href="/" class="btn">Kembali ke Beranda</a>
        </div>
      </body>
      </html>`,
      {
        status: arcjetDecision.status,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
      }
    );
  }

  const session = request.cookies.get('session-user');
  const mfaPending = request.cookies.get('mfa-pending');

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
