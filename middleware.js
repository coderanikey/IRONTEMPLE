import { NextResponse } from 'next/server';

const PUBLIC_PATHS = [
  '/',
  '/login',
  '/register',
  '/check',
  '/manifest.json',
  '/robots.txt',
  '/icon-192.png',
  '/icon-512.png',
  '/sw.js',
];

const PUBLIC_API_PATHS = [
  '/api/public',
  '/api/health',
];

export function middleware(req) {
  const { pathname } = req.nextUrl;

  const token = req.cookies.get('it_token')?.value;

  // If already logged in, opening "/" should go to dashboard.
  if (pathname === '/' && token) {
    const url = req.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  // Allow all internal Next.js routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/.well-known') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/icons')
  ) {
    return NextResponse.next();
  }

  // Allow public API endpoints (no auth required)
  if (PUBLIC_API_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Allow protected API endpoints (auth will be checked in the route handler)
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Check if page is public
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.next();
  }

  // Redirect unauthenticated users to login
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = '/';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
};

