
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies()

    const cookiesAdapter = {
      get(name: string) {
        const c = cookieStore.get(name)
        if (!c) return undefined
        return { name: c.name, value: c.value }
      },
      getAll() {
        return cookieStore.getAll().map((cookie: { name: string; value: string }) => ({ name: cookie.name, value: cookie.value }))
      },
      set(name: string, value: string, options?: Record<string, unknown>) {
        cookieStore.set(name, value, options)
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
        cookiesToSet.forEach((cookie) => {
          cookieStore.set(cookie.name, cookie.value, cookie.options)
        })
      },
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: cookiesAdapter }
    )
    const {
      data: { session },
    } = await supabase.auth.getSession()
    const user = session?.user
    let userId = user?.id

    // If no session user, try validating Authorization Bearer token
    if (!userId) {
      const authHeader = req.headers.get('authorization') || ''
      const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader
      if (token) {
        try {
          const userRes = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`, {
            headers: {
              Authorization: `Bearer ${token}`,
              apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
            },
          })
          if (userRes.ok) {
            const userJson = await userRes.json()
            userId = userJson?.id
            console.log('My-Orders GET: validated user from token', userId)
          } else {
            console.warn('My-Orders GET: token validation failed', await userRes.text())
          }
        } catch (err) {
          console.error('My-Orders GET: token validation error', err)
        }
      }
    }

    if (!userId) {
      return NextResponse.json([], { status: 200 }) // No orders for unauthenticated users
    }

    // Only fetch orders for this user
    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(orders)
  } catch (error) {
    if (error instanceof Error) {
      console.error('❌ Failed to fetch orders:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    } else {
      console.error('❌ Unknown error:', error)
      return NextResponse.json({ error: 'Unknown error occurred' }, { status: 500 })
    }
  }
}
