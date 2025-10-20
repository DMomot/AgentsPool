import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const host = request.headers.get('host');
  
  // Redirect www to non-www
  if (host?.startsWith('www.')) {
    return NextResponse.redirect(
      `https://${host.replace('www.', '')}${request.nextUrl.pathname}${request.nextUrl.search}`,
      301
    );
  }
}

