import { NextResponse } from 'next/server';

const PUBLIC_PATHS = [
  '/login',
  '/register',
  '/check',
  '/manifest.json',
  '/robots.txt',
  '/icon-192.png',
  '/icon-512.png',
  '/sw.js',
];

export function middleware(req) {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/.well-known') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/icons')
  ) {
    return NextResponse.next();
  }

  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.next();
  }

  const token = req.cookies.get('it_token')?.value;
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
};

