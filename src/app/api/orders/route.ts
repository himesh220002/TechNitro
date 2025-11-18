//src/app/api/orders/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

type ProductInOrder = {
  id: string
  quantity: number
}


export async function POST(req: Request) {
  try {
  const cookieStore = await cookies() // server-side RequestCookies (await to satisfy types)

    // Provide a cookies adapter that matches the shape expected by Supabase
    // helpers. The helper may call cookies.get(name) internally, so expose
    // both get and getAll, as well as set and setAll.
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
        // cookieStore.set accepts (name, value, options)
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
      {
        cookies: cookiesAdapter,
      }
    )

    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Read the request body early so we can accept a client-provided fallback
    const body = await req.json()

    // Prefer server session user, but allow client to provide userId as a fallback
    // (useful in development when the server doesn't receive Supabase cookies).
    const user = session?.user
    let userId = user?.id ?? body.userId
    console.log('Order POST: sessionUserId=', user?.id, ' body.userId=', body.userId)

    // If userId still missing, validate Authorization Bearer token with Supabase
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
            console.log('Order POST: validated user from token', userId)
          } else {
            console.warn('Order POST: token validation failed', await userRes.text())
          }
        } catch (err) {
          console.error('Order POST: token validation error', err)
        }
      }
    }

    if (!userId) {
      console.warn('Unauthorized order attempt: no userId')
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Validate product availability before creating the order
    const items: Array<{ id: string; quantity: number }> = Array.isArray(body.products)
      ? (body.products).map((p: ProductInOrder) => ({ id: p.id, quantity: Number(p.quantity) }))
      : []

    for (const item of items) {
      const prod = await prisma.product.findUnique({ where: { id: item.id } })
      if (!prod) {
        return NextResponse.json({ error: `Product not found: ${item.id}` }, { status: 400 })
      }
      if (prod.inventory < item.quantity) {
        return NextResponse.json({ error: `Insufficient stock for ${prod.name}` }, { status: 400 })
      }
    }

    // Create order and decrement inventory in a single transaction so we don't end up with
    // inconsistent state if one of the updates fails.
    const createOp = prisma.order.create({
      data: {
        id: body.id,
        userId: userId,
        accountName: body.accountName,
        accountNumber: body.accountNumber,
        phone: body.phone,
        address: body.address,
        pin: body.pin,
        paymentMethod: body.paymentMethod,
        payment: body.payment,
        products: body.products,
        shippingEvents: [],
      },
    })

    const updateOps = items.map((item) =>
      prisma.product.update({ where: { id: item.id }, data: { inventory: { decrement: item.quantity } } })
    )

    const [order] = await prisma.$transaction([createOp, ...updateOps])

    return NextResponse.json(order)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('❌ Order creation failed:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
