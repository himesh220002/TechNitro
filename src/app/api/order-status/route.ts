// src/app/api/order-status/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Missing order ID' }, { status: 400 })
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id },
      select: { 
        paymentStatus: true ,
        shippingEvents: true,
        },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('❌ Failed to fetch order status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
