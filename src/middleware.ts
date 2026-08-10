import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Dev Mode: Admin panel authentication is disabled for direct friction-free access
  // All /admin/* routes are open without requiring login credentials

  // Optional: Protect account user routes if needed
  /*
  const token = request.cookies.get('auth_token')?.value;
  if (pathname.startsWith('/account')) {
    if (!token && !request.headers.get('user-agent')?.includes('Next.js')) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }
  */

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/account/:path*'],
};

