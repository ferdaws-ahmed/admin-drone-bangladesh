// /* Server-side (middleware) + client-side admin auth helpers
//  * Completely decoupled from the client-facing store auth.
//  */
// import { NextResponse } from 'next/server';

// const LOGIN_PATH = '/login';
// const PUBLIC_PATHS = [LOGIN_PATH, '/favicon.ico'];

// export const adminPaths = {
//   LOGIN: LOGIN_PATH,
//   HOME:  '/dashboard',
//   isPublic: (p) => PUBLIC_PATHS.includes(p.split('?')[0]) || p.startsWith('/_next'),
// };

// /* Middleware check: read token from HTTP-only cookie-less header fallback via localStorage is impossible server-side,
//  * so we use a lightweight signed-token header flow: the admin token is passed via Authorization header on API calls,
//  * but for page protection we store a mirror cookie set on client-side after login.
//  * For simplicity + to match the existing JWT flow (tokens in localStorage), we perform the page-protect check with
//  * a lightweight middleware that verifies the token stored in the `admin_token` cookie.
//  * Login page sets this cookie.
//  */
// export const getAdminTokenFromRequest = (req) => req.cookies.get('admin_token')?.value || null;

// export const isAdminTokenPresent = (req) => Boolean(getAdminTokenFromRequest(req));

// export function redirectToLogin(req) {
//   const url = req.nextUrl.clone();
//   url.pathname = LOGIN_PATH;
//   url.searchParams.set('next', req.nextUrl.pathname + req.nextUrl.search);
//   return NextResponse.redirect(url);
// }

// export function redirectToHome(req) {
//   const url = req.nextUrl.clone();
//   const next = req.nextUrl.searchParams.get('next') || adminPaths.HOME;
//   url.pathname = next.startsWith('/') ? next : adminPaths.HOME;
//   url.search = '';
//   return NextResponse.redirect(url);
// }



import { NextResponse } from 'next/server';

export const adminPaths = {
  HOME: '/dashboard',
  LOGIN: '/login',
  PUBLIC: ['/login', '/forgot-password', '/reset-password'],
  isPublic: (pathname) => adminPaths.PUBLIC.includes(pathname),
};


export function isAdminTokenPresent(req) {
  const token = req.cookies.get('admin_token')?.value;
  return Boolean(token);
}

export function redirectToLogin(req) {
  const url = req.nextUrl.clone();
  url.pathname = adminPaths.LOGIN;
  return NextResponse.redirect(url);
}

export function redirectToHome(req) {
  const url = req.nextUrl.clone();
  url.pathname = adminPaths.HOME;
  return NextResponse.redirect(url);
}