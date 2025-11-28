'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Navbar from '@/components/Navbar'
import type { Order } from '@/types/order'
import Footer from '@/components/Footer'
import { useRouter } from 'next/navigation'
import OrderList from './components/OrderList'
import Link from 'next/link'

export default function MyOrdersPage() {
  const supabase = useMemo(() => createClientComponentClient(), [])
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const session = await supabase.auth.getSession()
      const token = session?.data?.session?.access_token

      // Fetch active orders (not archived, not hidden)
      const res = await fetch('/api/my-orders?archived=false&hidden=false', {
        headers: token ? {
          'Authorization': `Bearer ${token}`
        } : undefined
      })
      const data = await res.json()
      if (Array.isArray(data)) {
        setOrders(data)
      } else {
        setOrders([])
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [supabase.auth])

  return (
    <>
      <Navbar />
      <main className="max-w-6xl min-h-[500px] mx-auto p-3 sm:p-6">
        <div className='flex flex-col sm:flex-row gap-4 justify-between items-center mb-6'>
          <h1 className="text-xl sm:text-3xl font-bold ">📦 My Orders</h1>

          <div className="flex gap-4">
            <Link href="/my-orders/archived" className="text-sm text-gray-400 hover:text-white">
              Archived Orders
            </Link>
            <Link href="/my-orders/hidden" className="text-sm text-gray-400 hover:text-white">
              Hidden Orders
            </Link>
          </div>

          <div className='flex gap-2 items-center'>
            <label className='text-sm sm:text-lg'> Track Order</label>
            <input
              type="text"
              placeholder="Enter Order ID"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const id = (e.target as HTMLInputElement).value.trim()
                  if (id) {
                    router.push(`/track-order?id=${id}`)
                  }
                }
              }}
              className=" sm:ml-4  px-2 py-1 sm:px-4 sm:py-2 rounded bg-gray-800 text-white"
            />
          </div>
        </div>

        <OrderList orders={orders} loading={loading} onUpdate={fetchOrders} />
      </main>
      <Footer />
    </>
  )
}
