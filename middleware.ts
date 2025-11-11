import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple guard for admin routes when using output: 'export' (CSR shell).
// It checks a cookie 'admin_token' against NEXT_ADMIN_TOKEN.
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin')) {
    const isLoginPath = pathname === '/admin' || pathname === '/admin/' || pathname.startsWith('/admin/login');
    const cookieToken = request.cookies.get('admin_token')?.value;
    const expected = process.env.NEXT_ADMIN_TOKEN;

    if (!isLoginPath) {
      if (!expected) {
        // If no token configured, block non-login admin routes by default
        const url = request.nextUrl.clone();
        url.pathname = '/admin/login';
        return NextResponse.redirect(url);
      }
      if (!cookieToken || cookieToken !== expected) {
        const url = request.nextUrl.clone();
        url.pathname = '/admin/login';
        return NextResponse.redirect(url);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};



