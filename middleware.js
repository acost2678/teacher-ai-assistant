import { NextResponse } from 'next/server'

export async function middleware(req) {
  const { pathname } = req.nextUrl

  if (!pathname.startsWith('/dashboard')) {
    return NextResponse.next()
  }

  // Check for any auth-related cookie
  const cookieHeader = req.headers.get('cookie') || ''
  const hasAuth = cookieHeader.includes('sb-') || 
                  cookieHeader.includes('next-auth') ||
                  cookieHeader.includes('supabase')

  if (!hasAuth) {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*'],
}