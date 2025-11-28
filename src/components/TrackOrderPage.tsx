'use client'

import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import { useSearchParams } from 'next/navigation'

const statusStages: string[] = [
  'Order Placed',
  'Order Confirmed',
  'Packed',
  'Shipped',
  'Out for Delivery',
  'Delivered',
]

export default function TrackOrderPage() {
  const searchParams = useSearchParams()
  const initialId: string = searchParams?.get('id') || ''
  const [orderId, setOrderId] = useState<string>(initialId)
  const [status, setStatus] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    if (!orderId) return

    const fetchStatus = async (): Promise<void> => {
      setLoading(true)
      try {
        const res = await fetch(`/api/order-status?id=${orderId}`)
        const data = await res.json()
        setStatus(data.orderStatus)
      } catch (error) {
        console.error('Failed to fetch order status:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStatus()
    const interval = setInterval(fetchStatus, 10000)
    return () => clearInterval(interval)
  }, [orderId])

  const currentIndex: number = statusStages.indexOf(status)

  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">🚚 Track Your Order</h1>

        <input
          type="text"
          placeholder="Enter Order ID"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          className="w-full px-4 py-2 rounded bg-gray-800 text-white mb-6"
        />

        {loading ? (
          <p className="text-gray-400">Fetching status...</p>
        ) : status ? (
          <div className="space-y-4">
            {statusStages.map((stage: string, i: number) => (
              <div key={stage} className="flex items-center gap-4">
                <div
                  className={`w-4 h-4 rounded-full ${
                    i <= currentIndex ? 'bg-green-500' : 'bg-gray-600'
                  }`}
                />
                <p
                  className={`text-sm ${
                    i === currentIndex ? 'text-green-300 font-semibold' : 'text-gray-400'
                  }`}
                >
                  {stage}
                </p>
              </div>
            ))}
            <p className="mt-4 text-indigo-300 text-sm">
              Current Status: <span className="font-bold">{status}</span>
            </p>
          </div>
        ) : (
          <p className="text-gray-500">Enter your Order ID to see live updates.</p>
        )}
      </main>
    </>
  )
}
