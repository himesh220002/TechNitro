// src/app/api/recommendations/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { created_at: 'desc' },
      take: 6,
    })
    return NextResponse.json(products)
  } catch (error) {
    console.error('Prisma error:', error)
    return NextResponse.json({ error: 'Failed to fetch recommendations' }, { status: 500 })
  }
}
