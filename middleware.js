import { NextResponse } from 'next/server'

export async function middleware(req) {
  const { pathname } = req.nextUrl

  // Only protect dashboard routes
  if (!pathname.startsWith('/dashboard')) {
    return NextResponse.next()
  }

  // Check for Supabase auth cookie
  const cookies = req.cookies
  const hasSession = Array.from(cookies.getAll()).some(
    cookie => cookie.name.includes('sb-') && cookie.name.includes('-auth-token')
  )

  if (!hasSession) {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*'],
}