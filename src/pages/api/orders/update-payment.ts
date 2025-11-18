// src/app/api/orders/update-payment.ts
import { prisma } from '@/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { orderId, paymentResult } = req.body

  if (!orderId || !paymentResult) {
    return res.status(400).json({ error: 'Missing orderId or paymentResult' })
  }

  try {
    await prisma.order.updateMany({
      where: { id: orderId },
      data: { paymentResult },
    })
    res.status(200).json({ success: true })
  } catch (err) {
    console.error('Failed to update paymentResult', err)
    res.status(500).json({ error: 'Failed to update payment status' })
  }
}
