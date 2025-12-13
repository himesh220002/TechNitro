// middleware.ts
 
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({
    request: { headers: req.headers }
  })

  // mark the response so the browser Network panel can detect middleware runs
  res.headers.set('x-middleware-hit', '1')

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (cookies) => {
          cookies.forEach(({ name, value }) => req.cookies.set(name, value))
          res = NextResponse.next({ request: { headers: req.headers } })
          cookies.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options)
          )
        }
      }
    }
  )

  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  const role = user?.user_metadata?.role

  const path = req.nextUrl.pathname

  // debug: log middleware hits so we can confirm it's running in dev/prod
  // this will appear in your Next.js server terminal
  console.log(`[middleware] ${req.method} ${path} user=${user?.id ?? 'anonymous'} role=${role ?? 'none'}`)

  const isAdmin = !!user && role === 'admin'
  // expose whether middleware considered the request admin-authorized
  res.headers.set('x-admin-allowed', isAdmin ? '1' : '0')

  // ✅ Only admins can access /admin/* except the public login page
  if (path.startsWith('/admin') && !path.startsWith('/admin/login')) {
    if (!user || role !== 'admin') {
      // preserve the original path so user can be returned after login
      const loginUrl = new URL('/admin/login', req.url)
      loginUrl.searchParams.set('returnTo', path)
      const redirectRes = NextResponse.redirect(loginUrl)
      // indicate middleware ran on redirect as well
      redirectRes.headers.set('x-middleware-hit', '1')
      return redirectRes
    }
  }

  return res
}

export const config = {
  matcher: ['/admin/:path*'],
}
