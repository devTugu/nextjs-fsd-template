import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const LOGIN = '/sign-in';
const DASHBOARD = '/dashboard';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get('accessToken')?.value;
  const hasLocalAuthHint = Boolean(accessToken);

  const isProtected = pathname.startsWith(DASHBOARD);
  const isAuthRoute = pathname.startsWith(LOGIN);

  if (isProtected && !hasLocalAuthHint) {
    const hasHeader = request.headers.get('authorization');
    if (!hasHeader) {
      return NextResponse.redirect(new URL(LOGIN, request.url));
    }
  }

  if (isAuthRoute && hasLocalAuthHint) {
    return NextResponse.redirect(new URL(DASHBOARD, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/dashboard', '/sign-in'],
};
