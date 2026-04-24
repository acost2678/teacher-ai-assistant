import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(req) {
  const res = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) { return req.cookies.get(name)?.value },
        set(name, value, options) { res.cookies.set({ name, value, ...options }) },
        remove(name, options) { res.cookies.set({ name, value: '', ...options }) },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()
  const { pathname } = req.nextUrl

  const isPublic = ['/', '/pricing', '/auth', '/api/stripe', '/api/auth'].some(
    route => pathname.startsWith(route)
  )
  if (isPublic) return res

  if (!session) {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  if (pathname.startsWith('/dashboard')) {
    const { data: planData } = await supabase
      .from('user_plans')
      .select('plan')
      .eq('id', session.user.id)
      .single()

    const plan = planData?.plan

    if (plan === 'paid' || plan === 'founding') {
      return res
    }

    return NextResponse.redirect(new URL('/pricing', req.url))
  }

  return res
}

export const config = {
  matcher: ['/dashboard/:path*'],
}