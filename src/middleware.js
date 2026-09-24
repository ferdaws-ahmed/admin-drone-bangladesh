import { NextResponse } from 'next/server';
import { adminPaths, isAdminTokenPresent, redirectToLogin, redirectToHome } from './lib/auth';

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

export function middleware(req) {
  const { pathname } = req.nextUrl;

  if (pathname === '/' || pathname === '') {
    const url = req.nextUrl.clone();
    url.pathname = isAdminTokenPresent(req) ? adminPaths.HOME : adminPaths.LOGIN;
    return NextResponse.redirect(url);
  }

  const onLogin = pathname === adminPaths.LOGIN;

  if (onLogin) {
    if (isAdminTokenPresent(req)) return redirectToHome(req);
    return NextResponse.next();
  }

  if (adminPaths.isPublic(pathname)) return NextResponse.next();

  if (!isAdminTokenPresent(req)) return redirectToLogin(req);
  return NextResponse.next();
}
