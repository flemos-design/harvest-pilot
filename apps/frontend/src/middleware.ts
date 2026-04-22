import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/login', '/register', '/forgot-password', '/reset-password'];
const PROTECTED_PATHS = [
  '/dashboard',
  '/parcelas',
  '/operacoes',
  '/culturas',
  '/ciclos',
  '/tarefas',
  '/insumos',
  '/calendario',
  '/relatorios',
  '/satelite',
  '/assistente',
  '/mapa',
  '/utilizadores',
  '/organizacoes',
  '/propriedades',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('hp_session');
  const isAuthenticated = !!sessionCookie?.value;

  const isPublicPath = PUBLIC_PATHS.some((path) => pathname.startsWith(path));
  const isProtectedPath = PROTECTED_PATHS.some((path) => pathname.startsWith(path));

  // Redirect unauthenticated users away from protected routes
  if (!isAuthenticated && isProtectedPath) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from public auth pages
  if (isAuthenticated && isPublicPath) {
    const dashboardUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.json|sw.js|workbox-*.js).*)',
  ],
};
