// src/app/api/admin/orders/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(req: Request) {
  try {
    // -------------------------------
    // 1️⃣ Cookie adapter for SSR auth
    // -------------------------------
    const cookieStore = await cookies()

    const cookiesAdapter = {
      get(name: string) {
        const c = cookieStore.get(name)
        if (!c) return undefined
        return { name: c.name, value: c.value }
      },
      getAll() {
        return cookieStore.getAll().map((cookie: { name: string; value: string }) => ({
          name: cookie.name,
          value: cookie.value,
        }))
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

    // -------------------------------
    // 2️⃣ Create Supabase SSR client
    // -------------------------------
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: cookiesAdapter }
    )

    // -------------------------------
    // 3️⃣ Try reading session user
    // -------------------------------
    const {
      data: { session },
    } = await supabase.auth.getSession()

    let user = session?.user

    // -------------------------------------------------
    // 4️⃣ If SSR session not available → check Bearer
    // -------------------------------------------------
    if (!user) {
      const authHeader = req.headers.get('authorization') || ''
      const token = authHeader.startsWith('Bearer ')
        ? authHeader.split(' ')[1]
        : authHeader

      if (token) {
        try {
          const userRes = await fetch(
            `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
              },
            }
          )

          if (userRes.ok) {
            const userJson = await userRes.json()
            user = userJson
            console.log('Admin Orders GET: validated user from token', userJson.id)
          } else {
            console.warn(
              'Admin Orders GET: token validation failed',
              await userRes.text()
            )
          }
        } catch (err) {
          console.error('Admin Orders GET: token validation error', err)
        }
      }
    }

    // --------------------------------------------
    // 5️⃣ If user STILL not found → unauthorized
    // --------------------------------------------
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // --------------------------------------------
    // 6️⃣ Check admin role
    // --------------------------------------------
    const role = user.user_metadata?.role
    if (role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // --------------------------------------------
    // 7️⃣ Fetch all orders
    // --------------------------------------------
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error('❌ Failed to fetch admin orders:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
