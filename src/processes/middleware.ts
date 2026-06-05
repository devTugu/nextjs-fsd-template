import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ROUTES } from '@/shared/config/routes';

const PROTECTED_PREFIX = ROUTES.DASHBOARD;
const AUTH_ROUTES = [ROUTES.LOGIN];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get('accessToken')?.value;
  const hasLocalAuthHint = Boolean(accessToken);

  const isProtected = pathname.startsWith(PROTECTED_PREFIX);
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  if (isProtected && !hasLocalAuthHint) {
    const hasHeader = request.headers.get('authorization');
    if (!hasHeader) {
      return NextResponse.redirect(new URL(ROUTES.LOGIN, request.url));
    }
  }

  if (isAuthRoute && hasLocalAuthHint) {
    return NextResponse.redirect(new URL(ROUTES.DASHBOARD, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/sign-in'],
};
