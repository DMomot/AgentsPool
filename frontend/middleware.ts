import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Force HTTPS redirect
  const protocol = request.headers.get('x-forwarded-proto');
  const host = request.headers.get('host');
  
  if (protocol === 'http' && host && !host.includes('localhost')) {
    const url = request.nextUrl.clone();
    url.protocol = 'https:';
    return NextResponse.redirect(url, 301);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/:path*',
};
