// src/app/api/update-order-status/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type ProductInOrder = {
  id: string
  name: string
  slug: string
  price: number
  category: string
  imageUrl: string
  quantity: number
  inventory: number
  created_at: string
  description: string
  lastUpdated: string
}


export async function POST(req: Request) {
  try {
    const { id, status } = await req.json()

    const order = await prisma.order.findUnique({
      where: { id },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const previousStatus = order.paymentStatus
    const products: ProductInOrder[] =
    Array.isArray(order.products) && typeof order.products[0] === 'object'
    ? (order.products as ProductInOrder[])
    : []


    // 🔄 Restore stock if cancelling before shipment
    if (
      status === 'Cancelled' &&
      ['Order Placed', 'Order Confirmed', 'Packed'].includes(previousStatus)
    ) {
      for (const item of products) {
        await prisma.product.update({
          where: { id: item.id },
          data: {
            inventory: { increment: item.quantity },
          },
        })
      }
    }

    // 🟢 Deduct stock if placing or confirming order
    if (
      status === 'Order Placed' &&
      !['Cancelled', 'Returned'].includes(previousStatus)
    ) {
      for (const item of products) {
        await prisma.product.update({
          where: { id: item.id },
          data: {
            inventory: { decrement: item.quantity },
          },
        })
      }
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { paymentStatus: status },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('❌ Failed to update order:', error instanceof Error ? error.message : error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

