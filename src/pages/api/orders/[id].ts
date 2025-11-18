// src/pages/api/orders/[id].ts
import { prisma } from '@/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  if (req.method !== 'GET') return res.status(405).end()
  if (typeof id !== 'string') return res.status(400).json({ error: 'Invalid order ID' })

  try {
    const order = await prisma.order.findUnique({ where: { id } })
    if (!order) return res.status(404).json({ error: 'Order not found' })
    res.status(200).json(order)
  } catch (err) {
    console.error('Failed to fetch order:', err)
    res.status(500).json({ error: 'Failed to fetch order' })
  }
}
