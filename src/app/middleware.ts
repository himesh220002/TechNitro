// src/app/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(req: NextRequest) {
  // Create a response and supabase client
  let supabaseResponse = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request: {
              headers: req.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Get user session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const user = session?.user
  const role = user?.user_metadata?.role

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/register']
  if (publicRoutes.includes(req.nextUrl.pathname)) {
    return supabaseResponse
  }

  // Check for admin routes
  const isAdminRoute = ['/admin', '/admin-orders', '/admin-route-planner'].some(prefix =>
    req.nextUrl.pathname.startsWith(prefix)
  )

  // Admin auth pages (login/register) are accessible without admin role
  const isAdminAuthPage = ['/admin/login', '/admin/register'].includes(req.nextUrl.pathname)

  // Handle admin routes
  if (isAdminRoute) {
    console.log('Admin route accessed:', req.nextUrl.pathname)
    console.log('User session:', !!user)
    console.log('User role:', role)

    if (isAdminAuthPage) {
      // Redirect logged-in admins away from auth pages
      if (user && role === 'admin') {
        return NextResponse.redirect(new URL('/admin', req.url))
      }
      return supabaseResponse
    }

    // Protect admin routes - require both authentication and admin role
    if (!user || role !== 'admin') {
      console.log('Access denied to admin route')
      const redirectUrl = new URL('/admin/login', req.url)
      redirectUrl.searchParams.set('message', 'Admin access required')
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Protect customer routes - require authentication
  const protectedCustomerRoutes = ['/', '/cart', '/checkout', '/dashboard', '/my-orders']
  if (protectedCustomerRoutes.includes(req.nextUrl.pathname) && !user) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return supabaseResponse
}


export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|cartoonlandscape.avif|pic1.avif).*)',
  ],
}
