import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

export async function middleware(req) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const { data: { session } } = await supabase.auth.getSession()

  const { pathname } = req.nextUrl

  // Public routes — always accessible
  const publicRoutes = ['/', '/pricing', '/auth/login', '/auth/signup', '/api/stripe']
  const isPublic = publicRoutes.some(route => pathname.startsWith(route))

  if (isPublic) return res

  // If not logged in, redirect to login
  if (!session) {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  // Check user plan for dashboard access
  if (pathname.startsWith('/dashboard')) {
    const { data: planData } = await supabase
      .from('user_plans')
      .select('plan')
      .eq('id', session.user.id)
      .single()

    const plan = planData?.plan

    // Allow founding members and paid users
    if (plan === 'paid' || plan === 'founding') {
      return res
    }

    // No plan found — redirect to pricing
    return NextResponse.redirect(new URL('/pricing', req.url))
  }

  return res
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*'],
}