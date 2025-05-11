import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  const isDashboardRoute = request.nextUrl.pathname.startsWith('/dashboard');

  // If user is not logged in and tries to access protected routes
  if (!token && (isAdminRoute || isDashboardRoute)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If user is logged in
  if (token) {
    // If user is not admin and tries to access admin routes
    if (isAdminRoute && !token.isAdmin) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // If user is admin and tries to access regular dashboard
    if (isDashboardRoute && token.isAdmin) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*']
}; 