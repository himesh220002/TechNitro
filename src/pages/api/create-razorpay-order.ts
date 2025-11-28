// src/pages/api/create-razorpay-order.ts
import Razorpay from 'razorpay'
import { NextApiRequest, NextApiResponse } from 'next'
import dotenv from 'dotenv'
dotenv.config()


const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { amount } = req.body


  try {
    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
      payment_capture: true,
    })

    res.status(200).json({
      razorpayOrderId: order.id,
      razorpayKey: process.env.RAZORPAY_KEY_ID,
    })
  } catch (err) {
    console.error('Razorpay order creation failed', err)
    res.status(500).json({ error: 'Failed to create Razorpay order' })
  }
}
