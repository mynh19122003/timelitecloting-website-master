import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /admin routes (except /admin/login)
  if (pathname.startsWith('/admin')) {
    // Allow login page and public assets
    if (
      pathname === '/admin/login' ||
      pathname.startsWith('/admin/_next') ||
      pathname.startsWith('/admin/media')
    ) {
      return NextResponse.next();
    }

    // Check for admin auth token (from cookies or header)
    const adminToken = 
      request.cookies.get('adminToken')?.value ||
      request.cookies.get('admin:token')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '');

    if (!adminToken) {
      // For API requests, return 401
      if (pathname.startsWith('/admin/api')) {
        return new NextResponse(
          JSON.stringify({ error: 'Unauthorized', message: 'Admin authentication required' }),
          { status: 401, headers: { 'content-type': 'application/json' } }
        );
      }

      // For page requests, redirect to login
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Token exists - let client-side guard verify it
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
  ],
};

