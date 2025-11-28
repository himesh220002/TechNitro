"use client"

import React, { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import { useSearchParams } from 'next/navigation'

type ShippingEvent = {
  location: string
  status: 'active' | 'inactive'
  visible: boolean
  timestamp: string // departure time
  mode?: 'train' | 'flight' | 'truck'
  arrivalTime?: string // calculated from next leg
}

const statusStages: string[] = [
  'Order Placed',
  'Order Confirmed',
  'Packed',
  'Shipped',
  'Out for Delivery',
  'Delivered',
]

export default function TrackOrderClient() {
  const searchParams = useSearchParams()
  const initialId = searchParams?.get('id') || ''
  const [orderId, setOrderId] = useState<string>(initialId)
  const [status, setStatus] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [shippingEvents, setShippingEvents] = useState<ShippingEvent[]>([])


  useEffect(() => {
    if (!orderId) return

    const fetchStatus = async (): Promise<void> => {
      setLoading(true)
      try {
        const res = await fetch(`/api/order-status?id=${orderId}`)
        const data = await res.json()
        setStatus(data.orderStatus)
        setShippingEvents(data.shippingEvents || [])
      } catch (error) {
        console.error('❌ Failed to fetch order status:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStatus()
    const iv = setInterval(fetchStatus, 120000)
    return () => clearInterval(iv)
  }, [orderId])

  const currentIndex = statusStages.indexOf(status)

  const fetchStatus = async (): Promise<void> => {
    if (!orderId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/order-status?id=${orderId}`)
      const data = await res.json()
      setStatus(data.orderStatus)
      setShippingEvents(data.shippingEvents || []) 
    } catch (error) {
      console.error('❌ Failed to fetch order status:', error)
    } finally {
      setLoading(false)
    }
  }

  const enrichedEvents = shippingEvents.map((event, i, arr) => {
    if (i === arr.length - 1) return event // last leg, no arrival time

    const next = arr[i + 1]
    const nextDeparture = new Date(next.timestamp)
    const delayMin = Math.floor(Math.random() * (120 - 10 + 1)) + 10
    const arrival = new Date(nextDeparture.getTime() - delayMin * 60000)

    return {
      ...event,
      arrivalTime: arrival.toLocaleString()
    }
  })


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
            {statusStages.map((stage, i) => (
                <div key={stage} className="flex flex-col gap-2">
                    <div className="flex items-center gap-4">
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

                    {/* ✅ Show shipping timeline only below "Shipped" and later */}
                    {stage === 'Shipped' && currentIndex >= i && shippingEvents.length > 0 && (
                    <div className="ml-6 mt-2 space-y-2">
                        {enrichedEvents.map((event, index) => (
                        <div key={index} className="flex  gap-3 items-center">
                            <div className="flex items-center gap-3">
                            <div
                                className={`w-3 h-3 rounded-full ${
                                event.status === 'active' ? 'bg-green-400' : 'bg-gray-500'
                                }`}
                            />
                            <p
                                className={`text-sm ${
                                event.status === 'active'
                                    ? 'text-green-200 font-medium'
                                    : 'text-gray-400'
                                }`}
                            >
                                {event.location} <span className='ml-2 text-lg'>{event.mode === 'train' ? '🚆' : event.mode === 'flight' ? '✈️' : event.mode === 'truck' ? '🚚' : ''}</span>
                            </p>
                            </div>
                            {/* {event.arrivalTime && (
                            <p className="ml-6 text-xs text-gray-400">
                                Arrived: {event.arrivalTime}
                            </p>
                            )} */}
                            <p className="ml-6 text-xs text-gray-500">
                                {event.timestamp}
                            </p>
                        </div>
                        ))}

                    </div>
                    )}
                </div>
                ))}

            <div className='flex justify-between items-center'>
            <p className="mt-4 text-indigo-300 text-sm">
              Current Status: <span className="font-bold">{status}</span>
            </p>
            <button
                onClick={() => orderId && fetchStatus()}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
                🔄 Refresh Status
            </button>

            </div>
            

          </div>
        ) : (
          <p className="text-gray-500">Enter your Order ID to see live updates.</p>
        )}
      </main>
    </>
  )
}
